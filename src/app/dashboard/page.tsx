import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user as userTable, job, category, invoice } from "@/lib/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { EXCHANGE_RATE } from "@/lib/currency";
import FreeDashboard from "./FreeDashboard";
import ProDashboard from "./ProDashboard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const sp = await searchParams;

  const userData = await db.query.user.findFirst({
    where: eq(userTable.id, session.user.id),
  });

  const plan = userData?.plan || "free";

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const selectedMonth = sp.month || defaultMonth;
  // If selectedMonth is just a year (e.g. "2026"), show the whole year
  const isFullYear = /^\d{4}$/.test(selectedMonth);
  const dateFrom = isFullYear
    ? `${selectedMonth}-01-01`
    : `${selectedMonth}-01`;
  const dateTo = isFullYear ? `${selectedMonth}-12-31` : `${selectedMonth}-31`;

  // Fetch categories once
  const categories = await db.query.category.findMany({
    where: eq(category.userId, session.user.id),
  });

  // Fetch filtered jobs based on date range
  const monthJobs = await db.query.job.findMany({
    where: and(
      eq(job.userId, session.user.id),
      gte(job.date, dateFrom),
      lte(job.date, dateTo),
    ),
  });

  const doneMonthJobs = monthJobs.filter((j) => j.paymentStatus === "paid");
  const dpMonthJobs = monthJobs.filter((j) => j.paymentStatus === "dp");
  const totalIncome =
    doneMonthJobs.reduce(
      (sum, j) =>
        sum + (j.currency === "IDR" ? j.amount : j.amount * EXCHANGE_RATE),
      0,
    ) +
    dpMonthJobs.reduce(
      (sum, j) =>
        sum +
        (j.currency === "IDR"
          ? (j.dpAmount ?? 0)
          : (j.dpAmount ?? 0) * EXCHANGE_RATE),
      0,
    );
  const totalIncomeUSD =
    doneMonthJobs.reduce(
      (sum, j) =>
        sum + (j.currency === "USD" ? j.amount : j.amount / EXCHANGE_RATE),
      0,
    ) +
    dpMonthJobs.reduce(
      (sum, j) =>
        sum +
        (j.currency === "USD"
          ? (j.dpAmount ?? 0)
          : (j.dpAmount ?? 0) / EXCHANGE_RATE),
      0,
    );
  const jobCount = doneMonthJobs.length;

  // Fetch recent jobs filtered by selected month (client-side search handles filtering)
  const recentJobsRaw = await db.query.job.findMany({
    where: and(
      eq(job.userId, session.user.id),
      gte(job.date, dateFrom),
      lte(job.date, dateTo),
    ),
    orderBy: [desc(job.date)],
    limit: 100,
  });

  const recentJobs = recentJobsRaw.map((j) => ({
    ...j,
    categoryName:
      categories.find((c) => c.id === j.categoryId)?.name || "Uncategorized",
  }));

  // All jobs needed for category stats
  const allJobsForCategories = await db.query.job.findMany({
    where: eq(job.userId, session.user.id),
    columns: { categoryId: true },
  });

  const categoryStats = categories.map((c) => ({
    ...c,
    jobCount: allJobsForCategories.filter((j) => j.categoryId === c.id).length,
  }));

  // Yearly data (shared for both free and pro)
  const selectedYear = selectedMonth.slice(0, 4);
  const yearStart = `${selectedYear}-01-01`;
  const yearJobs = await db.query.job.findMany({
    where: and(
      eq(job.userId, session.user.id),
      gte(job.date, yearStart),
      lte(job.date, `${selectedYear}-12-31`),
    ),
  });

  const doneYearJobs = yearJobs.filter((j) => j.paymentStatus === "paid");
  const dpYearJobs = yearJobs.filter((j) => j.paymentStatus === "dp");
  const yearlyIncomeUSD =
    doneYearJobs.reduce(
      (s, j) =>
        s + (j.currency === "USD" ? j.amount : j.amount / EXCHANGE_RATE),
      0,
    ) +
    dpYearJobs.reduce(
      (s, j) =>
        s +
        (j.currency === "USD"
          ? (j.dpAmount ?? 0)
          : (j.dpAmount ?? 0) / EXCHANGE_RATE),
      0,
    );
  const yearlyIncomeIDR =
    doneYearJobs.reduce(
      (s, j) =>
        s + (j.currency === "IDR" ? j.amount : j.amount * EXCHANGE_RATE),
      0,
    ) +
    dpYearJobs.reduce(
      (s, j) =>
        s +
        (j.currency === "IDR"
          ? (j.dpAmount ?? 0)
          : (j.dpAmount ?? 0) * EXCHANGE_RATE),
      0,
    );

  // DP stats for dashboard
  const dpTotalIDR = dpYearJobs.reduce(
    (s, j) =>
      s +
      (j.currency === "IDR"
        ? (j.dpAmount ?? 0)
        : (j.dpAmount ?? 0) * EXCHANGE_RATE),
    0,
  );
  const dpTotalUSD = dpYearJobs.reduce(
    (s, j) =>
      s +
      (j.currency === "USD"
        ? (j.dpAmount ?? 0)
        : (j.dpAmount ?? 0) / EXCHANGE_RATE),
    0,
  );
  const dpJobCount = dpYearJobs.length;

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyRevenueIDR = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, "0");
    const mPaidJobs = doneYearJobs.filter((j) => j.date.slice(5, 7) === m);
    const mDpJobs = dpYearJobs.filter((j) => j.date.slice(5, 7) === m);
    return {
      month: monthNames[i],
      revenue:
        mPaidJobs.reduce(
          (s, j) =>
            s + (j.currency === "IDR" ? j.amount : j.amount * EXCHANGE_RATE),
          0,
        ) +
        mDpJobs.reduce(
          (s, j) =>
            s +
            (j.currency === "IDR"
              ? (j.dpAmount ?? 0)
              : (j.dpAmount ?? 0) * EXCHANGE_RATE),
          0,
        ),
    };
  });
  const monthlyRevenueUSD = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, "0");
    const mPaidJobs = doneYearJobs.filter((j) => j.date.slice(5, 7) === m);
    const mDpJobs = dpYearJobs.filter((j) => j.date.slice(5, 7) === m);
    return {
      month: monthNames[i],
      revenue:
        mPaidJobs.reduce(
          (s, j) =>
            s + (j.currency === "USD" ? j.amount : j.amount / EXCHANGE_RATE),
          0,
        ) +
        mDpJobs.reduce(
          (s, j) =>
            s +
            (j.currency === "USD"
              ? (j.dpAmount ?? 0)
              : (j.dpAmount ?? 0) / EXCHANGE_RATE),
          0,
        ),
    };
  });

  if (plan === "pro") {
    // Fetch invoices for the year
    const yearInvoices = await db.query.invoice.findMany({
      where: and(
        eq(invoice.userId, session.user.id),
        gte(invoice.issueDate, yearStart),
        lte(invoice.issueDate, `${selectedYear}-12-31`),
      ),
    });

    const paidInvoices = yearInvoices.filter((inv) => inv.status === "paid");
    const actualTaxIDR = paidInvoices.reduce(
      (s, inv) =>
        s +
        (inv.currency === "IDR"
          ? (inv.taxAmount ?? 0)
          : (inv.taxAmount ?? 0) * EXCHANGE_RATE),
      0,
    );
    const actualTaxUSD = paidInvoices.reduce(
      (s, inv) =>
        s +
        (inv.currency === "USD"
          ? (inv.taxAmount ?? 0)
          : (inv.taxAmount ?? 0) / EXCHANGE_RATE),
      0,
    );
    const totalInvoicedIDR = paidInvoices.reduce(
      (s, inv) =>
        s + (inv.currency === "IDR" ? inv.total : inv.total * EXCHANGE_RATE),
      0,
    );
    const totalInvoicedUSD = paidInvoices.reduce(
      (s, inv) =>
        s + (inv.currency === "USD" ? inv.total : inv.total / EXCHANGE_RATE),
      0,
    );

    // Projected revenue from unpaid jobs + remaining balance from DP jobs
    const projectedJobs = yearJobs.filter((j) => j.paymentStatus === "unpaid");
    const projectedRevenueIDR =
      projectedJobs.reduce(
        (s, j) =>
          s + (j.currency === "IDR" ? j.amount : j.amount * EXCHANGE_RATE),
        0,
      ) +
      dpYearJobs.reduce((s, j) => {
        const remaining = j.amount - (j.dpAmount ?? 0);
        return (
          s + (j.currency === "IDR" ? remaining : remaining * EXCHANGE_RATE)
        );
      }, 0);
    const projectedRevenueUSD =
      projectedJobs.reduce(
        (s, j) =>
          s + (j.currency === "USD" ? j.amount : j.amount / EXCHANGE_RATE),
        0,
      ) +
      dpYearJobs.reduce((s, j) => {
        const remaining = j.amount - (j.dpAmount ?? 0);
        return (
          s + (j.currency === "USD" ? remaining : remaining / EXCHANGE_RATE)
        );
      }, 0);
    const bookedCount = yearJobs.filter((j) => j.status === "booked").length;
    const ongoingCount = yearJobs.filter((j) => j.status === "ongoing").length;

    return (
      <ProDashboard
        userName={session.user.name}
        yearlyIncomeUSD={yearlyIncomeUSD}
        yearlyIncomeIDR={yearlyIncomeIDR}
        monthlyIncomeIDR={totalIncome}
        monthlyIncomeUSD={totalIncomeUSD}
        jobCount={jobCount}
        recentJobs={recentJobs}
        categories={categoryStats}
        monthlyRevenueIDR={monthlyRevenueIDR}
        monthlyRevenueUSD={monthlyRevenueUSD}
        projectedRevenueIDR={projectedRevenueIDR}
        projectedRevenueUSD={projectedRevenueUSD}
        bookedCount={bookedCount}
        ongoingCount={ongoingCount}
        selectedMonth={selectedMonth}
        actualTaxIDR={actualTaxIDR}
        actualTaxUSD={actualTaxUSD}
        totalInvoicedIDR={totalInvoicedIDR}
        totalInvoicedUSD={totalInvoicedUSD}
        dpTotalIDR={dpTotalIDR}
        dpTotalUSD={dpTotalUSD}
        dpJobCount={dpJobCount}
      />
    );
  }

  return (
    <FreeDashboard
      userName={session.user.name}
      totalIncomeIDR={totalIncome}
      totalIncomeUSD={totalIncomeUSD}
      yearlyIncomeIDR={yearlyIncomeIDR}
      yearlyIncomeUSD={yearlyIncomeUSD}
      jobCount={jobCount}
      recentJobs={recentJobs}
      categories={categoryStats}
      monthlyRevenueIDR={monthlyRevenueIDR}
      monthlyRevenueUSD={monthlyRevenueUSD}
      selectedMonth={selectedMonth}
    />
  );
}
