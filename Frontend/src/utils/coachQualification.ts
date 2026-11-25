/** Returns true only when a coach has a specialty compatible with the class sport. */
export function isCoachQualifiedForSport(
  specialty?: string,
  sportName?: string,
  className?: string,
): boolean {
  const spec = (specialty || "").toLowerCase().trim();
  if (!spec) return false;
  const sport = (sportName || "").toLowerCase().trim();
  const target = sport + " " + (className || "").toLowerCase().trim();
  if (!sport && !className) return false;
  if (target.includes("yoga") && spec.includes("yoga")) return true;
  if (target.includes("pilates") && (spec.includes("pilates") || spec.includes("yoga"))) return true;
  if (
    (target.includes("gym") || target.includes("fitness") || target.includes("thể lực") || target.includes("thể hình")) &&
    (spec.includes("gym") || spec.includes("fitness") || spec.includes("thể hình") || spec.includes("body"))
  ) return true;
  if ((target.includes("bóng đá") || target.includes("futsal")) && (spec.includes("bóng đá") || spec.includes("futsal"))) return true;
  if (target.includes("cầu lông") && (spec.includes("cầu lông") || spec.includes("badminton"))) return true;
  if ((target.includes("bơi") || target.includes("swim")) && (spec.includes("bơi") || spec.includes("swim"))) return true;
  if (
    (target.includes("boxing") || target.includes("võ") || target.includes("combat")) &&
    (spec.includes("boxing") || spec.includes("võ") || spec.includes("combat"))
  ) return true;
  if ((target.includes("dance") || target.includes("zumba")) && (spec.includes("dance") || spec.includes("zumba"))) return true;
  return Boolean(sport && spec.includes(sport));
}
