"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EllipsisVertical, SquarePen, Trash2 } from "lucide-react";

interface Props {
  jobId: string;
  onEdit: () => void;
}

export default function JobActions({ jobId, onEdit }: Props) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirming(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // silently fail — user can retry
    } finally {
      setDeleting(false);
      setOpen(false);
      setConfirming(false);
    }
  }

  return (
    <div ref={ref} className={`relative inline-block ${open ? "z-50" : ""}`}>
      <button
        onClick={() => { setOpen(!open); setConfirming(false); }}
        className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
      >
        <EllipsisVertical size={16} strokeWidth={1.75} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 right-0 w-40 bg-surface-container-lowest rounded-xl shadow-lg shadow-black/10 border border-outline-variant/20 overflow-hidden animate-dropdown">
          <button
            onClick={() => { onEdit(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <SquarePen size={14} strokeWidth={1.75} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
              confirming
                ? "bg-error/10 text-error font-semibold"
                : "text-error hover:bg-error/5"
            } ${deleting ? "opacity-50" : ""}`}
          >
            <Trash2 size={14} />
            {confirming ? "Confirm Delete?" : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}
