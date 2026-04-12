import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { job } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const VALID_CURRENCIES = ["IDR", "USD"];
const VALID_STATUSES = ["done", "pending", "booked", "ongoing"];
const VALID_PAYMENT_STATUSES = ["paid", "unpaid", "dp"];
const ALLOWED_FIELDS = [
  "clientName",
  "projectName",
  "date",
  "categoryId",
  "amount",
  "currency",
  "duration",
  "deadline",
  "status",
  "paymentStatus",
  "dpAmount",
  "dpDate",
  "description",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Only allow known fields (prevent mass assignment)
  const sanitized: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) sanitized[key] = body[key];
  }

  // Validate individual fields when present
  if (sanitized.clientName !== undefined) {
    if (
      typeof sanitized.clientName !== "string" ||
      (sanitized.clientName as string).trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid clientName" },
        { status: 400 },
      );
    }
    sanitized.clientName = (sanitized.clientName as string).trim();
  }
  if (sanitized.amount !== undefined) {
    if (
      typeof sanitized.amount !== "number" ||
      !isFinite(sanitized.amount as number) ||
      (sanitized.amount as number) < 0
    ) {
      return NextResponse.json(
        { error: "Amount must be a non-negative number" },
        { status: 400 },
      );
    }
  }
  if (
    sanitized.currency !== undefined &&
    !VALID_CURRENCIES.includes(sanitized.currency as string)
  ) {
    return NextResponse.json(
      { error: "Currency must be IDR or USD" },
      { status: 400 },
    );
  }
  if (
    sanitized.status !== undefined &&
    !VALID_STATUSES.includes(sanitized.status as string)
  ) {
    return NextResponse.json(
      { error: "Status must be done, pending, or ongoing" },
      { status: 400 },
    );
  }
  if (
    sanitized.paymentStatus !== undefined &&
    !VALID_PAYMENT_STATUSES.includes(sanitized.paymentStatus as string)
  ) {
    return NextResponse.json(
      { error: "Payment status must be paid, unpaid, or dp" },
      { status: 400 },
    );
  }
  if (sanitized.dpAmount !== undefined) {
    if (
      typeof sanitized.dpAmount !== "number" ||
      !isFinite(sanitized.dpAmount as number) ||
      (sanitized.dpAmount as number) < 0
    ) {
      return NextResponse.json(
        { error: "DP amount must be a non-negative number" },
        { status: 400 },
      );
    }
  }
  if (
    sanitized.date !== undefined &&
    !/^\d{4}-\d{2}-\d{2}$/.test(sanitized.date as string)
  ) {
    return NextResponse.json(
      { error: "Date must be in YYYY-MM-DD format" },
      { status: 400 },
    );
  }

  // Auto-set paymentStatus when status changes to "done"
  if (sanitized.status === "done" && sanitized.paymentStatus === undefined) {
    sanitized.paymentStatus = "paid";
  }

  const existing = await db.query.job.findFirst({
    where: and(eq(job.id, id), eq(job.userId, session.user.id)),
  });

  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db
    .update(job)
    .set({ ...sanitized, updatedAt: new Date() })
    .where(and(eq(job.id, id), eq(job.userId, session.user.id)))
    .returning();

  return NextResponse.json(updated[0]);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await db
    .delete(job)
    .where(and(eq(job.id, id), eq(job.userId, session.user.id)));

  return NextResponse.json({ success: true });
}
