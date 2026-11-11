"use client";
import { AdminFormDialog } from "@/components/shared/admin-form-dialog";
import { saveSignal } from "../actions";
import { signalFormSchema } from "../schemas";

type S = { id: string; symbol: string; side: string; entry: string; takeProfit: string; stopLoss: string; status: string; pips: string | null; setup: string | null; note: string | null; imageUrl: string | null; isFree: boolean; isFeatured: boolean };

export function SignalForm({ signal }: { signal?: S }) {
  return (
    <AdminFormDialog
      title={signal ? "Modifier le signal" : "Nouveau signal"} edit={!!signal} schema={signalFormSchema} action={saveSignal}
      defaultValues={signal ? { ...signal, pips: signal.pips ?? "", setup: signal.setup ?? "", note: signal.note ?? "", imageUrl: signal.imageUrl ?? "" } : { symbol: "XAUUSD", side: "BUY", status: "active", isFree: false, isFeatured: false, pips: "", setup: "", note: "", imageUrl: "" }}
      fields={[
        { name: "symbol", label: "Symbole" }, { name: "side", label: "Sens", kind: "select", options: ["BUY", "SELL"] },
        { name: "entry", label: "Entry", kind: "number" }, { name: "takeProfit", label: "Take profit", kind: "number" }, { name: "stopLoss", label: "Stop loss", kind: "number" },
        { name: "status", label: "Statut", kind: "select", options: ["active", "tp_hit", "sl_hit", "closed"] },
        { name: "pips", label: "Résultat (pips)", kind: "number", hint: "Une fois résolu" }, { name: "setup", label: "Setup", hint: "ex. SMC Professional" },
        { name: "note", label: "Commentaire", kind: "textarea" }, { name: "imageUrl", label: "URL image du graphique", wide: true },
        { name: "isFree", label: "Visible sur la landing (canal gratuit)", kind: "checkbox" }, { name: "isFeatured", label: "📌 Mis en avant", kind: "checkbox" },
      ]}
    />
  );
}
