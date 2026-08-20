"use client";

import type { Session } from "@supabase/supabase-js";
import { ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronUp, Copy, Download, FileText, LoaderCircle, LogOut, RefreshCw, TriangleAlert, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { getSupabaseBrowserClient, supabaseDashboardUrl } from "@/lib/supabase-browser";
import { timeAgo } from "@/lib/time";

type ApplicationRow = {
  id: string;
  reference_code: string;
  program_slug: "training-camp" | "campus-ambassador" | "directorate";
  applicant_email: string;
  applicant_phone: string;
  applicant_cnic: string;
  photo_path: string;
  review_status: string;
  payment_status: string;
  payment_reference: string | null;
  receipt_path: string | null;
  cv_path: string | null;
  cv_mime_type: string | null;
  payload: Record<string, unknown>;
  submitted_at: string;
};

const programNames: Record<ApplicationRow["program_slug"], string> = {
  "training-camp": "PYS Bootcamp",
  "campus-ambassador": "Campus Ambassador",
  directorate: "Directorate",
};

const reviewStatuses = ["received", "under_review", "interview", "accepted", "waitlisted", "rejected"] as const;
const paymentStatuses = ["proof_submitted", "confirmed", "invalid"] as const;

const statusLabels: Record<string, string> = {
  received: "Received",
  under_review: "Under review",
  interview: "Interview",
  accepted: "Accepted",
  waitlisted: "Waitlisted",
  rejected: "Rejected",
  pending: "No receipt",
  proof_submitted: "Awaiting verification",
  confirmed: "Payment confirmed",
  invalid: "Payment issue",
};

// Auto-generated labels read awkwardly for a few keys ("Availability City"),
// so the ones worth wording properly are spelled out here.
const fieldLabelOverrides: Record<string, string> = {
  age: "Age",
  alternatePhone: "Alternate phone",
  availabilityCity: "Available in city",
  availabilityMeetings: "Attends meetings",
  campusRole: "Campus role",
  educationLevel: "Education",
  emergencyContact: "Emergency contact",
  gradeSemester: "Grade / semester",
  instagramLink: "Instagram",
  motivation: "Motivation",
  outreachPlan: "Outreach plan",
  preferredDepartment: "Department",
  preferredPosition: "Position",
  previousExperience: "Previous experience",
  referral: "Heard about us via",
  requirements: "Requirements",
  socialProfile: "Social profile",
  uniqueValue: "Unique value",
};

function fieldLabel(key: string) {
  return fieldLabelOverrides[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

// JSON key order is arbitrary, so detail fields are shown in a deliberate
// reading order instead; anything unlisted falls to the end.
const detailFieldOrder = [
  "age", "city", "institution", "educationLevel", "gradeSemester", "campusRole", "experience",
  "preferredDepartment", "preferredPosition", "availabilityCity", "availabilityMeetings",
  "emergencyContact", "alternatePhone", "socialProfile", "instagramLink", "referral",
];


const csvSkippedPayloadKeys = ["email", "whatsapp", "cnic", "consent", "website", "turnstileToken", "transactionReference"];

const detailSkippedKeys = ["fullName", "email", "whatsapp", "cnic", "consent", "website", "turnstileToken", "transactionReference"];
const longTextKeys = ["motivation", "outreachPlan", "requirements", "previousExperience", "uniqueValue"];

const payloadValueLabels: Record<string, string> = {
  none: "None",
  "one-two": "1–2 conferences",
  "three-plus": "3 or more conferences",
  some: "Some experience",
  extensive: "Extensive experience",
  school: "School",
  college: "College",
  university: "University",
  other: "Other",
  student: "Student",
  "society-member": "Society or council member",
  "society-lead": "Society or council lead",
  yes: "Yes",
  no: "No",
  registrations: "Registrations",
  logistics: "Logistics",
  hospitality: "Hospitality",
  media: "Media",
  decor: "Decor",
  security: "Security",
  "delegate-affairs": "Delegate Affairs",
  director: "Director",
  "assistant-director": "Assistant Director",
  staff: "Staff",
};

function LongText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const needsToggle = text.length > 220;
  return (
    <div className="admin-longtext__body" data-open={open || undefined}>
      <p>{text}</p>
      {needsToggle && (
        <button type="button" className="admin-longtext__toggle" onClick={() => setOpen((value) => !value)}>
          {open ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

// Compact build of the site's custom dropdown: same .select-* classes the
// application forms use, without the form-field label chrome.
function AdminSelect({ value, options, onChange, ariaLabel }: { value: string; options: string[][]; onChange: (value: string) => void; ariaLabel: string }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const selectedIndex = options.findIndex(([key]) => key === value);
  const selectedLabel = selectedIndex >= 0 ? options[selectedIndex][1] : "";

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const openList = () => { setActive(selectedIndex >= 0 ? selectedIndex : 0); setOpen(true); };
  const choose = (index: number) => { onChange(options[index][0]); setOpen(false); buttonRef.current?.focus(); };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); openList(); }
      return;
    }
    if (event.key === "Escape") { event.preventDefault(); setOpen(false); return; }
    if (event.key === "Tab") { setOpen(false); return; }
    if (event.key === "ArrowDown") { event.preventDefault(); setActive((index) => Math.min(options.length - 1, index + 1)); return; }
    if (event.key === "ArrowUp") { event.preventDefault(); setActive((index) => Math.max(0, index - 1)); return; }
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(active); }
  };

  return (
    <div className="select-shell admin-select" ref={rootRef}>
      <button
        type="button"
        ref={buttonRef}
        className="select-trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-label={ariaLabel}
        data-open={open || undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        <span>{selectedLabel}</span>
        <ChevronDown aria-hidden="true" />
      </button>
      {open && (
        <ul className="select-menu" id={`${id}-listbox`} role="listbox" aria-label={ariaLabel}>
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
  );
}

type BarItem = { key: string; label: string; count: number; note?: string; tone?: "gold" | "green" | "red" };

function StatBars({ items, onSelect, activeKey }: { items: BarItem[]; onSelect?: (item: BarItem) => void; activeKey?: string }) {
  const max = Math.max(...items.map((item) => item.count), 1);
  return (
    <div className="admin-bars">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className="admin-bar"
          data-active={activeKey === item.key || undefined}
          disabled={!onSelect}
          onClick={() => onSelect?.(item)}
        >
          <span className="admin-bar__label">{item.label}{item.note && <em>{item.note}</em>}</span>
          <span className="admin-bar__track">
            <span className="admin-bar__fill" data-tone={item.tone} style={{ width: `${Math.max((item.count / max) * 100, item.count > 0 ? 3 : 0)}%` }} />
          </span>
          <span className="admin-bar__value">{item.count}</span>
        </button>
      ))}
    </div>
  );
}

type ExportContext = { programFilter: string; statusFilter: string; paymentFilter: string; search: string; facet: string; day: string };

function exportFileName(count: number, context: ExportContext) {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
  const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const parts = ["pysmun-applications"];
  const programSlugs: Record<string, string> = { "training-camp": "bootcamp", "campus-ambassador": "campus", directorate: "directorate" };
  if (context.programFilter !== "all") parts.push(programSlugs[context.programFilter] ?? context.programFilter);
  if (context.statusFilter !== "all") parts.push(slug(statusLabels[context.statusFilter] ?? context.statusFilter));
  if (context.paymentFilter !== "all") parts.push(slug(statusLabels[context.paymentFilter] ?? context.paymentFilter));
  if (context.facet) parts.push(slug(context.facet).slice(0, 24));
  if (context.day) parts.push(context.day);
  const searchSlug = slug(context.search).slice(0, 24);
  if (searchSlug) parts.push(`search-${searchSlug}`);
  parts.push(stamp, `${count}-rows`);
  return `${parts.join("_")}.csv`;
}

function exportRowsAsCsv(rows: ApplicationRow[], context: ExportContext) {
  const payloadKeys = Array.from(new Set(rows.flatMap((row) => Object.keys(row.payload)))).filter((key) => !csvSkippedPayloadKeys.includes(key)).sort();
  const headers = ["reference", "program", "submitted_at", "review_status", "payment_status", "transaction_reference", "email", "phone", "cnic", ...payloadKeys];

  // Quote everything and neutralize leading formula characters so a cell can
  // never execute when the file is opened in Excel/Sheets.
  const cell = (value: unknown) => {
    let text = value == null ? "" : String(value);
    if (/^[=+\-@\t]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };

  const lines = [
    headers.join(","),
    ...rows.map((row) => [
      row.reference_code,
      programNames[row.program_slug],
      row.submitted_at,
      row.review_status,
      row.program_slug === "training-camp" ? row.payment_status : "",
      row.payment_reference ?? "",
      row.applicant_email,
      row.applicant_phone,
      row.applicant_cnic,
      ...payloadKeys.map((key) => row.payload[key]),
    ].map(cell).join(",")),
  ];

  const blob = new Blob([`﻿${lines.join("\r\n")}`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = exportFileName(rows.length, context);
  link.click();
  URL.revokeObjectURL(link.href);
}

export function AdminConsole() {
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"oldest" | "newest">("oldest");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ url: string; title: string; trx?: string | null } | null>(null);
  const [staged, setStaged] = useState<Partial<Pick<ApplicationRow, "review_status" | "payment_status">>>({});
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  // A payload facet (city, institution, department, …) and a single-day filter,
  // both driven by clicking the detailed stats; they stack with the others.
  const [facet, setFacet] = useState<{ key: string; value: string; label: string } | null>(null);
  const [dayFilter, setDayFilter] = useState<string | null>(null);
  const [dupOnly, setDupOnly] = useState(false);

  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [lightbox]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      // Only redo the visible access check when the signed-in user actually
      // changes; token refreshes (e.g. on tab focus) re-verify silently.
      const nextId = nextSession?.user.id ?? null;
      if (nextId !== userIdRef.current) {
        userIdRef.current = nextId;
        setIsAdmin(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  const loadApplications = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setNotice("");
    const { data, error } = await supabase
      .from("applications")
      .select("id,reference_code,program_slug,applicant_email,applicant_phone,applicant_cnic,photo_path,review_status,payment_status,payment_reference,receipt_path,cv_path,cv_mime_type,payload,submitted_at")
      .order("submitted_at", { ascending: false });
    if (error) setNotice(`Could not load applications: ${error.message}`);
    else setRows((data ?? []) as ApplicationRow[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !session) return;
    let cancelled = false;
    supabase.rpc("is_admin").then(({ data, error }) => {
      if (cancelled) return;
      const admitted = !error && data === true;
      setIsAdmin(admitted);
      if (admitted) void loadApplications();
    });
    return () => { cancelled = true; };
  }, [supabase, session, loadApplications]);

  async function openFile(row: ApplicationRow, path: string) {
    if (!supabase) return;
    if (fileUrls[path]) return;
    const { data, error } = await supabase.storage.from("application-photos").createSignedUrl(path, 600);
    if (error || !data?.signedUrl) setNotice("Could not open the file. Check storage policies.");
    else setFileUrls((current) => ({ ...current, [path]: data.signedUrl }));
  }

  function stageChange(row: ApplicationRow, field: "review_status" | "payment_status", value: string) {
    setStaged((current) => {
      const next = { ...current };
      if (row[field] === value) delete next[field];
      else next[field] = value;
      return next;
    });
  }

  async function saveStaged(row: ApplicationRow) {
    if (!supabase) return;
    setUpdatingId(row.id);
    setNotice("");
    const changes: Record<string, string> = { ...staged } as Record<string, string>;
    if (staged.payment_status) changes.payment_updated_at = new Date().toISOString();
    const { error } = await supabase.from("applications").update(changes).eq("id", row.id);
    if (error) setNotice(`Update failed: ${error.message}`);
    else {
      setRows((current) => current.map((item) => (item.id === row.id ? { ...item, ...staged } : item)));
      setStaged({});
    }
    setUpdatingId(null);
  }

  if (!supabase) {
    return <section className="admin-shell"><div className="admin-panel"><h1>Admin</h1><p>Supabase is not configured. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.</p></div></section>;
  }

  if (!session) return <AdminLogin onError={setNotice} notice={notice} />;

  if (isAdmin === null) {
    return <section className="admin-shell"><div className="admin-panel admin-panel--center"><LoaderCircle className="spin" aria-hidden="true" /><p>Checking access…</p></div></section>;
  }

  if (!isAdmin) {
    return (
      <section className="admin-shell">
        <div className="admin-panel">
          <h1>Not authorized</h1>
          <p>This account is signed in but is not on the organizer list.</p>
          <button className="admin-ghost-btn" onClick={() => supabase.auth.signOut()}><LogOut aria-hidden="true" /> Sign out</button>
        </div>
      </section>
    );
  }

  const dashboardUrl = supabaseDashboardUrl();
  const query = search.trim().toLowerCase();

  const referenceUses = new Map<string, ApplicationRow[]>();
  for (const row of rows) {
    const trx = row.payment_reference?.trim().toLowerCase();
    if (!trx) continue;
    referenceUses.set(trx, [...(referenceUses.get(trx) ?? []), row]);
  }
  const duplicatesOf = (row: ApplicationRow) => {
    const trx = row.payment_reference?.trim().toLowerCase();
    if (!trx) return [];
    return (referenceUses.get(trx) ?? []).filter((other) => other.id !== row.id);
  };

  const needsReview = (row: ApplicationRow) => row.review_status === "received" || row.review_status === "under_review";
  const isToday = (row: ApplicationRow) => new Date(row.submitted_at).toDateString() === new Date().toDateString();

  const stats = {
    total: rows.length,
    today: rows.filter(isToday).length,
    needsReview: rows.filter(needsReview).length,
    received: rows.filter((row) => row.review_status === "received").length,
    underReview: rows.filter((row) => row.review_status === "under_review").length,
    interview: rows.filter((row) => row.review_status === "interview").length,
    accepted: rows.filter((row) => row.review_status === "accepted").length,
    waitlisted: rows.filter((row) => row.review_status === "waitlisted").length,
    rejected: rows.filter((row) => row.review_status === "rejected").length,
    awaiting: rows.filter((row) => row.program_slug === "training-camp" && row.payment_status === "proof_submitted").length,
    confirmed: rows.filter((row) => row.program_slug === "training-camp" && row.payment_status === "confirmed").length,
    invalid: rows.filter((row) => row.program_slug === "training-camp" && row.payment_status === "invalid").length,
    bootcamp: rows.filter((row) => row.program_slug === "training-camp").length,
    campus: rows.filter((row) => row.program_slug === "campus-ambassador").length,
    directorate: rows.filter((row) => row.program_slug === "directorate").length,
    bootcampPending: rows.filter((row) => row.program_slug === "training-camp" && needsReview(row)).length,
    campusPending: rows.filter((row) => row.program_slug === "campus-ambassador" && needsReview(row)).length,
    directoratePending: rows.filter((row) => row.program_slug === "directorate" && needsReview(row)).length,
  };

  const directorateRows = rows.filter((row) => row.program_slug === "directorate");

  const dayKey = (value: string | Date) => {
    const date = typeof value === "string" ? new Date(value) : value;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // Daily submission counts across the window that actually contains data
  // (7 days minimum so a fresh intake still reads as a chart, 30 max).
  const timeline = (() => {
    const counts = new Map<string, number>();
    let earliest = Infinity;
    for (const row of rows) {
      const key = dayKey(row.submitted_at);
      counts.set(key, (counts.get(key) ?? 0) + 1);
      earliest = Math.min(earliest, new Date(row.submitted_at).getTime());
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const spanDays = Number.isFinite(earliest)
      ? Math.round((today.getTime() - new Date(earliest).setHours(0, 0, 0, 0)) / 86_400_000) + 1
      : 7;
    const windowDays = Math.min(Math.max(spanDays, 7), 30);
    return Array.from({ length: windowDays }, (_, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (windowDays - 1 - index));
      const key = dayKey(date);
      return { key, label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }), count: counts.get(key) ?? 0 };
    });
  })();
  const timelinePeak = Math.max(...timeline.map((day) => day.count), 0);
  const timelineTotal = timeline.reduce((sum, day) => sum + day.count, 0);

  // Free-text payload values (city, institution) grouped case-insensitively,
  // keeping the first spelling an applicant actually typed.
  const topValues = (key: string, limit = 6, titleCase = false) => {
    const counts = new Map<string, { label: string; count: number }>();
    for (const row of rows) {
      const raw = String(row.payload[key] ?? "").trim();
      if (!raw) continue;
      const normalized = raw.toLowerCase();
      const existing = counts.get(normalized);
      if (existing) existing.count += 1;
      else counts.set(normalized, { label: titleCase ? raw.replace(/\b\w/g, (letter) => letter.toUpperCase()) : raw, count: 1 });
    }
    return [...counts.entries()]
      .map(([value, entry]) => ({ key: `${key}:${value}`, value, label: entry.label, count: entry.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  };

  const enumValues = (list: ApplicationRow[], key: string, order: string[]) =>
    order
      .map((value) => ({
        key: `${key}:${value}`,
        value,
        label: payloadValueLabels[value] ?? value,
        count: list.filter((row) => String(row.payload[key] ?? "") === value).length,
      }))
      .filter((item) => item.count > 0);

  // Rows sharing a transaction ID with another row — the fraud/mistake signal
  // that already exists per-row, surfaced as a number you can act on.
  const duplicateTrxCount = rows.filter((row) => duplicatesOf(row).length > 0).length;

  const ageItems = (() => {
    const counts = new Map<number, number>();
    for (const row of rows) {
      const age = Number(row.payload.age);
      if (Number.isFinite(age) && age > 0) counts.set(age, (counts.get(age) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([age, count]) => ({ key: `age:${age}`, value: String(age), label: `${age} years`, count }));
  })();

  const cityItems = topValues("city", 6, true);
  const institutionItems = topValues("institution", 6);
  const departmentItems = enumValues(directorateRows, "preferredDepartment", ["registrations", "logistics", "hospitality", "media", "decor", "security", "delegate-affairs"]);
  const positionItems = enumValues(directorateRows, "preferredPosition", ["director", "assistant-director", "staff"]);
  const educationItems = enumValues(rows, "educationLevel", ["school", "college", "university", "other"]);
  const experienceItems = enumValues(rows, "experience", ["none", "one-two", "three-plus", "some", "extensive"]);

  // Each stat control toggles its own filter dimension independently — click to
  // apply, click again to clear — so any combination of program/status/payment/
  // facet/day can be stacked instead of one control resetting another.
  const toggleProgram = (program: string) => setProgramFilter((current) => (current === program ? "all" : program));
  const toggleStatus = (status: string) => setStatusFilter((current) => (current === status ? "all" : status));
  const togglePayment = (payment: string) => setPaymentFilter((current) => (current === payment ? "all" : payment));
  const toggleFacet = (key: string, value: string, label: string) =>
    setFacet((current) => (current && current.key === key && current.value === value ? null : { key, value, label }));
  const clearAllFilters = () => { setProgramFilter("all"); setStatusFilter("all"); setPaymentFilter("all"); setFacet(null); setDayFilter(null); setDupOnly(false); };
  const filtersActive = programFilter !== "all" || statusFilter !== "all" || paymentFilter !== "all" || facet !== null || dayFilter !== null || dupOnly;

  type FacetItem = { key: string; value: string; label: string; count: number };
  const facetSection = (title: string, payloadKey: string, items: FacetItem[]) => {
    if (items.length === 0) return null;
    return (
      <section key={payloadKey}>
        <header className="admin-panel-head"><p>{title}</p></header>
        <StatBars
          activeKey={facet ? `${facet.key}:${facet.value}` : undefined}
          onSelect={(item) => {
            const source = items.find((entry) => entry.key === item.key);
            if (source) toggleFacet(payloadKey, source.value, source.label);
          }}
          items={items.map((entry) => ({ key: entry.key, label: entry.label, count: entry.count }))}
        />
      </section>
    );
  };

  const copyValue = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(key);
      window.setTimeout(() => setCopiedId((current) => (current === key ? null : current)), 1600);
    } catch {
      setNotice("Could not copy — select the text manually.");
    }
  };

  const copyButton = (key: string, text: string, label: string) => (
    <button type="button" className="admin-copy" onClick={() => copyValue(key, text)} aria-label={label}>
      {copiedId === key ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
    </button>
  );
  const filtered = rows.filter((row) => {
    if (programFilter !== "all" && row.program_slug !== programFilter) return false;
    if (statusFilter === "needs-review" && !needsReview(row)) return false;
    if (statusFilter !== "all" && statusFilter !== "needs-review" && row.review_status !== statusFilter) return false;
    if (paymentFilter !== "all" && (row.program_slug !== "training-camp" || row.payment_status !== paymentFilter)) return false;
    if (facet && String(row.payload[facet.key] ?? "").trim().toLowerCase() !== facet.value) return false;
    if (dayFilter && dayKey(row.submitted_at) !== dayFilter) return false;
    if (dupOnly && duplicatesOf(row).length === 0) return false;
    if (!query) return true;
    const queryDigits = query.replace(/\D/g, "");
    const haystack = [
      String(row.payload.fullName ?? ""),
      row.applicant_email,
      row.reference_code,
      row.applicant_cnic,
      String(row.payload.city ?? ""),
      String(row.payload.institution ?? ""),
      payloadValueLabels[String(row.payload.preferredDepartment ?? "")] ?? "",
      payloadValueLabels[String(row.payload.preferredPosition ?? "")] ?? "",
    ].join(" ").toLowerCase();
    if (haystack.includes(query)) return true;
    return queryDigits.length >= 4 && `${row.applicant_phone}${row.applicant_cnic}`.replace(/\D/g, "").includes(queryDigits);
  });
  const visible = [...filtered].sort((a, b) => (sortOrder === "oldest" ? a.submitted_at.localeCompare(b.submitted_at) : b.submitted_at.localeCompare(a.submitted_at)));

  return (
    <section className="admin-shell admin-shell--wide">
      <header className="admin-header">
        <div>
          <p className="eyebrow">PYSMUN Admin</p>
          <h1>Applications</h1>
        </div>
        <div className="admin-header__actions">
          <span>{session.user.email}</span>
          <button className="admin-ghost-btn" onClick={() => loadApplications()} disabled={loading}>{loading ? <LoaderCircle className="spin" aria-hidden="true" /> : <RefreshCw aria-hidden="true" />} Refresh</button>
          <button className="admin-ghost-btn" onClick={() => supabase.auth.signOut()}><LogOut aria-hidden="true" /> Sign out</button>
        </div>
      </header>

      <div className="admin-stats">
        <button data-active={(programFilter === "all" && statusFilter === "all" && paymentFilter === "all") || undefined} onClick={clearAllFilters}>
          <strong>{stats.total}</strong><span>Total{stats.today > 0 && ` · ${stats.today} today`}</span>
        </button>
        <button data-active={statusFilter === "needs-review" || undefined} onClick={() => toggleStatus("needs-review")}>
          <strong data-tone="gold">{stats.needsReview}</strong><span>Needs review</span>
        </button>
        <button data-active={statusFilter === "interview" || undefined} onClick={() => toggleStatus("interview")}>
          <strong data-tone="gold">{stats.interview}</strong><span>Interview</span>
        </button>
        <button data-active={statusFilter === "accepted" || undefined} onClick={() => toggleStatus("accepted")}>
          <strong data-tone="green">{stats.accepted}</strong><span>Accepted</span>
        </button>
        <button data-active={statusFilter === "waitlisted" || undefined} onClick={() => toggleStatus("waitlisted")}>
          <strong>{stats.waitlisted}</strong><span>Waitlisted</span>
        </button>
        <button data-active={statusFilter === "rejected" || undefined} onClick={() => toggleStatus("rejected")}>
          <strong data-tone="red">{stats.rejected}</strong><span>Rejected</span>
        </button>
      </div>

      <button type="button" className="admin-details-toggle" onClick={() => setDetailsOpen((value) => !value)} aria-expanded={detailsOpen}>
        {detailsOpen ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
        {detailsOpen ? "Hide detailed stats" : "Show detailed stats"}
      </button>

      {detailsOpen && (
        <div className="admin-stats-panel">
          <section className="admin-stats-panel__wide">
            <header className="admin-panel-head">
              <p>Applications over time</p>
              <span>{timelineTotal} in {timeline.length} days{timelinePeak > 0 && ` · peak ${timelinePeak} in a day`}</span>
            </header>
            <div className="admin-chart">
              {timeline.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  className="admin-chart__col"
                  data-active={dayFilter === day.key || undefined}
                  disabled={day.count === 0}
                  title={`${day.label} · ${day.count} application${day.count === 1 ? "" : "s"}`}
                  onClick={() => setDayFilter((current) => (current === day.key ? null : day.key))}
                >
                  <span className="admin-chart__bar" style={{ height: `${timelinePeak ? Math.max((day.count / timelinePeak) * 100, day.count ? 4 : 0) : 0}%` }} />
                </button>
              ))}
            </div>
            <div className="admin-chart__axis">
              <span>{timeline[0]?.label}</span>
              <span>{timeline[timeline.length - 1]?.label}</span>
            </div>
          </section>

          <section>
            <header className="admin-panel-head"><p>Review stage</p><span>{stats.needsReview} still open</span></header>
            <StatBars
              activeKey={statusFilter}
              onSelect={(item) => toggleStatus(item.key)}
              items={[
                { key: "received", label: "Received", count: stats.received, tone: "gold" },
                { key: "under_review", label: "Under review", count: stats.underReview, tone: "gold" },
              ]}
            />
          </section>

          <section>
            <header className="admin-panel-head"><p>Programs</p></header>
            <StatBars
              activeKey={programFilter}
              onSelect={(item) => toggleProgram(item.key)}
              items={[
                { key: "training-camp", label: "PYS Bootcamp", count: stats.bootcamp, note: stats.bootcampPending ? `${stats.bootcampPending} pending` : undefined },
                { key: "campus-ambassador", label: "Campus Ambassador", count: stats.campus, note: stats.campusPending ? `${stats.campusPending} pending` : undefined },
                { key: "directorate", label: "Directorate", count: stats.directorate, note: stats.directoratePending ? `${stats.directoratePending} pending` : undefined },
              ]}
            />
          </section>

          <section>
            <header className="admin-panel-head">
              <p>Payment · PYS Bootcamp</p>
              {duplicateTrxCount > 0 && (
                <button type="button" className="admin-flag" data-active={dupOnly || undefined} onClick={() => setDupOnly((value) => !value)}>
                  <TriangleAlert aria-hidden="true" />{duplicateTrxCount} shared transaction ID{duplicateTrxCount === 1 ? "" : "s"}
                </button>
              )}
            </header>
            <StatBars
              activeKey={paymentFilter}
              onSelect={(item) => togglePayment(item.key)}
              items={[
                { key: "proof_submitted", label: "Awaiting verification", count: stats.awaiting, tone: "gold" },
                { key: "confirmed", label: "Confirmed", count: stats.confirmed, tone: "green" },
                { key: "invalid", label: "Payment issue", count: stats.invalid, tone: "red" },
              ]}
            />
          </section>

          {facetSection("Top cities", "city", cityItems)}
          {facetSection("Top institutions", "institution", institutionItems)}
          {facetSection("Directorate · departments", "preferredDepartment", departmentItems)}
          {facetSection("Directorate · positions", "preferredPosition", positionItems)}
          {facetSection("Education level", "educationLevel", educationItems)}
          {facetSection("MUN experience", "experience", experienceItems)}
          {facetSection("Age", "age", ageItems)}
        </div>
      )}

      {filtersActive && (
        <div className="admin-active-filters">
          <span className="admin-active-filters__label">Filtering</span>
          {programFilter !== "all" && (
            <button type="button" onClick={() => setProgramFilter("all")}>{programNames[programFilter as ApplicationRow["program_slug"]] ?? programFilter}<X aria-hidden="true" /></button>
          )}
          {statusFilter !== "all" && (
            <button type="button" onClick={() => setStatusFilter("all")}>{statusFilter === "needs-review" ? "Needs review" : statusLabels[statusFilter] ?? statusFilter}<X aria-hidden="true" /></button>
          )}
          {paymentFilter !== "all" && (
            <button type="button" onClick={() => setPaymentFilter("all")}>{statusLabels[paymentFilter] ?? paymentFilter}<X aria-hidden="true" /></button>
          )}
          {facet && <button type="button" onClick={() => setFacet(null)}>{facet.label}<X aria-hidden="true" /></button>}
          {dupOnly && <button type="button" onClick={() => setDupOnly(false)}>Shared transaction IDs<X aria-hidden="true" /></button>}
          {dayFilter && (
            <button type="button" onClick={() => setDayFilter(null)}>{new Date(`${dayFilter}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}<X aria-hidden="true" /></button>
          )}
          <button type="button" className="admin-active-filters__clear" onClick={clearAllFilters}>Clear all</button>
        </div>
      )}

      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="Search name, email, phone, city, institution, department, CNIC or Application ID"
          title="Searches names, emails, phone numbers, cities, institutions, Directorate departments and positions, CNICs and Application IDs"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {/* Dropdowns and stat tiles drive the same state, so either path works
            and both always reflect the current filters. */}
        <AdminSelect
          value={programFilter}
          options={[["all", "All programs"], ["training-camp", "PYS Bootcamp"], ["campus-ambassador", "Campus Ambassador"], ["directorate", "Directorate"]]}
          onChange={setProgramFilter}
          ariaLabel="Filter by program"
        />
        <AdminSelect
          value={statusFilter}
          options={[["all", "All statuses"], ["needs-review", "Needs review"], ...reviewStatuses.map((status) => [status, statusLabels[status]])]}
          onChange={setStatusFilter}
          ariaLabel="Filter by review status"
        />
        <AdminSelect
          value={paymentFilter}
          options={[["all", "All payments"], ...paymentStatuses.map((status) => [status, statusLabels[status]])]}
          onChange={setPaymentFilter}
          ariaLabel="Filter by payment status"
        />
        <AdminSelect
          value={sortOrder}
          options={[["oldest", "Oldest first"], ["newest", "Newest first"]]}
          onChange={(value) => setSortOrder(value as "oldest" | "newest")}
          ariaLabel="Sort order"
        />
        <button className="admin-ghost-btn" onClick={() => exportRowsAsCsv(visible, { programFilter, statusFilter, paymentFilter, search: query, facet: [facet?.label, dupOnly ? "shared-trx" : ""].filter(Boolean).join("-"), day: dayFilter ?? "" })} disabled={visible.length === 0}><Download aria-hidden="true" /> Export CSV</button>
        <span className="admin-count">{visible.length} of {rows.length}</span>
      </div>

      {notice && <p className="admin-notice" role="alert">{notice}</p>}

      <div className="admin-list">
        {visible.map((row) => {
          const expanded = expandedId === row.id;
          return (
            <article className="admin-row" data-expanded={expanded || undefined} key={row.id}>
              <button
                className="admin-row__summary"
                onClick={() => {
                  setExpandedId(expanded ? null : row.id);
                  setStaged({});
                  if (!expanded) {
                    void openFile(row, row.photo_path);
                    if (row.receipt_path) void openFile(row, row.receipt_path);
                    if (row.cv_path) void openFile(row, row.cv_path);
                  }
                }}
                aria-expanded={expanded}
              >
                <strong>{String(row.payload.fullName ?? "—")}</strong>
                <span>{row.reference_code}</span>
                <span>{programNames[row.program_slug]}</span>
                <span className="admin-row__chips">
                  <span className="admin-chip" data-status={row.review_status}>{statusLabels[row.review_status] ?? row.review_status}</span>
                  {/* Only the Bootcamp collects payment; other programs show no
                      payment chip at all rather than claiming to be free. */}
                  {row.program_slug === "training-camp" && (
                    <span className="admin-chip" data-payment={row.payment_status}>{statusLabels[row.payment_status] ?? row.payment_status}</span>
                  )}
                </span>
              </button>

              {expanded && (
                // The third column holds either the payment aside (Bootcamp) or
                // the CV aside (Directorate); only collapse when neither exists.
                <div className="admin-row__detail" data-narrow={(row.program_slug !== "training-camp" && !row.cv_path) || undefined}>
                  <figure className="admin-detail__portrait">
                    {fileUrls[row.photo_path]
                      ? <button type="button" className="admin-media-open" onClick={() => setLightbox({ url: fileUrls[row.photo_path], title: `Applicant photo · ${row.reference_code}` })} aria-label="View photo full size">
                          {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
                          <img src={fileUrls[row.photo_path]} alt={`Applicant photo for ${row.reference_code}`} />
                        </button>
                      : <span className="admin-media-loading"><LoaderCircle className="spin" aria-hidden="true" /></span>}
                  </figure>

                  <div className="admin-detail__profile">
                    <dl className="admin-fields">
                      <div><dt>Application ID</dt><dd className="admin-fields__reference">{row.reference_code}
                        {copyButton(`${row.id}-ref`, row.reference_code, `Copy ${row.reference_code}`)}
                      </dd></div>
                      <div><dt>Submitted</dt><dd>{new Date(row.submitted_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}<em className="admin-ago">{timeAgo(row.submitted_at)}</em></dd></div>
                      <div><dt>Email</dt><dd className="admin-fields__contact">
                        <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(row.applicant_email)}`} target="_blank" rel="noreferrer">{row.applicant_email}</a>
                        {copyButton(`${row.id}-email`, row.applicant_email, "Copy email address")}
                      </dd></div>
                      <div><dt>Phone</dt><dd className="admin-fields__contact">
                        <a href={`https://wa.me/${row.applicant_phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">{row.applicant_phone}</a>
                        {copyButton(`${row.id}-phone`, row.applicant_phone, "Copy phone number")}
                      </dd></div>
                      <div><dt>CNIC</dt><dd>{row.applicant_cnic}</dd></div>
                      {Object.entries(row.payload)
                        .filter(([key, value]) => !detailSkippedKeys.includes(key) && !longTextKeys.includes(key) && value !== "" && value !== null)
                        .sort(([a], [b]) => {
                          const first = detailFieldOrder.indexOf(a);
                          const second = detailFieldOrder.indexOf(b);
                          return (first === -1 ? 99 : first) - (second === -1 ? 99 : second);
                        })
                        .map(([key, value]) => (
                          <div key={key}><dt>{fieldLabel(key)}</dt><dd>{payloadValueLabels[String(value)] ?? String(value)}</dd></div>
                        ))}
                    </dl>
                    {longTextKeys.some((key) => row.payload[key]) && (
                      <div className="admin-longtext">
                        {longTextKeys
                          .filter((key) => typeof row.payload[key] === "string" && row.payload[key] !== "")
                          .map((key) => (
                            <div key={key}>
                              <p className="admin-longtext__label">{fieldLabel(key)}</p>
                              <LongText text={String(row.payload[key])} />
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {row.program_slug === "training-camp" && (
                    <aside className="admin-detail__payment">
                      <p className="admin-detail__payment-title">Payment verification</p>
                      <figure>
                        {row.receipt_path
                          ? fileUrls[row.receipt_path]
                            ? <button type="button" className="admin-media-open" onClick={() => setLightbox({ url: fileUrls[row.receipt_path!], title: `Payment receipt · ${row.reference_code}`, trx: row.payment_reference })} aria-label="View receipt full size">
                                {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
                                <img src={fileUrls[row.receipt_path]} alt={`Payment receipt for ${row.reference_code}`} />
                              </button>
                            : <span className="admin-media-loading"><LoaderCircle className="spin" aria-hidden="true" /></span>
                          : <span className="admin-media-empty">No receipt submitted</span>}
                      </figure>
                      {row.payment_reference && (
                        <div className="admin-transaction">
                          <span>Transaction reference</span>
                          <div className="admin-transaction__value">
                            <strong>{row.payment_reference}</strong>
                            {copyButton(`${row.id}-trx`, row.payment_reference, "Copy transaction reference")}
                          </div>
                        </div>
                      )}
                      {duplicatesOf(row).length > 0 && (
                        <p className="admin-duplicate" role="alert">
                          <TriangleAlert aria-hidden="true" />
                          Same transaction ID as {duplicatesOf(row).map((other) => other.reference_code).join(", ")}
                        </p>
                      )}
                    </aside>
                  )}

                  {row.cv_path && (
                    <aside className="admin-detail__payment">
                      <p className="admin-detail__payment-title">CV / resume</p>
                      <figure>
                        {fileUrls[row.cv_path]
                          ? row.cv_mime_type === "application/pdf"
                            ? <a className="admin-media-open" href={fileUrls[row.cv_path]} target="_blank" rel="noreferrer" aria-label="Open CV in a new tab"><FileText aria-hidden="true" /></a>
                            : <button type="button" className="admin-media-open" onClick={() => setLightbox({ url: fileUrls[row.cv_path!], title: `CV · ${row.reference_code}` })} aria-label="View CV full size">
                                {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
                                <img src={fileUrls[row.cv_path]} alt={`CV for ${row.reference_code}`} />
                              </button>
                          : <span className="admin-media-loading"><LoaderCircle className="spin" aria-hidden="true" /></span>}
                      </figure>
                    </aside>
                  )}

                  <div className="admin-actions">
                    <div>
                      <p>Application</p>
                      <div className="admin-actions__row">
                        {reviewStatuses.map((status) => {
                          const active = (staged.review_status ?? row.review_status) === status;
                          return <button key={status} disabled={active || updatingId === row.id} onClick={() => stageChange(row, "review_status", status)}>{statusLabels[status]}</button>;
                        })}
                      </div>
                    </div>
                    {row.program_slug === "training-camp" && (
                      <div>
                        <p>Payment</p>
                        <div className="admin-actions__row">
                          {paymentStatuses.map((status) => {
                            const active = (staged.payment_status ?? row.payment_status) === status;
                            return <button key={status} disabled={active || updatingId === row.id} onClick={() => stageChange(row, "payment_status", status)}>{statusLabels[status]}</button>;
                          })}
                        </div>
                      </div>
                    )}
                    <div className="admin-actions__end">
                      {dashboardUrl && (
                        <a className="admin-link" href={`${dashboardUrl}/editor`} target="_blank" rel="noreferrer">Open in Supabase <ArrowUpRight aria-hidden="true" /></a>
                      )}
                      {(() => {
                        const dirty = Object.keys(staged).length > 0;
                        return (
                          <button
                            type="button"
                            className="admin-commit"
                            data-dirty={dirty || undefined}
                            disabled={updatingId === row.id}
                            onClick={() => {
                              if (dirty) void saveStaged(row);
                              else { setExpandedId(null); setStaged({}); }
                            }}
                          >
                            {updatingId === row.id && <LoaderCircle className="spin" aria-hidden="true" />}
                            {dirty ? "Save" : "Cancel"}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
        {!loading && visible.length === 0 && <p className="admin-empty">No applications match.</p>}
      </div>

      {lightbox && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={lightbox.title} onClick={() => setLightbox(null)}>
          <figure onClick={(event) => event.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
            <img src={lightbox.url} alt={lightbox.title} />
            <figcaption>
              <span>{lightbox.title}</span>
              {lightbox.trx && (
                <span className="lightbox__trx">
                  <strong>{lightbox.trx}</strong>
                  {copyButton("lightbox-trx", lightbox.trx, "Copy transaction reference")}
                </span>
              )}
              <button type="button" className="lightbox__close" onClick={() => setLightbox(null)}><X aria-hidden="true" /> Close</button>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}

function AdminLogin({ notice, onError }: { notice: string; onError: (message: string) => void }) {
  const supabase = getSupabaseBrowserClient();
  const [submitting, setSubmitting] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    onError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
    if (error) onError("Sign in failed. Check your email and password.");
    setSubmitting(false);
  }

  return (
    <section className="admin-shell">
      <div className="admin-panel admin-panel--login">
        <h1>PYSMUN <em>Admin.</em></h1>
        <form className="admin-login" method="post" onSubmit={signIn}>
          <label className="field"><span>Email</span><input name="email" type="email" autoComplete="email" required /><small></small></label>
          <label className="field"><span>Password</span><input name="password" type="password" autoComplete="current-password" required /><small></small></label>
          <div className="form-actions">
            <button type="submit" className="form-advance" disabled={submitting}>
              <span>Organizers only</span>
              <strong>{submitting ? "Signing in" : "Sign in"}</strong>
              {submitting ? <LoaderCircle className="spin" size={20} /> : <ArrowRight size={20} />}
            </button>
          </div>
        </form>
        {notice && <p className="admin-notice" role="alert">{notice}</p>}
        <p className="admin-panel__note">Access is limited to listed PYSMUN organizers.</p>
      </div>
    </section>
  );
}
