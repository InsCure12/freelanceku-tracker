export const STATUSES = ["pending", "booked", "ongoing", "done"] as const;
export type JobStatus = (typeof STATUSES)[number];

export const STATUS_STYLES: Record<JobStatus, { bg: string; dot: string; label: string }> = {
  done:    { bg: "bg-primary-fixed text-on-primary-fixed", dot: "bg-primary", label: "Done" },
  pending: { bg: "bg-secondary-fixed text-secondary",      dot: "bg-secondary", label: "Pending" },
  booked:  { bg: "bg-[#fff7ed] text-[#c2410c]",           dot: "bg-[#ea580c]", label: "Booked" },
  ongoing: { bg: "bg-tertiary-fixed text-tertiary",        dot: "bg-tertiary", label: "Ongoing" },
};

export function getStatusStyle(status: string) {
  return STATUS_STYLES[status as JobStatus] || STATUS_STYLES.pending;
}
