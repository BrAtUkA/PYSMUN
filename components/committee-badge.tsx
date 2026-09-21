import { HelpCircle } from "lucide-react";
import { committees } from "@/lib/content";

type Committee = (typeof committees)[number];

// Each committee is recognizable by its own brand color (sampled from the
// logo itself) rather than a uniform badge, so the fill is always a gradient
// between color/colorTo — a flat pair of identical stops renders as solid.
export function CommitteeBadge({ committee, className }: { committee: Committee; className?: string }) {
  return (
    <span
      className={`committee-badge${className ? ` ${className}` : ""}`}
      data-sealed={committee.sealed || undefined}
      style={{ background: `linear-gradient(135deg, ${committee.color}, ${committee.colorTo})` }}
    >
      {committee.logo
        // eslint-disable-next-line @next/next/no-img-element -- static bundled asset
        ? <img src={committee.logo} alt="" />
        : <HelpCircle aria-hidden="true" />}
    </span>
  );
}
