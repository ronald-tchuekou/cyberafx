"use client";

/** Dernier filet : remplace le layout racine, donc <html>/<body> sont requis. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#0b1020", color: "#f5f7ff", fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <main role="alert" style={{ textAlign: "center", padding: 24 }}>
          <h1>Something went wrong</h1>
          <p>Please try again in a moment.</p>
          {error.digest && <p style={{ fontFamily: "monospace", fontSize: 12 }}>Reference: {error.digest}</p>}
          <button onClick={reset} style={{ marginTop: 16, padding: "8px 16px", borderRadius: 8, border: 0, background: "#a3e635", color: "#1a2e05", fontWeight: 700, cursor: "pointer" }}>Try again</button>
        </main>
      </body>
    </html>
  );
}
