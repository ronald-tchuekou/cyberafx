import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db, users } from "@/db";
import { requireAdmin } from "@/features/auth/server/current-user";
import { setUserRole } from "@/features/users/actions";
import { dateFr } from "@/lib/format";

export const metadata: Metadata = { title: "Users" };

export default async function UsersAdmin() {
  const me = await requireAdmin();
  const rows = await db.select().from(users).orderBy(desc(users.createdAt));
  return (
    <>
      <PageHeader title="Users" description="Deux rôles : admin et user." />
      <Table>
        <TableHeader><TableRow>{["Nom", "Email", "Pseudo", "Rôle", "Inscrit", ""].map((h) => <TableHead key={h}>{h || <span className="sr-only">Actions</span>}</TableHead>)}</TableRow></TableHeader>
        <TableBody>{rows.map((u) => (
          <TableRow key={u.id}><TableCell className="font-medium">{u.name}</TableCell><TableCell>{u.email}</TableCell><TableCell>@{u.username}</TableCell>
            <TableCell><StatusBadge status={u.role === "admin" ? "active" : "closed"} /> <span className="text-xs">{u.role}</span></TableCell><TableCell className="text-xs">{dateFr(u.createdAt)}</TableCell>
            <TableCell className="text-right">{u.id !== me.id && <ActionButton action={setUserRole} args={{ userId: u.id, role: u.role === "admin" ? "user" : "admin" }} confirm={`Passer ${u.email} en ${u.role === "admin" ? "user" : "admin"} ?`}>{u.role === "admin" ? "Rétrograder" : "Promouvoir admin"}</ActionButton>}</TableCell></TableRow>
        ))}</TableBody>
      </Table>
    </>
  );
}
