"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown } from "lucide-react";
import { STATUSES, getStatusStyle } from "@/lib/status";

interface Props {
  jobId: string;
  currentStatus: string;
}

export default function StatusDropdown({ jobId, currentStatus }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus);
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

  async function changeStatus(newStatus: string) {
    if (newStatus === status) {
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        router.refresh();
      }
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  const s = getStatusStyle(status);

  return (
    <div ref={ref} className={`relative inline-block ${open ? "z-50" : ""}`}>
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize cursor-pointer transition-all hover:opacity-80 ${s.bg} ${loading ? "opacity-50" : ""}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {status}
        <ChevronsUpDown size={12} strokeWidth={1.75} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 right-0 min-w-[130px] bg-surface-container-lowest rounded-xl shadow-lg shadow-black/10 border border-outline-variant/20 overflow-hidden animate-dropdown">
          {STATUSES.map((opt) => {
            const os = getStatusStyle(opt);
            return (
              <button
                key={opt}
                onClick={() => changeStatus(opt)}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium capitalize hover:bg-surface-container-low transition-colors ${opt === status ? "bg-surface-container" : ""}`}
              >
                <span className={`w-2 h-2 rounded-full ${os.dot}`} />
                {opt}
                {opt === status && <span className="ml-auto text-primary">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
