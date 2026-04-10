"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { pdf } from "@react-pdf/renderer";
import { CircleCheck, ScrollText, ScanEye, SendHorizontal } from "lucide-react";
import InvoicePDF from "@/components/InvoicePDF";
import type { InvoicePDFData } from "@/components/InvoicePDF";

interface Job {
  id: string;
  date: string;
  clientName: string;
  projectName: string | null;
  amount: number;
  currency: string;
  duration: number | null;
}

interface CreateInvoiceFormProps {
  jobs: Job[];
  userName: string;
  companyName: string;
}

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID").format(Math.round(amount));
}

export default function CreateInvoiceForm({ jobs, userName, companyName }: CreateInvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [clientName, setClientName] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState("15");
  const [discount, setDiscount] = useState("0");

  const selectedItems = jobs.filter((j) => selectedJobs.includes(j.id));
  const subtotal = selectedItems.reduce((s, j) => s + j.amount, 0);
  const tax = subtotal * (parseFloat(taxRate) || 0) / 100;
  const disc = parseFloat(discount) || 0;
  const total = subtotal + tax - disc;

  const year = new Date().getFullYear();
  const invoiceNumber = `INV-${year}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`;

  const toggleJob = (id: string) => {
    setSelectedJobs((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]
    );
  };

  const buildPDFData = (): InvoicePDFData => ({
    invoiceNumber,
    clientName,
    issueDate,
    dueDate: dueDate || null,
    subtotal,
    taxRate: parseFloat(taxRate) || 0,
    taxAmount: tax,
    discount: disc,
    total,
    currency: "IDR",
    status: "draft",
    fromName: userName,
    fromCompany: companyName,
    items: selectedItems.map((j) => ({
      description: `${j.projectName || j.clientName}`,
      amount: j.amount,
      hours: j.duration,
    })),
  });

  const downloadPDF = async (data: InvoicePDFData) => {
    const blob = await pdf(<InvoicePDF data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.invoiceNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    if (!clientName || selectedJobs.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber,
          clientName,
          issueDate,
          dueDate: dueDate || null,
          subtotal,
          taxRate: parseFloat(taxRate) || 0,
          taxAmount: tax,
          discount: disc,
          total,
          currency: "IDR",
          jobIds: selectedJobs,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        const pdfData = buildPDFData();
        pdfData.status = saved.status || "draft";
        await downloadPDF(pdfData);
        router.push("/dashboard/invoices");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (selectedJobs.length === 0) return;
    const data = buildPDFData();
    const blob = await pdf(<InvoicePDF data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handleSaveDraft = async () => {
    if (!clientName || selectedJobs.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber,
          clientName,
          issueDate,
          dueDate: dueDate || null,
          subtotal,
          taxRate: parseFloat(taxRate) || 0,
          taxAmount: tax,
          discount: disc,
          total,
          currency: "IDR",
          jobIds: selectedJobs,
        }),
      });
      if (res.ok) {
        router.push("/dashboard/invoices");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const uniqueClients = [...new Set(jobs.map((j) => j.clientName))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-on-surface">Create New Invoice</h1>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-0 max-w-lg mx-auto overflow-x-auto">
        {["Client", "Line Items", "Branding", "Preview"].map((step, i) => (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                i === 0 ? "bg-primary text-on-primary" : "bg-surface-container-high text-outline"
              }`}>
                {i + 1}
              </div>
              <span className="text-[9px] lg:text-[10px] mt-1 uppercase tracking-wider text-outline">{step}</span>
            </div>
            {i < 3 && <div className={`w-8 lg:w-16 h-0.5 mx-1 lg:mx-2 ${i === 0 ? "bg-primary" : "bg-surface-container-high"}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Client */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 lg:p-8">
            <h2 className="text-lg font-bold text-on-surface mb-1">Section 1: Client Selection</h2>
            <p className="text-sm text-on-surface-variant mb-6">Define the recipient for this invoice.</p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Select Existing Client</label>
                <select
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Choose a client...</option>
                  {uniqueClients.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Invoice Number</label>
                  <input type="text" readOnly value={invoiceNumber} className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm text-outline" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Issue Date</label>
                  <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Line Items */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base lg:text-lg font-bold text-on-surface">Section 2: Work Log Items</h2>
                <p className="text-sm text-on-surface-variant">Select billable jobs from your recent work history.</p>
              </div>
            </div>

            <div className="space-y-3">
              {jobs.length === 0 ? (
                <p className="text-sm text-outline py-8 text-center">No billable jobs available.</p>
              ) : (
                jobs.slice(0, 10).map((j) => (
                  <label
                    key={j.id}
                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors ${
                      selectedJobs.includes(j.id) ? "bg-primary-fixed/30" : "hover:bg-surface-container-low"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center ${
                      selectedJobs.includes(j.id) ? "bg-primary text-on-primary" : "bg-surface-container-high"
                    }`}>
                      {selectedJobs.includes(j.id) && <CircleCheck size={14} strokeWidth={1.75} />}
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(j.id)}
                      onChange={() => toggleJob(j.id)}
                      className="hidden"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-on-surface">
                        {j.projectName || j.clientName}
                      </p>
                      <p className="text-xs text-outline">
                        Completed {new Date(j.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {j.duration && ` • ${j.duration} Hours`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-on-surface">Rp {formatIDR(j.amount)}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Section 3: Customization */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 lg:p-8">
            <h2 className="text-base lg:text-lg font-bold text-on-surface mb-6">Section 3: Customization & Branding</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Applied Tax (%)</label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Discount (Flat Rp)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Live Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-tertiary to-tertiary/80 rounded-2xl p-5 lg:p-6 text-on-tertiary sticky top-24">
            <p className="text-[10px] uppercase tracking-wider text-on-tertiary/60">Live Total Summary</p>
            <p className="text-3xl lg:text-4xl font-bold mt-2">Rp {formatIDR(total)}</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-on-tertiary/70">
                <span>Subtotal ({selectedJobs.length} Items)</span>
                <span>Rp {formatIDR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-on-tertiary/70">
                <span>Tax ({taxRate}%)</span>
                <span>Rp {formatIDR(tax)}</span>
              </div>
              {disc > 0 && (
                <div className="flex justify-between text-on-tertiary/70">
                  <span>Discount</span>
                  <span>-Rp {formatIDR(disc)}</span>
                </div>
              )}
              <div className="border-t border-on-tertiary/20 pt-2 flex justify-between font-bold">
                <span>Balance Due</span>
                <span>Rp {formatIDR(total)}</span>
              </div>
            </div>
          </div>

          {/* Pro Advantage */}
          <div className="bg-surface-container-lowest rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-tertiary">💎</span>
              <p className="text-sm font-bold text-on-surface">Pro Advantage</p>
            </div>
            <ul className="space-y-2 text-xs text-on-surface-variant">
              <li className="flex items-center gap-2">
                <CircleCheck size={12} strokeWidth={1.75} className="text-tertiary" /> Auto-calculated tax projections
              </li>
              <li className="flex items-center gap-2">
                <CircleCheck size={12} strokeWidth={1.75} className="text-tertiary" /> Direct email delivery with tracking
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleSubmit}
              disabled={loading || selectedJobs.length === 0 || !clientName}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50"
            >
              <SendHorizontal size={16} strokeWidth={1.75} /> Generate & Send
            </button>
            <button
              onClick={handlePreview}
              disabled={selectedJobs.length === 0}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-surface-container-high text-on-surface rounded-xl text-sm font-semibold hover:bg-surface-container-highest transition-colors disabled:opacity-50"
            >
              <ScanEye size={16} strokeWidth={1.75} /> Preview PDF
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={loading || selectedJobs.length === 0 || !clientName}
              className="w-full text-center text-sm text-outline hover:text-on-surface-variant disabled:opacity-50"
            >
              Save as Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
