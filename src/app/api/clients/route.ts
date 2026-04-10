import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { job, invoice } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { EXCHANGE_RATE } from "@/lib/currency";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobs = await db.query.job.findMany({
    where: eq(job.userId, session.user.id),
  });

  const invoices = await db.query.invoice.findMany({
    where: eq(invoice.userId, session.user.id),
  });

  // Group by clientName
  const clientMap = new Map<string, {
    name: string;
    totalRevenueIDR: number;
    totalRevenueUSD: number;
    jobCount: number;
    invoiceCount: number;
    invoiceTotalIDR: number;
    lastJobDate: string | null;
    statuses: Record<string, number>;
  }>();

  for (const j of jobs) {
    const existing = clientMap.get(j.clientName) || {
      name: j.clientName,
      totalRevenueIDR: 0,
      totalRevenueUSD: 0,
      jobCount: 0,
      invoiceCount: 0,
      invoiceTotalIDR: 0,
      lastJobDate: null,
      statuses: {},
    };

    existing.totalRevenueIDR += j.currency === "IDR" ? j.amount : j.amount * EXCHANGE_RATE;
    existing.totalRevenueUSD += j.currency === "USD" ? j.amount : j.amount / EXCHANGE_RATE;
    existing.jobCount += 1;
    existing.statuses[j.status] = (existing.statuses[j.status] || 0) + 1;

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

  return NextResponse.json(clients);
}
