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

export const opportunities = [
  {
    id: "pys-bootcamp",
    eyebrow: "First release",
    title: "PYS Bootcamp",
    description: "Learn the room before you lead it. Interactive training in procedure, speaking, negotiation and resolution writing.",
    href: "/applications/pys-bootcamp",
    status: "open" as ApplicationStatus,
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
    status: "coming-soon" as ApplicationStatus,
    number: "03",
  },
  {
    id: "delegate",
    eyebrow: "Conference floor",
    title: "Delegates",
    description: "Represent, negotiate and turn an informed position into collective action.",
    href: "/applications/delegate",
    status: "coming-soon" as ApplicationStatus,
    number: "04",
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

export const committees = [
  { code: "UNHRC", name: "United Nations Human Rights Council", tone: "Human dignity", index: "01", sealed: false },
  { code: "DISEC", name: "Disarmament & International Security", tone: "Global security", index: "02", sealed: false },
  { code: "UNSC", name: "United Nations Security Council", tone: "Peace & security", index: "03", sealed: false },
  { code: "WHO", name: "World Health Organization", tone: "Global health", index: "04", sealed: false },
  { code: "PNA", name: "Pakistan National Assembly", tone: "National policy", index: "05", sealed: false },
  { code: "CRISIS", name: "Continuous Crisis Committee", tone: "Decisions in motion", index: "06", sealed: false },
  { code: "Reveal I", name: "Fictional committee", tone: "Identity withheld", index: "07", sealed: true },
  { code: "Reveal II", name: "Fictional committee", tone: "Identity withheld", index: "08", sealed: true },
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
    answer: `PYS Bootcamp applications close on ${bootcampFacts.deadline}. Campus Ambassador applications are closed. Bootcamp seats are first-come-first-served, and you will hear from us within 24 hours of applying.`,
  },
  {
    question: "What will I learn at the PYS Bootcamp?",
    answer: "You will practice rules of procedure, structured public speaking, negotiation, caucusing, resolution writing and committee strategy through guided exercises.",
  },
  {
    question: "Are Directorate and Delegate applications open?",
    answer: `Not yet. ${formatTitleList(openOpportunities)} applications are open now. ${formatTitleList(upcomingOpportunities)} opportunities will follow.`,
  },
];
