import type { Metadata } from "next";
import { ComingSoonApplication } from "@/components/coming-soon-application";
import { AcdForm } from "@/components/acd-form";
import { opportunities } from "@/lib/content";

export const metadata: Metadata = {
  title: "Assistant Committee Director Form",
  description: "Apply for the Dais at PYSMUN. Lead debate, guide procedure and shape the committee experience as an Assistant Committee Director.",
  openGraph: {
    title: "Assistant Committee Director Form · PYSMUN",
    description: "Apply for the Dais at PYSMUN. Lead debate, guide procedure and shape the committee experience as an Assistant Committee Director.",
    url: "https://pysmun.com/applications/acd",
  },
  twitter: {
    card: "summary_large_image",
    title: "Assistant Committee Director Form · PYSMUN",
    description: "Apply for the Dais at PYSMUN. Lead debate, guide procedure and shape the committee experience as an Assistant Committee Director.",
  },
};

export default function AcdApplicationPage() {
  const opportunity = opportunities.find((item) => item.id === "acd");

  if (opportunity?.status !== "open") {
    return (
      <ComingSoonApplication
        eyebrow="Dais leadership"
        title="Assistant Committee Director"
        description="Help lead committee debate, ensure procedural integrity and mentor delegates from the dais."
        status="closed"
        notice="Applications for Assistant Committee Directors are currently closed. Announcements will follow through official PYSMUN channels."
        items={[
          "Demonstrate solid MUN delegate and/or dais experience.",
          "Attach your resume and awards with proof.",
          "Shortlisted candidates are contacted for committee allocation and interview.",
        ]}
      />
    );
  }

  return (
    <main id="main-content" className="form-page">
      <aside className="form-aside">
        <div>
          <p className="eyebrow">Dais leadership</p>
          <h1>Lead the room<br /><em>from the dais.</em></h1>
          <p>Assistant Committee Directors guide debate, ensure procedural flow and evaluate delegate performance alongside the Committee Director.</p>
        </div>
        <div className="form-aside__foot">
          <span className="status-pill" data-status="open">Applications open</span>
          <p>Free to apply · Academic leadership</p>
        </div>
      </aside>
      <section className="form-main">
        <AcdForm />
      </section>
    </main>
  );
}
