import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user as userTable, job, category } from "@/lib/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { EXCHANGE_RATE } from "@/lib/currency";
import FreeDashboard from "./FreeDashboard";
import ProDashboard from "./ProDashboard";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
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
  const dateFrom = isFullYear ? `${selectedMonth}-01-01` : `${selectedMonth}-01`;
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

  const doneMonthJobs = monthJobs.filter((j) => j.status === "done");
  const totalIncome = doneMonthJobs.reduce((sum, j) => sum + (j.currency === "IDR" ? j.amount : j.amount * EXCHANGE_RATE), 0);
  const totalIncomeUSD = doneMonthJobs.reduce((sum, j) => sum + (j.currency === "USD" ? j.amount : j.amount / EXCHANGE_RATE), 0);
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
    categoryName: categories.find((c) => c.id === j.categoryId)?.name || "Uncategorized",
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

  if (plan === "pro") {
    const yearStart = `${now.getFullYear()}-01-01`;
    const yearJobs = await db.query.job.findMany({
      where: and(
        eq(job.userId, session.user.id),
        gte(job.date, yearStart),
      ),
    });

    const doneYearJobs = yearJobs.filter((j) => j.status === "done");
    const yearlyIncomeUSD = doneYearJobs.reduce((s, j) => s + (j.currency === "USD" ? j.amount : j.amount / EXCHANGE_RATE), 0);
    const yearlyIncomeIDR = doneYearJobs.reduce((s, j) => s + (j.currency === "IDR" ? j.amount : j.amount * EXCHANGE_RATE), 0);

    // Projected revenue from booked + ongoing jobs
    const projectedJobs = yearJobs.filter((j) => j.status === "booked" || j.status === "ongoing");
    const projectedRevenueIDR = projectedJobs.reduce((s, j) => s + (j.currency === "IDR" ? j.amount : j.amount * EXCHANGE_RATE), 0);
    const projectedRevenueUSD = projectedJobs.reduce((s, j) => s + (j.currency === "USD" ? j.amount : j.amount / EXCHANGE_RATE), 0);
    const bookedCount = yearJobs.filter((j) => j.status === "booked").length;
    const ongoingCount = yearJobs.filter((j) => j.status === "ongoing").length;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRevenueIDR = Array.from({ length: 12 }, (_, i) => {
      const m = String(i + 1).padStart(2, "0");
      const mJobs = doneYearJobs.filter((j) => j.date.slice(5, 7) === m);
      return {
        month: monthNames[i],
        revenue: mJobs.reduce((s, j) => s + (j.currency === "IDR" ? j.amount : j.amount * EXCHANGE_RATE), 0),
      };
    });
    const monthlyRevenueUSD = Array.from({ length: 12 }, (_, i) => {
      const m = String(i + 1).padStart(2, "0");
      const mJobs = doneYearJobs.filter((j) => j.date.slice(5, 7) === m);
      return {
        month: monthNames[i],
        revenue: mJobs.reduce((s, j) => s + (j.currency === "USD" ? j.amount : j.amount / EXCHANGE_RATE), 0),
      };
    });

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
      />
    );
  }

  return (
    <FreeDashboard
      userName={session.user.name}
      totalIncomeIDR={totalIncome}
      totalIncomeUSD={totalIncomeUSD}
      jobCount={jobCount}
      recentJobs={recentJobs}
      categories={categoryStats}
      selectedMonth={selectedMonth}
    />
  );
}
