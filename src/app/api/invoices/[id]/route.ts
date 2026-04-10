import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoice, invoiceItem, user as userTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const inv = await db.query.invoice.findFirst({
    where: and(eq(invoice.id, id), eq(invoice.userId, session.user.id)),
  });

  if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { status, paidAmount, paidDate, paymentNotes } = body;

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

  const updated = await db
    .update(invoice)
    .set(updates)
    .where(and(eq(invoice.id, id), eq(invoice.userId, session.user.id)))
    .returning();

  return NextResponse.json(updated[0]);
}
