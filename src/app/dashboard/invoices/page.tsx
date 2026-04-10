import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user as userTable, invoice } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import InvoicesClient from "./InvoicesClient";

export default async function InvoicesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userData = await db.query.user.findFirst({
    where: eq(userTable.id, session.user.id),
  });

  if (userData?.plan !== "pro") {
    redirect("/dashboard");
  }

  const invoices = await db.query.invoice.findMany({
    where: eq(invoice.userId, session.user.id),
  });

  const sortedInvoices = invoices.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return <InvoicesClient invoices={sortedInvoices} />;
}
