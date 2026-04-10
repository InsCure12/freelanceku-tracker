"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { pdf } from "@react-pdf/renderer";
import { PlusCircle, ArrowDownToLine, SquarePen, SendHorizontal, ScanEye, Trash2, ChevronLeft, ChevronRight, SlidersHorizontal, CheckCircle2, X } from "lucide-react";

function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [headers.join(","), ...data.map(row => headers.map(h => {
    const v = String(row[h] ?? "");
    return v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v;
  }).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
import InvoicePDF from "@/components/InvoicePDF";
import type { InvoicePDFData } from "@/components/InvoicePDF";

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientAddress: string | null;
  issueDate: string;
  dueDate: string | null;
  total: number;
  currency: string;
  status: string;
  paidAmount: number | null;
  paidDate: string | null;
  paymentNotes: string | null;
}

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID").format(Math.round(amount));
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-[#dcfce7] text-[#166534]",
    sent: "bg-secondary-fixed text-secondary",
    overdue: "bg-error-container text-error",
    draft: "bg-surface-container-high text-on-surface-variant",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || styles.draft}`}>
      {status}
    </span>
  );
}

export default function InvoicesClient({ invoices }: { invoices: Invoice[] }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payNotes, setPayNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const itemsPerPage = 10;

  const totalReceivables = invoices.reduce((s, inv) => s + inv.total, 0);
  const overdueInvoices = invoices.filter((inv) => inv.status === "overdue");
  const agingAmount = overdueInvoices.reduce((s, inv) => s + inv.total, 0);
  const paidInvoices = invoices.filter((inv) => inv.status === "paid");
  const paidTotal = paidInvoices.reduce((s, inv) => s + (inv.paidAmount || inv.total), 0);

  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const paginated = invoices.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const csvData = invoices.map((inv) => ({
    "Invoice #": inv.invoiceNumber,
    Client: inv.clientName,
    "Issue Date": inv.issueDate,
    "Due Date": inv.dueDate || "",
    "Total (IDR)": inv.total,
    Status: inv.status,
    "Paid Amount": inv.paidAmount || 0,
    "Paid Date": inv.paidDate || "",
    Notes: inv.paymentNotes || "",
  }));

  const openPayModal = (inv: Invoice) => {
    setPayingInvoice(inv);
    setPayAmount(String(inv.total - (inv.paidAmount || 0)));
    setPayDate(new Date().toISOString().slice(0, 10));
    setPayNotes("");
  };

  const handleMarkPaid = async () => {
    if (!payingInvoice) return;
    setSaving(true);
    try {
      const amount = Number(payAmount);
      if (isNaN(amount) || amount <= 0) return;
      const newPaidAmount = (payingInvoice.paidAmount || 0) + amount;
      const newStatus = newPaidAmount >= payingInvoice.total ? "paid" : payingInvoice.status === "draft" ? "sent" : payingInvoice.status;

      await fetch(`/api/invoices/${payingInvoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          paidAmount: newPaidAmount,
          paidDate: payDate,
          paymentNotes: payNotes || null,
        }),
      });
      setPayingInvoice(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (inv: Invoice, newStatus: string) => {
    await fetch(`/api/invoices/${inv.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  };

  const handleDownload = async (invoiceId: string) => {
    setDownloading(invoiceId);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`);
      if (!res.ok) return;
      const data = await res.json();
      const pdfData: InvoicePDFData = {
        invoiceNumber: data.invoiceNumber,
        clientName: data.clientName,
        clientAddress: data.clientAddress,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        subtotal: data.subtotal,
        taxRate: data.taxRate || 0,
        taxAmount: data.taxAmount || 0,
        discount: data.discount || 0,
        total: data.total,
        currency: data.currency,
        status: data.status,
        fromName: data.fromName || "",
        fromCompany: data.fromCompany || "",
        items: (data.items || []).map((it: { description: string; amount: number; hours?: number | null }) => ({
          description: it.description,
          amount: it.amount,
          hours: it.hours,
        })),
      };
      const blob = await pdf(<InvoicePDF data={pdfData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-gradient-to-r from-primary to-primary-container rounded-2xl p-5 lg:p-6 text-on-primary">
          <p className="text-[10px] uppercase tracking-wider text-primary-fixed/60">Total Receivables</p>
          <p className="text-3xl lg:text-4xl font-bold mt-2">Rp {formatIDR(totalReceivables)}</p>
          <p className="text-xs text-primary-fixed/60 mt-3">↗ +12% from last quarter</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wider text-outline">Aging Invoices</p>
            {overdueInvoices.length > 0 && <span className="text-error">⚠</span>}
          </div>
          <p className="text-3xl lg:text-4xl font-bold mt-2 text-on-surface">Rp {formatIDR(agingAmount)}</p>
          <p className="text-xs text-outline mt-1">Across {overdueInvoices.length} overdue accounts</p>
          <div className="flex mt-3 h-1.5 rounded-full overflow-hidden gap-0.5">
            <div className="bg-error flex-[3]" />
            <div className="bg-surface-container-high flex-[2]" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-error/10 to-error/5 rounded-2xl p-5 lg:p-6">
          <p className="text-[10px] uppercase tracking-wider text-outline">Total Paid</p>
          <p className="text-3xl lg:text-4xl font-bold mt-2 text-on-surface">Rp {formatIDR(paidTotal)}</p>
          <p className="text-xs text-outline mt-1">{paidInvoices.length} invoices collected</p>
        </div>
      </div>

      {/* Active Accounts */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 lg:px-6 py-4 lg:py-5 gap-4">
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-on-surface">Active Accounts</h2>
            <p className="text-xs lg:text-sm text-on-surface-variant mt-1">
              Managing {invoices.length} active invoice streams.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => downloadCSV(csvData, "invoices-export.csv")}
              className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 bg-surface-container-high rounded-xl text-xs lg:text-sm font-semibold text-on-surface-variant hover:bg-surface-container-highest transition-colors"
            >
              <ArrowDownToLine size={16} strokeWidth={1.75} /> <span className="hidden sm:inline">Export</span> CSV
            </button>
            <Link
              href="/dashboard/invoices/new"
              className="flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 bg-primary text-on-primary rounded-xl text-xs lg:text-sm font-semibold hover:bg-primary-container transition-colors"
            >
              <PlusCircle size={16} strokeWidth={1.75} /> <span className="hidden sm:inline">Create Invoice</span>
            </Link>
          </div>
        </div>

        {/* Mobile: Card list */}
        <div className="lg:hidden px-4 pb-4 space-y-3">
          {paginated.length === 0 ? (
            <div className="py-12 text-center text-sm text-outline">No invoices yet. Create your first professional invoice!</div>
          ) : (
            paginated.map((inv) => (
              <div key={inv.id} className="bg-surface-container-low/50 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: `hsl(${inv.clientName.charCodeAt(0) * 10}, 60%, 90%)`, color: `hsl(${inv.clientName.charCodeAt(0) * 10}, 60%, 30%)` }}>
                      {inv.clientName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-on-surface truncate">{inv.clientName}</p>
                      <p className="text-[0.65rem] text-outline">{inv.invoiceNumber}</p>
                    </div>
                  </div>
                  <InvoiceStatusBadge status={inv.status} />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-sm font-bold ${inv.status === "overdue" ? "text-error" : "text-on-surface"}`}>Rp {formatIDR(inv.total)}</span>
                  <div className="flex gap-1">
                    {inv.status !== "paid" && (
                      <button onClick={() => openPayModal(inv)} className="p-1.5 rounded-lg hover:bg-[#dcfce7] text-[#166534]" title="Mark as Paid">
                        <CheckCircle2 size={16} strokeWidth={1.75} />
                      </button>
                    )}
                    <button onClick={() => handleDownload(inv.id)} disabled={downloading === inv.id} className={`p-1.5 rounded-lg hover:bg-surface-container-high text-outline ${downloading === inv.id ? "opacity-50" : ""}`} title="Download PDF">
                      <ArrowDownToLine size={16} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop: Table */}
        <div className="hidden lg:block">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-outline">
              <th className="text-left py-3 px-6 font-semibold">Invoice #</th>
              <th className="text-left py-3 px-6 font-semibold">Client</th>
              <th className="text-right py-3 px-6 font-semibold">Amount</th>
              <th className="text-center py-3 px-6 font-semibold">Status</th>
              <th className="text-left py-3 px-6 font-semibold">Paid</th>
              <th className="text-center py-3 px-6 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-sm text-outline">
                  No invoices yet. Create your first professional invoice!
                </td>
              </tr>
            ) : (
              paginated.map((inv) => (
                <tr key={inv.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-6 text-sm font-medium text-on-surface">{inv.invoiceNumber}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: `hsl(${inv.clientName.charCodeAt(0) * 10}, 60%, 90%)`, color: `hsl(${inv.clientName.charCodeAt(0) * 10}, 60%, 30%)` }}>
                        {inv.clientName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{inv.clientName}</p>
                        {inv.clientAddress && <p className="text-xs text-outline">{inv.clientAddress}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <p className={`text-sm font-bold ${inv.status === "overdue" ? "text-error" : "text-on-surface"}`}>
                      Rp {formatIDR(inv.total)}
                    </p>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <InvoiceStatusBadge status={inv.status} />
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-on-surface">
                      <p className="font-semibold">Rp {formatIDR(inv.paidAmount || 0)}</p>
                      {inv.paidDate && <p className="text-[10px] text-outline">{inv.paidDate}</p>}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center gap-1">
                      {inv.status !== "paid" && (
                        <button
                          onClick={() => openPayModal(inv)}
                          className="p-2 rounded-lg hover:bg-[#dcfce7] text-[#166534] transition-colors"
                          title="Mark as Paid"
                        >
                          <CheckCircle2 size={16} strokeWidth={1.75} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDownload(inv.id)}
                        disabled={downloading === inv.id}
                        className={`p-2 rounded-lg hover:bg-surface-container-high text-outline transition-colors ${downloading === inv.id ? "opacity-50" : ""}`}
                        title="Download PDF"
                      >
                        <ArrowDownToLine size={16} strokeWidth={1.75} />
                      </button>
                      {inv.status === "draft" && (
                        <button
                          onClick={() => handleStatusChange(inv, "sent")}
                          className="p-2 rounded-lg hover:bg-surface-container-high text-outline transition-colors"
                          title="Mark as Sent"
                        >
                          <SendHorizontal size={16} strokeWidth={1.75} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {invoices.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 lg:px-6 py-4 gap-3">
            <p className="text-xs text-outline">
              Showing {(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, invoices.length)} of {invoices.length} invoices
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-surface-container-high disabled:opacity-30 transition-colors"><ChevronLeft size={18} /></button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-semibold ${p === page ? "bg-primary text-on-primary" : "hover:bg-surface-container-high text-on-surface-variant"}`}>{p}</button>
              ))}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages || totalPages === 0} className="p-1.5 rounded-lg hover:bg-surface-container-high disabled:opacity-30 transition-colors"><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      <Link
        href="/dashboard/invoices/new"
        className="fixed bottom-24 lg:bottom-8 right-6 lg:right-8 w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary-container transition-colors"
      >
        <PlusCircle size={24} strokeWidth={1.75} />
      </Link>

      {/* Payment Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface-container-lowest rounded-2xl p-8 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-on-surface">Record Payment</h3>
              <button onClick={() => setPayingInvoice(null)} className="p-2 rounded-lg hover:bg-surface-container-high text-outline">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-outline">Invoice</p>
                <p className="text-lg font-bold text-on-surface">{payingInvoice.invoiceNumber} — {payingInvoice.clientName}</p>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-outline">Total Amount</span>
                <span className="font-semibold text-on-surface">Rp {formatIDR(payingInvoice.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-outline">Already Paid</span>
                <span className="font-semibold text-on-surface">Rp {formatIDR(payingInvoice.paidAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-outline/20 pt-2">
                <span className="text-outline">Remaining</span>
                <span className="font-bold text-primary">Rp {formatIDR(payingInvoice.total - (payingInvoice.paidAmount || 0))}</span>
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface-variant">Payment Amount (IDR)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full mt-1 px-4 py-3 bg-surface-container-high rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface-variant">Payment Date</label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full mt-1 px-4 py-3 bg-surface-container-high rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface-variant">Notes (optional)</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Bank transfer, partial payment..."
                  className="w-full mt-1 px-4 py-3 bg-surface-container-high rounded-xl text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                onClick={handleMarkPaid}
                disabled={saving}
                className="w-full py-3 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50"
              >
                {saving ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
