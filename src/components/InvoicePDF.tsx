"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export interface InvoicePDFData {
  invoiceNumber: string;
  clientName: string;
  clientAddress?: string | null;
  issueDate: string;
  dueDate?: string | null;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  currency: string;
  status: string;
  fromName: string;
  fromCompany: string;
  items: { description: string; amount: number; hours?: number | null }[];
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const blue = "#0f4c81";
const lightBg = "#f5f7fa";

const s = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", fontSize: 10, color: "#1a1a1a" },
  // Header
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  title: { fontSize: 28, fontFamily: "Helvetica-Bold", color: blue, letterSpacing: -0.5 },
  invNum: { fontSize: 10, color: "#727780", marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "uppercase" as const },
  // Parties
  parties: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  partyBlock: { width: "45%" },
  partyLabel: { fontSize: 8, color: "#727780", textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 6 },
  partyName: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  partyDetail: { fontSize: 10, color: "#555" },
  // Dates
  dateRow: { flexDirection: "row", gap: 40, marginBottom: 24, padding: 12, backgroundColor: lightBg, borderRadius: 6 },
  dateLabel: { fontSize: 8, color: "#727780", textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 2 },
  dateValue: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  // Table
  tableHeader: { flexDirection: "row", backgroundColor: blue, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 4 },
  tableHeaderText: { color: "#fff", fontSize: 8, fontFamily: "Helvetica-Bold", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  tableRow: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  tableRowAlt: { backgroundColor: "#fafbfc" },
  descCol: { flex: 1 },
  hrsCol: { width: 70, textAlign: "right" },
  amtCol: { width: 90, textAlign: "right" },
  // Totals
  totals: { alignItems: "flex-end", marginTop: 20 },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", width: 240, paddingVertical: 4 },
  totalLabel: { flex: 1, textAlign: "right", paddingRight: 16, color: "#555" },
  totalValue: { width: 90, textAlign: "right" },
  grandTotal: { flexDirection: "row", justifyContent: "flex-end", width: 240, paddingVertical: 8, borderTopWidth: 2, borderTopColor: blue, marginTop: 4 },
  grandTotalLabel: { flex: 1, textAlign: "right", paddingRight: 16, fontSize: 12, fontFamily: "Helvetica-Bold", color: blue },
  grandTotalValue: { width: 90, textAlign: "right", fontSize: 12, fontFamily: "Helvetica-Bold", color: blue },
  // Footer
  footer: { position: "absolute", bottom: 40, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 12 },
  footerText: { fontSize: 8, color: "#999" },
});

const statusColors: Record<string, { bg: string; color: string }> = {
  paid: { bg: "#dcfce7", color: "#166534" },
  sent: { bg: "#dbeafe", color: "#1e40af" },
  overdue: { bg: "#fef2f2", color: "#991b1b" },
  draft: { bg: "#f3f4f6", color: "#6b7280" },
};

export default function InvoicePDF({ data }: { data: InvoicePDFData }) {
  const sc = statusColors[data.status] || statusColors.draft;
  const sym = data.currency === "IDR" ? "Rp " : "$";

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>INVOICE</Text>
            <Text style={s.invNum}>{data.invoiceNumber}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: sc.bg, color: sc.color, alignSelf: "flex-start" }]}>
            <Text>{data.status}</Text>
          </View>
        </View>

        {/* From / To */}
        <View style={s.parties}>
          <View style={s.partyBlock}>
            <Text style={s.partyLabel}>From</Text>
            <Text style={s.partyName}>{data.fromName}</Text>
            {data.fromCompany ? <Text style={s.partyDetail}>{data.fromCompany}</Text> : null}
          </View>
          <View style={s.partyBlock}>
            <Text style={s.partyLabel}>Bill To</Text>
            <Text style={s.partyName}>{data.clientName}</Text>
            {data.clientAddress ? <Text style={s.partyDetail}>{data.clientAddress}</Text> : null}
          </View>
        </View>

        {/* Dates */}
        <View style={s.dateRow}>
          <View>
            <Text style={s.dateLabel}>Issue Date</Text>
            <Text style={s.dateValue}>{fmtDate(data.issueDate)}</Text>
          </View>
          {data.dueDate && (
            <View>
              <Text style={s.dateLabel}>Due Date</Text>
              <Text style={s.dateValue}>{fmtDate(data.dueDate)}</Text>
            </View>
          )}
        </View>

        {/* Table */}
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, s.descCol]}>Description</Text>
          <Text style={[s.tableHeaderText, s.hrsCol]}>Hours</Text>
          <Text style={[s.tableHeaderText, s.amtCol]}>Amount</Text>
        </View>
        {data.items.map((item, i) => (
          <View key={i} style={[s.tableRow, ...(i % 2 !== 0 ? [s.tableRowAlt] : [])]}>
            <Text style={s.descCol}>{item.description}</Text>
            <Text style={s.hrsCol}>{item.hours ? String(item.hours) : "—"}</Text>
            <Text style={s.amtCol}>{sym}{fmt(item.amount)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={s.totals}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Subtotal</Text>
            <Text style={s.totalValue}>{sym}{fmt(data.subtotal)}</Text>
          </View>
          {data.taxRate > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Tax ({data.taxRate}%)</Text>
              <Text style={s.totalValue}>{sym}{fmt(data.taxAmount)}</Text>
            </View>
          )}
          {data.discount > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Discount</Text>
              <Text style={s.totalValue}>-{sym}{fmt(data.discount)}</Text>
            </View>
          )}
          <View style={s.grandTotal}>
            <Text style={s.grandTotalLabel}>Total Due</Text>
            <Text style={s.grandTotalValue}>{sym}{fmt(data.total)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>Generated by Freelanceku</Text>
          <Text style={s.footerText}>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
}
