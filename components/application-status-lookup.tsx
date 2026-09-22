"use client";

import { ArrowLeft, ArrowRight, Check, LoaderCircle, TriangleAlert } from "lucide-react";
import { FormEvent, useState } from "react";
import { emailPattern } from "@/lib/contact-validation";
import { bootcampFacts, paidPrograms, siteConfig } from "@/lib/content";
import { timeAgo } from "@/lib/time";

type StatusResult = {
  referenceCode: string;
  program: "training-camp" | "campus-ambassador" | "directorate" | "delegate" | "observer";
  fullName: string;
  submittedAt: string;
  reviewStatus: string;
  paymentStatus: string;
};

type Stage = {
  label: string;
  description: string;
  state: "done" | "current" | "upcoming" | "issue";
};

const programNames: Record<StatusResult["program"], string> = {
  "training-camp": "PYS Bootcamp",
  "campus-ambassador": "Campus Ambassador",
  directorate: "Directorate",
  delegate: "Delegate",
  observer: "Observer",
};

// What a confirmed conference seat means, per program.
const allotmentConfirmed: Partial<Record<StatusResult["program"], { confirmed: string; next: string }>> = {
  delegate: { confirmed: "Your committee and country or personality allotment is confirmed", next: "Study guides and conference details arrive by email and WhatsApp." },
  observer: { confirmed: "Your committee allotment is confirmed", next: "Conference details arrive by email and WhatsApp." },
};

function buildStages(result: StatusResult): Stage[] {
  const review = result.reviewStatus;
  const first = result.fullName?.trim().split(/\s+/)[0];
  const greeting = first && first.length <= 20 ? `, ${first}` : "";

  if (paidPrograms.includes(result.program as (typeof paidPrograms)[number])) {
    const allotment = allotmentConfirmed[result.program];
    const decisionLabel = allotment ? "Allotment decision" : "Seat decision";
    const confirmedLabel = allotment ? "Committee allotment" : "Seat confirmed";
    const payment = result.paymentStatus;
    const stages: Stage[] = [
      { label: "Application received", description: `Thanks${greeting}. Your application and payment receipt are safely in our records.`, state: "done" },
    ];

    if (payment === "confirmed") {
      stages.push({ label: "Payment verified", description: "Your payment has been checked and confirmed.", state: "done" });
    } else if (payment === "invalid") {
      stages.push({ label: "Payment verification", description: "There is an issue with your payment. Please check your email or WhatsApp.", state: "issue" });
    } else {
      stages.push({ label: "Payment verification", description: "Receipt received. Payments are verified within 24 hours.", state: "current" });
    }

    if (review === "rejected") {
      stages.push({ label: decisionLabel, description: "We could not offer a seat this time. Thank you for applying.", state: "issue" });
    } else if (review === "waitlisted") {
      stages.push({ label: decisionLabel, description: "You are on the waiting list. We will contact you if a seat opens.", state: "current" });
    } else if (payment === "confirmed") {
      stages.push({
        label: confirmedLabel,
        description: allotment
          ? `${allotment.confirmed}${greeting}. ${allotment.next}`
          : `Your seat is reserved${greeting}. Camp details arrive by email and WhatsApp before ${bootcampFacts.datesShort}.`,
        state: "done",
      });
    } else {
      stages.push({ label: confirmedLabel, description: "Confirmed as soon as your payment is verified. This page updates the moment it happens.", state: "upcoming" });
    }
    return stages;
  }

  // Directorate runs an interview between review and the final decision, so
  // that stage is shown on its timeline from the start.
  const usesInterview = result.program === "directorate";

  const stages: Stage[] = [
    { label: "Application received", description: `Thanks${greeting}. Your application is safely in our records.`, state: "done" },
  ];

  if (review === "received" || review === "under_review") {
    stages.push({ label: "Under review", description: "The team reviews applications within 24 hours.", state: "current" });
    if (usesInterview) stages.push({ label: "Interview", description: "Shortlisted applicants are invited to a short interview.", state: "upcoming" });
    stages.push({ label: "Decision", description: "Posted here the moment it is made, check back anytime. We will also reach out on provided contact details.", state: "upcoming" });
  } else if (review === "interview") {
    stages.push({ label: "Under review", description: "Review complete.", state: "done" });
    stages.push({ label: "Interview", description: `You have been shortlisted${greeting}. The team will contact you on your email and WhatsApp to arrange a short interview.`, state: "current" });
    stages.push({ label: "Decision", description: "Posted here once your interview is complete.", state: "upcoming" });
  } else if (review === "accepted") {
    stages.push({ label: "Under review", description: "Review complete.", state: "done" });
    if (usesInterview) stages.push({ label: "Interview", description: "Interview stage complete.", state: "done" });
    stages.push({ label: "Selected", description: `Congratulations${greeting}! Check your email and WhatsApp for onboarding details.`, state: "done" });
  } else if (review === "waitlisted") {
    stages.push({ label: "Under review", description: "Review complete.", state: "done" });
    stages.push({ label: "Decision", description: "You are on the waiting list. We will contact you if a spot opens.", state: "current" });
  } else {
    stages.push({ label: "Under review", description: "Review complete.", state: "done" });
    stages.push({ label: "Decision", description: "We could not offer a place this time. Thank you for applying.", state: "issue" });
  }
  return stages;
}

function formatReference(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 10);
}

export function ApplicationStatusLookup() {
  const [referenceCode, setReferenceCode] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<StatusResult | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^(TC|CA|DR|DL|OB)-\d{2}-\d{4}$/.test(referenceCode)) {
      setMessage("Enter your Application ID, e.g. TC‑26‑1234.");
      return;
    }
    if (!emailPattern.test(email)) {
      setMessage("Enter the email address you applied with.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/applications/status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ referenceCode, email }),
      });
      const body = await response.json() as StatusResult & { message?: string };
      if (!response.ok) {
        setMessage(body.message || "We could not check your status right now.");
        return;
      }
      setResult(body);
    } catch {
      setMessage("A network error interrupted the lookup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const stages = buildStages(result);
    return (
      <div className="status-view">
        <button type="button" className="status-view__back" onClick={() => setResult(null)}>
          <ArrowLeft aria-hidden="true" /> Back
        </button>
        <div className="status-view__head">
          <strong>{programNames[result.program]}</strong>
          <p className="status-view__meta">
            <span className="status-view__id">{result.referenceCode}</span>
            {result.fullName && <span>{result.fullName}</span>}
            <span>Submitted {new Date(result.submittedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
            <span className="status-view__meta-ago">({timeAgo(result.submittedAt)})</span>
          </p>
        </div>
        <ol className="status-timeline">
          {stages.map((stage, index) => (
            <li key={stage.label} data-state={stage.state}>
              <span className="status-timeline__marker" aria-hidden="true">
                {stage.state === "done" ? <Check /> : stage.state === "issue" ? <TriangleAlert /> : index + 1}
              </span>
              <div>
                <strong>{stage.label}</strong>
                <p>{stage.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="status-view__hint">Updates arrive by WhatsApp and email. If you are expecting a message, check your spam folder for {siteConfig.email}.</p>
      </div>
    );
  }

  return (
    <div className="status-lookup">
      <header>
        <p className="eyebrow">Application status</p>
        <h1>Your application, <em>tracked.</em></h1>
        <p>Enter the Application ID from your confirmation screen and the email address you applied with.</p>
      </header>
      <form onSubmit={lookup} noValidate method="post">
        <label className="field">
          <span>Application ID</span>
          <input value={referenceCode} onChange={(event) => { setReferenceCode(formatReference(event.target.value)); setMessage(""); }} placeholder="TC-26-1234" autoComplete="off" spellCheck={false} />
          <small></small>
        </label>
        <label className="field">
          <span>Email address</span>
          <input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setMessage(""); }} autoComplete="email" />
          <small></small>
        </label>
        <div className="form-actions">
          <button type="submit" className="form-advance" disabled={loading}>
            <span>Instant lookup</span>
            <strong>{loading ? "Checking" : "Check status"}</strong>
            {loading ? <LoaderCircle className="spin" size={20} /> : <ArrowRight size={20} />}
          </button>
        </div>
      </form>

      <div className="status-lookup__feedback">
        {message && <p className="form-message" role="alert">{message}</p>}
      </div>
    </div>
  );
}
