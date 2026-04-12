"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";

interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  hours: number | null;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientAddress: string | null;
  issueDate: string;
  dueDate: string | null;
  subtotal: number;
  taxRate: number | null;
  taxAmount: number | null;
  discount: number | null;
  total: number;
  currency: string;
  status: string;
  items: InvoiceItem[];
}

interface EditInvoiceFormProps {
  invoice: InvoiceData;
  userName: string;
  companyName: string;
}

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID").format(Math.round(amount));
}

export default function EditInvoiceForm({
  invoice,
  userName,
  companyName,
}: EditInvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [clientName, setClientName] = useState(invoice.clientName);
  const [clientAddress, setClientAddress] = useState(
    invoice.clientAddress || "",
  );
  const [issueDate, setIssueDate] = useState(invoice.issueDate);
  const [dueDate, setDueDate] = useState(invoice.dueDate || "");
  const [taxRate, setTaxRate] = useState(String(invoice.taxRate || 0));
  const [discount, setDiscount] = useState(String(invoice.discount || 0));
  const [items, setItems] = useState<
    { description: string; amount: string; hours: string }[]
  >(
    invoice.items.map((it) => ({
      description: it.description,
      amount: String(it.amount),
      hours: it.hours ? String(it.hours) : "",
    })),
  );

  const subtotal = items.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);
  const tax = (subtotal * (parseFloat(taxRate) || 0)) / 100;
  const disc = parseFloat(discount) || 0;
  const total = subtotal + tax - disc;

  const addItem = () => {
    setItems([...items, { description: "", amount: "", hours: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    setItems(
      items.map((it, i) => (i === index ? { ...it, [field]: value } : it)),
    );
  };

  const handleSave = async () => {
    if (!clientName.trim() || items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientAddress: clientAddress || null,
          issueDate,
          dueDate: dueDate || null,
          subtotal,
          taxRate: parseFloat(taxRate) || 0,
          taxAmount: tax,
          discount: disc,
          total,
          items: items.map((it) => ({
            description: it.description,
            amount: parseFloat(it.amount) || 0,
            hours: it.hours ? parseFloat(it.hours) : null,
          })),
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/invoices"
          className="p-2 rounded-xl hover:bg-surface-container-high transition-colors"
        >
          <ArrowLeft size={20} className="text-on-surface-variant" />
        </Link>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface">
            Edit Invoice
          </h1>
          <p className="text-sm text-on-surface-variant">
            {invoice.invoiceNumber}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* Client Info */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 lg:p-8">
            <h2 className="text-lg font-bold text-on-surface mb-6">
              Client Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">
                  Client Name
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">
                  Client Address (optional)
                </label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="e.g. Jl. Raya Kuta No. 10, Bali"
                  className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={invoice.invoiceNumber}
                    className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm text-outline"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-on-surface">
                  Line Items
                </h2>
                <p className="text-sm text-on-surface-variant">
                  Edit invoice items or add new ones.
                </p>
              </div>
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:bg-primary-container transition-colors"
              >
                <Plus size={14} strokeWidth={2} /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.length === 0 ? (
                <p className="text-sm text-outline py-8 text-center">
                  No items. Add at least one line item.
                </p>
              ) : (
                items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-surface-container-low/50"
                  >
                    <div className="flex-1">
                      <label className="text-[9px] uppercase tracking-wider text-outline font-semibold">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(idx, "description", e.target.value)
                        }
                        className="w-full mt-1 px-3 py-2.5 bg-surface-container-high/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="w-full sm:w-28">
                      <label className="text-[9px] uppercase tracking-wider text-outline font-semibold">
                        Hours
                      </label>
                      <input
                        type="number"
                        value={item.hours}
                        onChange={(e) =>
                          updateItem(idx, "hours", e.target.value)
                        }
                        placeholder="—"
                        className="w-full mt-1 px-3 py-2.5 bg-surface-container-high/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="w-full sm:w-40">
                      <label className="text-[9px] uppercase tracking-wider text-outline font-semibold">
                        Amount (IDR)
                      </label>
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) =>
                          updateItem(idx, "amount", e.target.value)
                        }
                        className="w-full mt-1 px-3 py-2.5 bg-surface-container-high/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => removeItem(idx)}
                        className="p-2.5 rounded-lg hover:bg-error-container text-error transition-colors"
                        title="Remove item"
                      >
                        <Trash2 size={16} strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tax & Discount */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 lg:p-8">
            <h2 className="text-lg font-bold text-on-surface mb-6">
              Tax & Discount
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">
                  Discount (Flat IDR)
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Summary */}
          <div className="bg-gradient-to-br from-tertiary to-tertiary/80 rounded-2xl p-5 lg:p-6 text-on-tertiary sticky top-24">
            <p className="text-[10px] uppercase tracking-wider text-on-tertiary/60">
              Live Total Summary
            </p>
            <p className="text-3xl lg:text-4xl font-bold mt-2">
              Rp {formatIDR(total)}
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-on-tertiary/70">
                <span>Subtotal ({items.length} Items)</span>
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

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleSave}
              disabled={loading || items.length === 0 || !clientName.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50"
            >
              <Save size={16} strokeWidth={1.75} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href="/dashboard/invoices"
              className="w-full flex items-center justify-center gap-2 py-3 bg-surface-container-high text-on-surface-variant rounded-xl text-sm font-semibold hover:bg-surface-container-highest transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
