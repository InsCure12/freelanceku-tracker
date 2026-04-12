"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

interface JobData {
  id: string;
  date: string;
  clientName: string;
  projectName: string | null;
  amount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  dpAmount?: number | null;
  dpDate?: string | null;
  deadline?: string | null;
  description?: string | null;
}

interface Props {
  job: JobData;
  onClose: () => void;
}

export default function EditJobModal({ job, onClose }: Props) {
  const [form, setForm] = useState({
    clientName: job.clientName,
    projectName: job.projectName || "",
    date: job.date,
    deadline: job.deadline || "",
    amount: job.amount,
    currency: job.currency,
    status: job.status,
    paymentStatus: job.paymentStatus || "unpaid",
    dpAmount: job.dpAmount || 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: form.clientName.trim(),
          projectName: form.projectName.trim() || null,
          date: form.date,
          deadline: form.deadline || null,
          amount: form.amount,
          currency: form.currency,
          status: form.status,
          paymentStatus: form.paymentStatus,
          dpAmount: form.paymentStatus === "dp" ? form.dpAmount : 0,
          dpDate:
            form.paymentStatus === "dp"
              ? new Date().toISOString().split("T")[0]
              : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to save changes");
        return;
      }
      router.refresh();
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/15">
          <h2 className="text-lg font-bold text-on-surface">Edit Job</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <XCircle size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Client Name */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Client Name
            </label>
            <input
              type="text"
              required
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container text-on-surface text-sm border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Project Name
            </label>
            <input
              type="text"
              value={form.projectName}
              onChange={(e) =>
                setForm({ ...form, projectName: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container text-on-surface text-sm border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Optional"
            />
          </div>

          {/* Date + Deadline + Status row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container text-on-surface text-sm border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Deadline
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container text-on-surface text-sm border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container text-on-surface text-sm border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="pending">Pending</option>
                <option value="ongoing">Ongoing</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Payment Status
            </label>
            <div className="flex rounded-xl overflow-hidden border border-outline-variant/20">
              {(["unpaid", "dp", "paid"] as const).map((ps) => (
                <button
                  key={ps}
                  type="button"
                  onClick={() => setForm({ ...form, paymentStatus: ps })}
                  className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-colors ${
                    form.paymentStatus === ps
                      ? ps === "paid"
                        ? "bg-[#ecfdf5] text-[#065f46]"
                        : ps === "dp"
                          ? "bg-[#fff7ed] text-[#9a3412]"
                          : "bg-[#fef2f2] text-[#991b1b]"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {ps === "paid"
                    ? "💰 Paid"
                    : ps === "dp"
                      ? "💳 DP"
                      : "⏳ Unpaid"}
                </button>
              ))}
            </div>
            {form.paymentStatus === "dp" && (
              <div className="mt-3">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Jumlah DP
                </label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={form.dpAmount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dpAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="Masukkan jumlah DP"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container text-on-surface text-sm border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/30"
                />
              </div>
            )}
          </div>

          {/* Amount + Currency row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Amount
              </label>
              <input
                type="number"
                required
                min={0}
                step="any"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container text-on-surface text-sm border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Currency
              </label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container text-on-surface text-sm border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="IDR">IDR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          {error && (
            <div className="px-4 py-2.5 rounded-xl bg-error-container text-error text-sm font-medium">
              {error}
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
