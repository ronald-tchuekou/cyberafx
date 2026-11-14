import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtected = createRouteMatcher(["/client(.*)", "/operator(.*)"]);
const isDev = process.env.NODE_ENV === "development";

// Vérification optimiste : l'autorisation par rôle est refaite côté serveur (voir features/auth/server).
export default clerkMiddleware(
  async (auth, req) => {
    if (isProtected(req)) await auth.protect({ unauthenticatedUrl: new URL("/auth", req.url).toString() });
  },
  {
    // CSP stricte avec nonce par requête (pages dynamiques) ; Clerk ajoute ses propres domaines.
    contentSecurityPolicy: {
      strict: true,
      directives: {
        "default-src": ["'self'"],
        // 'unsafe-eval' uniquement en développement (reconstruction des stacks par React).
        "script-src": isDev ? ["'unsafe-eval'"] : [],
        // Tailwind/Base UI/lightweight-charts posent des styles inline : autorisés pour les attributs et éléments <style>.
        "style-src": ["'unsafe-inline'"],
        "img-src": ["'self'", "data:", "blob:", "https:"],
        "font-src": ["'self'", "data:"],
        "connect-src": isDev ? ["'self'", "ws:", "wss:"] : ["'self'"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"],
        "frame-ancestors": ["'none'"],
        "upgrade-insecure-requests": isDev ? [] : [""],
      },
    },
  },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|txt|xml)).*)",
    "/(api|trpc)(.*)",
  ],
};
