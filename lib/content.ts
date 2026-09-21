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
export const paidPrograms = ["training-camp", "delegate"] as const;

export type DelegateFeeTier = "early-bird" | "regular";

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

export function currentDelegateFee(now: Date = new Date()): { tier: DelegateFeeTier; label: string; fee: string; feeAmount: string } {
  // earlyBirdDeadlineDate is a Pakistan-local calendar date (the site's only
  // audience), so the cutoff instant is midnight PKT at the start of the next
  // day, i.e. 19:00 UTC on the deadline date itself (PKT is UTC+5).
  const isEarlyBird = now.getTime() < new Date(`${delegateFacts.earlyBirdDeadlineDate}T19:00:00Z`).getTime();
  return isEarlyBird
    ? { tier: "early-bird", label: "Early bird", fee: delegateFacts.earlyBirdFee, feeAmount: delegateFacts.earlyBirdFeeAmount }
    : { tier: "regular", label: "Regular", fee: delegateFacts.regularFee, feeAmount: delegateFacts.regularFeeAmount };
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
  },
];

export const openOpportunities = opportunities.filter((item) => item.status === "open");
export const upcomingOpportunities = opportunities.filter((item) => item.status === "coming-soon");

export const countWords = ["No", "One", "Two", "Three", "Four"];

export function formatTitleList(items: { title: string }[]) {
  const titles = items.map((item) => item.title);
  if (titles.length <= 1) return titles[0] ?? "";
  return `${titles.slice(0, -1).join(", ")} and ${titles[titles.length - 1]}`;
}

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
    question: "Do I need previous MUN experience?",
    answer: "No. The PYS Bootcamp is designed to give first-time participants a confident start while still offering practical simulations for experienced delegates.",
  },
  {
    question: "When and where will the PYS Bootcamp take place?",
    answer: `The PYS Bootcamp takes place on ${bootcampFacts.dates} in ${bootcampFacts.city}. The exact venue and start time will be announced soon.`,
  },
  {
    question: "Who can apply?",
    answer: `Students aged ${bootcampFacts.ages}. No previous MUN experience is required.`,
  },
  {
    question: "How much does the PYS Bootcamp cost?",
    answer: `The Bootcamp fee is ${bootcampFacts.fee}, paid together with your application, and is non-refundable. The Campus Ambassador Program is free.`,
  },
  {
    question: "When do applications close?",
    answer: openOpportunities.length > 0
      ? `${formatTitleList(openOpportunities)} applications are open now, and a closing date has not been announced yet. The PYS Bootcamp, Campus Ambassador and Directorate intakes are closed.`
      : `PYS Bootcamp applications closed on ${bootcampFacts.deadline}. Campus Ambassador and Directorate applications are also closed. No further applications are currently being accepted.`,
  },
  {
    question: "What will I learn at the PYS Bootcamp?",
    answer: "You will practice rules of procedure, structured public speaking, negotiation, caucusing, resolution writing and committee strategy through guided exercises.",
  },
  {
    question: "Are Directorate applications and the Delegate form open?",
    answer: `Directorate applications have closed for this cycle.${openOpportunities.some((item) => item.id === "delegate") ? " The Delegate form is open now." : upcomingOpportunities.length > 0 ? ` Applications for ${formatTitleList(upcomingOpportunities)} will follow.` : ""}`,
  },
  {
    question: "How much does the Delegate form cost?",
    answer: `The Delegate fee is ${delegateFacts.earlyBirdFee} for early bird applicants through ${delegateFacts.earlyBirdEndsDisplay}, rising to ${delegateFacts.regularFee} from ${delegateFacts.regularStartsDisplay} onward.`,
  },
];
