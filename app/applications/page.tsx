import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { applicationStatusLabels, countWords, formatTitleList, openOpportunities, opportunities, upcomingOpportunities } from "@/lib/content";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { PageMotionField } from "@/components/page-motion-field";

export const metadata: Metadata = {
  title: "Applications",
  description: "Apply to the PYS Bootcamp. Campus Ambassador applications are closed; Directorate and Delegate opportunities follow soon.",
};

const applicationOrder = ["pys-bootcamp", "campus-ambassador", "directorate", "delegate"];
const orderedOpportunities = applicationOrder.map((id) => opportunities.find((item) => item.id === id)!);

export default function ApplicationsPage() {
  return (
    <main id="main-content" className="applications-page">
      <section className="applications-overview">
        <div className="container applications-overview__inner">
          <header className="applications-overview__header">
            <PageMotionField word="APPLY" className="applications-motion-field" />
            <div>
              <p className="eyebrow">Applications</p>
              <h1>Choose how you <em>enter the room.</em></h1>
            </div>
            <div className="applications-overview__meta">
              <p>{formatTitleList(openOpportunities)} applications are now open. {formatTitleList(upcomingOpportunities)} opportunities will follow.</p>
              <span className="status-pill" data-status="open">{countWords[openOpportunities.length]} application{openOpportunities.length === 1 ? "" : "s"} live</span>
            </div>
          </header>
          <div className="application-grid application-grid--overview">
          {orderedOpportunities.map((item) => (
            <Reveal className="application-tile-shell" key={item.id}>
              <Link className="application-tile" href={item.href} aria-label={`View ${item.title}`} data-tap-feedback>
                <div className="application-tile__content"><p>{item.eyebrow}</p><h2>{item.title}</h2><p>{item.description}</p></div>
                {"deadline" in item && item.deadline && <p className="application-tile__deadline">Application deadline: {item.deadline}</p>}
                <div className="application-tile__foot"><span className="status-pill" data-status={item.status}>{applicationStatusLabels[item.status].short}</span><span className="application-tile__foot-end">{"fee" in item && item.fee && <span className="application-tile__fee">{item.fee}</span>}<span className="application-tile__arrow"><ArrowUpRight /></span></span></div>
              </Link>
            </Reveal>
          ))}
          </div>
        </div>
      </section>
    </main>
  );
}
