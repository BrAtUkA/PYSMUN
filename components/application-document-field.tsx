"use client";

import { FileText, LoaderCircle, Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";
import { filePreviewUrl } from "@/lib/file-preview";
import { optimizeApplicationPhoto } from "@/lib/optimize-photo";

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_INPUT_BYTES = 30 * 1024 * 1024;
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

type ApplicationDocumentFieldProps = {
  file: File | null;
  error?: string[];
  onChange: (file: File | null) => void;
  onError: (message?: string) => void;
  wide?: boolean;
  label?: string;
  prompt?: string;
  note?: string;
  requiredMessage?: string;
};

// Sibling to ApplicationPhotoField, not a variant of it: this field also
// accepts PDFs, which can't go through the canvas-based optimizer, so the
// two file kinds need different accept/validate paths even though the UI
// reuses the exact same picker markup and CSS.
export function ApplicationDocumentField({
  file,
  error,
  onChange,
  onError,
  wide,
  label = "CV",
  prompt = "Attach your CV",
  note = "PDF or image, under 2 MB. Photos are optimized automatically; PDFs are not, so please keep the file small.",
  requiredMessage = "CV is required",
}: ApplicationDocumentFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [optimizing, setOptimizing] = useState(false);
  const isImage = file?.type.startsWith("image/") ?? false;
  const preview = isImage ? filePreviewUrl(file) : "";

  function reject(message: string) {
    if (inputRef.current) inputRef.current.value = "";
    onChange(null);
    onError(message);
  }

  async function choose(nextFile?: File) {
    if (!nextFile) return;
    if (!acceptedTypes.has(nextFile.type)) {
      reject("Use a JPEG, PNG, WebP image or PDF file");
      return;
    }
    if (nextFile.size > MAX_INPUT_BYTES) {
      reject("Please choose a file under 30 MB");
      return;
    }

    if (nextFile.type === "application/pdf") {
      if (nextFile.size > MAX_BYTES) {
        reject("Please choose a PDF under 2 MB");
        return;
      }
      onError();
      onChange(nextFile);
      return;
    }

    setOptimizing(true);
    try {
      const optimized = await optimizeApplicationPhoto(nextFile);
      if (optimized.size > MAX_BYTES) {
        reject("This photo could not be reduced below 2 MB. Please choose another.");
        return;
      }
      onError();
      onChange(optimized);
    } finally {
      setOptimizing(false);
    }
  }

  return (
    <div className={wide ? "field field--wide application-photo-field" : "field application-photo-field"}>
      <span>{label}</span>
      <div className={error?.length ? "photo-picker photo-picker--error" : "photo-picker"}>
        <label className="photo-picker__select">
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => choose(event.target.files?.[0])} />
          {preview
            ? <img src={preview} alt="Selected image" />
            : <span className="photo-picker__icon">{optimizing ? <LoaderCircle className="spin" aria-hidden="true" /> : file ? <FileText aria-hidden="true" /> : <Paperclip aria-hidden="true" />}</span>}
          <span className="photo-picker__copy">
            <strong>{optimizing ? "Optimizing photo…" : file ? file.name : prompt}</strong>
            <small>{optimizing ? "One moment" : file ? `${formatSize(file.size)} · Click to replace` : "JPEG, PNG, WebP or PDF · Photos are optimized automatically"}</small>
          </span>
        </label>
        {file && <button type="button" className="photo-picker__remove" onClick={() => { if (inputRef.current) inputRef.current.value = ""; onChange(null); onError(requiredMessage); }} aria-label="Remove selected file"><X aria-hidden="true" /></button>}
      </div>
      <small>{error?.[0] || note}</small>
    </div>
  );
}
