import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { findApplicationStatus } from "@/lib/application-store";
import { emailPattern } from "@/lib/contact-validation";

export const runtime = "nodejs";

const referencePattern = /^(TC|CA|DR)-\d{2}-\d{4}$/i;

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
  return current.count > 15;
}

export async function POST(request: Request) {
  if (rateLimited(request)) return NextResponse.json({ message: "Too many lookups. Please try again shortly." }, { status: 429 });

  let input: { referenceCode?: unknown; email?: unknown };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const referenceCode = typeof input.referenceCode === "string" ? input.referenceCode.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  if (!referencePattern.test(referenceCode) || !emailPattern.test(email) || email.length > 160) {
    return NextResponse.json({ message: "Enter your Application ID and the email you applied with." }, { status: 422 });
  }

  try {
    const result = await findApplicationStatus(referenceCode, email);
    if (!result) {
      return NextResponse.json({ message: "No application matches that Application ID and email." }, { status: 404 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Application status lookup error", error);
    return NextResponse.json({ message: "We could not check your status right now. Please try again." }, { status: 500 });
  }
}
