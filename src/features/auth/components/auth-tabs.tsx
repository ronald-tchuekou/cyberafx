"use client";
import { SignIn, SignUp } from "@clerk/nextjs";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Onglets Sign In / Register de la plateforme d'origine, portés par les composants Clerk. */
export function AuthTabs({ redirectUrl }: { redirectUrl: string }) {
  const [tab, setTab] = useState<"in" | "up">("in");
  const common = { routing: "hash" as const, forceRedirectUrl: redirectUrl, appearance: { elements: { rootBox: "w-full", cardBox: "w-full shadow-none", card: "bg-transparent shadow-none border-0 p-0", footer: "hidden" } } };
  return (
    <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl">
      <h1 className="text-center text-2xl font-bold">Cyber<span className="text-link">AFX</span></h1>
      <p className="mb-5 mt-1 text-center text-xs text-muted-foreground">Professional Trading Signals &amp; Premium Mentorship</p>
      <div className="mb-5 grid grid-cols-2 rounded-lg bg-muted p-1 text-sm font-semibold">
        {([["in", "Sign In"], ["up", "Register"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={cn("rounded-md py-1.5", tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{l}</button>
        ))}
      </div>
      {tab === "in" ? <SignIn {...common} signUpUrl="/auth" /> : <SignUp {...common} signInUrl="/auth" />}
    </div>
  );
}
