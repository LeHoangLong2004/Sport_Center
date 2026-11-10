export const coachHashes = new Set([
  "#coach-portal",
  "#coach-dashboard",
  "#coach-schedule",
  "#coach-class-detail",
  "#coach-attendance",
  "#coach-members",
  "#coach-member-profile",
  "#coach-curriculum",
  "#coach-assessment",
  "#coach-notifications",
  "#coach-profile",
  "#coach-settings",
  "#coach-ai",
  "#coach-chat",
  "#coach-reviews",
]);

export const adminHashes = new Set([
  "#admin",
  "#login",
  "#dashboard",
  "#register",
  "#member",
  "#classes",
  "#booking-confirm",
  "#schedule",
  "#booking-success",
  "#workout-detail",
  "#move-ai",
  "#ai",
  "#support",
]);

export const paymentHashes = new Set(["#payment"]);
export const receptionistHashes = new Set(["#receptionist"]);

export function isAdminHash(hash: string): boolean {
  return hash.startsWith("#member") || hash.startsWith("#dashboard") || adminHashes.has(hash);
}

export function isReceptionistHash(hash: string): boolean {
  return hash.startsWith("#receptionist") || receptionistHashes.has(hash);
}

export function isCoachHash(hash: string): boolean {
  // `#coach` is the public coach directory page. Only the explicit portal
  // hashes should render the authenticated Coach Portal.
  return hash.startsWith("#coach-") || hash.startsWith("#coach/") || coachHashes.has(hash);
}

