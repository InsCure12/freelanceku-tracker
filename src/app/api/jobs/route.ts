import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { job } from "@/lib/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const VALID_CURRENCIES = ["IDR", "USD"];
const VALID_STATUSES = ["done", "pending", "booked", "ongoing"];
const MAX_STRING_LEN = 500;

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200);
  const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const conditions = [eq(job.userId, session.user.id)];
  if (from) conditions.push(gte(job.date, from));
  if (to) conditions.push(lte(job.date, to));

  const jobs = await db.query.job.findMany({
    where: and(...conditions),
    orderBy: [desc(job.date)],
    limit,
    offset,
  });

  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { clientName, projectName, date, categoryId, amount, currency, duration, deadline, status, description } = body;

  // Validate required fields
  if (!clientName || !date || amount === undefined) {
    return NextResponse.json({ error: "Missing required fields: clientName, date, amount" }, { status: 400 });
  }

  // Validate types and constraints
  if (typeof clientName !== "string" || clientName.trim().length === 0 || clientName.length > MAX_STRING_LEN) {
    return NextResponse.json({ error: "Invalid clientName" }, { status: 400 });
  }
  if (projectName && (typeof projectName !== "string" || projectName.length > MAX_STRING_LEN)) {
    return NextResponse.json({ error: "Invalid projectName" }, { status: 400 });
  }
  if (typeof amount !== "number" || !isFinite(amount) || amount < 0) {
    return NextResponse.json({ error: "Amount must be a non-negative number" }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Date must be in YYYY-MM-DD format" }, { status: 400 });
  }
  if (currency && !VALID_CURRENCIES.includes(currency)) {
    return NextResponse.json({ error: "Currency must be IDR or USD" }, { status: 400 });
  }
  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Status must be done, pending, or ongoing" }, { status: 400 });
  }
  if (duration !== undefined && duration !== null && (typeof duration !== "number" || duration < 0)) {
    return NextResponse.json({ error: "Duration must be a non-negative number" }, { status: 400 });
  }
  if (deadline !== undefined && deadline !== null && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    return NextResponse.json({ error: "Deadline must be in YYYY-MM-DD format" }, { status: 400 });
  }

  const newJob = await db.insert(job).values({
    clientName: clientName.trim(),
    projectName: projectName?.trim() || null,
    date,
    categoryId: categoryId || null,
    amount: Number(amount),
    currency: currency || "IDR",
    duration: duration ? Number(duration) : null,
    deadline: deadline || null,
    status: status || "pending",
    description: description?.slice(0, 2000) || null,
    userId: session.user.id,
  }).returning();

  return NextResponse.json(newJob[0], { status: 201 });
}
