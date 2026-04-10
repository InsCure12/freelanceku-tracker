"use client";

interface Props {
  currency: "IDR" | "USD";
  onChange: (c: "IDR" | "USD") => void;
}

export default function CurrencyToggle({ currency, onChange }: Props) {
  return (
    <div className="flex rounded-xl overflow-hidden bg-surface-container-high relative">
      <button
        onClick={() => onChange("IDR")}
        className={`px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
          currency === "IDR" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container-highest"
        }`}
      >
        IDR
      </button>
      <button
        onClick={() => onChange("USD")}
        className={`px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
          currency === "USD" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container-highest"
        }`}
      >
        USD
      </button>
    </div>
  );
}
