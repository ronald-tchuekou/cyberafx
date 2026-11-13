"use client";
import { MessageSquare, Search, UserCog } from "lucide-react";
import { useState } from "react";
import { ActionButton } from "@/components/shared/action-button";
import { EmptyState } from "@/components/shared/page-header";
import { Field } from "@/components/shared/field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendCommunityMessage } from "@/features/chat/actions";
import { ChatPanel } from "@/features/chat/components/chat-panel";
import { PaymentDialog } from "@/features/payments/components/payment-dialog";
import { useActionForm } from "@/hooks/use-action-form";
import { usd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { joinPublicCommunity, requestPrivateAccess, updateUsername } from "../actions";
import { usernameSchema } from "../schemas";

type Row = { community: { id: string; name: string; description: string; type: "public" | "private"; monthlyPriceUsd: string | null }; status: string | null };
type Tab = "mine" | "discover" | "profile";

/** Champ avec préfixe « @ » : transmet id / aria-* (injectés par Field) à l'<input>, pas au conteneur. */
function HandleInput(props: React.ComponentProps<typeof Input>) {
  return <div className="relative"><span aria-hidden="true" className="absolute left-2.5 top-1.5 text-sm text-muted-foreground">@</span><Input className="pl-6" {...props} /></div>;
}

function ProfileForm({ username }: { username: string }) {
  const { form, onSubmit, pending } = useActionForm(usernameSchema, updateUsername, { defaultValues: { username }, keepValues: true });
  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-xl border bg-card p-5">
      <div><h3 className="font-bold">Chat Profile Settings</h3><p className="text-xs text-muted-foreground">Manage your handle identity for in-app communities</p></div>
      <Field label="Unique username" error={form.formState.errors.username?.message as string} hint="Your handle identifier across chats (e.g. @trader_gold)">
        <HandleInput autoComplete="off" {...form.register("username")} />
      </Field>
      <Button type="submit" disabled={pending}>Save Profile Settings</Button>
    </form>
  );
}

export function CommunitiesView({ rows, username }: { rows: Row[]; username: string }) {
  const [tab, setTab] = useState<Tab>("mine");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [payFor, setPayFor] = useState<Row["community"] | null>(null);
  const match = (r: Row) => r.community.name.toLowerCase().includes(q.toLowerCase());
  const mine = rows.filter((r) => r.status === "active" && match(r));
  const discover = rows.filter(match);
  const current = rows.find((r) => r.community.id === openId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {tab !== "profile" ? (
          <div className="relative w-full max-w-xs"><Search className="absolute left-2.5 top-2 size-4 text-muted-foreground" /><Input aria-label="Search communities by name" className="pl-8" placeholder="Search communities by name..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
        ) : <span />}
        <div className="flex rounded-lg border bg-card p-0.5 text-xs font-semibold">
          {([["mine", "My Channels"], ["discover", "Discover"], ["profile", "Profile Settings"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={cn("rounded-md px-3 py-1.5", tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{k === "profile" && <UserCog className="mr-1 inline size-3" />}{l}</button>
          ))}
        </div>
      </div>

      {tab === "mine" && (mine.length === 0 ? (
        <EmptyState icon={<MessageSquare />} title="No Active Memberships" description="Explore our list of public networks or purchase premium access plans." action={<Button size="sm" onClick={() => setTab("discover")}>Discover Communities</Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-[14rem_1fr]">
          <ul className="space-y-1">{mine.map((r) => (
            <li key={r.community.id}><button onClick={() => setOpenId(r.community.id)} className={cn("w-full rounded-lg border px-3 py-2 text-left text-sm font-semibold hover:bg-muted", openId === r.community.id && "border-primary bg-primary/10")}>💬 {r.community.name}</button></li>
          ))}</ul>
          <div className="flex h-[30rem] flex-col overflow-hidden rounded-xl border bg-card">
            {current ? (
              <>
                <div className="border-b px-4 py-2 text-sm font-bold">{current.community.name} <Badge variant="outline" className="ml-1 text-[11px]">{current.community.type.toUpperCase()}</Badge></div>
                <ChatPanel key={current.community.id} url={`/api/chat/community/${current.community.id}`} send={(v) => sendCommunityMessage({ ...v, communityId: current.community.id })} empty={<p className="py-8 text-center text-xs text-muted-foreground">Soyez le premier à écrire !</p>} />
              </>
            ) : <p className="m-auto text-sm text-muted-foreground">Sélectionnez un canal.</p>}
          </div>
        </div>
      ))}

      {tab === "discover" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {discover.map(({ community: c, status }) => (
            <div key={c.id} className="flex flex-col rounded-xl border bg-card p-4">
              <span className="text-2xl">💬</span>
              <Badge variant="outline" className="mt-2 w-fit text-[11px]">{c.type.toUpperCase()}</Badge>
              <h3 className="mt-1 font-bold">{c.name}</h3>
              <p className="flex-1 text-xs text-muted-foreground">{c.description || "No description provided."}</p>
              {c.type === "private" && c.monthlyPriceUsd && <p className="mt-2 text-xs font-semibold">Monthly: {usd(c.monthlyPriceUsd)}</p>}
              {status === "active" ? <Button className="mt-3" variant="secondary" onClick={() => { setOpenId(c.id); setTab("mine"); }}>Open chat</Button>
                : status === "pending" ? <Button className="mt-3" variant="secondary" disabled>Pending approval</Button>
                : c.type === "public" ? <div className="mt-3"><ActionButton action={joinPublicCommunity} args={{ communityId: c.id }} variant="default">Join Free Community</ActionButton></div>
                : <Button className="mt-3" onClick={() => setPayFor(c)}>Unlock Community</Button>}
            </div>
          ))}
        </div>
      )}
      {tab === "profile" && <ProfileForm username={username} />}
      {payFor && (
        <PaymentDialog open onOpenChange={(o) => !o && setPayFor(null)} title={`Unlock ${payFor.name}`} amountUsd={Number(payFor.monthlyPriceUsd ?? 0)}
          submit={({ txHash }) => requestPrivateAccess({ communityId: payFor.id, txHash })} />
      )}
    </div>
  );
}
