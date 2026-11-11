"use client";
import { AdminFormDialog } from "@/components/shared/admin-form-dialog";
import { savePackage } from "../actions";
import { packageFormSchema } from "../schemas";

type P = { id: string; slug: string; kind: string; name: string; description: string; priceUsd: string; durationMonths: number; scansPerDay: number | null; features: string[]; isActive: boolean; sortOrder: number };

export function PackageForm({ pkg }: { pkg?: P }) {
  return (
    <AdminFormDialog
      title={pkg ? "Modifier l'offre" : "Nouvelle offre"} edit={!!pkg} schema={packageFormSchema} action={savePackage}
      defaultValues={pkg ? { ...pkg, scansPerDay: pkg.scansPerDay ?? "", features: pkg.features.join("\n") } : { kind: "signal", durationMonths: 1, isActive: true, sortOrder: 0, features: "", description: "", scansPerDay: "" }}
      fields={[
        { name: "name", label: "Nom" }, { name: "slug", label: "Slug", hint: "Utilisé par /auth?pkg=" },
        { name: "kind", label: "Type", kind: "select", options: ["signal", "mentorship"] }, { name: "priceUsd", label: "Prix (USD)", kind: "number" },
        { name: "durationMonths", label: "Durée (mois)", kind: "number", hint: "12000 = à vie" }, { name: "scansPerDay", label: "Scans IA / jour", kind: "number", hint: "Vide = illimité" },
        { name: "sortOrder", label: "Ordre", kind: "number" }, { name: "isActive", label: "Active", kind: "checkbox" },
        { name: "description", label: "Description", kind: "textarea" }, { name: "features", label: "Avantages (un par ligne)", kind: "textarea" },
      ]}
    />
  );
}
