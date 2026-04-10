"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

interface NewJobFormProps {
  plan: "free" | "pro";
  categories: { id: string; name: string }[];
}

export default function NewJobForm({ plan, categories }: NewJobFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    clientName: "",
    projectName: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: categories[0]?.id || "",
    amount: "",
    currency: "IDR" as "IDR" | "USD",
    duration: "",
    deadline: "",
    status: "pending" as "pending" | "ongoing" | "done",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount) || 0,
          duration: form.duration ? parseFloat(form.duration) : null,
          deadline: form.deadline || null,
        }),
      });
      if (res.ok) {
        router.push("/dashboard/work-log");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const contractValue = parseFloat(form.amount) || 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-xs text-outline">
        <Link href="/dashboard/work-log" className="hover:text-primary">Work Log</Link>
        {" > "}
        <span className="text-on-surface font-semibold">New Job Entry</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-on-surface">Register New Engagement</h1>
          <p className="text-xs lg:text-sm text-on-surface-variant mt-2">
            Document your professional services with architectural precision. Ensure all fiscal details are captured for accurate tax forecasting.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/work-log"
            className="flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 bg-surface-container-lowest rounded-xl text-xs lg:text-sm font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
          >
            Discard Draft
          </Link>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 bg-primary text-on-primary rounded-xl text-xs lg:text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50"
          >
            <CheckCircle2 size={16} strokeWidth={1.75} /> Save Engagement
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-8 space-y-8">
          {/* Core Details */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-lg">🏗️</span>
              <h2 className="text-lg font-bold text-on-surface">Core Engagement Details</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Client Identity</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Architectural Firm"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  required
                  className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-on-surface text-sm placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Website Redesign Phase 1"
                  value={form.projectName}
                  onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                  className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-on-surface text-sm placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Project Commencement</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                    className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Deadline</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div>
                  <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Service Architecture</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Select category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-outline font-semibold">Scope of Work</label>
                <textarea
                  placeholder="Outline the architectural milestones and deliverables..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full mt-2 px-4 py-3 bg-surface-container-high/50 rounded-xl text-on-surface text-sm placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-lg">🚩</span>
              <h2 className="text-lg font-bold text-on-surface">Current Workflow Phase</h2>
            </div>
            <div className="grid grid-cols-3 gap-3 lg:gap-4">
              {(["pending", "ongoing", "done"] as const).map((s) => {
                const icons: Record<string, string> = { pending: "⏳", ongoing: "🔄", done: "✅" };
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, status: s })}
                    className={`p-4 rounded-xl text-left transition-all ${
                      form.status === s
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-high/50 text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    <span className="text-2xl">{icons[s]}</span>
                    <p className="mt-2 text-sm font-bold uppercase">{s}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Financial Valuation */}
          <div className="bg-gradient-to-br from-primary to-primary-container rounded-2xl p-6 text-on-primary sticky top-24">
            <p className="text-[10px] uppercase tracking-wider text-primary-fixed/60">Financial Valuation</p>
            <p className="text-xs text-primary-fixed/60 mt-1 uppercase tracking-wider">Contract Value</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-sm text-primary-fixed/60">{form.currency === "USD" ? "$" : "Rp"}</span>
              <span className="text-4xl font-bold">{contractValue > 0 ? new Intl.NumberFormat(form.currency === "USD" ? "en-US" : "id-ID").format(contractValue) : "0.00"}</span>
            </div>

            <input
              type="number"
              step="0.01"
              placeholder="Enter amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              className="w-full mt-4 px-4 py-3 bg-on-primary/10 rounded-xl text-on-primary text-sm placeholder:text-primary-fixed/40 focus:outline-none focus:ring-2 focus:ring-on-primary/30"
            />

            <p className="text-[10px] uppercase tracking-wider text-primary-fixed/60 mt-4">Currency Locale</p>
            <div className="flex rounded-xl overflow-hidden mt-2 bg-on-primary/10">
              {(["USD", "IDR"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => plan === "pro" || c === "IDR" ? setForm({ ...form, currency: c }) : null}
                  className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                    form.currency === c ? "bg-on-primary text-primary" : "text-primary-fixed/60 hover:text-on-primary"
                  } ${c === "USD" && plan === "free" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {c}
                </button>
              ))}
              <button
                type="button"
                disabled
                className="flex-1 py-2 text-xs font-semibold text-primary-fixed/30 cursor-not-allowed"
              >
                🔒 EUR
              </button>
            </div>
            {plan === "free" && (
              <p className="text-[10px] text-primary-fixed/40 mt-2">* Multi-currency active via Pro subscription</p>
            )}

            {plan === "pro" && (
              <div className="mt-4">
                <label className="text-[10px] uppercase tracking-wider text-primary-fixed/60">Duration (hours)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 4.5"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="w-full mt-2 px-4 py-3 bg-on-primary/10 rounded-xl text-on-primary text-sm placeholder:text-primary-fixed/40 focus:outline-none focus:ring-2 focus:ring-on-primary/30"
                />
              </div>
            )}
          </div>

          {/* Tip */}
          <div className="bg-tertiary-fixed/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-tertiary text-lg">💡</span>
              <p className="text-sm font-bold text-tertiary">Architect&apos;s Tip</p>
            </div>
            <p className="text-xs text-on-surface-variant">
              Defining specific categories helps our AI engine predict your quarterly tax liability with 99.8% accuracy.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
