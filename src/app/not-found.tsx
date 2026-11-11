import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-mono text-sm text-brand">404</p>
      <h1 className="text-3xl font-extrabold tracking-tight">Page not found</h1>
      <p className="text-sm text-muted-foreground">The page you are looking for doesn&apos;t exist or has been moved.</p>
      <Link href="/" className={buttonVariants()}>Back to CyberAFX</Link>
    </main>
  );
}
