import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user as userTable, job, category } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import WorkLogClient from "./WorkLogClient";

export default async function WorkLogPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userData = await db.query.user.findFirst({
    where: eq(userTable.id, session.user.id),
  });
  const plan = userData?.plan || "free";

  const jobs = await db.query.job.findMany({
    where: eq(job.userId, session.user.id),
  });

  const categories = await db.query.category.findMany({
    where: eq(category.userId, session.user.id),
  });

  const enrichedJobs = jobs
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((j) => ({
      ...j,
      categoryName: categories.find((c) => c.id === j.categoryId)?.name || "Uncategorized",
    }));

  return (
    <WorkLogClient
      plan={plan as "free" | "pro"}
      jobs={enrichedJobs}
      categories={categories}
      jobCount={jobs.filter((j) => {
        const now = new Date();
        const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
        return j.date >= monthStart;
      }).length}
    />
  );
}
