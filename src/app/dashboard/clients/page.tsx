import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user as userTable, job, invoice } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { EXCHANGE_RATE } from "@/lib/currency";
import ClientsClient from "./ClientsClient";

export default async function ClientsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userData = await db.query.user.findFirst({
    where: eq(userTable.id, session.user.id),
  });

  const plan = userData?.plan || "free";

  const jobs = await db.query.job.findMany({
    where: eq(job.userId, session.user.id),
  });

  const invoices = await db.query.invoice.findMany({
    where: eq(invoice.userId, session.user.id),
  });

  // Build client data from jobs
  const clientMap = new Map<string, {
    name: string;
    totalRevenueIDR: number;
    totalRevenueUSD: number;
    jobCount: number;
    doneCount: number;
    pendingCount: number;
    invoiceCount: number;
    invoiceTotalIDR: number;
    lastJobDate: string | null;
  }>();

  for (const j of jobs) {
    const existing = clientMap.get(j.clientName) || {
      name: j.clientName,
      totalRevenueIDR: 0,
      totalRevenueUSD: 0,
      jobCount: 0,
      doneCount: 0,
      pendingCount: 0,
      invoiceCount: 0,
      invoiceTotalIDR: 0,
      lastJobDate: null,
    };

    if (j.status === "done") {
      existing.totalRevenueIDR += j.currency === "IDR" ? j.amount : j.amount * EXCHANGE_RATE;
      existing.totalRevenueUSD += j.currency === "USD" ? j.amount : j.amount / EXCHANGE_RATE;
      existing.doneCount += 1;
    } else if (j.status === "pending" || j.status === "booked") {
      existing.pendingCount += 1;
    }
    existing.jobCount += 1;
    if (!existing.lastJobDate || j.date > existing.lastJobDate) {
      existing.lastJobDate = j.date;
    }

    clientMap.set(j.clientName, existing);
  }

  for (const inv of invoices) {
    const existing = clientMap.get(inv.clientName);
    if (existing) {
      existing.invoiceCount += 1;
      existing.invoiceTotalIDR += inv.total;
    }
  }

  const clients = Array.from(clientMap.values()).sort((a, b) => b.totalRevenueIDR - a.totalRevenueIDR);

  return <ClientsClient clients={clients} plan={plan} />;
}
