import type { Metadata } from "next";
import { ComingSoonApplication } from "@/components/coming-soon-application";
import { ConferenceForm } from "@/components/conference-form";
import { currentObserverFee, opportunities } from "@/lib/content";

export const metadata: Metadata = {
  title: "Observer Form",
  description: "Follow the PYSMUN committees from inside the room and see diplomacy at work, without a position to represent.",
};

export default function ObserverApplicationPage() {
  const opportunity = opportunities.find((item) => item.id === "observer");

  if (opportunity?.status !== "open") {
    return (
      <ComingSoonApplication
        eyebrow="Observer gallery"
        title="Observer"
        description="Follow the committees from inside the room and see diplomacy at work."
        items={["Share your details and committee preferences.", "Receive your committee allotment after review.", "Watch debate, negotiation and resolution writing up close.", "No country or personality to represent."]}
      />
    );
  }

  const currentFee = currentObserverFee();

  return (
    <main id="main-content" className="form-page">
      <aside className="form-aside">
        <div>
          <p className="eyebrow">Observer gallery</p>
          <h1>Watch the room<br /><em>at work.</em></h1>
          <p>Observers follow committee sessions from inside the room, see how negotiation turns into resolutions and learn how the floor works, without a country or personality to represent.</p>
        </div>
        <div className="form-aside__foot">
          <span className="status-pill" data-status="open">Applications open</span>
          <p>{currentFee.label} fee &middot; {currentFee.fee}</p>
        </div>
      </aside>
      <section className="form-main">
        <ConferenceForm program="observer" currentFee={currentFee} />
      </section>
    </main>
  );
}
