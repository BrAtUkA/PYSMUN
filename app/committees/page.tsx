import type { Metadata } from "next";
import { CommitteeIcon } from "@/components/committee-icon";
import { PageMotionField } from "@/components/page-motion-field";
import { Reveal } from "@/components/reveal";
import { committeeCopy, committeeSummary, committees } from "@/lib/content";

export const metadata: Metadata = {
  title: "Committees — PNA, CRISIS, UNHRC & More",
  description: committeeCopy.metaDescription,
};

export default function CommitteesPage() {
  return (
    <main id="main-content" className="committees-page">
      <section className="committees-overview">
        <div className="container committees-overview__inner">
          <header className="committees-overview__header">
            <PageMotionField word="UNITED NATIONS" mobileWord="UN" className="committees-motion-field" />
            <div>
              <p className="eyebrow">PYSMUN Committees</p>
              <h1>{committeeSummary.rooms} <em>{committeeSummary.revealedLine}</em></h1>
            </div>
            <div className="committees-overview__meta">
              <p>{committeeCopy.lede}</p>
              <span>{committeeCopy.footnote}</span>
            </div>
          </header>
          <Reveal className="committee-list-page committee-list-page--overview">
            {committees.map((committee) => (
              <div className={`committee-row${committee.sealed ? " committee-row--sealed" : ""}`} key={committee.code}>
                <span className="committee-row__mark">
                  <CommitteeIcon committee={committee} className="committee-icon--row" />
                  <strong>{committee.short}</strong>
                </span>
                <h2>{committee.name}</h2><p>{committee.tone}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
    </main>
  );
}
