"use client";
import { AdminFormDialog } from "@/components/shared/admin-form-dialog";
import { sendBroadcast } from "../actions";
import { broadcastSchema } from "../schemas";

export function BroadcastForm() {
  return <AdminFormDialog title="Notifier tous les utilisateurs" schema={broadcastSchema} action={sendBroadcast} defaultValues={{ title: "", body: "" }}
    fields={[{ name: "title", label: "Titre", wide: true }, { name: "body", label: "Message", kind: "textarea" }]} />;
}
