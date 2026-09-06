import type { Metadata } from "next";
import { ComingSoonApplication } from "@/components/coming-soon-application";
import { DirectorateForm } from "@/components/directorate-form";
import { opportunities } from "@/lib/content";

export const metadata: Metadata = {
  title: "Directorate Applications Closed",
  description: "Directorate applications for the current PYSMUN intake are closed.",
};

export default function DirectorateApplicationPage() {
  const opportunity = opportunities.find((item) => item.id === "directorate");

  if (opportunity?.status !== "open") {
    return (
      <ComingSoonApplication
        eyebrow="Leadership team"
        title="Directorate"
        description="Help design, coordinate and deliver the PYSMUN experience from inside the organization."
        status="closed"
        notice="Applications for the current Directorate intake are closed. Future opportunities will be announced through official PYSMUN channels."
        items={["Select the roles that best fit your skills and availability.", "Show relevant leadership, event or Model UN experience.", "Explain how you would contribute to a professional delegate experience.", "Shortlisted candidates are invited to a short interview."]}
      />
    );
  }

  return (
    <main id="main-content" className="form-page">
      <aside className="form-aside">
        <div>
          <p className="eyebrow">Leadership team</p>
          <h1>Run the room<br /><em>from the inside.</em></h1>
          <p>Directors, assistant directors and staff design, coordinate and deliver the PYSMUN experience. Shortlisted applicants are invited to a short interview.</p>
        </div>
        <div className="form-aside__foot">
          <span className="status-pill" data-status="open">Applications open</span>
          <p>Registrations · Logistics · Hospitality · Media · Decor · Security · Delegate Affairs</p>
        </div>
      </aside>
      <section className="form-main">
        <DirectorateForm />
      </section>
    </main>
  );
}
