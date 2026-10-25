"use client";

import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import Script from "next/script";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Field, FormRail, FormSuccess, PhoneField, ReviewLedger, StepNumeral, TextareaField } from "@/components/application-form-kit";
import { ApplicationDocumentField } from "@/components/application-document-field";
import { ApplicationPhotoField } from "@/components/application-photo-field";
import { cnicPattern, formatCnic } from "@/lib/cnic";
import { emailPattern, formatPakistaniNationalNumber, pakistaniMobileMessage, pakistaniNationalMobilePattern } from "@/lib/contact-validation";

type Values = {
  fullName: string;
  institution: string;
  email: string;
  whatsapp: string;
  cnic: string;
  delegateExperience: string;
  daisExperience: string;
  delegationsCount: string;
  awards: string;
  consent: boolean;
  website: string;
};

const initialValues: Values = {
  fullName: "",
  institution: "",
  email: "",
  whatsapp: "",
  cnic: "",
  delegateExperience: "",
  daisExperience: "",
  delegationsCount: "",
  awards: "",
  consent: false,
  website: "",
};

const stepFields: (keyof Values)[][] = [
  ["fullName", "institution", "email", "whatsapp", "cnic"],
  ["delegateExperience", "daisExperience", "delegationsCount", "awards"],
  ["consent"],
];

const stepNames = ["Identity", "Experience", "Declaration"];
const lastStep = stepNames.length - 1;

export function AcdForm() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [photo, setPhoto] = useState<File | null>(null);
  const [cv, setCv] = useState<File | null>(null);
  const [awardsProof, setAwardsProof] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // Turnstile only auto-renders widgets present when its script first loads;
  // our widget mounts on the final step, so render it explicitly.
  useEffect(() => {
    if (!siteKey || step !== lastStep) return;
    const element = document.querySelector<HTMLElement>(".cf-turnstile");
    if (!element || element.childElementCount > 0) return;
    const turnstile = (window as { turnstile?: { render?: (el: HTMLElement, options: { sitekey: string; theme?: string }) => void } }).turnstile;
    turnstile?.render?.(element, { sitekey: siteKey, theme: "light" });
  }, [siteKey, step]);

  const update = (name: keyof Values, value: string | boolean) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
    setMessage("");
  };

  const setPhotoError = (error?: string) => {
    setErrors((current) => {
      const next = { ...current };
      if (error) next.photo = [error];
      else delete next.photo;
      return next;
    });
  };

  const setCvError = (error?: string) => {
    setErrors((current) => {
      const next = { ...current };
      if (error) next.cv = [error];
      else delete next.cv;
      return next;
    });
  };

  const setAwardsProofError = (error?: string) => {
    setErrors((current) => {
      const next = { ...current };
      if (error) next.idDocument = [error];
      else delete next.idDocument;
      return next;
    });
  };

  const validateStep = () => {
    const nextErrors: Record<string, string[]> = {};
    for (const field of stepFields[step]) {
      const value = values[field];
      if (value === "" || value === false) nextErrors[field] = ["This field is required"];
    }
    if (step === 0 && values.fullName.trim().length < 3) nextErrors.fullName = ["Enter your full name"];
    if (step === 0 && values.institution.trim().length < 2) nextErrors.institution = ["Enter your institution"];
    if (step === 0 && values.email && !emailPattern.test(values.email)) nextErrors.email = ["Enter a valid email address"];
    if (step === 0 && values.whatsapp && !pakistaniNationalMobilePattern.test(values.whatsapp)) nextErrors.whatsapp = [pakistaniMobileMessage];
    if (step === 0 && !cnicPattern.test(values.cnic)) nextErrors.cnic = ["Enter a valid CNIC in 12345-1234567-1 format"];
    if (step === 0 && !photo) nextErrors.photo = ["Applicant photo is required"];

    if (step === 1 && values.delegateExperience.trim().length < 5) nextErrors.delegateExperience = ["Share your experience as a delegate"];
    if (step === 1 && values.daisExperience.trim().length < 4) nextErrors.daisExperience = ["Share your experience as a Dais member, or write None"];
    if (step === 1 && values.delegationsCount.trim().length < 1) nextErrors.delegationsCount = ["Please specify how many delegations you can bring"];
    if (step === 1 && values.awards.trim().length < 3) nextErrors.awards = ["List your awards or write None"];
    if (step === 1 && !cv) nextErrors.cv = ["Resume is required"];
    if (step === 1 && !awardsProof) nextErrors.idDocument = ["Proof of awards is required"];

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const scrollToForm = () => {
    window.requestAnimationFrame(() => document.querySelector(".form-main")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  // Waits two frames so freshly-set error state has rendered, then centers the
  // topmost errored field so failures are never off screen.
  const scrollToFirstError = () => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>('.application-form [aria-invalid="true"], .application-form .photo-picker--error, .application-form .form-error');
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const alreadyVisible = rect.top >= 90 && rect.bottom <= window.innerHeight - 16;
      if (!alreadyVisible) target.scrollIntoView({ behavior: "smooth", block: "center" });
      const focusable = (target.matches("input, select, textarea, button")
        ? target
        : target.querySelector<HTMLElement>("input, select, textarea, button"))
        ?? target.previousElementSibling?.querySelector<HTMLElement>("input");
      focusable?.focus({ preventScroll: true });
    }));
  };

  // A double-fired click on Continue would land its second click on the button
  // that replaced it (the next step's Continue, or Submit) and act on the new
  // step instantly. Ignore advance/submit actions briefly after a step change.
  const stepChangedAt = useRef(0);
  const stepJustChanged = () => Date.now() - stepChangedAt.current < 350;
  const markStepChange = () => { stepChangedAt.current = Date.now(); };

  const next = () => {
    if (stepJustChanged()) return;
    if (validateStep()) { markStepChange(); setMessage(""); setStep((current) => Math.min(lastStep, current + 1)); scrollToForm(); }
    else scrollToFirstError();
  };
  const goTo = (index: number) => { if (index < step) { markStepChange(); setMessage(""); setStep(index); scrollToForm(); } };

  const returnToFirstInvalidStep = (issues: Record<string, string[]>) => {
    const invalidStep = issues.photo?.length ? 0 : (issues.cv?.length || issues.idDocument?.length) ? 1 : stepFields.findIndex((fields) => fields.some((field) => issues[field]?.length));
    if (invalidStep < 0) return;
    markStepChange();
    setStep(invalidStep);
    scrollToFirstError();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (step !== lastStep) return;
    if (stepJustChanged()) return;
    if (!validateStep()) { scrollToFirstError(); return; }
    setStatus("submitting");
    setMessage("");
    const token = document.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]')?.value;
    try {
      const submission = new FormData();
      submission.set("payload", JSON.stringify({
        ...values,
        whatsapp: `+92${values.whatsapp}`,
        turnstileToken: token,
      }));
      if (photo) submission.set("photo", photo);
      if (cv) submission.set("cv", cv);
      if (awardsProof) submission.set("idDocument", awardsProof);

      const response = await fetch("/api/applications/acd", {
        method: "POST",
        body: submission,
      });
      const result = await response.json() as { message: string; referenceCode?: string; issues?: Record<string, string[]> };
      if (!response.ok) {
        const issues = result.issues || {};
        setErrors(issues);
        returnToFirstInvalidStep(issues);
        setMessage(result.message);
        setStatus("idle");
        return;
      }
      setReference(result.referenceCode || "Received");
      setStatus("success");
    } catch {
      setMessage("A network error interrupted the submission. Please try again.");
      setStatus("idle");
    }
  };

  if (status === "success") {
    return <FormSuccess
      title={<>You&rsquo;re on<br /><em>the dais list.</em></>}
      note="Your Assistant Committee Director application is with the PYSMUN team."
      reference={reference}
      steps={[
        "Your application and credentials are reviewed by the secretariat within 24 hours",
        "Shortlisted candidates are contacted for committee allocation and interview",
        "Confirmed Assistant Committee Directors are announced on official channels",
      ]}
    />;
  }

  return (
    <form className="application-form" method="post" onSubmit={submit} noValidate>
      {siteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />}
      <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => update("website", event.target.value)} aria-hidden="true" />
      <FormRail steps={stepNames} current={step} onStepSelect={goTo} />

      <div className="form-step" key={step}>
        <StepNumeral step={step} />
        {step === 0 && <fieldset><legend>Let&rsquo;s start with you.</legend><p className="form-legend-copy">Use contact details you check regularly. We will use them for dais updates and committee allocation.</p><div className="field-grid">
          <Field label="Full name" name="fullName" value={values.fullName} error={errors.fullName} onChange={update} autoComplete="name" />
          <Field label="Institution" name="institution" value={values.institution} error={errors.institution} onChange={update} placeholder="School, college, or university" />
          <Field label="Email address" name="email" type="email" value={values.email} error={errors.email} onChange={update} autoComplete="email" />
          <PhoneField label="WhatsApp / contact number" name="whatsapp" value={values.whatsapp} error={errors.whatsapp} onChange={update} autoComplete="tel-national" />
          <Field label="CNIC / B-Form number" name="cnic" value={values.cnic} error={errors.cnic} onChange={update} transform={formatCnic} inputMode="numeric" maxLength={15} placeholder="12345-1234567-1" autoComplete="off" />
          <ApplicationPhotoField file={photo} error={errors.photo} onChange={(file) => { setPhoto(file); if (file) setPhotoError(); }} onError={setPhotoError} prompt="Choose a clear headshot or portrait" note="Used to identify your application and dais profile." wide />
        </div></fieldset>}

        {step === 1 && <fieldset><legend>Your MUN background.</legend><p className="form-legend-copy">Share your experience in committee and on the dais. Honest details help us allot committees effectively.</p><div className="field-grid">
          <TextareaField label="What is your experience as a delegate?" name="delegateExperience" value={values.delegateExperience} error={errors.delegateExperience} onChange={update} maxLength={1200} minLength={5} placeholder="List conferences, committees, countries represented and years..." rows={3} />
          <TextareaField label="What is your experience as a Dais member?" name="daisExperience" value={values.daisExperience} error={errors.daisExperience} onChange={update} maxLength={1200} minLength={4} placeholder="List conferences chaired, committees moderated or write “None” if this is your first dais role..." rows={3} />
          <Field label="How many delegations can you bring to PYSMUN?" name="delegationsCount" value={values.delegationsCount} error={errors.delegationsCount} onChange={update} placeholder="e.g. 1–2 delegations, or None" wide />
          <TextareaField label="Awards and honors" name="awards" value={values.awards} error={errors.awards} onChange={update} maxLength={1000} minLength={3} placeholder="List any Best Delegate, Outstanding, or other honors won (or write “None”)..." rows={3} />
          <ApplicationDocumentField file={cv} error={errors.cv} onChange={(file) => { setCv(file); if (file) setCvError(); }} onError={setCvError} label="Resume / CV" prompt="Attach your resume (PDF or image)" note="PDF or image under 2 MB with your academic or MUN background." requiredMessage="Resume is required" wide />
          <ApplicationDocumentField file={awardsProof} error={errors.idDocument} onChange={(file) => { setAwardsProof(file); if (file) setAwardsProofError(); }} onError={setAwardsProofError} label="Proof of awards" prompt="Attach award certificates, medals or proof" note="Upload images or PDF of certificates or accolades (under 2 MB)." requiredMessage="Proof of awards is required" wide />
        </div></fieldset>}

        {step === 2 && <fieldset><legend>Review and submit.</legend><p className="form-legend-copy">Check your information before sending it to the academic secretariat.</p>
          <ReviewLedger
            photo={photo}
            cv={cv}
            cvLabel="Resume"
            idDocument={awardsProof}
            idDocumentLabel="Awards proof"
            rows={[
              ["Program", "Assistant Committee Director"],
              ["Name", values.fullName],
              ["Institution", values.institution],
              ["Email", values.email],
              ["WhatsApp", `+92 ${formatPakistaniNationalNumber(values.whatsapp)}`],
              ["CNIC", values.cnic],
              ["Delegations to bring", values.delegationsCount],
            ]}
          />
          <label className="consent">
            <input type="checkbox" checked={values.consent} onChange={(event) => update("consent", event.target.checked)} />
            <span>I confirm this information is accurate and consent to PYSMUN securely using my details, CNIC, photo, resume and award proof to review my Assistant Committee Director application and contact me about dais allotment.</span>
          </label>
          {errors.consent && <p className="form-error">{errors.consent[0]}</p>}
          {siteKey && <div className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />}
        </fieldset>}
      </div>

      {message && <p className="form-message form-message--mobile" role="alert">{message}</p>}
      <div className="form-actions">
        {step > 0 && <button type="button" className="form-back" onClick={() => goTo(step - 1)}><ArrowLeft size={15} /> Back</button>}
        {step < lastStep
          ? <button type="button" className="form-advance" onClick={next}><span data-error={message ? true : undefined} role={message ? "alert" : undefined}>{message || <>Next · {stepNames[step + 1]}</>}</span><strong>Continue</strong><ArrowRight size={20} /></button>
          : <button type="submit" className="form-advance" disabled={status === "submitting"}><span data-error={message ? true : undefined} role={message ? "alert" : undefined}>{message || "Final step"}</span><strong>{status === "submitting" ? "Sending" : "Submit application"}</strong>{status === "submitting" ? <LoaderCircle className="spin" size={20} /> : <ArrowRight size={20} />}</button>}
      </div>
    </form>
  );
}
