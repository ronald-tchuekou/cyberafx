"use client";
import { AdminFormDialog } from "@/components/shared/admin-form-dialog";
import { saveStrategy } from "../actions";
import { strategyFormSchema } from "../schemas";

type S = { id: string; name: string; asset: string; magic: number; description: string; avgMonthlyPct: string; winRatePct: string; profitFactor: string; maxDdPct: string; expectancyR: string; minCapital: number; prices: Record<"monthly" | "quarterly" | "yearly" | "lifetime", number>; isActive: boolean };

export function StrategyForm({ strategy: s }: { strategy?: S }) {
  return (
    <AdminFormDialog
      title={s ? "Modifier la stratégie" : "Nouvelle stratégie"} edit={!!s} schema={strategyFormSchema} action={saveStrategy}
      defaultValues={s ? { ...s, priceMonthly: s.prices.monthly, priceQuarterly: s.prices.quarterly, priceYearly: s.prices.yearly, priceLifetime: s.prices.lifetime } : { asset: "XAUUSD", isActive: true, description: "" }}
      fields={[
        { name: "name", label: "Nom" }, { name: "asset", label: "Actif" }, { name: "magic", label: "Magic #", kind: "number" }, { name: "minCapital", label: "Capital min ($)", kind: "number" },
        { name: "avgMonthlyPct", label: "Gain mensuel moyen (%)", kind: "number" }, { name: "winRatePct", label: "Win rate (%)", kind: "number" },
        { name: "profitFactor", label: "Profit factor", kind: "number" }, { name: "maxDdPct", label: "Max DD (%)", kind: "number" }, { name: "expectancyR", label: "Expectancy (R)", kind: "number" },
        { name: "priceMonthly", label: "Prix mensuel", kind: "number" }, { name: "priceQuarterly", label: "Prix trimestriel", kind: "number" },
        { name: "priceYearly", label: "Prix annuel", kind: "number" }, { name: "priceLifetime", label: "Prix à vie", kind: "number" },
        { name: "description", label: "Description", kind: "textarea" }, { name: "isActive", label: "Active", kind: "checkbox" },
      ]}
    />
  );
}
