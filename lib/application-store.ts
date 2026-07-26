import "server-only";

import { createHash, randomInt } from "node:crypto";
import { mkdir, appendFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ApplicationPhoto } from "./application-photo";
import type { CampusAmbassadorApplication, TrainingCampApplication } from "./application-schema";

type ApplicationProgram = "training-camp" | "campus-ambassador";
type ApplicationPayload = TrainingCampApplication | CampusAmbassadorApplication;

type StoredFile = {
  path: string;
  mimeType: string;
  size: number;
};

type StoredApplication<T extends ApplicationPayload = ApplicationPayload> = {
  id: string;
  referenceCode: string;
  program: ApplicationProgram;
  submittedAt: string;
  reviewStatus: "received";
  applicant: T;
  photo: StoredFile;
  receipt?: StoredFile;
  paymentStatus?: string;
  paymentReference?: string;
};

function referenceCode(program: ApplicationProgram) {
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = program === "training-camp" ? "TC" : "CA";
  return `${prefix}-${year}-${randomInt(1000, 9999)}`;
}

function fingerprint(value: string) {
  return createHash("sha256").update(value.toLowerCase().trim()).digest("hex");
}

async function saveLocally<T extends ApplicationPayload>(application: T, program: ApplicationProgram, photo: ApplicationPhoto, receipt?: ApplicationPhoto): Promise<StoredApplication<T>> {
  const dataDirectory = path.join(process.cwd(), ".data");
  const filePath = path.join(dataDirectory, "applications.ndjson");
  await mkdir(dataDirectory, { recursive: true });

  try {
    const current = await readFile(filePath, "utf8");
    const duplicate = current.split("\n").filter(Boolean).some((line) => {
      const item = JSON.parse(line) as StoredApplication;
      return item.program === program && (
        fingerprint(item.applicant.email) === fingerprint(application.email) ||
        item.applicant.cnic === application.cnic ||
        item.applicant.whatsapp === application.whatsapp
      );
    });
    if (duplicate) throw new Error("DUPLICATE_APPLICATION");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const id = crypto.randomUUID();
  const relativePhotoPath = path.posix.join("application-photos", program, `${id}.${photo.extension}`);
  const photoDirectory = path.join(dataDirectory, "application-photos", program);
  await mkdir(photoDirectory, { recursive: true });
  await writeFile(path.join(photoDirectory, `${id}.${photo.extension}`), new Uint8Array(photo.data));

  let storedReceipt: StoredFile | undefined;
  if (receipt) {
    const receiptDirectory = path.join(dataDirectory, "application-photos", "receipts", program);
    await mkdir(receiptDirectory, { recursive: true });
    await writeFile(path.join(receiptDirectory, `${id}.${receipt.extension}`), new Uint8Array(receipt.data));
    storedReceipt = {
      path: path.posix.join("application-photos", "receipts", program, `${id}.${receipt.extension}`),
      mimeType: receipt.contentType,
      size: receipt.size,
    };
  }

  const record: StoredApplication<T> = {
    id,
    referenceCode: referenceCode(program),
    program,
    submittedAt: new Date().toISOString(),
    reviewStatus: "received",
    applicant: application,
    photo: { path: relativePhotoPath, mimeType: photo.contentType, size: photo.size },
    receipt: storedReceipt,
    paymentStatus: receipt ? "proof_submitted" : "pending",
    paymentReference: "transactionReference" in application ? String(application.transactionReference) : undefined,
  };
  await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
  return record;
}

async function saveToSupabase<T extends ApplicationPayload>(application: T, program: ApplicationProgram, photo: ApplicationPhoto, receipt?: ApplicationPhoto): Promise<StoredApplication<T>> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return saveLocally(application, program, photo, receipt);

  const authHeaders = { apikey: key, authorization: `Bearer ${key}` };
  const id = crypto.randomUUID();
  const photoPath = `${program}/${id}.${photo.extension}`;
  const receiptPath = receipt ? `receipts/${program}/${id}.${receipt.extension}` : null;

  async function hasDuplicate(column: "applicant_email" | "applicant_cnic" | "applicant_phone", value: string) {
    const duplicateUrl = new URL(`${url}/rest/v1/applications`);
    duplicateUrl.searchParams.set("select", "id");
    duplicateUrl.searchParams.set("program_slug", `eq.${program}`);
    duplicateUrl.searchParams.set(column, `eq.${value}`);
    duplicateUrl.searchParams.set("limit", "1");
    const duplicateResponse = await fetch(duplicateUrl, {
      headers: authHeaders,
    });
    if (!duplicateResponse.ok) throw new Error("APPLICATION_STORE_FAILED");
    const duplicates = await duplicateResponse.json() as Array<{ id: string }>;
    return duplicates.length > 0;
  }

  const [emailExists, cnicExists, phoneExists] = await Promise.all([
    hasDuplicate("applicant_email", application.email),
    hasDuplicate("applicant_cnic", application.cnic),
    hasDuplicate("applicant_phone", application.whatsapp),
  ]);
  if (emailExists || cnicExists || phoneExists) throw new Error("DUPLICATE_APPLICATION");

  const record: StoredApplication<T> = {
    id,
    referenceCode: referenceCode(program),
    program,
    submittedAt: new Date().toISOString(),
    reviewStatus: "received",
    applicant: application,
    photo: { path: photoPath, mimeType: photo.contentType, size: photo.size },
    receipt: receipt && receiptPath ? { path: receiptPath, mimeType: receipt.contentType, size: receipt.size } : undefined,
    paymentStatus: receipt ? "proof_submitted" : "pending",
    paymentReference: "transactionReference" in application ? String(application.transactionReference) : undefined,
  };

  async function uploadImage(objectPath: string, image: ApplicationPhoto) {
    const uploadResponse = await fetch(`${url}/storage/v1/object/application-photos/${objectPath}`, {
      method: "POST",
      headers: { ...authHeaders, "content-type": image.contentType, "x-upsert": "false" },
      body: image.data,
    });
    return uploadResponse.ok;
  }

  async function removeUploads(paths: string[]) {
    await fetch(`${url}/storage/v1/object/application-photos`, {
      method: "DELETE",
      headers: { ...authHeaders, "content-type": "application/json" },
      body: JSON.stringify({ prefixes: paths }),
    }).catch(() => undefined);
  }

  const [photoUploaded, receiptUploaded] = await Promise.all([
    uploadImage(photoPath, photo),
    receipt && receiptPath ? uploadImage(receiptPath, receipt) : Promise.resolve(true),
  ]);
  if (!photoUploaded || !receiptUploaded) {
    // Clean up whichever half of the pair actually landed, so a partial
    // failure never leaves an orphaned file behind.
    const uploadedPaths = [photoUploaded ? photoPath : null, receiptUploaded && receiptPath ? receiptPath : null].filter((path): path is string => Boolean(path));
    await removeUploads(uploadedPaths);
    throw new Error("APPLICATION_PHOTO_STORE_FAILED");
  }

  const { website: _website, turnstileToken: _turnstileToken, ...storedPayload } = application;

  const response = await fetch(`${url}/rest/v1/applications`, {
    method: "POST",
    headers: {
      ...authHeaders,
      "content-type": "application/json",
      prefer: "return=minimal",
    },
    body: JSON.stringify({
      id: record.id,
      reference_code: record.referenceCode,
      program_slug: record.program,
      applicant_email: application.email,
      applicant_phone: application.whatsapp,
      applicant_cnic: application.cnic,
      photo_path: photoPath,
      photo_mime_type: photo.contentType,
      photo_size_bytes: photo.size,
      payload: storedPayload,
      review_status: record.reviewStatus,
      submitted_at: record.submittedAt,
      payment_status: record.paymentStatus,
      payment_reference: record.paymentReference ?? null,
      receipt_path: receiptPath,
      receipt_mime_type: receipt?.contentType ?? null,
      receipt_size_bytes: receipt?.size ?? null,
      payment_updated_at: receipt ? record.submittedAt : null,
    }),
  });

  if (!response.ok) {
    await removeUploads(receiptPath ? [photoPath, receiptPath] : [photoPath]);
    if (response.status === 409) throw new Error("DUPLICATE_APPLICATION");
    throw new Error("APPLICATION_STORE_FAILED");
  }
  return record;
}

export type ApplicationStatusResult = {
  referenceCode: string;
  program: ApplicationProgram;
  fullName: string;
  submittedAt: string;
  reviewStatus: string;
  paymentStatus: string;
};

export async function findApplicationStatus(referenceCode: string, email: string): Promise<ApplicationStatusResult | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedReference = referenceCode.trim().toUpperCase();

  if (!url || !key) {
    try {
      const filePath = path.join(process.cwd(), ".data", "applications.ndjson");
      const current = await readFile(filePath, "utf8");
      for (const line of current.split("\n")) {
        if (!line) continue;
        const item = JSON.parse(line) as StoredApplication;
        if (item.referenceCode === normalizedReference && item.applicant.email.toLowerCase() === normalizedEmail) {
          return {
            referenceCode: item.referenceCode,
            program: item.program,
            fullName: item.applicant.fullName,
            submittedAt: item.submittedAt,
            reviewStatus: item.reviewStatus,
            paymentStatus: item.paymentStatus ?? "pending",
          };
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    return null;
  }

  const lookupUrl = new URL(`${url}/rest/v1/applications`);
  lookupUrl.searchParams.set("select", "reference_code,program_slug,submitted_at,review_status,payment_status,fullName:payload->>fullName");
  lookupUrl.searchParams.set("reference_code", `eq.${normalizedReference}`);
  lookupUrl.searchParams.set("applicant_email", `eq.${normalizedEmail}`);
  lookupUrl.searchParams.set("limit", "1");
  const response = await fetch(lookupUrl, { headers: { apikey: key, authorization: `Bearer ${key}` } });
  if (!response.ok) throw new Error("APPLICATION_STATUS_LOOKUP_FAILED");
  const rows = await response.json() as Array<{ reference_code: string; program_slug: ApplicationProgram; submitted_at: string; review_status: string; payment_status?: string; fullName?: string }>;
  const row = rows[0];
  if (!row) return null;
  return {
    referenceCode: row.reference_code,
    program: row.program_slug,
    fullName: row.fullName ?? "",
    submittedAt: row.submitted_at,
    reviewStatus: row.review_status,
    paymentStatus: row.payment_status ?? "pending",
  };
}

export async function saveTrainingCampApplication(application: TrainingCampApplication, photo: ApplicationPhoto, receipt: ApplicationPhoto) {
  const record = await saveToSupabase(application, "training-camp", photo, receipt);
  const webhook = process.env.APPLICATION_NOTIFICATION_WEBHOOK_URL;
  if (webhook) {
    fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event: "training_camp_application.received", referenceCode: record.referenceCode }),
    }).catch(() => undefined);
  }
  return { referenceCode: record.referenceCode };
}

export async function saveCampusAmbassadorApplication(application: CampusAmbassadorApplication, photo: ApplicationPhoto) {
  const record = await saveToSupabase(application, "campus-ambassador", photo);
  const webhook = process.env.APPLICATION_NOTIFICATION_WEBHOOK_URL;
  if (webhook) {
    fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event: "campus_ambassador_application.received", referenceCode: record.referenceCode }),
    }).catch(() => undefined);
  }
  return { referenceCode: record.referenceCode };
}
