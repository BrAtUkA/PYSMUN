import type { Metadata } from "next";
import Link from "next/link";
import { PageMotionField } from "@/components/page-motion-field";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How PYSMUN collects, uses and protects information shared through its website and applications.",
};

const privacyTerms = [
  {
    number: "01",
    title: "Information We Collect",
    content: <p>We may collect information you provide to us, including your name, CNIC or B-Form number and a photo or scan of it, applicant photo, email address, WhatsApp and emergency contact numbers, institution, CV, payment receipt and transaction reference, and other details submitted through an application or enquiry.</p>,
  },
  {
    number: "02",
    title: "How We Use It",
    content: <p>We use your information to review applications, manage registrations, communicate event updates, prepare certificates and improve the PYSMUN experience.</p>,
  },
  {
    number: "03",
    title: "Data Protection",
    content: <p>We take reasonable measures to safeguard your information. Identity documents and applicant photos are stored privately and used only for application review, verification and event administration. PYSMUN does not sell personal data or use it for unrelated commercial marketing.</p>,
  },
  {
    number: "04",
    title: "Cookies",
    content: <p>Our website may use cookies or similar technologies to support essential functionality, remember preferences and understand aggregate website usage.</p>,
  },
  {
    number: "05",
    title: "Third-Party Services",
    content: <p>Trusted providers may support hosting, forms, email communication or analytics. They receive only the information needed to provide those services and handle it under their own privacy terms.</p>,
  },
  {
    number: "06",
    title: "Contact",
    content: <p>For a privacy-related question, correction or deletion request, contact the PYSMUN team through our official email address.</p>,
  },
];

export default function PrivacyPage() {
  return (
    <main id="main-content" className="terms-page privacy-page">
      <section className="terms-overview">
        <div className="container terms-overview__inner">
          <PageMotionField word="CUSTODY" floorLift={0.5} leftInset={0.4} className="terms-motion-field" />
          <div><p className="eyebrow">Legal / Your information</p><h1>Privacy<br /><em>Policy.</em></h1></div>
          <div className="terms-overview__intro"><span>Clear by design</span><p>Your privacy matters to us. This policy explains what we collect, why we use it and how we protect it.</p></div>
        </div>
      </section>

      <section className="terms-register" aria-labelledby="privacy-register-title">
        <div className="container">
          <header className="terms-register__header"><p className="eyebrow" id="privacy-register-title">How information is handled</p><p>Six clear principles covering information shared through our website, applications and event communication.</p></header>
          <ol className="terms-grid privacy-grid">
            {privacyTerms.map((term) => <li className="terms-clause privacy-clause" key={term.number}><span className="terms-clause__number">{term.number}</span><div><h2>{term.title}</h2><div className="terms-clause__copy">{term.content}</div></div></li>)}
          </ol>
          <div className="terms-contact">
            <div><p className="eyebrow">Privacy questions</p><h2>Your data,<br /><em>your voice.</em></h2></div>
            <div><p>Contact us if you have a privacy concern or want to request a correction or deletion.</p><Link href="mailto:pysmun@gmail.com">pysmun@gmail.com</Link></div>
          </div>
        </div>
      </section>
    </main>
  );
}
