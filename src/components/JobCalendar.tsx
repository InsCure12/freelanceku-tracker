"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarJob {
  id: string;
  date: string;
  deadline?: string | null;
  clientName: string;
  projectName: string | null;
  status: string;
  paymentStatus: string;
  amount: number;
  currency: string;
}

interface JobCalendarProps {
  jobs: CalendarJob[];
  formatAmount?: (amount: number, currency: string) => string;
}

const STATUS_DOT: Record<string, string> = {
  done: "bg-primary",
  ongoing: "bg-tertiary",
  booked: "bg-[#ea580c]",
  pending: "bg-outline/50",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function JobCalendar({ jobs, formatAmount }: JobCalendarProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const jobsByDate = useMemo(() => {
    const map: Record<string, CalendarJob[]> = {};
    for (const j of jobs) {
      (map[j.date] ??= []).push(j);
    }
    return map;
  }, [jobs]);

  // Build a map of deadlines falling on each date (exclude done jobs)
  const deadlinesByDate = useMemo(() => {
    const map: Record<string, CalendarJob[]> = {};
    for (const j of jobs) {
      if (j.deadline && j.status !== "done") {
        (map[j.deadline] ??= []).push(j);
      }
    }
    return map;
  }, [jobs]);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const toDateStr = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
    setSelectedDate(null);
  };

  const next = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setSelectedDate(null);
  };

  const selectedJobs = selectedDate ? jobsByDate[selectedDate] || [] : [];

  const fmt = (amount: number, currency: string) =>
    formatAmount
      ? formatAmount(amount, currency)
      : currency === "IDR"
        ? `Rp ${new Intl.NumberFormat("id-ID").format(Math.round(amount))}`
        : `$${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">
          Job Calendar
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-on-surface min-w-[140px] text-center">
            {monthLabel}
          </span>
          <button
            onClick={next}
            className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] uppercase tracking-wider text-outline font-semibold py-2"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 relative" ref={calendarRef}>
        {weeks.flat().map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="h-12 lg:h-14" />;
          }
          const dateStr = toDateStr(day);
          const dayJobs = jobsByDate[dateStr] || [];
          const dayDeadlines = deadlinesByDate[dateStr] || [];
          const hasContent = dayJobs.length > 0 || dayDeadlines.length > 0;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              onMouseEnter={(e) => {
                if (!hasContent) return;
                setHoveredDate(dateStr);
                const rect = e.currentTarget.getBoundingClientRect();
                const calRect = calendarRef.current?.getBoundingClientRect();
                if (calRect) {
                  setTooltipPos({
                    x: rect.left - calRect.left + rect.width / 2,
                    y: rect.top - calRect.top,
                  });
                }
              }}
              onMouseLeave={() => {
                setHoveredDate(null);
                setTooltipPos(null);
              }}
              className={`h-12 lg:h-14 flex flex-col items-center justify-center gap-1 rounded-xl transition-colors relative ${
                isSelected
                  ? "bg-primary text-on-primary"
                  : isToday
                    ? "bg-primary-fixed text-on-primary-fixed"
                    : "hover:bg-surface-container-high text-on-surface"
              }`}
            >
              <span className={`text-sm ${hasContent ? "font-bold" : ""}`}>
                {day}
              </span>
              {(dayJobs.length > 0 || dayDeadlines.length > 0) && (
                <div className="flex gap-0.5 items-center">
                  {dayJobs.slice(0, 3).map((j, idx) => (
                    <span
                      key={`job-${idx}`}
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? "bg-on-primary/70" : STATUS_DOT[j.status] || STATUS_DOT.pending
                      }`}
                    />
                  ))}
                  {dayDeadlines.length > 0 && dayJobs.length === 0 && (
                    <span
                      className={`w-1.5 h-1.5 rounded-sm ${
                        isSelected ? "bg-on-primary/70" : "bg-error"
                      }`}
                    />
                  )}
                  {dayJobs.length > 3 && (
                    <span className={`text-[8px] leading-none ${isSelected ? "text-on-primary/70" : "text-outline"}`}>
                      +{dayJobs.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}

        {/* Floating hover tooltip */}
        {hoveredDate && tooltipPos && (() => {
          const hoverJobs = jobsByDate[hoveredDate] || [];
          const hoverDeadlines = deadlinesByDate[hoveredDate] || [];
          if (hoverJobs.length === 0 && hoverDeadlines.length === 0) return null;

          return (
            <div
              className="absolute z-50 pointer-events-none animate-in fade-in duration-150"
              style={{
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`,
                transform: "translate(-50%, -100%) translateY(-8px)",
              }}
            >
              <div className="bg-surface-container-highest rounded-xl shadow-lg shadow-black/15 border border-outline/10 px-3.5 py-3 min-w-[200px] max-w-[280px]">
                <p className="text-[10px] text-outline uppercase tracking-wider font-semibold mb-2">
                  {new Date(hoveredDate + "T00:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>

                {/* Jobs on this date */}
                {hoverJobs.length > 0 && (
                  <div className="space-y-1.5">
                    {hoverJobs.slice(0, 4).map((j) => (
                      <div key={j.id} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[j.status] || STATUS_DOT.pending}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-on-surface truncate">{j.clientName}</p>
                          {j.projectName && (
                            <p className="text-[10px] text-outline truncate">{j.projectName}</p>
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-on-surface-variant shrink-0">
                          {fmt(j.amount, j.currency)}
                        </span>
                      </div>
                    ))}
                    {hoverJobs.length > 4 && (
                      <p className="text-[10px] text-outline">+{hoverJobs.length - 4} more</p>
                    )}
                  </div>
                )}

                {/* Deadlines on this date */}
                {hoverDeadlines.length > 0 && (
                  <>
                    {hoverJobs.length > 0 && <div className="my-2 border-t border-outline/10" />}
                    <p className="text-[10px] text-error font-semibold uppercase tracking-wider mb-1.5">
                      🔴 Deadline{hoverDeadlines.length > 1 ? "s" : ""}
                    </p>
                    <div className="space-y-1.5">
                      {hoverDeadlines.slice(0, 3).map((j) => (
                        <div key={`dl-${j.id}`} className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-sm bg-error shrink-0" />
                          <p className="text-xs font-medium text-on-surface truncate flex-1">{j.clientName}</p>
                          <span className={`text-[10px] font-semibold capitalize ${j.status === "done" ? "text-primary" : "text-outline"}`}>
                            {j.status}
                          </span>
                        </div>
                      ))}
                      {hoverDeadlines.length > 3 && (
                        <p className="text-[10px] text-outline">+{hoverDeadlines.length - 3} more</p>
                      )}
                    </div>
                  </>
                )}
              </div>
              {/* Tooltip arrow */}
              <div className="flex justify-center">
                <div className="w-2.5 h-2.5 bg-surface-container-highest rotate-45 -mt-1.5 border-r border-b border-outline/10" />
              </div>
            </div>
          );
        })()}
      </div>

      {/* Selected day detail */}
      {selectedDate && (() => {
        const selDeadlines = deadlinesByDate[selectedDate] || [];
        return (
        <div className="mt-4 pt-4 border-t border-outline/10">
          <p className="text-xs text-outline uppercase tracking-wider mb-3">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {selectedJobs.length > 0 && (
              <span className="ml-2 text-primary font-semibold">
                {selectedJobs.length} job{selectedJobs.length !== 1 ? "s" : ""}
              </span>
            )}
            {selDeadlines.length > 0 && (
              <span className="ml-2 text-error font-semibold">
                {selDeadlines.length} deadline{selDeadlines.length !== 1 ? "s" : ""}
              </span>
            )}
          </p>
          {selectedJobs.length === 0 && selDeadlines.length === 0 ? (
            <p className="text-sm text-outline">No jobs on this date.</p>
          ) : (
            <div className="space-y-2">
              {selectedJobs.map((j) => (
                <div
                  key={j.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[j.status] || STATUS_DOT.pending}`}
                    />
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        {j.clientName}
                      </p>
                      {j.projectName && (
                        <p className="text-xs text-outline">{j.projectName}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-on-surface">
                      {fmt(j.amount, j.currency)}
                    </p>
                    <span
                      className={`text-[10px] font-semibold uppercase ${
                        j.paymentStatus === "paid"
                          ? "text-[#065f46]"
                          : "text-[#991b1b]"
                      }`}
                    >
                      {j.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}

              {/* Deadlines on selected date */}
              {selDeadlines.length > 0 && (
                <>
                  {selectedJobs.length > 0 && <div className="my-2 border-t border-outline/10" />}
                  <p className="text-[10px] text-error font-semibold uppercase tracking-wider mb-2">
                    🔴 Deadline{selDeadlines.length > 1 ? "s" : ""} due
                  </p>
                  {selDeadlines.map((j) => (
                    <div
                      key={`dl-${j.id}`}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-error-container/30 hover:bg-error-container/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-sm bg-error" />
                        <div>
                          <p className="text-sm font-semibold text-on-surface">{j.clientName}</p>
                          {j.projectName && (
                            <p className="text-xs text-outline">{j.projectName}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-on-surface">
                          {fmt(j.amount, j.currency)}
                        </p>
                        <span className={`text-[10px] font-semibold capitalize ${j.status === "done" ? "text-primary" : "text-outline"}`}>
                          {j.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
        );
      })()}
    </div>
  );
}
