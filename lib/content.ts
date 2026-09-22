export const siteConfig = {
  name: "PYSMUN",
  fullName: "Pakistan Youth Summit Model United Nations",
  tagline: "Inspiring Leaders, Empowering Change",
  email: "pysmun@gmail.com",
};

export type ApplicationStatus = "open" | "coming-soon" | "closed";

export const applicationStatusLabels: Record<ApplicationStatus, { short: string; long: string }> = {
  open: { short: "Open", long: "Applications open" },
  "coming-soon": { short: "Coming soon", long: "Coming soon" },
  closed: { short: "Closed", long: "Applications closed" },
};

export const bootcampFacts = {
  dates: "August 15–16, 2026",
  datesShort: "August 15–16",
  startDate: "2026-08-15",
  endDate: "2026-08-16",
  city: "Rahim Yar Khan",
  deadline: "August 14",
  deadlineDate: "2026-08-14",
  fee: "Rs. 1,000",
  feeAmount: "1000",
  ages: "15–23",
};

// Programs whose form collects a real payment (fee slip + TRX + receipt),
// as opposed to Campus Ambassador/Directorate which are free. Shared so the
// admin console and status timeline don't each hardcode their own list.
export const paidPrograms = ["training-camp", "delegate", "observer"] as const;

// Delegate and Observer share one form and pipeline; Observer only drops the
// country/personality preference and pays a single flat fee.
export type ConferenceProgram = "delegate" | "observer";

export type FeeTier = "early-bird" | "regular" | "standard";
export type ConferenceFee = { tier: FeeTier; label: string; fee: string; feeAmount: string };

export const delegateFacts = {
  earlyBirdFee: "Rs. 4,000",
  earlyBirdFeeAmount: "4000",
  regularFee: "Rs. 5,000",
  regularFeeAmount: "5000",
  // Early bird pricing is valid through the end of this date in Pakistan
  // time. Display copy derived from this: earlyBirdEndsDisplay/regularStartsDisplay.
  earlyBirdDeadlineDate: "2026-10-07",
  earlyBirdEndsDisplay: "October 7",
  regularStartsDisplay: "October 8",
  ages: "15–23",
};

export function currentDelegateFee(now: Date = new Date()): ConferenceFee {
  // earlyBirdDeadlineDate is a Pakistan-local calendar date (the site's only
  // audience), so the cutoff instant is midnight PKT at the start of the next
  // day, i.e. 19:00 UTC on the deadline date itself (PKT is UTC+5).
  const isEarlyBird = now.getTime() < new Date(`${delegateFacts.earlyBirdDeadlineDate}T19:00:00Z`).getTime();
  return isEarlyBird
    ? { tier: "early-bird", label: "Early bird", fee: delegateFacts.earlyBirdFee, feeAmount: delegateFacts.earlyBirdFeeAmount }
    : { tier: "regular", label: "Regular", fee: delegateFacts.regularFee, feeAmount: delegateFacts.regularFeeAmount };
}

// Surfaced outside the form (homepage, hub tile, Delegate page) while early
// bird pricing is live; undefined afterwards so it disappears on its own.
const delegateEarlyBirdLive = currentDelegateFee().tier === "early-bird";
export const delegateEarlyBirdNote = delegateEarlyBirdLive ? `Delegate early bird until ${delegateFacts.earlyBirdEndsDisplay}` : undefined;

export const observerFacts = {
  fee: "Rs. 6,000",
  feeAmount: "6000",
  ages: "15–23",
};

export function currentObserverFee(): ConferenceFee {
  return { tier: "standard", label: "Observer", fee: observerFacts.fee, feeAmount: observerFacts.feeAmount };
}

export function currentConferenceFee(program: ConferenceProgram): ConferenceFee {
  return program === "delegate" ? currentDelegateFee() : currentObserverFee();
}

export const opportunities = [
  {
    id: "pys-bootcamp",
    eyebrow: "First release",
    title: "PYS Bootcamp",
    description: "Learn the room before you lead it. Interactive training in procedure, speaking, negotiation and resolution writing.",
    href: "/applications/pys-bootcamp",
    status: "closed" as ApplicationStatus,
    number: "01",
    fee: "Rs. 1,000",
    deadline: bootcampFacts.deadline,
  },
  {
    id: "campus-ambassador",
    eyebrow: "Nationwide network",
    title: "Campus Ambassador",
    description: "Represent PYSMUN at your institution and grow a nationwide student diplomacy network.",
    href: "/applications/campus-ambassador",
    status: "closed" as ApplicationStatus,
    number: "02",
    fee: "Free",
  },
  {
    id: "directorate",
    eyebrow: "Leadership team",
    title: "Directorate",
    description: "Help shape the conference from the inside and build an experience delegates will remember.",
    href: "/applications/directorate",
    status: "closed" as ApplicationStatus,
    number: "03",
    // Deliberately no fee field: Directorate says nothing about payment,
    // because selected candidates may be asked to contribute after interview.
  },
  {
    id: "delegate",
    eyebrow: "Conference floor",
    title: "Delegates",
    description: "Represent, negotiate and turn an informed position into collective action.",
    href: "/applications/delegate",
    status: "open" as ApplicationStatus,
    number: "04",
    fee: currentDelegateFee().fee,
    highlight: delegateEarlyBirdLive ? `Early bird pricing until ${delegateFacts.earlyBirdEndsDisplay}` : undefined,
  },
  {
    id: "observer",
    eyebrow: "Observer gallery",
    title: "Observers",
    description: "Follow the committees from inside the room and see diplomacy at work, without a position to represent.",
    href: "/applications/observer",
    status: "open" as ApplicationStatus,
    number: "05",
    fee: observerFacts.fee,
  },
];

export const openOpportunities = opportunities.filter((item) => item.status === "open");
export const upcomingOpportunities = opportunities.filter((item) => item.status === "coming-soon");
export const closedOpportunities = opportunities.filter((item) => item.status === "closed");

export const countWords = ["No", "One", "Two", "Three", "Four", "Five", "Six"];

export function formatNameList(names: string[]) {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function formatTitleList(items: { title: string }[]) {
  return formatNameList(items.map((item) => item.title));
}

// Singular names for the shared conference form ("the Delegate form"), since
// opportunity titles are plural ("Delegates").
export const conferenceFormNames: Record<ConferenceProgram, string> = { delegate: "Delegate", observer: "Observer" };
const openConferenceForms = openOpportunities.filter((item) => item.id in conferenceFormNames);

// Flat gold marks, no badge/avatar shape (Saim's call). `logo` is the darker
// accent gold (#8a742c) for use on the site's light/ivory surfaces;
// `logoOnDark` is the same mark in the lighter --gold (#d8c88a) for the
// homepage's dark committee index, matching how the rest of the site
// already swaps between those two gold tones by background.
export const committees = [
  { code: "PNA", name: "Pakistan National Assembly", tone: "National policy", index: "01", sealed: false, logo: "/committees/pna.png", logoOnDark: "/committees/pna-on-dark.png" },
  { code: "CRISIS", name: "Continuous Crisis Committee", tone: "Decisions in motion", index: "02", sealed: false, logo: "/committees/crisis.png", logoOnDark: "/committees/crisis-on-dark.png" },
  { code: "UNHRC", name: "United Nations Human Rights Council", tone: "Human dignity", index: "03", sealed: false, logo: "/committees/unhrc.png", logoOnDark: "/committees/unhrc-on-dark.png" },
  { code: "UN WOMEN", name: "UN Women", tone: "Gender equality", index: "04", sealed: false, logo: "/committees/un-women.png", logoOnDark: "/committees/un-women-on-dark.png" },
  { code: "Reveal", name: "Fictional committee", tone: "Identity withheld", index: "05", sealed: true, logo: null, logoOnDark: null },
];

export const faqs = [
  {
    question: "Are the Delegate and Observer forms open?",
    answer: openConferenceForms.length > 0
      ? `Yes. The ${formatNameList(openConferenceForms.map((item) => conferenceFormNames[item.id as ConferenceProgram]))} ${openConferenceForms.length === 1 ? "form is" : "forms are"} open now. Directorate applications have closed for this cycle.`
      : "Not right now. Directorate applications have also closed for this cycle. New dates will be announced through official PYSMUN channels.",
  },
  {
    question: "What is the difference between a Delegate and an Observer?",
    answer: "Delegates represent a country or personality in committee and negotiate toward resolutions. Observers follow committee sessions from inside the room without representing a country or personality.",
  },
  {
    question: "How much do the Delegate and Observer forms cost?",
    answer: `The Delegate fee is ${delegateFacts.earlyBirdFee} for early bird applicants through ${delegateFacts.earlyBirdEndsDisplay}, rising to ${delegateFacts.regularFee} from ${delegateFacts.regularStartsDisplay} onward. The Observer fee is a flat ${observerFacts.fee}, with no early bird pricing.`,
  },
  {
    question: "Who can apply?",
    answer: `Students aged ${delegateFacts.ages}. No previous MUN experience is required.`,
  },
  {
    question: "Do I need previous MUN experience?",
    answer: "No. First-time participants are welcome. The Delegate and Observer forms ask about previous MUN experience, but \"None\" is a perfectly good answer.",
  },
  {
    question: "When do applications close?",
    answer: openOpportunities.length > 0
      ? `Applications for ${formatTitleList(openOpportunities)} are open now, and a closing date has not been announced yet.${closedOpportunities.length > 0 ? ` The ${formatTitleList(closedOpportunities)} intakes are closed.` : ""}`
      : "All current PYSMUN intakes are closed. New opportunities will be announced through official PYSMUN channels.",
  },
  {
    question: "When and where was the PYS Bootcamp held?",
    answer: `The PYS Bootcamp was held on ${bootcampFacts.dates} in ${bootcampFacts.city}, with a fee of ${bootcampFacts.fee}. Future editions will be announced through official PYSMUN channels.`,
  },
  {
    question: "What does the PYS Bootcamp cover?",
    answer: "Participants practice rules of procedure, structured public speaking, negotiation, caucusing, resolution writing and committee strategy through guided exercises.",
  },
];
