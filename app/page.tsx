import { AnimatedCounter } from "@/components/animated-counter";
import { HeroLetterField } from "@/components/hero-letter-field";
import { Reveal } from "@/components/reveal";
import { applicationStatusLabels, committees, countWords, openOpportunities, opportunities } from "@/lib/content";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const applicationsOpen = openOpportunities.length > 0;
  // With exactly one intake open the hero points straight at it; with several
  // it falls back to the hub rather than picking a favourite.
  const featured = openOpportunities.length === 1 ? openOpportunities[0] : null;

  return (
    <main id="main-content">
      <section className={styles.hero}>
        <HeroLetterField />
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <div className={styles.liveLine}>
              <span className="status-pill" data-status={applicationsOpen ? "open" : "closed"}>{applicationsOpen ? `${countWords[openOpportunities.length]} application${openOpportunities.length === 1 ? " is" : "s are"} now open` : "Applications for this intake are closed"}</span>
            </div>
            <h1 className={styles.heroTitle}>
              Where voices<br />become <em>resolutions.</em>
            </h1>
            <div className={styles.heroBottom}>
              <p>Pakistan Youth Summit Model United Nations develops future leaders through diplomacy, public speaking and international affairs.</p>
            </div>
          </div>
          <div className={styles.heroActions}>
            <Link className={styles.heroPrimaryCta} href={applicationsOpen ? (featured?.href ?? "/applications") : "/pys-bootcamp"}>
              <span className={styles.heroCtaMeta}>{applicationsOpen ? "Applications open" : "Current application intake closed"}</span>
              <strong>{applicationsOpen ? (featured ? `Apply for ${featured.title}` : "See open applications") : "Explore the PYS Bootcamp"}</strong>
              <span className={styles.heroCtaIcon}><ArrowUpRight size={18} /></span>
            </Link>
            <Link className={styles.heroDiscover} href="#discover">
              <span>Discover PYSMUN</span><ArrowDown size={15} />
            </Link>
          </div>
        </div>
      </section>

      <div className={styles.signalBar} aria-hidden="true">
        <div className={styles.signalTrack}>
          {[0, 1].map((copy) => (
            <div className={styles.signalGroup} key={copy}>
              <span>Diplomacy</span><i />
              <span>Leadership</span><i />
              <span>Negotiation</span><i />
              <span>Global awareness</span><i />
              <span>Committee craft</span><i />
              <span>Consensus</span><i />
            </div>
          ))}
        </div>
      </div>

      <section className={`section section--light ${styles.camp}`} id="discover">
        <div className="container">
          <Reveal className={styles.campHeader}>
            <p className="eyebrow">The first step into committee</p>
            <div className={styles.campHeadline}>
              <h2>Learn the room.<br /><em>Then lead it.</em></h2>
              <div className={styles.campIntroduction}>
                <span>Official PYS Bootcamp</span>
                <p>The rules stop being terminology here. Workshops, simulations and speaking practice turn them into instinct.</p>
              </div>
            </div>
          </Reveal>

          <div className={styles.campProgramme}>
            <Reveal className={styles.campManifesto}>
              <span className={styles.campManifestoIndex}>01 / Practice</span>
              <h3>Practice before<br /><em>the room counts.</em></h3>
              <div className={styles.campManifestoFoot}>
                <span>Four disciplines</span>
                <span>One live simulation</span>
              </div>
            </Reveal>
            <div className={styles.campDetails}>
              {[
                ["01", "Committee craft", "Procedure, motions and caucuses—understood by doing."],
                ["02", "Speak with intent", "Clear interventions that respond to the room, not a script."],
                ["03", "Negotiate outcomes", "Build blocs, find common ground and protect your position."],
                ["04", "Simulate the floor", "Pressure-test every skill before conference day."],
              ].map(([number, title, copy], index) => (
                <Reveal className={styles.detailRow} delay={(index % 3 + 1) as 1 | 2 | 3} key={number}>
                  <span>{number}</span><h3>{title}</h3><p>{copy}</p>
                </Reveal>
              ))}
              <Reveal className={styles.campCta}>
                <Link className={styles.campCtaLink} href="/pys-bootcamp" data-tap-feedback>
                  <span>Explore the full program</span>
                  <strong>Walk in prepared.</strong>
                  <i><ArrowUpRight size={22} /></i>
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className={`section ${styles.aboutStatement}`}>
        <div className="container">
          <Reveal className={styles.aboutHeader}>
            <p className="eyebrow">Why PYSMUN</p>
            <span>02 / Purpose</span>
          </Reveal>
          <div className={styles.aboutEditorial}>
            <Reveal className={styles.aboutThesis}>
              <span>Diplomacy, practiced.</span>
              <p>Model United Nations should change how a student enters a room—not only how they perform inside it.</p>
            </Reveal>
            <Reveal className={styles.aboutLead} delay={1}>
              <h2>Learn to read the room.<br /><em>Then move it forward.</em></h2>
              <p>PYSMUN prepares young people to listen before they answer, speak with evidence and build agreement across difference.</p>
            </Reveal>
          </div>
          <div className={styles.aboutPrinciples}>
            {[
              ["01", "Listen", "Understand the room before taking the floor."],
              ["02", "Articulate", "Turn research into a position people can follow."],
              ["03", "Build", "Move disagreement toward workable consensus."],
            ].map(([number, title, copy], index) => (
              <Reveal className={styles.aboutPrinciple} delay={(index + 1) as 1 | 2 | 3} tapFeedback key={number}>
                <span>{number}</span><h3>{title}</h3><p>{copy}</p>
              </Reveal>
            ))}
            <Reveal className={styles.aboutStory}>
              <Link href="/about"><span>Discover our story</span><i><ArrowUpRight size={18} /></i></Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={`section section--paper ${styles.numbers}`}>
        <div className="container">
          <Reveal className={styles.numbersHead}>
            <p className="eyebrow">The room we are building</p>
            <p>Early conference targets — final figures will be confirmed with the official conference release.</p>
          </Reveal>
          <div className={styles.numberGrid}>
            {[
              [500, "+", "Delegates", "Target"],
              [8, "", "Committees", "Confirmed"],
              [30, "+", "Institutions", "Target"],
              [3, "", "Conference days", "Planned"],
            ].map(([value, suffix, label, note]) => (
              <Reveal className={styles.numberCard} tapFeedback key={label as string}>
                <span className={styles.numberNote}>{note}</span>
                <strong><AnimatedCounter value={value as number} suffix={suffix as string} /></strong>
                <p>{label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`section section--light ${styles.opportunities}`}>
        <div className="container">
          <Reveal className={styles.sectionHead}>
            <div><p className="eyebrow">Find your place</p><h2 className="headline">Four ways to<br /><em>enter the story.</em></h2></div>
            <p className="lede">Every role has a different responsibility. Every role helps build the room.</p>
          </Reveal>
          <div className={styles.opportunityList}>
            {opportunities.map((item) => (
              <Reveal key={item.id}>
                <Link className={styles.opportunity} href={item.href}>
                  <div><span className="status-pill" data-status={item.status}>{applicationStatusLabels[item.status].long}</span><h3>{item.title}</h3></div>
                  <p>{item.description}</p>
                  <span className={styles.circleArrow}><ArrowUpRight /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.committees}`}>
        <div className="container">
          <Reveal className={styles.committeeHead}>
            <div>
              <p className="eyebrow">Committee index</p>
              <h2>Eight rooms.<br /><em>Six revealed.</em></h2>
            </div>
            <div className={styles.committeeIntro}>
              <span>Choose the question you want to carry.</span>
              <p>Security, rights, health, policy, crisis and two fictional worlds still waiting to be revealed.</p>
            </div>
          </Reveal>
          <div className={styles.committeeIndex}>
            {committees.map((committee) => (
              <Reveal className={`${styles.committeeEntry}${committee.sealed ? ` ${styles.committeeEntrySealed}` : ""}`} tapFeedback key={committee.code}>
                <p>{committee.tone}</p>
                <strong>{committee.code}</strong>
                <h3>{committee.name}</h3>
              </Reveal>
            ))}
          </div>
          <Reveal className={styles.committeeCta}>
            <Link className={styles.committeeCtaLink} href="/committees" data-tap-feedback>
              <span>Explore all eight committees</span>
              <strong>Find your room.</strong>
              <i><ArrowUpRight size={24} /></i>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className={`section section--light ${styles.journey}`}>
        <div className="container">
          <Reveal className={styles.journeyHead}><p className="eyebrow">The delegate journey</p><span>Four movements · one room</span></Reveal>
          <div className={styles.journeyRows}>
            {[
              ["01", "Prepare", "Research the world behind your position."],
              ["02", "Represent", "Enter the room with clarity and purpose."],
              ["03", "Negotiate", "Build trust across competing interests."],
              ["04", "Resolve", "Turn ideas into action the room can support."],
            ].map(([number, title, copy], index) => (
              <Reveal className={styles.journeyRow} delay={(index || undefined) as 1 | 2 | 3 | undefined} key={number}>
                <span className={styles.journeyNumber}>{number}</span>
                <h2>{title}</h2>
                <i className={styles.journeyArrow} aria-hidden="true" />
                <p>{copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.ambassador}`}>
        <div className="container">
          <Reveal className={styles.ambassadorTop}>
            <p className="eyebrow">Campus Ambassador Program</p>
            <span>Represent · Connect · Lead</span>
          </Reveal>
          <div className={styles.ambassadorStatement}>
            <Reveal><h2>Put your campus<br /><em>on the map.</em></h2></Reveal>
            <Reveal className={styles.ambassadorAside} delay={1}>
              <p>Represent PYSMUN at your institution, develop leadership skills and become part of a nationwide student network.</p>
              <div><span>The role</span><strong>Campus Ambassador</strong></div>
              <div><span>The reach</span><strong>Your institution → PYSMUN</strong></div>
            </Reveal>
          </div>
          <Reveal className={styles.ambassadorCtaWrap}>
            <Link className={styles.ambassadorCta} href="/applications/campus-ambassador" data-tap-feedback>
              <span>Applications closed / Campus Ambassador</span>
              <strong>Next intake to follow.</strong>
              <i><ArrowUpRight size={28} /></i>
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
