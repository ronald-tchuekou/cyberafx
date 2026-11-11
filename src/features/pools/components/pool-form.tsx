"use client";
import { AdminFormDialog } from "@/components/shared/admin-form-dialog";
import { savePool } from "../actions";
import { poolFormSchema } from "../schemas";

type P = { id: string; name: string; description: string; targetUsd: string; minPledgeUsd: string; profitSharePct: string; brokerServer: string; brokerLogin: string; investorPassword: string; status: string };

export function PoolForm({ pool }: { pool?: P }) {
  return (
    <AdminFormDialog
      title={pool ? "Modifier le pool" : "Nouveau pool"} edit={!!pool} schema={poolFormSchema} action={savePool}
      defaultValues={pool ?? { status: "open", description: "", profitSharePct: 70 }}
      fields={[
        { name: "name", label: "Nom" }, { name: "status", label: "Statut", kind: "select", options: ["open", "closed"] },
        { name: "targetUsd", label: "Objectif ($)", kind: "number" }, { name: "minPledgeUsd", label: "Engagement min ($)", kind: "number" },
        { name: "profitSharePct", label: "Part de profit investisseur (%)", kind: "number" }, { name: "brokerServer", label: "Serveur broker" },
        { name: "brokerLogin", label: "Login broker" }, { name: "investorPassword", label: "Mot de passe investisseur", hint: "Révélé aux investisseurs approuvés uniquement" },
        { name: "description", label: "Description", kind: "textarea" },
      ]}
    />
  );
}
