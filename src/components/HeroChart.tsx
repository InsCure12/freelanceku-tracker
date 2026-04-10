"use client";

import { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const values = [8.19, 3.5, 5.88, 5.88, 8.77, 6.2];

export default function HeroChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const data = {
    labels,
    datasets: [
      {
        data: visible ? values : values.map(() => 0),
        backgroundColor: "rgba(0, 53, 95, 0.80)",
        borderRadius: 6,
        borderSkipped: false as const,
        barPercentage: 0.7,
        categoryPercentage: 0.65,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
      easing: "easeOutQuart",
      delay(ctx) {
        return ctx.dataIndex * 120;
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: "#00355f",
        titleFont: { family: "Inter", size: 11 },
        bodyFont: { family: "Inter", size: 12, weight: "bold" },
        padding: 8,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (ctx) => `$${(ctx.parsed.y ?? 0).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "#727780",
          font: { family: "Inter", size: 10 },
        },
      },
      y: {
        display: false,
        beginAtZero: true,
        max: 12,
      },
    },
  };

  return (
    <div ref={containerRef} className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-secondary">Online Invoicing</p>
          <p className="text-sm font-medium text-primary mt-0.5">Tax Planning Unit</p>
        </div>
        <div className="text-secondary text-lg">≡</div>
      </div>
      <div className="space-y-1.5 text-xs text-secondary">
        <p>Expense Invoices</p>
        <p>Google Invoiced</p>
        <p>Automated Drafted</p>
      </div>
      <div className="h-40">
        <Bar data={data} options={options} />
      </div>
      <div className="flex gap-2 pt-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-full h-1.5 bg-surface-container rounded-full" />
        ))}
      </div>
    </div>
  );
}
