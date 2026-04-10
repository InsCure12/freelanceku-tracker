"use client";

import Link from "next/link";
import { useState } from "react";
import { PlusCircle, ArrowDownToLine, PrinterCheck, ChevronLeft, ChevronRight } from "lucide-react";
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

interface Job {
  id: string;
  date: string;
  clientName: string;
  projectName: string | null;
  categoryName: string;
  amount: number;
  currency: string;
  status: string;
  duration: number | null;
}

interface WorkLogClientProps {
  plan: "free" | "pro";
  jobs: Job[];
  categories: { id: string; name: string }[];
  jobCount: number;
}

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID").format(Math.round(amount));
}
function formatUSD(amount: number) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    done: "bg-primary-fixed text-on-primary-fixed",
    pending: "bg-secondary-fixed text-secondary",
    ongoing: "bg-tertiary-fixed text-tertiary",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

function CategoryBadge({ name }: { name: string }) {
  const colors: Record<string, string> = {
    "UI Design": "bg-primary-fixed/50 text-primary",
    "Web Design": "bg-primary-fixed/50 text-primary",
    Design: "bg-tertiary-fixed/50 text-tertiary",
    Consulting: "bg-secondary-fixed/50 text-secondary",
    Branding: "bg-tertiary-fixed text-tertiary",
    Photography: "bg-primary-fixed text-primary",
    Development: "bg-[#dcfce7] text-[#166534]",
    Strategic: "bg-error-container text-error",
    Strategy: "bg-secondary-container text-secondary",
  };
  const style = colors[name] || "bg-surface-container-high text-on-surface-variant";
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${style}`}>{name}</span>;
}

const ITEMS_PER_PAGE = 10;

export default function WorkLogClient({ plan, jobs, categories, jobCount }: WorkLogClientProps) {
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = jobs.filter((j) => {
    if (filterMonth !== "all" && !j.date.startsWith(filterMonth)) return false;
    if (filterCategory !== "all" && j.categoryName !== filterCategory) return false;
    if (filterStatus !== "all" && j.status !== filterStatus) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const csvData = filtered.map((j) => ({
    Date: j.date,
    Client: j.clientName,
    Project: j.projectName || "",
    Category: j.categoryName,
    Amount: j.amount,
    Currency: j.currency,
    Status: j.status,
  }));

  // Stats for Pro
  const totalHours = jobs.reduce((s, j) => s + (j.duration || 0), 0);
  const avgRate = totalHours > 0 ? jobs.reduce((s, j) => s + (j.currency === "USD" ? j.amount : j.amount / 15745), 0) / totalHours : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      {plan === "pro" && (
        <div className="text-xs text-outline uppercase tracking-wider">
          Projects &gt; <span className="text-on-surface font-semibold">Work Log</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface">
            {plan === "pro" ? "Precision Work Log" : "Work Log"}
          </h1>
          {plan === "free" && (
            <p className="text-xs lg:text-sm text-on-surface-variant mt-1">Detailed history of your architectural and design commissions.</p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => downloadCSV(csvData, "work-log-export.csv")}
            className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 bg-surface-container-lowest rounded-xl text-xs lg:text-sm font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <ArrowDownToLine size={16} strokeWidth={1.75} /> <span className="hidden sm:inline">Export</span> CSV
          </button>
          <Link
            href="/dashboard/work-log/new"
            className="flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 bg-primary text-on-primary rounded-xl text-xs lg:text-sm font-semibold hover:bg-primary-container transition-colors"
          >
            <PlusCircle size={16} strokeWidth={1.75} /> <span className="hidden sm:inline">{plan === "pro" ? "Log New Hours" : "New Entry"}</span>
          </Link>
        </div>
      </div>

      {/* Pro Stats Cards */}
      {plan === "pro" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          <div className="bg-surface-container-lowest rounded-2xl p-5 lg:p-6">
            <p className="text-[10px] uppercase tracking-wider text-outline">Total Billable Hours</p>
            <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl lg:text-4xl font-bold text-on-surface">{totalHours.toFixed(1)}</span>
            <span className="text-lg text-outline">hrs</span>
            </div>
            <p className="text-xs text-[#16a34a] mt-2">↗ +12% from last month</p>
          </div>
          <div className="bg-gradient-to-r from-tertiary to-tertiary/80 rounded-2xl p-5 lg:p-6 text-on-tertiary">
            <p className="text-[10px] uppercase tracking-wider text-on-tertiary/60">Average Hourly Rate</p>
            <p className="text-3xl lg:text-4xl font-bold mt-2">${formatUSD(avgRate)}</p>
            <p className="text-xs text-on-tertiary/60 mt-2">Blended rate across IDR/USD contracts</p>
            <div className="flex items-center justify-between mt-3 text-xs">
              <span className="text-on-tertiary/60">Performance Target</span>
              <span className="font-semibold">80% Met</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary to-primary-container rounded-2xl p-5 lg:p-6 text-on-primary">
            <div className="flex justify-end"><span className="text-2xl">✦</span></div>
            <p className="text-lg font-bold mt-2">Pro Insights Unlocked</p>
            <p className="text-xs text-primary-fixed/60 mt-1">Multi-currency exchange rates auto-syncing every 60m.</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 lg:gap-4">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest rounded-xl">
          <span className="text-outline text-sm">📅</span>
          <select
            className="bg-transparent text-sm text-on-surface focus:outline-none"
            value={filterMonth}
            onChange={(e) => { setFilterMonth(e.target.value); setPage(1); }}
          >
            <option value="all">{plan === "pro" ? "Last 30 Days" : "All Months"}</option>
            {Array.from(new Set(jobs.map((j) => j.date.slice(0, 7)))).sort().reverse().map((m) => (
              <option key={m} value={m}>
                {new Date(m + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest rounded-xl">
          <span className="text-outline text-sm">🏷️</span>
          <select
            className="bg-transparent text-sm text-on-surface focus:outline-none"
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest rounded-xl">
          <span className="text-outline text-sm">📊</span>
          <select
            className="bg-transparent text-sm text-on-surface focus:outline-none"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          >
            <option value="all">All Statuses</option>
            <option value="done">Done</option>
            <option value="pending">Pending</option>
            <option value="ongoing">Ongoing</option>
          </select>
        </div>

        {plan === "pro" && (
          <div className="ml-auto text-xs text-outline">
            Exchange Rate: 1 USD = 15,745 IDR
          </div>
        )}

        {plan === "free" && (
          <div className="ml-auto flex gap-2">
            <button className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors">
              <ArrowDownToLine size={18} strokeWidth={1.75} />
            </button>
            <button className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors">
              <PrinterCheck size={18} strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>

      {/* Mobile: Card list */}
      <div className="lg:hidden space-y-3">
        {paginated.length === 0 ? (
          <div className="py-8 text-center text-sm text-outline">No entries found. Try adjusting your filters or add a new job.</div>
        ) : (
          paginated.map((j) => (
            <div key={j.id} className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-primary-fixed rounded-xl flex items-center justify-center text-xs font-bold text-on-primary-fixed shrink-0">
                  {j.clientName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">{j.clientName}</p>
                  <p className="text-[0.65rem] text-outline truncate">{j.projectName || j.categoryName}</p>
                  <p className="text-[0.6rem] text-outline">{new Date(j.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 ml-3">
                <span className="text-sm font-bold text-primary">Rp {formatIDR(j.currency === "IDR" ? j.amount : j.amount * 15745)}</span>
                <StatusBadge status={j.status} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: Table */}
      <div className="hidden lg:block bg-surface-container-lowest rounded-2xl overflow-visible">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-outline">
              <th className="text-left py-4 px-6 font-semibold">Date</th>
              <th className="text-left py-4 px-6 font-semibold">{plan === "pro" ? "Project & Client" : "Client / Job"}</th>
              {plan === "pro" && <th className="text-left py-4 px-6 font-semibold">Duration</th>}
              <th className="text-left py-4 px-6 font-semibold">Category</th>
              <th className="text-right py-4 px-6 font-semibold">{plan === "pro" ? "Rate (IDR)" : "Amount (IDR)"}</th>
              {plan === "pro" && <th className="text-right py-4 px-6 font-semibold">Total (USD)</th>}
              <th className="text-center py-4 px-6 font-semibold">Status</th>
              {plan === "free" && <th className="text-center py-4 px-6 font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={plan === "pro" ? 7 : 6} className="py-12 text-center text-sm text-outline">
                  No entries found. Try adjusting your filters or add a new job.
                </td>
              </tr>
            ) : (
              paginated.map((j) => (
                <tr key={j.id} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="py-4 px-6 text-sm text-on-surface-variant whitespace-nowrap">
                    {new Date(j.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-semibold text-on-surface">{j.clientName}</p>
                    {j.projectName && <p className="text-xs text-outline">{j.projectName}</p>}
                  </td>
                  {plan === "pro" && (
                    <td className="py-4 px-6 text-sm text-on-surface-variant">
                      {j.duration ? `${j.duration} hrs` : "—"}
                    </td>
                  )}
                  <td className="py-4 px-6">
                    <CategoryBadge name={j.categoryName} />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <p className="text-sm font-semibold text-on-surface">
                      Rp {formatIDR(j.currency === "IDR" ? j.amount : j.amount * 15745)}
                    </p>
                    {plan === "pro" && j.duration && (
                      <p className="text-[10px] text-outline">/hr</p>
                    )}
                  </td>
                  {plan === "pro" && (
                    <td className="py-4 px-6 text-right">
                      <p className="text-sm font-bold text-on-surface">
                        ${formatUSD(j.currency === "USD" ? j.amount : j.amount / 15745)}
                      </p>
                      <p className="text-[10px] text-outline">
                        Rp {formatIDR(j.currency === "IDR" ? j.amount : j.amount * 15745)}
                      </p>
                    </td>
                  )}
                  <td className="py-4 px-6 text-center">
                    <StatusBadge status={j.status} />
                  </td>
                  {plan === "free" && (
                    <td className="py-4 px-6 text-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-1">
                        <button className="p-1.5 rounded hover:bg-surface-container-high text-outline text-xs">✏️</button>
                        <button className="p-1.5 rounded hover:bg-error-container text-outline text-xs">🗑️</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-xs text-outline uppercase tracking-wider">
            {plan === "free"
              ? `Showing ${paginated.length} of ${filtered.length} jobs this month`
              : `Showing ${(page - 1) * ITEMS_PER_PAGE + 1}-${Math.min(page * ITEMS_PER_PAGE, filtered.length)} of ${filtered.length} entries`}
          </p>

          {plan === "free" && (
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-surface-container-high rounded-full">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(jobCount / 50) * 100}%` }} />
              </div>
              <span className="text-[10px] text-outline">{Math.round((jobCount / 50) * 100)}% of Monthly Limit</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                  p === page ? "bg-primary text-on-primary" : "hover:bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* FAB */}
      <Link
        href="/dashboard/work-log/new"
        className="fixed bottom-24 lg:bottom-8 right-6 lg:right-8 w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary-container transition-colors"
      >
        <PlusCircle size={24} strokeWidth={1.75} />
      </Link>
    </div>
  );
}
