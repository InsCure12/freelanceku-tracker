import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoice, invoiceItem } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoices = await db.query.invoice.findMany({
    where: eq(invoice.userId, session.user.id),
  });

  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    invoiceNumber,
    clientName,
    issueDate,
    dueDate,
    subtotal,
    taxRate,
    taxAmount,
    discount,
    total,
    currency,
    jobIds,
  } = body;

  if (!invoiceNumber || !clientName || !issueDate || total === undefined) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const newInvoice = await db
    .insert(invoice)
    .values({
      invoiceNumber,
      clientName,
      issueDate,
      dueDate: dueDate || null,
      subtotal: Number(subtotal),
      taxRate: Number(taxRate) || 0,
      taxAmount: Number(taxAmount) || 0,
      discount: Number(discount) || 0,
      total: Number(total),
      currency: currency || "USD",
      status: "draft",
      userId: session.user.id,
    })
    .returning();

  // Create invoice items from selected jobs
  if (jobIds && Array.isArray(jobIds)) {
    const jobs = await db.query.job.findMany({
      where: eq(invoice.userId, session.user.id),
    });

    for (const jobId of jobIds) {
      const j = jobs.find((job: { id: string }) => job.id === jobId);
      if (j) {
        await db.insert(invoiceItem).values({
          invoiceId: newInvoice[0].id,
          jobId: j.id,
          description: `${j.clientName} - ${j.projectName || "Service"}`,
          amount: j.amount,
          hours: j.duration,
        });
        // Auto-sync DP: set job paymentStatus to 'dp' and dpAmount to invoice item amount
        await db
          .update(job)
          .set({
            paymentStatus: "dp",
            dpAmount: j.amount,
            dpDate: new Date().toISOString(),
          })
          .where(eq(job.id, j.id));
      }
    }
  }

  return NextResponse.json(newInvoice[0], { status: 201 });
}
