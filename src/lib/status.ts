export const STATUSES = ["pending", "booked", "ongoing", "done"] as const;
export type JobStatus = (typeof STATUSES)[number];

export const STATUS_STYLES: Record<
  JobStatus,
  { bg: string; dot: string; label: string }
> = {
  done: {
    bg: "bg-primary-fixed text-on-primary-fixed",
    dot: "bg-primary",
    label: "Done",
  },
  pending: {
    bg: "bg-secondary-fixed text-secondary",
    dot: "bg-secondary",
    label: "Pending",
  },
  booked: {
    bg: "bg-[#fff7ed] text-[#c2410c]",
    dot: "bg-[#ea580c]",
    label: "Booked",
  },
  ongoing: {
    bg: "bg-tertiary-fixed text-tertiary",
    dot: "bg-tertiary",
    label: "Ongoing",
  },
};

export const PAYMENT_STATUSES = ["paid", "unpaid", "dp"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_STYLES: Record<
  PaymentStatus,
  { bg: string; dot: string; label: string }
> = {
  paid: {
    bg: "bg-[#ecfdf5] text-[#065f46]",
    dot: "bg-[#10b981]",
    label: "Paid",
  },
  unpaid: {
    bg: "bg-[#fef2f2] text-[#991b1b]",
    dot: "bg-[#ef4444]",
    label: "Unpaid",
  },
  dp: { bg: "bg-[#fff7ed] text-[#9a3412]", dot: "bg-[#f59e0b]", label: "DP" },
};

export function getPaymentStatusStyle(status: string) {
  return (
    PAYMENT_STATUS_STYLES[status as PaymentStatus] ||
    PAYMENT_STATUS_STYLES.unpaid
  );
}

export function getStatusStyle(status: string) {
  return STATUS_STYLES[status as JobStatus] || STATUS_STYLES.pending;
}
