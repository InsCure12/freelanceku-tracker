"use client";

import { useState } from "react";
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
import { ArrowDownToLine, Users, TrendingUp, ChevronLeft, ChevronRight, Search } from "lucide-react";

interface Client {
  name: string;
  totalRevenueIDR: number;
  totalRevenueUSD: number;
  jobCount: number;
  doneCount: number;
  pendingCount: number;
  invoiceCount: number;
  invoiceTotalIDR: number;
  lastJobDate: string | null;
}

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID").format(Math.round(amount));
}
function formatUSD(amount: number) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

const ITEMS_PER_PAGE = 10;

export default function ClientsClient({ clients, plan }: { clients: Client[]; plan: string }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [cur, setCur] = useState<"IDR" | "USD">("IDR");

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalRevenueIDR = clients.reduce((s, c) => s + c.totalRevenueIDR, 0);
  const totalRevenueUSD = clients.reduce((s, c) => s + c.totalRevenueUSD, 0);
  const totalJobs = clients.reduce((s, c) => s + c.jobCount, 0);

  const csvData = filtered.map((c) => ({
    Client: c.name,
    "Total Revenue (IDR)": Math.round(c.totalRevenueIDR),
    "Total Revenue (USD)": c.totalRevenueUSD.toFixed(2),
    "Total Jobs": c.jobCount,
    "Done Jobs": c.doneCount,
    "Pending Jobs": c.pendingCount,
    Invoices: c.invoiceCount,
    "Last Job Date": c.lastJobDate || "",
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Client Directory</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Overview of all clients derived from your work log.
          </p>
        </div>
        <button
          onClick={() => downloadCSV(csvData, "clients-export.csv")}
          className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
        >
          <ArrowDownToLine size={16} strokeWidth={1.75} /> Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-primary to-primary-container rounded-2xl p-6 text-on-primary">
          <p className="text-[10px] uppercase tracking-wider text-primary-fixed/60">Total Clients</p>
          <p className="text-4xl font-bold mt-2">{clients.length}</p>
          <p className="text-xs text-primary-fixed/60 mt-1">Active client relationships</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-6">
          <p className="text-[10px] uppercase tracking-wider text-outline">Total Revenue</p>
          <p className="text-4xl font-bold mt-2 text-on-surface">
            {cur === "IDR" ? `Rp ${formatIDR(totalRevenueIDR)}` : `$${formatUSD(totalRevenueUSD)}`}
          </p>
          <button onClick={() => setCur(cur === "IDR" ? "USD" : "IDR")} className="text-xs text-primary mt-1 hover:underline">
            {cur === "IDR" ? `≈ $${formatUSD(totalRevenueUSD)}` : `≈ Rp ${formatIDR(totalRevenueIDR)}`}
          </button>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-6">
          <p className="text-[10px] uppercase tracking-wider text-outline">Total Jobs</p>
          <p className="text-4xl font-bold mt-2 text-on-surface">{totalJobs}</p>
          <p className="text-xs text-outline mt-1">Across all clients</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest rounded-xl flex-1">
          <Search size={16} className="text-outline" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent text-sm text-on-surface focus:outline-none w-full placeholder:text-outline"
          />
        </div>
      </div>

      {/* Client Table */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-visible">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-outline">
              <th className="text-left py-4 px-6 font-semibold">Client</th>
              <th className="text-right py-4 px-6 font-semibold">Revenue</th>
              <th className="text-center py-4 px-6 font-semibold">Jobs</th>
              <th className="text-center py-4 px-6 font-semibold">Done</th>
              <th className="text-center py-4 px-6 font-semibold">Pending</th>
              <th className="text-center py-4 px-6 font-semibold">Invoices</th>
              <th className="text-left py-4 px-6 font-semibold">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-sm text-outline">
                  {search ? "No clients match your search." : "No clients yet. Start logging jobs to see your clients here!"}
                </td>
              </tr>
            ) : (
              paginated.map((c) => (
                <tr key={c.name} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                        style={{
                          background: `hsl(${c.name.charCodeAt(0) * 10}, 60%, 90%)`,
                          color: `hsl(${c.name.charCodeAt(0) * 10}, 60%, 30%)`,
                        }}
                      >
                        {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </div>
                      <p className="text-sm font-semibold text-on-surface">{c.name}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <p className="text-sm font-bold text-on-surface">
                      {cur === "IDR" ? `Rp ${formatIDR(c.totalRevenueIDR)}` : `$${formatUSD(c.totalRevenueUSD)}`}
                    </p>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-sm font-semibold text-on-surface">{c.jobCount}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-fixed text-on-primary-fixed">
                      {c.doneCount}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary-fixed text-secondary">
                      {c.pendingCount}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-sm text-on-surface-variant">{c.invoiceCount}</span>
                  </td>
                  <td className="py-4 px-6 text-sm text-on-surface-variant">
                    {c.lastJobDate
                      ? new Date(c.lastJobDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {filtered.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-xs text-outline">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} clients
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-surface-container-high disabled:opacity-30 transition-colors">
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-semibold ${p === page ? "bg-primary text-on-primary" : "hover:bg-surface-container-high text-on-surface-variant"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-surface-container-high disabled:opacity-30 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
