import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { parseApplicationSubmission } from "@/lib/application-photo";
import { campusAmbassadorApplicationSchema } from "@/lib/application-schema";
import { saveCampusAmbassadorApplication } from "@/lib/application-store";

export const runtime = "nodejs";
// Turnstile verify + dup checks + image upload to Supabase can add up on a
// slow mobile connection; give it real headroom above the 10s default.
export const maxDuration = 30;

const attempts = new Map<string, { count: number; resetsAt: number }>();

function rateLimited(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = createHash("sha256").update(forwarded).digest("hex");
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetsAt < now) {
    attempts.set(key, { count: 1, resetsAt: now + 10 * 60 * 1000 });
    return false;
  }
  current.count += 1;
  return current.count > 6;
}

async function verifyTurnstile(token?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const body = new FormData();
  body.set("secret", secret);
  body.set("response", token);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  if (!response.ok) return false;
  const result = await response.json() as { success?: boolean };
  return result.success === true;
}

export async function POST(request: Request) {
  if (rateLimited(request)) return NextResponse.json({ message: "Too many attempts. Please try again shortly." }, { status: 429 });

  const submission = await parseApplicationSubmission(request);
  if (!submission.ok) {
    return NextResponse.json({ message: submission.message, issues: submission.issues }, { status: 400 });
  }

  const parsed = campusAmbassadorApplicationSchema.safeParse(submission.input);
  if (!parsed.success) {
    return NextResponse.json({ message: "Please review the highlighted information.", issues: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  if (!(await verifyTurnstile(parsed.data.turnstileToken))) {
    return NextResponse.json({ message: "Verification failed. Please try again." }, { status: 400 });
  }

  try {
    const result = await saveCampusAmbassadorApplication(parsed.data, submission.photo);
    return NextResponse.json({ message: "Application received.", referenceCode: result.referenceCode }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE_APPLICATION") {
      return NextResponse.json({ message: "A Campus Ambassador application using this email, WhatsApp number or CNIC has already been received." }, { status: 409 });
    }
    console.error("Campus Ambassador application error", error);
    return NextResponse.json({ message: "We could not save your application. Please try again." }, { status: 500 });
  }
}
