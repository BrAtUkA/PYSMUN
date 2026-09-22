import type { Metadata } from "next";
import { ComingSoonApplication } from "@/components/coming-soon-application";
import { ConferenceForm } from "@/components/conference-form";
import { currentDelegateFee, delegateFacts, opportunities } from "@/lib/content";

export const metadata: Metadata = {
  title: "Delegate Form",
  description: "Represent, negotiate and turn an informed position into collective action at PYSMUN.",
};

export default function DelegateApplicationPage() {
  const opportunity = opportunities.find((item) => item.id === "delegate");

  if (opportunity?.status !== "open") {
    return (
      <ComingSoonApplication
        eyebrow="Conference floor"
        title="Delegate"
        description="Represent a position, negotiate global issues and collaborate toward resolutions."
        items={["Share your details and committee preferences.", "Tell us which country or personality you would like to represent.", "Receive committee and country or personality allotment after review.", "Prepare with official study guides before conference day."]}
      />
    );
  }

  const currentFee = currentDelegateFee();

  return (
    <main id="main-content" className="form-page">
      <aside className="form-aside">
        <div>
          <p className="eyebrow">Conference floor</p>
          <h1>Take your seat<br /><em>on the floor.</em></h1>
          <p>Delegates represent a country or personality in committee, negotiate global issues and turn an informed position into collective action.</p>
        </div>
        <div className="form-aside__foot">
          <span className="status-pill" data-status="open">Applications open</span>
          <p>{currentFee.label} fee &middot; {currentFee.fee}{currentFee.tier === "early-bird" && <> until {delegateFacts.earlyBirdEndsDisplay}, then {delegateFacts.regularFee}</>}</p>
        </div>
      </aside>
      <section className="form-main">
        <ConferenceForm program="delegate" currentFee={currentFee} />
      </section>
    </main>
  );
}
