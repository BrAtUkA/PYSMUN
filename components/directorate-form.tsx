"use client";

import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import Script from "next/script";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Field, FormRail, FormSuccess, PhoneField, ReviewLedger, SelectField, StepNumeral, TextareaField } from "@/components/application-form-kit";
import { ApplicationDocumentField } from "@/components/application-document-field";
import { ApplicationPhotoField } from "@/components/application-photo-field";
import { cnicPattern, formatCnic } from "@/lib/cnic";
import { emailPattern, formatPakistaniNationalNumber, pakistaniMobileMessage, pakistaniNationalMobilePattern } from "@/lib/contact-validation";

type Values = {
  fullName: string;
  cnic: string;
  email: string;
  whatsapp: string;
  emergencyContact: string;
  institution: string;
  gradeSemester: string;
  preferredDepartment: string;
  preferredPosition: string;
  previousExperience: string;
  uniqueValue: string;
  instagramLink: string;
  availabilityCity: string;
  availabilityMeetings: string;
  consent: boolean;
  website: string;
};

const initialValues: Values = {
  fullName: "",
  cnic: "",
  email: "",
  whatsapp: "",
  emergencyContact: "",
  institution: "",
  gradeSemester: "",
  preferredDepartment: "",
  preferredPosition: "",
  previousExperience: "",
  uniqueValue: "",
  instagramLink: "",
  availabilityCity: "",
  availabilityMeetings: "",
  consent: false,
  website: "",
};

const stepFields: (keyof Values)[][] = [
  ["fullName", "cnic", "email", "whatsapp", "emergencyContact", "institution", "gradeSemester"],
  ["preferredDepartment", "preferredPosition", "previousExperience", "uniqueValue"],
  ["availabilityCity", "availabilityMeetings"],
  ["consent"],
];

const stepNames = ["Identity", "Role", "Availability", "Declaration"];
const lastStep = stepNames.length - 1;

const departmentLabels: Record<string, string> = {
  registrations: "Registrations",
  logistics: "Logistics",
  hospitality: "Hospitality",
  media: "Media",
  decor: "Decor",
  security: "Security",
  "delegate-affairs": "Delegate Affairs",
};

const positionLabels: Record<string, string> = {
  director: "Director",
  "assistant-director": "Assistant Director",
  staff: "Staff",
};

export function DirectorateForm() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [photo, setPhoto] = useState<File | null>(null);
  const [cv, setCv] = useState<File | null>(null);
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

  const validateStep = () => {
    const nextErrors: Record<string, string[]> = {};
    for (const field of stepFields[step]) {
      const value = values[field];
      if (value === "" || value === false) nextErrors[field] = ["This field is required"];
    }
    if (step === 0 && !cnicPattern.test(values.cnic)) nextErrors.cnic = ["Enter a valid CNIC in 12345-1234567-1 format"];
    if (step === 0 && values.email && !emailPattern.test(values.email)) nextErrors.email = ["Enter a valid email address"];
    if (step === 0 && values.whatsapp && !pakistaniNationalMobilePattern.test(values.whatsapp)) nextErrors.whatsapp = [pakistaniMobileMessage];
    if (step === 0 && values.emergencyContact && !pakistaniNationalMobilePattern.test(values.emergencyContact)) nextErrors.emergencyContact = [pakistaniMobileMessage];
    if (step === 0 && !photo) nextErrors.photo = ["Applicant photo is required"];
    if (step === 1 && values.previousExperience.trim().length < 3) nextErrors.previousExperience = ["Let us know, even if it's none"];
    if (step === 1 && values.uniqueValue.trim().length < 30) nextErrors.uniqueValue = ["Please write at least 30 characters"];
    if (step === 1 && !cv) nextErrors.cv = ["CV is required"];
    if (step === 2 && values.availabilityCity && values.availabilityCity !== "yes") nextErrors.availabilityCity = ["You must be available in Rahim Yar Khan during the event to apply for this role"];
    if (step === 2 && values.availabilityMeetings && values.availabilityMeetings !== "yes") nextErrors.availabilityMeetings = ["You must be able to attend all meetings before the event to apply for this role"];
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
    const invalidStep = issues.photo?.length ? 0 : issues.cv?.length ? 1 : stepFields.findIndex((fields) => fields.some((field) => issues[field]?.length));
    if (invalidStep < 0) return;
    markStepChange();
    setStep(invalidStep);
    scrollToFirstError();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    // A submit event on an intermediate step (e.g. Enter in a single-input
    // step) must do nothing; only the explicit Continue button advances.
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
        emergencyContact: `+92${values.emergencyContact}`,
        turnstileToken: token,
      }));
      if (photo) submission.set("photo", photo);
      if (cv) submission.set("cv", cv);
      const response = await fetch("/api/applications/directorate", {
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
      title={<>You&rsquo;re on the<br /><em>shortlist.</em></>}
      note="Your Directorate application is with the PYSMUN team."
      reference={reference}
      steps={[
        "Your application is reviewed within 24 hours",
        "Shortlisted candidates may be invited to an interview",
        "Selected directors and staff are confirmed by email and WhatsApp",
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
        {step === 0 && <fieldset><legend>Let&rsquo;s start with you.</legend><p className="form-legend-copy">Use contact details you check regularly. We will use them for application updates.</p><div className="field-grid">
          <Field label="Full name" name="fullName" value={values.fullName} error={errors.fullName} onChange={update} autoComplete="name" />
          <Field label="CNIC / B-Form number" name="cnic" value={values.cnic} error={errors.cnic} onChange={update} transform={formatCnic} inputMode="numeric" maxLength={15} placeholder="12345-1234567-1" autoComplete="off" />
          <Field label="Email address" name="email" type="email" value={values.email} error={errors.email} onChange={update} autoComplete="email" />
          <PhoneField label="WhatsApp number" name="whatsapp" value={values.whatsapp} error={errors.whatsapp} onChange={update} autoComplete="tel-national" />
          <PhoneField label="Emergency contact number" name="emergencyContact" value={values.emergencyContact} error={errors.emergencyContact} onChange={update} />
          <Field label="Institution" name="institution" value={values.institution} error={errors.institution} onChange={update} />
          <Field label="Grade / semester" name="gradeSemester" value={values.gradeSemester} error={errors.gradeSemester} onChange={update} placeholder="e.g. Grade 11, or 4th semester" />
          <ApplicationPhotoField file={photo} error={errors.photo} onChange={(file) => { setPhoto(file); if (file) setPhotoError(); }} onError={setPhotoError} wide />
        </div></fieldset>}

        {step === 1 && <fieldset><legend>Choose your room.</legend><p className="form-legend-copy">Tell us where you would fit best and what you would bring to the team.</p><div className="field-grid">
          <SelectField label="Preferred department" name="preferredDepartment" value={values.preferredDepartment} error={errors.preferredDepartment} onChange={update} options={[["registrations", "Registrations"], ["logistics", "Logistics"], ["hospitality", "Hospitality"], ["media", "Media"], ["decor", "Decor"], ["security", "Security"], ["delegate-affairs", "Delegate Affairs"]]} />
          <SelectField label="Preferred position" name="preferredPosition" value={values.preferredPosition} error={errors.preferredPosition} onChange={update} options={[["director", "Director"], ["assistant-director", "Assistant Director"], ["staff", "Staff"]]} />
          <TextareaField label="Previous MUN or event experience" name="previousExperience" value={values.previousExperience} error={errors.previousExperience} onChange={update} maxLength={700} placeholder="Write “None” if this is your first time — that’s alright." />
          <TextareaField label="What unique value will you bring?" name="uniqueValue" value={values.uniqueValue} error={errors.uniqueValue} onChange={update} maxLength={700} minLength={30} />
          <Field label="Instagram link (optional, if public)" name="instagramLink" value={values.instagramLink} error={errors.instagramLink} onChange={update} placeholder="instagram.com/yourprofile" wide />
          <ApplicationDocumentField file={cv} error={errors.cv} onChange={(file) => { setCv(file); if (file) setCvError(); }} onError={setCvError} wide />
        </div></fieldset>}

        {step === 2 && <fieldset><legend>Can you commit?</legend><p className="form-legend-copy">Directors and staff carry the event on the day. Please answer honestly — we would rather know now.</p><div className="field-grid">
          <SelectField label="Will you be available in Rahim Yar Khan during the event dates?" name="availabilityCity" value={values.availabilityCity} error={errors.availabilityCity} onChange={update} options={[["yes", "Yes"], ["no", "No"]]} wide />
          <SelectField label="Can you attend all meetings scheduled before the event?" name="availabilityMeetings" value={values.availabilityMeetings} error={errors.availabilityMeetings} onChange={update} options={[["yes", "Yes"], ["no", "No"]]} wide />
        </div></fieldset>}

        {step === 3 && <fieldset><legend>Review and submit.</legend><p className="form-legend-copy">Check your information before sending it to the PYSMUN team.</p>
          <ReviewLedger photo={photo} cv={cv} rows={[["Program", "Directorate"], ["Name", values.fullName], ["CNIC", values.cnic], ["Email", values.email], ["WhatsApp", `+92 ${formatPakistaniNationalNumber(values.whatsapp)}`], ["Emergency contact", `+92 ${formatPakistaniNationalNumber(values.emergencyContact)}`], ["Institution", values.institution], ["Grade / semester", values.gradeSemester], ["Preferred department", departmentLabels[values.preferredDepartment] || values.preferredDepartment], ["Preferred position", positionLabels[values.preferredPosition] || values.preferredPosition]]} />
          <label className="consent"><input type="checkbox" checked={values.consent} onChange={(event) => update("consent", event.target.checked)} /><span>I confirm this information is accurate and consent to PYSMUN securely using my details, CNIC, photo and CV to review my Directorate application and contact me about the role.</span></label>{errors.consent && <p className="form-error">{errors.consent[0]}</p>}{siteKey && <div className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />}</fieldset>}
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
