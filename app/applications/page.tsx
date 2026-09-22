import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { applicationStatusLabels, countWords, formatTitleList, openOpportunities, opportunities, upcomingOpportunities } from "@/lib/content";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { PageMotionField } from "@/components/page-motion-field";

export const metadata: Metadata = {
  title: "Applications",
  description: openOpportunities.length > 0
    ? `Applications for ${formatTitleList(openOpportunities)} are open at PYSMUN.${upcomingOpportunities.length > 0 ? ` Applications for ${formatTitleList(upcomingOpportunities)} will follow.` : ""}`
    : "All current PYSMUN intakes are closed. New opportunities will be announced soon.",
};

const applicationOrder = ["pys-bootcamp", "campus-ambassador", "directorate", "delegate", "observer"];
const orderedOpportunities = applicationOrder.map((id) => opportunities.find((item) => item.id === id)!);

export default function ApplicationsPage() {
  const applicationsOpen = openOpportunities.length > 0;

  return (
    <main id="main-content" className="applications-page">
      <section className="applications-overview">
        <div className="container applications-overview__inner">
          <header className="applications-overview__header">
            <PageMotionField word="NEXT" className="applications-motion-field" />
            <div>
              <p className="eyebrow">Applications</p>
              <h1>See what comes <em>next.</em></h1>
            </div>
            <div className="applications-overview__meta">
              <p>{applicationsOpen ? `Applications for ${formatTitleList(openOpportunities)} are now open.` : "All current PYSMUN intakes are closed."}{upcomingOpportunities.length > 0 && ` Applications for ${formatTitleList(upcomingOpportunities)} will follow.`}</p>
              <span className="status-pill" data-status={applicationsOpen ? "open" : "closed"}>{applicationsOpen ? `${countWords[openOpportunities.length]} application${openOpportunities.length === 1 ? "" : "s"} live` : "No applications currently open"}</span>
            </div>
          </header>
          <div className="application-grid application-grid--overview">
          {orderedOpportunities.map((item) => (
            <Reveal className="application-tile-shell" key={item.id}>
              <Link className="application-tile" href={item.href} aria-label={`View ${item.title}`} data-tap-feedback>
                <div className="application-tile__content"><p>{item.eyebrow}</p><h2>{item.title}</h2><p>{item.description}</p></div>
                {"deadline" in item && item.deadline && <p className="application-tile__deadline">{item.status === "closed" ? "Applications closed" : "Application deadline"}: {item.deadline}</p>}
                {"highlight" in item && item.highlight && <p className="application-tile__deadline">{item.highlight}</p>}
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
