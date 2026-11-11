"use client";
import { RouteError } from "@/components/shared/route-error";

export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <main id="main" className="min-h-screen px-4"><RouteError {...props} /></main>;
}
