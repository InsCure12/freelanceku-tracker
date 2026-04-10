import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user as userTable, job } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import CreateInvoiceForm from "./CreateInvoiceForm";

export default async function CreateInvoicePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userData = await db.query.user.findFirst({
    where: eq(userTable.id, session.user.id),
  });
  if (userData?.plan !== "pro") redirect("/dashboard");

  const jobs = await db.query.job.findMany({
    where: eq(job.userId, session.user.id),
  });

  const billableJobs = jobs
    .filter((j) => j.status === "done" || j.status === "pending")
    .sort((a, b) => b.date.localeCompare(a.date));

  return <CreateInvoiceForm jobs={billableJobs} userName={session.user.name} companyName={userData?.companyName || ""} />;
}
