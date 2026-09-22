import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { PageMotionField } from "@/components/page-motion-field";
import { bootcampFacts } from "@/lib/content";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PYS Bootcamp",
  description: `Learn Model United Nations through practical workshops, simulations and expert mentorship at the official PYS Bootcamp, ${bootcampFacts.dates} in ${bootcampFacts.city}.`,
};

const eventSchema = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "PYS Bootcamp 2026",
  description: "A two-day Model United Nations training bootcamp by Pakistan Youth Summit MUN: procedure, public speaking, negotiation and resolution writing.",
  startDate: bootcampFacts.startDate,
  endDate: bootcampFacts.endDate,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: bootcampFacts.city,
    address: { "@type": "PostalAddress", addressLocality: bootcampFacts.city, addressCountry: "PK" },
  },
  organizer: { "@type": "Organization", name: "Pakistan Youth Summit Model United Nations", url: "https://pysmun.com" },
  offers: {
    "@type": "Offer",
    price: bootcampFacts.feeAmount,
    priceCurrency: "PKR",
    url: "https://pysmun.com/applications/pys-bootcamp",
    availability: "https://schema.org/SoldOut",
    validThrough: bootcampFacts.deadlineDate,
  },
  image: "https://pysmun.com/opengraph-image.png",
};

const learningTracks = [
  {
    label: "Know the system",
    phase: "Foundation",
    topics: ["Introduction to MUN", "Rules of Procedure"],
    outcome: "Learn how MUN works and when procedure matters.",
  },
  {
    label: "Build the case",
    phase: "Preparation",
    topics: ["Research Techniques", "Position Papers"],
    outcome: "Turn information into a position you can defend.",
  },
  {
    label: "Hold the floor",
    phase: "Expression",
    topics: ["Public Speaking", "Diplomacy & Negotiation"],
    outcome: "Speak clearly, listen closely and negotiate with purpose.",
  },
  {
    label: "Shape the outcome",
    phase: "Resolution",
    topics: ["Resolution Writing", "Team Building"],
    outcome: "Build agreement and turn shared ideas into action.",
  },
];

const activities = [
  { stage: "Arrive", title: "Icebreakers", description: "Meet the room and begin building working relationships." },
  { stage: "Articulate", title: "Debate drills", description: "Test arguments, respond clearly and disagree constructively." },
  { stage: "Convene", title: "Mock committee", description: "Practice motions, caucuses and formal debate before conference day." },
  { stage: "Adapt", title: "Crisis simulation", description: "Read new information and make decisions under pressure." },
  { stage: "Ask", title: "Chair Q&A", description: "Get answers to the questions that rarely fit inside a rulebook." },
  { stage: "Connect", title: "Networking", description: "Meet delegates, chairs and students from different institutions." },
];

const audienceLevels = [
  ["First-time delegates", "Learn the language, rules and rhythm of committee from the ground up."],
  ["Developing delegates", "Turn previous exposure into clearer research, stronger speaking and calmer decisions."],
  ["Experienced MUNers", "Refine strategy, negotiation and leadership before stepping back onto the floor."],
];

const benefits = [
  ["Certificate of Participation", "A formal record of your completed training."],
  ["Practical MUN Experience", "Experience built around real committee situations."],
  ["Greater Confidence", "A steadier voice when the floor is yours."],
  ["New Connections", "Relationships with delegates, chairs and future collaborators."],
];

export default function PysBootcampPage() {
  return (
    <main id="main-content" className="training-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }} />
      <section className="training-overview">
        <PageMotionField word="PREPARE" className="training-motion-field" />
        <div className="training-overview__header">
          <Reveal>
            <p className="eyebrow">PYS Bootcamp</p>
            <h1><span>Learn.</span><span>Practice.</span><em>Lead.</em></h1>
          </Reveal>
          <Reveal className="training-overview__intro" delay={1}>
            <p>The PYS Bootcamp prepares delegates for Model United Nations through interactive workshops, practical activities and expert mentorship.</p>
            <span className="training-status" data-status="closed"><i /> Applications closed</span>
            <p className="training-facts">{bootcampFacts.dates} · {bootcampFacts.city} · Applications closed on {bootcampFacts.deadline}</p>
          </Reveal>
        </div>

        <div className="training-overview__foot">
          <Reveal>
            <p className="eyebrow">Who can join</p>
            <p>Students aged {bootcampFacts.ages} — from first-time delegates to experienced MUNers.</p>
          </Reveal>
          <Reveal delay={1}>
            <p className="eyebrow">The method</p>
            <p>Learn the framework. Practice it in the room. Leave ready to lead.</p>
          </Reveal>
          <Reveal delay={2}>
            <Link className="training-overview__apply" href="/applications/pys-bootcamp">
              <span>Applications<br />closed</span>
              <ArrowRight aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="camp-learning">
        <div className="camp-learning__header">
          <Reveal>
            <p className="eyebrow">What you&apos;ll learn</p>
            <h2>The delegate<br /><em>toolkit.</em></h2>
          </Reveal>
          <Reveal delay={1}>
            <p>Eight practical skills, arranged in the order a delegate uses them—from understanding procedure to shaping an outcome.</p>
          </Reveal>
        </div>
        <div className="camp-learning__grid">
          {learningTracks.map((track, index) => (
            <Reveal className="camp-learning__track" delay={(index % 3) as 0 | 1 | 2} tapFeedback key={track.label}>
              <div className="camp-learning__track-head">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{track.phase}</p>
              </div>
              <h3>{track.label}</h3>
              <p className="camp-learning__outcome">{track.outcome}</p>
              <ol>
                {track.topics.map((topic, topicIndex) => (
                  <li key={topic}><span>{index * 2 + topicIndex + 1}</span>{topic}</li>
                ))}
              </ol>
            </Reveal>
          ))}
        </div>
        <div className="camp-learning__mobile-list">
          {learningTracks.map((track, index) => (
            <Reveal className="camp-learning__mobile-stage" key={`mobile-${track.label}`}>
              <div className="camp-learning__mobile-intro">
                <div><span>{String(index + 1).padStart(2, "0")}</span><small>{track.phase}</small></div>
                <strong>{track.label}</strong>
              </div>
              <ol>
                {track.topics.map((topic, topicIndex) => (
                  <li key={topic}><span>{index * 2 + topicIndex + 1}</span>{topic}</li>
                ))}
              </ol>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="camp-activities">
        <div className="camp-activities__header">
          <Reveal>
            <p className="eyebrow">Activities</p>
            <h2>Two days that move<br /><em>at committee pace.</em></h2>
          </Reveal>
          <Reveal delay={1}>
            <p>Each session leads naturally into the next: meet the room, find your voice, test it under pressure, then leave with a network.</p>
          </Reveal>
        </div>
        <div className="camp-activities__timeline">
          {activities.map((activity, index) => (
            <Reveal className="camp-activities__item" delay={(index % 3) as 0 | 1 | 2} key={activity.title}>
              <span className="camp-activities__node" aria-hidden="true" />
              <div className="camp-activities__content">
                <div><span>{String(index + 1).padStart(2, "0")}</span><small>{activity.stage}</small></div>
                <h3>{activity.title}</h3>
                <p>{activity.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="camp-outcomes">
        <div className="camp-outcomes__intro">
          <Reveal>
            <p className="eyebrow camp-outcomes__label">Who is it for?</p>
            <h2>One room.<br /><em>Three starting points.</em></h2>
          </Reveal>
          <Reveal delay={1}>
            <p>No prior MUN experience is required. The PYS Bootcamp meets first-time participants, developing delegates and experienced MUNers at the right point in their journey.</p>
          </Reveal>
        </div>

        <div className="camp-audiences">
          {audienceLevels.map(([level, description], index) => (
            <Reveal className="camp-audience" delay={(index + 1) as 1 | 2 | 3} tapFeedback key={level}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{level}</h3>
              <p>{description}</p>
            </Reveal>
          ))}
        </div>

        <div className="camp-benefits">
          <p className="eyebrow">What you leave with</p>
          <div className="camp-benefits__grid">
            {benefits.map(([benefit, description], index) => (
              <Reveal className="camp-benefit" delay={(index % 2) as 0 | 1} key={benefit}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{benefit}</strong>
                <p>{description}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="camp-outcomes__apply-shell">
          <Link className="camp-outcomes__apply" href="/applications/pys-bootcamp">
            <span><small><span>Applications closed</span><span>Closed {bootcampFacts.deadline}</span><span>Future editions to follow</span></small>Current intake <span className="camp-outcomes__apply-tail">has ended.</span></span>
            <ArrowRight aria-hidden="true" />
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
