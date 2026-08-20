import "server-only";

export const APPLICATION_PHOTO_MAX_BYTES = 2 * 1024 * 1024;

const allowedPhotoTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

const allowedDocumentTypes = {
  ...allowedPhotoTypes,
  "application/pdf": "pdf",
} as const;

export type ApplicationPhoto = {
  data: ArrayBuffer;
  contentType: keyof typeof allowedDocumentTypes;
  extension: (typeof allowedDocumentTypes)[keyof typeof allowedDocumentTypes];
  size: number;
};

export type ParsedApplicationSubmission =
  | { ok: true; input: unknown; photo: ApplicationPhoto; receipt?: ApplicationPhoto; cv?: ApplicationPhoto }
  | { ok: false; message: string; issues?: Record<string, string[]> };

function hasBytes(bytes: Uint8Array, expected: number[], offset = 0) {
  return expected.every((value, index) => bytes[offset + index] === value);
}

function matchesFileSignature(bytes: Uint8Array, contentType: keyof typeof allowedDocumentTypes) {
  if (contentType === "image/jpeg") return hasBytes(bytes, [0xff, 0xd8, 0xff]);
  if (contentType === "image/png") return hasBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (contentType === "application/pdf") return hasBytes(bytes, [0x25, 0x50, 0x44, 0x46]);
  return hasBytes(bytes, [0x52, 0x49, 0x46, 0x46]) && hasBytes(bytes, [0x57, 0x45, 0x42, 0x50], 8);
}

type ImageFieldResult =
  | { ok: true; image: ApplicationPhoto }
  | { ok: false; message: string; issues: Record<string, string[]> };

async function readImageField(form: FormData, field: string, label: string, kind: "image" | "document" = "image"): Promise<ImageFieldResult> {
  const allowedTypes = kind === "document" ? allowedDocumentTypes : allowedPhotoTypes;
  const typeHint = kind === "document" ? "Use a JPEG, PNG, WebP image or PDF file" : "Use a JPEG, PNG or WebP image";

  const file = form.get(field);
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: `Please add your ${label}.`, issues: { [field]: [`${label[0].toUpperCase()}${label.slice(1)} is required`] } };
  }
  if (file.size > APPLICATION_PHOTO_MAX_BYTES) {
    return { ok: false, message: `Please use a smaller ${label}.`, issues: { [field]: ["File must be 2 MB or smaller"] } };
  }
  if (!(file.type in allowedTypes)) {
    return { ok: false, message: `Please use a supported ${label}.`, issues: { [field]: [typeHint] } };
  }

  const contentType = file.type as keyof typeof allowedDocumentTypes;
  const data = await file.arrayBuffer();
  if (!matchesFileSignature(new Uint8Array(data), contentType)) {
    return { ok: false, message: `The selected ${label} could not be verified.`, issues: { [field]: [`Choose a valid ${kind === "document" ? "JPEG, PNG, WebP or PDF file" : "JPEG, PNG or WebP image"}`] } };
  }

  return { ok: true, image: { data, contentType, extension: allowedTypes[contentType as keyof typeof allowedTypes], size: file.size } };
}

export async function parseApplicationSubmission(request: Request, options?: { withReceipt?: boolean; withCv?: boolean }): Promise<ParsedApplicationSubmission> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return { ok: false, message: "Invalid submission." };
  }

  const payload = form.get("payload");
  if (typeof payload !== "string" || payload.length > 50_000) {
    return { ok: false, message: "Invalid application information." };
  }

  let input: unknown;
  try {
    input = JSON.parse(payload);
  } catch {
    return { ok: false, message: "Invalid application information." };
  }

  const photo = await readImageField(form, "photo", "applicant photo");
  if (!photo.ok) return photo;

  let receipt: ApplicationPhoto | undefined;
  if (options?.withReceipt) {
    const receiptResult = await readImageField(form, "receipt", "payment receipt");
    if (!receiptResult.ok) return receiptResult;
    receipt = receiptResult.image;
  }

  let cv: ApplicationPhoto | undefined;
  if (options?.withCv) {
    const cvResult = await readImageField(form, "cv", "CV", "document");
    if (!cvResult.ok) return cvResult;
    cv = cvResult.image;
  }

  return { ok: true, input, photo: photo.image, receipt, cv };
}
