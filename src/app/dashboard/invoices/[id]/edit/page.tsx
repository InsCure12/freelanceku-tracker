import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { user as userTable, invoice, invoiceItem } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import EditInvoiceForm from "./EditInvoiceForm";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userData = await db.query.user.findFirst({
    where: eq(userTable.id, session.user.id),
  });
  if (userData?.plan !== "pro") redirect("/dashboard");

  const { id } = await params;

  const inv = await db.query.invoice.findFirst({
    where: and(eq(invoice.id, id), eq(invoice.userId, session.user.id)),
  });

  if (!inv) notFound();

  const items = await db.query.invoiceItem.findMany({
    where: eq(invoiceItem.invoiceId, id),
  });

  return (
    <EditInvoiceForm
      invoice={{
        ...inv,
        items: items.map((it) => ({
          id: it.id,
          description: it.description,
          amount: it.amount,
          hours: it.hours,
        })),
      }}
      userName={userData?.name || ""}
      companyName={userData?.companyName || ""}
    />
  );
}
