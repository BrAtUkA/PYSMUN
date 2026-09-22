import { handleConferenceSubmission } from "@/lib/conference-submission";

export const runtime = "nodejs";
// Turnstile verify + dup checks + three file uploads to Supabase can add up
// on a slow mobile connection; give it real headroom above the 10s default.
export const maxDuration = 30;

export function POST(request: Request) {
  return handleConferenceSubmission(request, "observer");
}
