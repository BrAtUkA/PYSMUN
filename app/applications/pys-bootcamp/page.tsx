import type { Metadata } from "next";
import { ComingSoonApplication } from "@/components/coming-soon-application";
import { bootcampFacts } from "@/lib/content";

export const metadata: Metadata = { title: "PYS Bootcamp Applications Closed", description: `Applications for the ${bootcampFacts.dates} PYS Bootcamp in ${bootcampFacts.city} are closed.` };

export default function PysBootcampApplicationPage() {
  return (
    <ComingSoonApplication
      eyebrow="PYS Bootcamp"
      title="PYS Bootcamp"
      description={`The application intake for the ${bootcampFacts.datesShort} PYS Bootcamp in ${bootcampFacts.city} has ended.`}
      status="closed"
      notice={`Applications closed on ${bootcampFacts.deadline}. No further applications are being accepted for this intake; future editions will be announced through official PYSMUN channels.`}
      items={["Interactive Model United Nations workshops.", "Practical committee simulations and speaking exercises.", "Guided preparation in research, negotiation and resolution writing."]}
    />
  );
}
