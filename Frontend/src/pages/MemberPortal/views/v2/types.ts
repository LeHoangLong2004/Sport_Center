export type NewMemberPage = "schedule" | "success" | "workout" | "ai";
export type Navigate = (
  page:
    | NewMemberPage
    | "classes"
    | "overview"
    | "users"
    | "payment"
    | "reports"
) => void;
