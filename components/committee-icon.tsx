import { HelpCircle } from "lucide-react";
import { committees } from "@/lib/content";

type Committee = (typeof committees)[number];

// Flat gold mark, no badge/avatar shape — just the committee's own icon (or
// a mystery glyph for the still-sealed one) in the site's gold accent.
// `onDark` swaps in the lighter gold cut for the homepage's dark section.
export function CommitteeIcon({ committee, className, onDark }: { committee: Committee; className?: string; onDark?: boolean }) {
  const src = onDark ? committee.logoOnDark : committee.logo;
  const classes = `committee-icon${committee.sealed ? " committee-icon--placeholder" : ""}${onDark ? " committee-icon--on-dark" : ""}${className ? ` ${className}` : ""}`;
  return src
    // eslint-disable-next-line @next/next/no-img-element -- static bundled asset
    ? <img src={src} alt="" className={classes} />
    : <HelpCircle aria-hidden="true" className={classes} />;
}
