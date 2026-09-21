import type { Metadata } from "next";
import { CommitteeIcon } from "@/components/committee-icon";
import { PageMotionField } from "@/components/page-motion-field";
import { Reveal } from "@/components/reveal";
import { committees } from "@/lib/content";

export const metadata: Metadata = {
  title: "Committees — PNA, CRISIS, UNHRC & More",
  description: "Explore PYSMUN's five Model United Nations committees, from national policy and human rights to a continuous crisis committee, UN Women and one fictional committee still under wraps.",
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
              <h1>Five rooms. <em>Four revealed.</em></h1>
            </div>
            <div className="committees-overview__meta">
              <p>From national policy and human rights to gender equality, crisis response and one fictional world still under wraps.</p>
              <span>Final reveals, agendas and dais announcements will follow.</span>
            </div>
          </header>
          <Reveal className="committee-list-page committee-list-page--overview">
            {committees.map((committee) => (
              <div className={`committee-row${committee.sealed ? " committee-row--sealed" : ""}`} key={committee.code}>
                <span className="committee-row__mark">
                  <CommitteeIcon committee={committee} className="committee-icon--row" />
                  <strong>{committee.code}</strong>
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
