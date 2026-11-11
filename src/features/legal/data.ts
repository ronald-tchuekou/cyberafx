/**
 * Pages légales (modèles). À faire relire par un juriste avant mise en production :
 * l'entité exploitante, la juridiction et les contacts sont à compléter.
 */
export type LegalPage = {
  slug: "risk-disclosure" | "terms" | "privacy";
  title: string;
  description: string;
  updated: string; // ISO
  sections: readonly (readonly [heading: string, body: string])[];
};

export const LEGAL_PAGES: readonly LegalPage[] = [
  {
    slug: "risk-disclosure",
    title: "Risk Disclosure",
    description: "Trading leveraged products carries a high level of risk. Read the CyberAFX risk disclosure before using our signals.",
    updated: "2026-11-11",
    sections: [
      ["High risk of loss", "Trading foreign exchange, indices, commodities, CFDs and cryptocurrencies on margin carries a high level of risk and may not be suitable for every investor. You can lose more than your initial deposit."],
      ["No investment advice", "CyberAFX publishes educational content and trading ideas. Nothing on this website or in our channels is personalised investment advice, a recommendation or an offer to buy or sell any instrument. You are solely responsible for your trading decisions."],
      ["Past performance", "Past results, verified or not, are not a reliable indicator of future performance. Statistics shown on this website may be simulated or illustrative and must not be relied upon as a guarantee."],
      ["Copy trading and pooled accounts", "Automated copy trading and pooled capital depend on third-party brokers, platforms and market liquidity. Slippage, execution delays and technical failures can cause results that differ from the strategy provider's."],
      ["Only risk what you can afford to lose", "Never trade with money you cannot afford to lose. Seek independent financial advice if you have any doubt about your situation."],
    ],
  },
  {
    slug: "terms",
    title: "Terms of Service",
    description: "The terms that govern your use of the CyberAFX website, memberships, mentorship programs and community channels.",
    updated: "2026-11-11",
    sections: [
      ["Acceptance", "By creating an account or purchasing a membership you agree to these terms. If you do not agree, do not use the service."],
      ["Eligibility", "You must be at least 18 years old and legally allowed to trade financial products in your jurisdiction."],
      ["Memberships and payments", "Memberships are paid in USDT and activated after an operator verifies the transaction. Payments are generally non-refundable once access is activated, unless required by law."],
      ["Acceptable use", "You may not resell, share or publicly redistribute signals, private channel content or credentials. Accounts abusing the service can be suspended without refund."],
      ["Service availability", "We aim for continuous availability but do not guarantee uninterrupted service. Signals may be delayed, modified or cancelled."],
      ["Limitation of liability", "To the maximum extent permitted by law, CyberAFX is not liable for trading losses or indirect damages arising from the use of the service."],
      ["Changes", "We may update these terms. Continued use after an update constitutes acceptance."],
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    description: "How CyberAFX collects, uses and protects your personal data.",
    updated: "2026-11-11",
    sections: [
      ["Data we collect", "Account data (name, email, username) provided through our authentication provider, subscription and payment references (transaction hashes), messages you send to support and communities, and technical data needed to operate and secure the service."],
      ["How we use it", "To create your account, activate memberships, deliver signals and notifications, provide support, prevent fraud and abuse, and improve the service."],
      ["Processors", "We rely on trusted providers for authentication, database hosting and infrastructure. They process data on our behalf under contractual safeguards."],
      ["Retention", "We keep your data while your account is active and as long as needed for legal, accounting and security purposes."],
      ["Your rights", "Depending on your location, you may request access, correction, export or deletion of your personal data. Contact us through the support channel to exercise these rights."],
      ["Security", "We use encryption in transit, access controls and rate limiting. No system is perfectly secure; report any suspected vulnerability to our support team."],
    ],
  },
];

export const getLegalPage = (slug: string) => LEGAL_PAGES.find((p) => p.slug === slug);
