import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user as userTable, job } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { EXCHANGE_RATE } from "@/lib/currency";
import TaxPlannerClient from "./TaxPlannerClient";

export default async function TaxPlannerPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userData = await db.query.user.findFirst({ where: eq(userTable.id, session.user.id) });
  if (userData?.plan !== "pro") redirect("/dashboard");

  const jobs = await db.query.job.findMany({ where: eq(job.userId, session.user.id) });

  const yearJobs = jobs.filter((j) => j.date.startsWith(String(new Date().getFullYear())));
  const totalIncome = yearJobs.reduce((s, j) => s + (j.currency === "IDR" ? j.amount : j.amount * EXCHANGE_RATE), 0);

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, "0");
    const mJobs = yearJobs.filter((j) => j.date.slice(5, 7) === m);
    return {
      month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
      income: mJobs.reduce((s, j) => s + (j.currency === "IDR" ? j.amount : j.amount * EXCHANGE_RATE), 0),
    };
  });

  return <TaxPlannerClient totalIncome={totalIncome} monthlyData={monthlyData} />;
}
