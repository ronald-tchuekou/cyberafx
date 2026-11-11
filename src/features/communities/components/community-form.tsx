"use client";
import { AdminFormDialog } from "@/components/shared/admin-form-dialog";
import { saveCommunity } from "../actions";
import { communityFormSchema } from "../schemas";

type C = { id: string; name: string; description: string; type: string; monthlyPriceUsd: string | null };

export function CommunityForm({ community }: { community?: C }) {
  return (
    <AdminFormDialog
      title={community ? "Modifier la communauté" : "Nouvelle communauté"} edit={!!community} schema={communityFormSchema} action={saveCommunity}
      defaultValues={community ? { ...community, monthlyPriceUsd: community.monthlyPriceUsd ?? "" } : { type: "public", description: "", monthlyPriceUsd: "" }}
      fields={[
        { name: "name", label: "Nom" }, { name: "type", label: "Type", kind: "select", options: ["public", "private"] },
        { name: "monthlyPriceUsd", label: "Prix mensuel ($)", kind: "number", hint: "Privé uniquement" }, { name: "description", label: "Description", kind: "textarea" },
      ]}
    />
  );
}
