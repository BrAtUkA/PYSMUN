"use client";

import { Check, ChevronDown, Copy, FileText, TriangleAlert, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { formatPakistaniNationalNumber, parsePakistaniNationalNumber } from "@/lib/contact-validation";
import { siteConfig } from "@/lib/content";
import { filePreviewUrl } from "@/lib/file-preview";

type FieldChange<N extends string> = (name: N, value: string) => void;

export function FormRail({ steps, current, onStepSelect }: { steps: string[]; current: number; onStepSelect: (index: number) => void }) {
  return (
    <ol className="form-rail" data-steps={steps.length} aria-label="Application steps">
      {steps.map((label, index) => {
        const state = index === current ? "current" : index < current ? "done" : "todo";
        return (
          <li key={label} data-state={state}>
            <button
              type="button"
              disabled={index >= current}
              aria-current={index === current ? "step" : undefined}
              onClick={() => onStepSelect(index)}
            >
              <span className="form-rail__num">{String(index + 1).padStart(2, "0")}</span>
              <span className="form-rail__label">{label}</span>
              {index < current && <Check aria-hidden="true" />}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function StepNumeral({ step }: { step: number }) {
  return <span className="form-numeral" aria-hidden="true">{String(step + 1).padStart(2, "0")}</span>;
}

export function Field<N extends string>({ label, name, value, onChange, error, type = "text", transform, wide, ...props }: {
  label: string;
  name: N;
  value: string;
  onChange: FieldChange<N>;
  error?: string[];
  type?: string;
  transform?: (value: string) => string;
  wide?: boolean;
  [key: string]: unknown;
}) {
  return (
    <label className={wide ? "field field--wide" : "field"}>
      <span>{label}</span>
      <input {...props} type={type} value={value} onChange={(event) => onChange(name, transform ? transform(event.target.value) : event.target.value)} aria-invalid={Boolean(error)} />
      <small>{error?.[0]}</small>
    </label>
  );
}

export function PhoneField<N extends string>({ label, name, value, onChange, error, dial = "+92", wide, ...props }: {
  label: string;
  name: N;
  value: string;
  onChange: FieldChange<N>;
  error?: string[];
  dial?: string;
  wide?: boolean;
  [key: string]: unknown;
}) {
  return (
    <label className={wide ? "field field--phone field--wide" : "field field--phone"}>
      <span>{label}</span>
      <span className="field__phone-wrap">
        <span className="field__dial">{dial}</span>
        <input
          {...props}
          type="tel"
          inputMode="tel"
          value={formatPakistaniNationalNumber(value)}
          onChange={(event) => onChange(name, parsePakistaniNationalNumber(event.target.value))}
          aria-invalid={Boolean(error)}
          placeholder="300 1234567"
        />
      </span>
      <small>{error?.[0]}</small>
    </label>
  );
}

export function SelectField<N extends string>({ label, name, value, onChange, error, options, wide }: {
  label: string;
  name: N;
  value: string;
  onChange: FieldChange<N>;
  error?: string[];
  options: string[][];
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [dropUp, setDropUp] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const selectedIndex = options.findIndex(([key]) => key === value);
  const selectedLabel = selectedIndex >= 0 ? options[selectedIndex][1] : "";

  const openList = () => {
    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const host = button.closest(".form-step");
      const hostBottom = host ? host.getBoundingClientRect().bottom : window.innerHeight;
      setDropUp(Math.min(hostBottom, window.innerHeight) - rect.bottom < options.length * 44 + 24);
    }
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const choose = (index: number) => {
    onChange(name, options[index][0]);
    setOpen(false);
    buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    if (event.key === "Escape") { event.preventDefault(); setOpen(false); return; }
    if (event.key === "Tab") { setOpen(false); return; }
    if (event.key === "ArrowDown") { event.preventDefault(); setActive((index) => Math.min(options.length - 1, index + 1)); return; }
    if (event.key === "ArrowUp") { event.preventDefault(); setActive((index) => Math.max(0, index - 1)); return; }
    if (event.key === "Home") { event.preventDefault(); setActive(0); return; }
    if (event.key === "End") { event.preventDefault(); setActive(options.length - 1); return; }
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(active); }
  };

  return (
    <div className={wide ? "field field--select field--wide" : "field field--select"} ref={rootRef}>
      <span id={`${id}-label`}>{label}</span>
      <div className="select-shell">
        <button
          type="button"
          ref={buttonRef}
          className="select-trigger"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          aria-labelledby={`${id}-label ${id}-value`}
          aria-activedescendant={open ? `${id}-option-${active}` : undefined}
          aria-invalid={Boolean(error)}
          data-open={open || undefined}
          data-placeholder={!selectedLabel || undefined}
          onClick={() => (open ? setOpen(false) : openList())}
          onKeyDown={onKeyDown}
        >
          <span id={`${id}-value`}>{selectedLabel || "Select one"}</span>
          <ChevronDown aria-hidden="true" />
        </button>
        {open && (
          <ul className="select-menu" id={`${id}-listbox`} role="listbox" aria-labelledby={`${id}-label`} data-drop-up={dropUp || undefined}>
            {options.map(([key, text], index) => (
              <li
                key={key}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={key === value}
                data-active={index === active || undefined}
                onPointerMove={() => setActive(index)}
                onClick={() => choose(index)}
              >
                {text}
                {key === value && <Check aria-hidden="true" />}
              </li>
            ))}
          </ul>
        )}
      </div>
      <small>{error?.[0]}</small>
    </div>
  );
}

export function TextareaField<N extends string>({ label, name, value, onChange, error, rows = 4, maxLength, minLength, hint, placeholder }: {
  label: string;
  name: N;
  value: string;
  onChange: FieldChange<N>;
  error?: string[];
  rows?: number;
  maxLength: number;
  minLength?: number;
  hint?: string;
  placeholder?: string;
}) {
  const counter = minLength && value.length > 0 && value.length < minLength
    ? `${value.length}/${maxLength} · minimum ${minLength} characters`
    : `${value.length}/${maxLength}`;
  return (
    <label className="field field--area">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(name, event.target.value)} rows={rows} maxLength={maxLength} placeholder={placeholder ?? (minLength ? `At least ${minLength} characters` : undefined)} aria-invalid={Boolean(error)} />
      <small>{error?.[0] || hint || counter}</small>
    </label>
  );
}

export function ReviewLedger({ rows, photo, receipt, cv }: { rows: [string, string][]; photo: File | null; receipt?: File | null; cv?: File | null }) {
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    if (!preview) return;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") setPreview(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [preview]);

  return (
    <div className="review-ledger">
      {rows.map(([label, value]) => (
        <div key={label}><span>{label}</span><strong>{value || "—"}</strong></div>
      ))}
      <div className="review-ledger__photo"><span>Photo</span><PhotoThumb file={photo} onView={(url) => setPreview({ url, title: "Applicant photo" })} /></div>
      {receipt !== undefined && <div className="review-ledger__photo"><span>Receipt</span><PhotoThumb file={receipt} onView={(url) => setPreview({ url, title: "Payment receipt" })} /></div>}
      {cv !== undefined && <div className="review-ledger__photo"><span>CV</span><DocumentThumb file={cv} onView={(url) => setPreview({ url, title: "CV" })} /></div>}

      {preview && createPortal(
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={preview.title} onClick={() => setPreview(null)}>
          <figure onClick={(event) => event.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element -- blob preview URL */}
            <img src={preview.url} alt={preview.title} />
            <figcaption>
              <span>{preview.title}</span>
              <button type="button" className="lightbox__close" onClick={() => setPreview(null)}><X aria-hidden="true" /> Close</button>
            </figcaption>
          </figure>
        </div>,
        document.body,
      )}
    </div>
  );
}

function PhotoThumb({ file, onView }: { file: File | null; onView: (url: string) => void }) {
  const url = filePreviewUrl(file);
  if (!file) return <strong>Not selected</strong>;
  return (
    <strong className="review-photo">
      <Check aria-hidden="true" />
      Attached
      <button type="button" className="review-photo__open" onClick={() => onView(url)} aria-label="View image full size">
        {/* eslint-disable-next-line @next/next/no-img-element -- blob preview URL */}
        <img src={url} alt="Selected image" />
      </button>
    </strong>
  );
}

// Like PhotoThumb, but the file may be a PDF: images still open the shared
// lightbox, PDFs (which the <img>-based lightbox can't render) open in a new
// tab via the browser's own PDF viewer instead.
function DocumentThumb({ file, onView }: { file: File | null; onView: (url: string) => void }) {
  if (!file) return <strong>Not selected</strong>;
  const url = filePreviewUrl(file);
  const isImage = file.type.startsWith("image/");
  return (
    <strong className="review-photo">
      <Check aria-hidden="true" />
      Attached
      {isImage
        ? <button type="button" className="review-photo__open" onClick={() => onView(url)} aria-label="View file full size">
            {/* eslint-disable-next-line @next/next/no-img-element -- blob preview URL */}
            <img src={url} alt="Selected file" />
          </button>
        : <a className="review-photo__open" href={url} target="_blank" rel="noreferrer" aria-label="Open PDF in a new tab">
            <FileText size={37} aria-hidden="true" />
          </a>}
    </strong>
  );
}

export function FormSuccess({ title, note, reference, steps }: { title: React.ReactNode; note: string; reference: string; steps: string[] }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // The code stays selectable by hand.
    }
  };

  return (
    <div className="form-success">
      <div className="form-success__lead">
        <p className="form-success__eyebrow"><Check aria-hidden="true" /> Application received</p>
        <h2>{title}</h2>
        <p className="form-success__note">{note}</p>
      </div>
      <div className="form-success__panel">
        <p className="form-success__save">Save your Application ID</p>
        <div className="form-success__code">
          <strong className="form-success__seal">{reference}</strong>
          <button type="button" className="form-success__copy" onClick={copy}>
            {copied ? <><Check aria-hidden="true" /> Copied</> : <><Copy aria-hidden="true" /> Copy</>}
          </button>
        </div>
        <p className="form-success__warning">
          <TriangleAlert aria-hidden="true" />
          Your Application ID is shown only once. It will not be visible again after you leave this page, so copy it or write it down now. You will need it to check your status and in any conversation with the PYSMUN team.
        </p>
        <ol className="form-success__steps">
          {steps.map((step, index) => (
            <li key={step}><span>{String(index + 1).padStart(2, "0")}</span>{step}</li>
          ))}
        </ol>
        <p className="form-success__hint">Our emails can land in spam. If you do not hear from us, check there and save {siteConfig.email} to your contacts.</p>
        <p className="form-success__track"><a href="/status">Track your application anytime →</a></p>
      </div>
    </div>
  );
}
