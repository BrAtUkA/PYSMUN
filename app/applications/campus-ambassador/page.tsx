import type { Metadata } from "next";
import { CampusAmbassadorForm } from "@/components/campus-ambassador-form";
import { ComingSoonApplication } from "@/components/coming-soon-application";
import { opportunities } from "@/lib/content";

export const metadata: Metadata = {
  title: "Campus Ambassador Applications Closed",
  description: "Campus Ambassador applications for the current PYSMUN intake are closed.",
};

export default function CampusAmbassadorApplicationPage() {
  const opportunity = opportunities.find((item) => item.id === "campus-ambassador");

  if (opportunity?.status !== "open") {
    return (
      <ComingSoonApplication
        eyebrow="Campus Ambassador Program"
        title="Campus Ambassador"
        description="Represent your institution, connect students with PYSMUN and help grow a nationwide diplomacy network."
        status="closed"
        notice="Applications for the current Campus Ambassador intake are closed. Future opportunities will be announced through official PYSMUN channels."
        items={["Represent PYSMUN at your institution.", "Connect students with youth diplomacy opportunities.", "Build leadership, communication and outreach experience."]}
      />
    );
  }

  return (
    <main id="main-content" className="form-page">
      <aside className="form-aside">
        <div>
          <p className="eyebrow">Campus Ambassador Program</p>
          <h1>Put your campus<br /><em>on the map.</em></h1>
          <p>Represent your institution, connect students with PYSMUN and help grow a nationwide diplomacy network.</p>
        </div>
        <div className="form-aside__foot">
          <span className="status-pill" data-status="open">Applications open</span>
          <p>Your institution → PYSMUN</p>
        </div>
      </aside>
      <section className="form-main">
        <CampusAmbassadorForm />
      </section>
    </main>
  );
}
