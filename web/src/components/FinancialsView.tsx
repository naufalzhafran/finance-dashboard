"use client";

import { useEffect, useState } from "react";
import {
  FinancialsIncome,
  FinancialsBalance,
  FinancialsCashflow,
} from "@/lib/db";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FinancialsViewProps {
  symbol: string;
  currency?: string;
}

type FinancialsType = "income" | "balance" | "cashflow";
type PeriodType = "annual" | "quarterly";

const formatCurrency = (val: number | null, currency: string) => {
  if (val === null || val === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(val);
};

export default function FinancialsView({
  symbol,
  currency = "USD",
}: FinancialsViewProps) {
  const [type, setType] = useState<FinancialsType>("income");
  const [period, setPeriod] = useState<PeriodType>("annual");
  const [data, setData] = useState<
    (FinancialsIncome | FinancialsBalance | FinancialsCashflow)[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/financials/${encodeURIComponent(symbol)}?type=${type}&period=${period}`,
        );
        const json = await res.json();
        setData(json.data || []);
      } catch (error) {
        console.error("Error fetching financials:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [symbol, type, period]);

  const tabs: { id: FinancialsType; label: string }[] = [
    { id: "income", label: "Income Statement" },
    { id: "balance", label: "Balance Sheet" },
    { id: "cashflow", label: "Cash Flow" },
  ];

  /* Columns configuration for each statement type */
  const incomeColumns: {
    key: keyof FinancialsIncome;
    label: string;
    format?: boolean;
  }[] = [
    { key: "date", label: "Date", format: false },
    { key: "total_revenue", label: "Total Revenue", format: true },
    { key: "gross_profit", label: "Gross Profit", format: true },
    { key: "operating_income", label: "Operating Income", format: true },
    { key: "net_income", label: "Net Income", format: true },
    { key: "ebitda", label: "EBITDA", format: true },
    { key: "basic_eps", label: "EPS (Basic)", format: false },
  ];

  const balanceColumns: {
    key: keyof FinancialsBalance;
    label: string;
    format?: boolean;
  }[] = [
    { key: "date", label: "Date", format: false },
    { key: "total_assets", label: "Total Assets", format: true },
    {
      key: "total_liabilities_net_minority_interest",
      label: "Total Liabilities",
      format: true,
    },
    {
      key: "total_equity_gross_minority_interest",
      label: "Total Equity",
      format: true,
    },
    { key: "cash_and_cash_equivalents", label: "Cash & Eq.", format: true },
    { key: "total_debt", label: "Total Debt", format: true },
    { key: "working_capital", label: "Working Capital", format: true },
  ];

  const cashflowColumns: {
    key: keyof FinancialsCashflow;
    label: string;
    format?: boolean;
  }[] = [
    { key: "date", label: "Date", format: false },
    { key: "operating_cash_flow", label: "Operating CF", format: true },
    { key: "investing_cash_flow", label: "Investing CF", format: true },
    { key: "financing_cash_flow", label: "Financing CF", format: true },
    { key: "capital_expenditure", label: "CapEx", format: true },
    { key: "free_cash_flow", label: "Free Cash Flow", format: true },
  ];

  let columns: any[] = [];
  if (type === "income") columns = incomeColumns;
  else if (type === "balance") columns = balanceColumns;
  else if (type === "cashflow") columns = cashflowColumns;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex bg-muted/20 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setType(tab.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                type === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex bg-muted/20 p-1 rounded-xl">
          <button
            onClick={() => setPeriod("annual")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              period === "annual"
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Annual
          </button>
          <button
            onClick={() => setPeriod("quarterly")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              period === "quarterly"
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Quarterly
          </button>
        </div>
      </div>

      <Card className="overflow-hidden border-white/5 bg-background/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 text-muted-foreground border-b border-white/5">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key as string}
                    className="px-6 py-4 font-medium whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse opacity-50">
                    {columns.map((_col, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-muted/30 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No data available for this period.
                  </td>
                </tr>
              ) : (
                data.map((row: any, i) => (
                  <tr key={i} className="hover:bg-muted/5 transition-colors">
                    {columns.map((col) => (
                      <td
                        key={col.key as string}
                        className="px-6 py-4 whitespace-nowrap"
                      >
                        {col.key === "date"
                          ? new Date(row[col.key]).toLocaleDateString()
                          : col.format
                            ? formatCurrency(row[col.key], currency)
                            : (row[col.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center italic">
        * All values in {currency}. Data is provided for informational purposes
        only.
      </p>
    </div>
  );
}
