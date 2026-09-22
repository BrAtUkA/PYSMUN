import type { Metadata } from "next";
import { FaqAccordion } from "@/components/faq-accordion";
import { PageMotionField } from "@/components/page-motion-field";
import { faqs } from "@/lib/content";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers about the PYSMUN Delegate and Observer forms, fees, eligibility and the PYS Bootcamp.",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function FaqPage() {
  return (
    <main id="main-content" className="faq-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="faq-overview">
        <div className="container faq-overview__inner">
          <header className="faq-overview__header">
            <PageMotionField word="ANSWERS" spread={1.32} floorLift={0.5} mobileLeftReach={0.9} className="faq-motion-field" />
            <div>
              <p className="eyebrow">Information</p>
              <h1>Questions, <em>answered.</em></h1>
            </div>
            <p>Everything currently confirmed about PYSMUN, from the Delegate and Observer forms to the PYS Bootcamp.</p>
          </header>
          <FaqAccordion items={faqs} />
        </div>
      </section>
    </main>
  );
}
