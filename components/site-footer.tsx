"use client";

import { ArrowUpRight, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "./brand-mark";
import { openOpportunities } from "@/lib/content";

export function SiteFooter() {
  const pathname = usePathname();
  const isPysBootcampApplication = pathname === "/applications/pys-bootcamp";
  const isApplicationsOverview = pathname === "/applications";
  const cta = isPysBootcampApplication
    ? { eyebrow: "Explore the Bootcamp programme", href: "/pys-bootcamp", label: "See the experience" }
    : isApplicationsOverview
      ? { eyebrow: "Questions about future opportunities?", href: "/faq", label: "Find your answer" }
      : openOpportunities.length > 0
        ? { eyebrow: "The next session begins with you", href: "/applications", label: "Enter the room" }
        : { eyebrow: "The next room is taking shape", href: "/applications", label: "See what comes next" };

  return (
    <footer className="site-footer">
      <FooterAtlas />
      <div className="container">
        <div className="site-footer__top">
          <p className="eyebrow">{cta.eyebrow}</p>
          <Link className="site-footer__cta" href={cta.href}>
            <span>{cta.label}</span><ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
        <div className="site-footer__grid">
          <div className="site-footer__identity">
            <BrandMark variant="mark" />
            <p className="site-footer__statement">Where voices become <em>resolutions.</em></p>
            <CreatorCredit />
          </div>
          <div>
            <p className="site-footer__label">Explore</p>
            <Link href="/about">About PYSMUN</Link>
            <Link href="/executive-council">Executive Council</Link>
            <Link href="/committees">Committees</Link>
            <Link href="/applications">Applications</Link>
          </div>
          <div>
            <p className="site-footer__label">Opportunity</p>
            <Link href="/pys-bootcamp">PYS Bootcamp</Link>
            <Link href="/applications/campus-ambassador">Campus Ambassador</Link>
            <Link href="/applications/directorate">Directorate</Link>
            <Link href="/applications/delegate">Delegates</Link>
            <Link href="/applications/observer">Observers</Link>
          </div>
          <div>
            <p className="site-footer__label">Information</p>
            <Link href="/status">Application status</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
        <div className="site-footer__mobile-credit-row">
          <CreatorCredit mobile />
        </div>
        <div className="site-footer__bottom">
          <span>© {new Date().getFullYear()} Pakistan Youth Summit MUN</span>
          <span>Inspiring Leaders, Empowering Change</span>
        </div>
      </div>
    </footer>
  );
}

function FooterAtlas() {
  return <div className="site-footer__atlas" aria-hidden="true" />;
}

function CreatorCredit({ mobile = false }: { mobile?: boolean }) {
  return (
    <a className={`site-footer__credit${mobile ? " site-footer__credit--mobile" : ""}`} href="https://github.com/BrAtUkA" target="_blank" rel="noreferrer" aria-label="Made with love by BAtUkA on GitHub">
      <span className="site-footer__credit-mark"><Image src="/batuka-logo.png" alt="" width={20} height={28} /></span>
      <span className="site-footer__credit-copy">Made with <Heart size={12} aria-hidden="true" /> by <strong>BrAtUkA</strong></span>
    </a>
  );
}
