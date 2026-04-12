"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown } from "lucide-react";
import { PAYMENT_STATUSES, getPaymentStatusStyle } from "@/lib/status";

interface Props {
  jobId: string;
  currentStatus: string;
  currentDpAmount?: number;
}

export default function PaymentStatusDropdown({
  jobId,
  currentStatus,
  currentDpAmount,
}: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [dpAmount, setDpAmount] = useState(currentDpAmount || 0);
  const [showDpInput, setShowDpInput] = useState(false);
  const [dpInputValue, setDpInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  async function changeStatus(newStatus: string, dpVal?: number) {
    if (newStatus === status && newStatus !== "dp") {
      setOpen(false);
      setShowDpInput(false);
      return;
    }
    if (newStatus === "dp" && !showDpInput) {
      setShowDpInput(true);
      setDpInputValue(dpAmount > 0 ? String(dpAmount) : "");
      return;
    }
    setLoading(true);
    try {
      const payload: Record<string, unknown> = { paymentStatus: newStatus };
      if (newStatus === "dp") {
        payload.dpAmount = dpVal ?? (parseFloat(dpInputValue) || 0);
        payload.dpDate = new Date().toISOString().split("T")[0];
      }
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus(newStatus);
        if (newStatus === "dp")
          setDpAmount(dpVal ?? (parseFloat(dpInputValue) || 0));
        router.refresh();
      }
    } finally {
      setLoading(false);
      setOpen(false);
      setShowDpInput(false);
    }
  }

  const s = getPaymentStatusStyle(status);

  return (
    <div ref={ref} className={`relative inline-block ${open ? "z-50" : ""}`}>
      <button
        onClick={() => {
          setOpen(!open);
          setShowDpInput(false);
        }}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize cursor-pointer transition-all hover:opacity-80 ${s.bg} ${loading ? "opacity-50" : ""}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {status === "dp" && dpAmount > 0
          ? `DP ${new Intl.NumberFormat("id-ID").format(dpAmount)}`
          : s.label}
        <ChevronsUpDown
          size={12}
          strokeWidth={1.75}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 right-0 min-w-[160px] bg-surface-container-lowest rounded-xl shadow-lg shadow-black/10 border border-outline-variant/20 overflow-hidden animate-dropdown">
          {PAYMENT_STATUSES.map((opt) => {
            const os = getPaymentStatusStyle(opt);
            return (
              <button
                key={opt}
                onClick={() => changeStatus(opt)}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium capitalize hover:bg-surface-container-low transition-colors ${opt === status ? "bg-surface-container" : ""}`}
              >
                <span className={`w-2 h-2 rounded-full ${os.dot}`} />
                {os.label}
                {opt === status && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </button>
            );
          })}
          {showDpInput && (
            <div className="px-3 py-2 border-t border-outline-variant/20">
              <label className="text-[10px] text-outline uppercase tracking-wider">
                Jumlah DP
              </label>
              <div className="flex gap-2 mt-1">
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={dpInputValue}
                  onChange={(e) => setDpInputValue(e.target.value)}
                  placeholder="0"
                  className="flex-1 px-2 py-1.5 rounded-lg bg-surface-container text-sm text-on-surface border border-outline-variant/20 focus:outline-none focus:ring-1 focus:ring-primary w-20"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      changeStatus("dp");
                    }
                  }}
                />
                <button
                  onClick={() => changeStatus("dp")}
                  className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold"
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
