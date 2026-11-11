import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ActionButton } from "@/components/shared/action-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deletePackage } from "@/features/packages/actions";
import { PackageForm } from "@/features/packages/components/package-form";
import { listAllPackages } from "@/features/packages/queries";
import { durationLabel, usd } from "@/lib/format";

export const metadata: Metadata = { title: "Packages" };

export default async function PackagesAdmin() {
  const rows = await listAllPackages();
  return (
    <>
      <PageHeader title="Packages" description="Offres signaux et mentorat affichées sur la landing et dans le portail." actions={<PackageForm />} />
      <Table>
        <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Type</TableHead><TableHead>Prix</TableHead><TableHead>Durée</TableHead><TableHead>Scans/j</TableHead><TableHead>Statut</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>
          {rows.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.name}<span className="block font-mono text-[11px] text-muted-foreground">{p.slug}</span></TableCell>
              <TableCell>{p.kind}</TableCell><TableCell>{usd(p.priceUsd)}</TableCell><TableCell>{durationLabel(p.durationMonths)}</TableCell>
              <TableCell>{p.scansPerDay ?? "∞"}</TableCell><TableCell><StatusBadge status={p.isActive ? "active" : "closed"} /></TableCell>
              <TableCell className="flex justify-end gap-1"><PackageForm pkg={p} />{p.isActive && <ActionButton action={deletePackage} args={{ id: p.id }} variant="ghost" confirm="Archiver cette offre ?">Archiver</ActionButton>}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
