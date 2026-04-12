import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoice, invoiceItem, user as userTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const inv = await db.query.invoice.findFirst({
    where: and(eq(invoice.id, id), eq(invoice.userId, session.user.id)),
  });

  if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const items = await db.query.invoiceItem.findMany({
    where: eq(invoiceItem.invoiceId, id),
  });

  const userData = await db.query.user.findFirst({
    where: eq(userTable.id, session.user.id),
  });

  return NextResponse.json({
    ...inv,
    items,
    fromName: userData?.name || "",
    fromCompany: userData?.companyName || "",
  });
}

const VALID_INVOICE_STATUSES = ["draft", "sent", "paid", "overdue"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const inv = await db.query.invoice.findFirst({
    where: and(eq(invoice.id, id), eq(invoice.userId, session.user.id)),
  });

  if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const {
    status,
    paidAmount,
    paidDate,
    paymentNotes,
    clientName,
    clientAddress,
    issueDate,
    dueDate,
    subtotal,
    taxRate,
    taxAmount,
    discount,
    total,
    currency,
    items,
  } = body;

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (status !== undefined) {
    if (!VALID_INVOICE_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updates.status = status;
  }
  if (paidAmount !== undefined) updates.paidAmount = Number(paidAmount);
  if (paidDate !== undefined) updates.paidDate = paidDate;
  if (paymentNotes !== undefined) updates.paymentNotes = paymentNotes;
  if (clientName !== undefined) updates.clientName = clientName;
  if (clientAddress !== undefined) updates.clientAddress = clientAddress;
  if (issueDate !== undefined) updates.issueDate = issueDate;
  if (dueDate !== undefined) updates.dueDate = dueDate;
  if (subtotal !== undefined) updates.subtotal = Number(subtotal);
  if (taxRate !== undefined) updates.taxRate = Number(taxRate);
  if (taxAmount !== undefined) updates.taxAmount = Number(taxAmount);
  if (discount !== undefined) updates.discount = Number(discount);
  if (total !== undefined) updates.total = Number(total);
  if (currency !== undefined) updates.currency = currency;

  const updated = await db
    .update(invoice)
    .set(updates)
    .where(and(eq(invoice.id, id), eq(invoice.userId, session.user.id)))
    .returning();

  // Replace invoice items if provided
  if (Array.isArray(items)) {
    await db.delete(invoiceItem).where(eq(invoiceItem.invoiceId, id));
    for (const item of items) {
      await db.insert(invoiceItem).values({
        invoiceId: id,
        description: item.description,
        amount: Number(item.amount),
        hours: item.hours ? Number(item.hours) : null,
      });
      // Auto-sync DP: if item has jobId, update job's DP fields
      if (item.jobId) {
        await db
          .update(job)
          .set({
            paymentStatus: "dp",
            dpAmount: Number(item.amount),
            dpDate: new Date().toISOString(),
          })
          .where(eq(job.id, item.jobId));
      }
    }
  }

  return NextResponse.json(updated[0]);
}
