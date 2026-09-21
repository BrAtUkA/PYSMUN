"use client";

import { ArrowLeft, ArrowRight, Check, Copy, LoaderCircle } from "lucide-react";
import Script from "next/script";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Field, FormRail, FormSuccess, PhoneField, ReviewLedger, SelectField, StepNumeral, TextareaField } from "@/components/application-form-kit";
import { ApplicationDocumentField } from "@/components/application-document-field";
import { ApplicationPhotoField } from "@/components/application-photo-field";
import { CommitteeIcon } from "@/components/committee-icon";
import { cnicPattern, formatCnic } from "@/lib/cnic";
import { emailPattern, formatPakistaniNationalNumber, pakistaniMobileMessage, pakistaniNationalMobilePattern } from "@/lib/contact-validation";
import { committees, delegateFacts } from "@/lib/content";
import { paymentAccount } from "@/lib/payment";

type CurrentFee = { tier: "early-bird" | "regular"; label: string; fee: string; feeAmount: string };

type Values = {
  fullName: string; email: string; whatsapp: string; gender: string; age: string;
  cnic: string; institution: string; fieldOfStudy: string; gradeSemester: string; emergencyContact: string;
  firstChoiceCommittee: string; secondChoiceCommittee: string; countryPreference: string; previousExperience: string; referral: string; ambassadorCode: string;
  transactionReference: string; consent: boolean; website: string;
};

const initialValues: Values = {
  fullName: "", email: "", whatsapp: "", gender: "", age: "",
  cnic: "", institution: "", fieldOfStudy: "", gradeSemester: "", emergencyContact: "",
  firstChoiceCommittee: "", secondChoiceCommittee: "", countryPreference: "", previousExperience: "", referral: "", ambassadorCode: "",
  transactionReference: "", consent: false, website: "",
};

const stepFields: (keyof Values)[][] = [
  ["fullName", "email", "whatsapp", "gender", "age"],
  ["cnic", "institution", "fieldOfStudy", "gradeSemester", "emergencyContact"],
  ["firstChoiceCommittee", "secondChoiceCommittee", "countryPreference", "previousExperience"],
  ["transactionReference"],
  ["consent"],
];

const stepNames = ["Identity", "Documents", "Committee", "Payment", "Declaration"];
const lastStep = stepNames.length - 1;

const genderOptions: string[][] = [["male", "Male"], ["female", "Female"], ["other", "Other"]];
const genderLabels: Record<string, string> = { male: "Male", female: "Female", other: "Other" };
const committeeLabels: Record<string, string> = Object.fromEntries(committees.map((committee) => [committee.code, committee.name]));

// A card grid instead of a dropdown so each committee's own brand color and
// logo carry through into the choice itself, not just the review step.
function CommitteePicker({ label, name, value, otherValue, onChange, error }: {
  label: string;
  name: "firstChoiceCommittee" | "secondChoiceCommittee";
  value: string;
  otherValue: string;
  onChange: (name: "firstChoiceCommittee" | "secondChoiceCommittee", value: string) => void;
  error?: string[];
}) {
  return (
    <div className="field field--wide committee-picker">
      <span>{label}</span>
      <div className="committee-picker__grid" role="radiogroup" aria-label={label}>
        {committees.map((committee) => {
          const selected = value === committee.code;
          const disabled = !selected && committee.code === otherValue;
          return (
            <button
              type="button"
              key={committee.code}
              className="committee-picker__option"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              data-selected={selected || undefined}
              onClick={() => onChange(name, committee.code)}
            >
              <CommitteeIcon committee={committee} className="committee-icon--picker" />
              <span>{committee.name}</span>
            </button>
          );
        })}
      </div>
      <small>{error?.[0]}</small>
    </div>
  );
}

function CopyableDetail({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // The value stays selectable by hand.
    }
  };

  return (
    <div>
      <span>{label}</span>
      <span className="payment-slip__value">
        <strong>{value}</strong>
        <button type="button" className="payment-slip__copy" data-copied={copied || undefined} onClick={copy} aria-label={`Copy ${label.toLowerCase()}`}>
          {copied ? <><Check aria-hidden="true" /> Copied</> : <><Copy aria-hidden="true" /> Copy</>}
        </button>
      </span>
    </div>
  );
}

export function DelegateForm({ currentFee }: { currentFee: CurrentFee }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [photo, setPhoto] = useState<File | null>(null);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
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
    setErrors((current) => { const next = { ...current }; delete next[name]; return next; });
    setMessage("");
  };

  const setFileError = (field: "photo" | "idDocument" | "receipt") => (error?: string) => {
    setErrors((current) => {
      const next = { ...current };
      if (error) next[field] = [error];
      else delete next[field];
      return next;
    });
  };
  const setPhotoError = setFileError("photo");
  const setIdDocumentError = setFileError("idDocument");
  const setReceiptError = setFileError("receipt");

  const validateStep = () => {
    const nextErrors: Record<string, string[]> = {};
    for (const field of stepFields[step]) {
      const value = values[field];
      if (value === "" || value === false) nextErrors[field] = ["This field is required"];
    }
    if (step === 0 && values.email && !emailPattern.test(values.email)) nextErrors.email = ["Enter a valid email address"];
    if (step === 0 && values.whatsapp && !pakistaniNationalMobilePattern.test(values.whatsapp)) nextErrors.whatsapp = [pakistaniMobileMessage];
    const age = Number(values.age);
    if (step === 0 && values.age && (!Number.isInteger(age) || age < 15 || age > 23)) nextErrors.age = ["Applicants must be between 15 and 23"];
    if (step === 0 && !photo) nextErrors.photo = ["Applicant photo is required"];
    if (step === 1 && !cnicPattern.test(values.cnic)) nextErrors.cnic = ["Enter a valid CNIC or B-Form number in 12345-1234567-1 format"];
    if (step === 1 && values.emergencyContact && !pakistaniNationalMobilePattern.test(values.emergencyContact)) nextErrors.emergencyContact = [pakistaniMobileMessage];
    if (step === 1 && !idDocument) nextErrors.idDocument = ["ID document is required"];
    if (step === 2 && values.previousExperience.trim().length < 3) nextErrors.previousExperience = ["Let us know, even if it's none"];
    if (step === 2 && values.firstChoiceCommittee && values.secondChoiceCommittee && values.firstChoiceCommittee === values.secondChoiceCommittee) nextErrors.secondChoiceCommittee = ["Choose two different committees"];
    if (step === 3 && values.transactionReference.trim().length < 4) nextErrors.transactionReference = ["Enter the transaction ID from your payment"];
    if (step === 3 && !receipt) nextErrors.receipt = ["Payment receipt is required"];
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
    const invalidStep = issues.photo?.length
      ? 0
      : issues.idDocument?.length
        ? 1
        : issues.receipt?.length
          ? 3
          : stepFields.findIndex((fields) => fields.some((field) => issues[field]?.length));
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
        age: Number(values.age),
        turnstileToken: token,
      }));
      if (photo) submission.set("photo", photo);
      if (idDocument) submission.set("idDocument", idDocument);
      if (receipt) submission.set("receipt", receipt);
      const response = await fetch("/api/applications/delegate", {
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
      title={<>You&rsquo;re on<br /><em>the floor.</em></>}
      note="Your Delegate form is with the PYSMUN team."
      reference={reference}
      steps={[
        "Your payment is verified within 24 hours",
        "Committee and country or personality allotment is confirmed by email and WhatsApp",
        "Study guides and conference details arrive before the event",
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
          <Field label="Email address" name="email" type="email" value={values.email} error={errors.email} onChange={update} autoComplete="email" />
          <PhoneField label="Contact number" name="whatsapp" value={values.whatsapp} error={errors.whatsapp} onChange={update} autoComplete="tel-national" />
          <SelectField label="Gender" name="gender" value={values.gender} error={errors.gender} onChange={update} options={genderOptions} />
          <Field label="Age" name="age" type="number" value={values.age} error={errors.age} onChange={update} min="15" max="23" />
          <ApplicationPhotoField file={photo} error={errors.photo} onChange={(file) => { setPhoto(file); if (file) setPhotoError(); }} onError={setPhotoError} wide />
        </div></fieldset>}

        {step === 1 && <fieldset><legend>Verify your identity.</legend><p className="form-legend-copy">Your CNIC or B-Form is used to confirm your identity and issue your delegate badge.</p><div className="field-grid">
          <Field label="CNIC / B-Form number" name="cnic" value={values.cnic} error={errors.cnic} onChange={update} transform={formatCnic} inputMode="numeric" maxLength={15} placeholder="12345-1234567-1" autoComplete="off" />
          <Field label="Institution" name="institution" value={values.institution} error={errors.institution} onChange={update} />
          <Field label="Field of study" name="fieldOfStudy" value={values.fieldOfStudy} error={errors.fieldOfStudy} onChange={update} />
          <Field label="Grade / semester" name="gradeSemester" value={values.gradeSemester} error={errors.gradeSemester} onChange={update} placeholder="e.g. Grade 11, or 4th semester" />
          <PhoneField label="Emergency contact number" name="emergencyContact" value={values.emergencyContact} error={errors.emergencyContact} onChange={update} />
          <ApplicationDocumentField file={idDocument} error={errors.idDocument} onChange={(file) => { setIdDocument(file); if (file) setIdDocumentError(); }} onError={setIdDocumentError} label="CNIC / B-Form photo" prompt="Attach a photo or scan of your CNIC or B-Form" note="JPEG, PNG, WebP or PDF, under 2 MB." requiredMessage="ID document is required" wide />
        </div></fieldset>}

        {step === 2 && <fieldset><legend>Your committee preferences.</legend><p className="form-legend-copy">Committee and country or personality allotment follows review, based on your preferences.</p><div className="field-grid">
          <CommitteePicker label="1st choice of committee" name="firstChoiceCommittee" value={values.firstChoiceCommittee} otherValue={values.secondChoiceCommittee} error={errors.firstChoiceCommittee} onChange={update} />
          <CommitteePicker label="2nd choice of committee" name="secondChoiceCommittee" value={values.secondChoiceCommittee} otherValue={values.firstChoiceCommittee} error={errors.secondChoiceCommittee} onChange={update} />
          <Field label="Country / personality preference" name="countryPreference" value={values.countryPreference} error={errors.countryPreference} onChange={update} wide />
          <TextareaField label="Previous MUN experience" name="previousExperience" value={values.previousExperience} error={errors.previousExperience} onChange={update} maxLength={700} placeholder="Write “None” if this is your first time — that’s alright." />
          <Field label="How did you hear about PYSMUN? (optional)" name="referral" value={values.referral} error={errors.referral} onChange={update} />
          <Field label="Ambassador code (optional)" name="ambassadorCode" value={values.ambassadorCode} error={errors.ambassadorCode} onChange={update} placeholder="If referred by a Campus Ambassador" />
        </div></fieldset>}

        {step === 3 && <fieldset><legend>Reserve your seat.</legend><p className="form-legend-copy">Send the fee, then attach your receipt. Payments are verified within 24 hours.</p>
          <div className="payment-slip">
            <div className="payment-slip__fee"><span>Delegate fee &middot; {currentFee.label}</span><strong>{currentFee.fee}</strong></div>
            <div className="payment-slip__rows">
              <div><span>Bank</span><strong>{paymentAccount.bank}</strong></div>
              <div><span>Account title</span><strong>{paymentAccount.title}</strong></div>
              <CopyableDetail label="Account number" value={paymentAccount.number} />
              <CopyableDetail label="IBAN" value={paymentAccount.iban} />
            </div>
            <p className="payment-slip__note">
              {paymentAccount.pending
                ? "Final account details will be published here before applications open."
                : "Send exactly the fee amount, keep your receipt, and enter the transaction ID below."}
              {!paymentAccount.pending && currentFee.tier === "early-bird" && ` Early bird pricing ends ${delegateFacts.earlyBirdEndsDisplay}.`}
            </p>
          </div>
          <div className="field-grid">
            <Field label="Transaction / TRX ID" name="transactionReference" value={values.transactionReference} error={errors.transactionReference} onChange={update} autoComplete="off" placeholder="e.g. 9284716352" wide />
            <ApplicationPhotoField file={receipt} error={errors.receipt} onChange={(file) => { setReceipt(file); if (file) setReceiptError(); }} onError={setReceiptError} label="Payment receipt" prompt="Attach your payment screenshot" note="Checked against your transaction ID during verification." requiredMessage="Payment receipt is required" wide />
          </div></fieldset>}

        {step === 4 && <fieldset><legend>Review and submit.</legend><p className="form-legend-copy">Check your information before sending it to the PYSMUN team.</p>
          <ReviewLedger photo={photo} idDocument={idDocument} receipt={receipt} rows={[["Program", "Delegate"], ["Name", values.fullName], ["Email", values.email], ["Contact", `+92 ${formatPakistaniNationalNumber(values.whatsapp)}`], ["Gender", genderLabels[values.gender] || values.gender], ["Age", values.age], ["CNIC / B-Form", values.cnic], ["Institution", values.institution], ["Field of study", values.fieldOfStudy], ["Grade / semester", values.gradeSemester], ["Emergency contact", `+92 ${formatPakistaniNationalNumber(values.emergencyContact)}`], ["1st choice committee", committeeLabels[values.firstChoiceCommittee] || values.firstChoiceCommittee], ["2nd choice committee", committeeLabels[values.secondChoiceCommittee] || values.secondChoiceCommittee], ["Country / personality preference", values.countryPreference], ["Fee paid", currentFee.fee], ["Transaction ID", values.transactionReference]]} />
          <label className="consent"><input type="checkbox" checked={values.consent} onChange={(event) => update("consent", event.target.checked)} /><span>I confirm this information is accurate and consent to PYSMUN securely using my details, CNIC, photo, ID document and payment information to process my Delegate form and contact me about committee allotment. I understand the fee is non-refundable.</span></label>{errors.consent && <p className="form-error">{errors.consent[0]}</p>}{siteKey && <div className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />}</fieldset>}
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
