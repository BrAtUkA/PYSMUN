"use client";

import { ArrowUpLeft, ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { BrandMark } from "./brand-mark";
import { formatTitleList, openOpportunities, siteConfig } from "@/lib/content";

const links = [
  { href: "/about", label: "About" },
  { href: "/executive-council", label: "Executive Council" },
  { href: "/committees", label: "Committees" },
  { href: "/applications", label: "Applications" },
];

// The fullscreen menu leads with Home: the brand mark is the only other way
// back to the landing page, and it is easy to miss on phones.
const menuLinks = [{ href: "/", label: "Home" }, ...links];

const informationLinks = [
  { href: "/status", label: "Application status", wide: true },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const needsRestingSurface = pathname !== "/";
  const usesSplitFormHeader = pathname === "/applications/pys-bootcamp" || pathname === "/applications/campus-ambassador" || pathname === "/applications/directorate";
  const isApplicationsHub = pathname === "/applications";
  const primaryAction = usesSplitFormHeader
    ? pathname === "/applications/pys-bootcamp"
      ? { href: "/pys-bootcamp", label: "Learn More", back: false }
      : { href: "/applications", label: "All applications", back: true }
    : isApplicationsHub
      ? { href: "/faq", label: "FAQ", back: false }
      : { href: "/applications", label: openOpportunities.length > 0 ? "Apply now" : "Applications", back: false };

  // The "Applications" nav link is redundant wherever the CTA pill already
  // leads to /applications, and on the applications hub itself (a self-link).
  // The mobile menu keeps the full list — the pill is hidden on phones, so
  // nothing is redundant there.
  const navLinks = links.filter((link) => link.href !== "/applications" || (primaryAction.href !== "/applications" && !isApplicationsHub));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNavigatingTo(null);
        setOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  useEffect(() => {
    if (!navigatingTo || pathname !== navigatingTo) return;

    // Keep the dark menu over the viewport until the destination has committed,
    // then reveal the new page beneath it instead of flashing the previous page.
    const frame = window.requestAnimationFrame(() => {
      setOpen(false);
      setNavigatingTo(null);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [navigatingTo, pathname]);

  const handleMenuNavigation = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    if (pathname === href) {
      setOpen(false);
      setNavigatingTo(null);
      return;
    }

    setNavigatingTo(href);
  };

  const toggleMenu = () => {
    setNavigatingTo(null);
    setOpen((value) => !value);
  };

  useEffect(() => {
    const footer = document.querySelector(".site-footer");
    if (!footer) return;

    const observer = new IntersectionObserver(([entry]) => {
      setFooterVisible(entry.isIntersecting && entry.intersectionRatio >= .12);
    }, { threshold: [0, .12, .3] });

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <header className="site-header" data-scrolled={scrolled || undefined} data-resting-surface={needsRestingSurface || undefined} data-split-form={usesSplitFormHeader || undefined} data-menu-open={open || undefined} data-footer-visible={(footerVisible && !open) || undefined}>
      <div className="site-header__inner">
        <div className="site-header__brand-group">
          <BrandMark onClick={handleMenuNavigation("/")} />
          <p className="site-header__promise">{siteConfig.tagline}</p>
        </div>
        <div className="site-header__nav-group">
          <nav className="site-header__nav" aria-label="Primary navigation">
            {navLinks.map((link) => <Link className="nav-link" href={link.href} key={link.href} onClick={handleMenuNavigation(link.href)}>{link.label}</Link>)}
          </nav>
          <div className="site-header__actions">
            <Link className="btn btn--gold site-header__apply" href={primaryAction.href} onClick={handleMenuNavigation(primaryAction.href)} data-back={primaryAction.back || undefined}>
              {primaryAction.back
                ? <><ArrowUpLeft size={15} /> {primaryAction.label}</>
                : <>{primaryAction.label} <ArrowUpRight size={15} /></>}
            </Link>
            <button className="menu-trigger" onClick={toggleMenu} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}>
              <span className="menu-trigger__icon" aria-hidden="true">
                <Menu className="menu-trigger__glyph menu-trigger__glyph--menu" />
                <X className="menu-trigger__glyph menu-trigger__glyph--close" />
              </span>
            </button>
          </div>
        </div>
      </div>

      <nav className="mobile-menu" id="mobile-menu" data-open={open || undefined} aria-hidden={!open} aria-label="Expanded navigation">
        <div className="mobile-menu__links">
          {menuLinks.map((link) => (
            <Link href={link.href} key={link.href} onClick={handleMenuNavigation(link.href)}>
              {link.label}<ArrowUpRight size={24} />
            </Link>
          ))}
        </div>
        <div className="mobile-menu__foot">
          <div className="mobile-menu__utility">
            <p>Information</p>
            <div className="mobile-menu__utility-links">
              {informationLinks.map((link) => (
                <Link href={link.href} key={link.href} data-wide={link.wide || undefined} onClick={handleMenuNavigation(link.href)}>
                  {link.label}<ArrowUpRight size={18} />
                </Link>
              ))}
            </div>
          </div>
          <div className="mobile-menu__closing">
            <p>Inspiring Leaders,<br />Empowering Change</p>
            <div className="mobile-menu__status" data-status={openOpportunities.length > 0 ? "open" : "closed"}>
              <span aria-hidden="true" />
              <p><strong>{openOpportunities.length > 0 ? "Applications open" : "Applications closed"}</strong>{openOpportunities.length > 0 ? formatTitleList(openOpportunities) : "No applications are currently being accepted."}</p>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
