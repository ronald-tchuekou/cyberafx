import {
  boolean, date, index, integer, jsonb, numeric, pgEnum, pgTable, primaryKey,
  text, timestamp, uuid, uniqueIndex,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const roleEnum = pgEnum("role", ["admin", "user"]);
export const packageKindEnum = pgEnum("package_kind", ["signal", "mentorship"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "active", "rejected", "expired"]);
export const sideEnum = pgEnum("side", ["BUY", "SELL"]);
export const signalStatusEnum = pgEnum("signal_status", ["active", "tp_hit", "sl_hit", "closed"]);
export const communityTypeEnum = pgEnum("community_type", ["public", "private"]);
export const poolStatusEnum = pgEnum("pool_status", ["open", "closed"]);
export const strategyPlanEnum = pgEnum("strategy_plan", ["monthly", "quarterly", "yearly", "lifetime"]);

/** Clé primaire = id Clerk. Le rôle (admin | user) vit ici. */
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull().default(""),
  username: text("username").unique(),
  role: roleEnum("role").notNull().default("user"),
  telegram: text("telegram"),
  createdAt: createdAt(),
});

export const packages = pgTable("packages", {
  id: id(),
  slug: text("slug").notNull().unique(), // utilisé par /auth?pkg=<slug>
  kind: packageKindEnum("kind").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  priceUsd: numeric("price_usd", { precision: 10, scale: 2 }).notNull(),
  durationMonths: integer("duration_months").notNull(), // 12000 = lifetime
  scansPerDay: integer("scans_per_day"), // null = illimité
  features: jsonb("features").$type<string[]>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
});

export const subscriptions = pgTable("subscriptions", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  packageId: uuid("package_id").notNull().references(() => packages.id),
  status: paymentStatusEnum("status").notNull().default("pending"),
  txHash: text("tx_hash").notNull(),
  amountUsd: numeric("amount_usd", { precision: 10, scale: 2 }).notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  reviewNote: text("review_note"),
  createdAt: createdAt(),
}, (t) => [index("subs_user_idx").on(t.userId)]);

export const signals = pgTable("signals", {
  id: id(),
  symbol: text("symbol").notNull(),
  side: sideEnum("side").notNull(),
  entry: numeric("entry").notNull(),
  takeProfit: numeric("take_profit").notNull(),
  stopLoss: numeric("stop_loss").notNull(),
  status: signalStatusEnum("status").notNull().default("active"),
  pips: numeric("pips"), // résultat une fois résolu
  setup: text("setup"), // ex. "SMC Professional"
  note: text("note"),
  imageUrl: text("image_url"),
  isFree: boolean("is_free").notNull().default(false), // visible sur la landing (canal gratuit)
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: createdAt(),
});

export const strategies = pgTable("strategies", {
  id: id(),
  name: text("name").notNull(),
  asset: text("asset").notNull(),
  magic: integer("magic").notNull(),
  description: text("description").notNull().default(""),
  avgMonthlyPct: numeric("avg_monthly_pct").notNull(),
  winRatePct: numeric("win_rate_pct").notNull(),
  profitFactor: numeric("profit_factor").notNull(),
  maxDdPct: numeric("max_dd_pct").notNull(),
  expectancyR: numeric("expectancy_r").notNull(),
  minCapital: integer("min_capital").notNull(),
  prices: jsonb("prices").$type<Record<"monthly" | "quarterly" | "yearly" | "lifetime", number>>().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
});

export const strategySubscriptions = pgTable("strategy_subscriptions", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  strategyId: uuid("strategy_id").notNull().references(() => strategies.id, { onDelete: "cascade" }),
  plan: strategyPlanEnum("plan").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  txHash: text("tx_hash"),
  brokerLogin: text("broker_login"), // compte Exness MT4/MT5 (connexion simulée)
  brokerServer: text("broker_server"),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("strat_sub_unique").on(t.userId, t.strategyId)]);

export const pools = pgTable("pools", {
  id: id(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  targetUsd: numeric("target_usd", { precision: 12, scale: 2 }).notNull(),
  minPledgeUsd: numeric("min_pledge_usd", { precision: 12, scale: 2 }).notNull(),
  profitSharePct: numeric("profit_share_pct").notNull().default("0"),
  brokerServer: text("broker_server").notNull(),
  brokerLogin: text("broker_login").notNull(),
  investorPassword: text("investor_password").notNull(), // révélé aux investisseurs approuvés
  status: poolStatusEnum("status").notNull().default("open"),
  createdAt: createdAt(),
});

export const poolPledges = pgTable("pool_pledges", {
  id: id(),
  poolId: uuid("pool_id").notNull().references(() => pools.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amountUsd: numeric("amount_usd", { precision: 12, scale: 2 }).notNull(),
  txHash: text("tx_hash").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  createdAt: createdAt(),
});

export const communities = pgTable("communities", {
  id: id(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  type: communityTypeEnum("type").notNull(),
  monthlyPriceUsd: numeric("monthly_price_usd", { precision: 10, scale: 2 }),
  createdAt: createdAt(),
});

export const communityMembers = pgTable("community_members", {
  communityId: uuid("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: paymentStatusEnum("status").notNull().default("active"),
  txHash: text("tx_hash"),
  createdAt: createdAt(),
}, (t) => [primaryKey({ columns: [t.communityId, t.userId] })]);

export const communityMessages = pgTable("community_messages", {
  id: id(),
  communityId: uuid("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: createdAt(),
}, (t) => [index("msg_community_idx").on(t.communityId, t.createdAt)]);

/** Un fil de support par utilisateur ; les messages indiquent l'expéditeur. */
export const supportMessages = pgTable("support_messages", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), // propriétaire du fil
  fromAdmin: boolean("from_admin").notNull().default(false),
  body: text("body").notNull(),
  createdAt: createdAt(),
}, (t) => [index("support_user_idx").on(t.userId, t.createdAt)]);

export const notifications = pgTable("notifications", {
  id: id(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }), // null = diffusion
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  createdAt: createdAt(),
});

/** Compteur quotidien de scans du graphique IA (limite selon le forfait). */
export const chartScans = pgTable("chart_scans", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  day: date("day").notNull(),
  count: integer("count").notNull().default(0),
}, (t) => [primaryKey({ columns: [t.userId, t.day] })]);

/** Réglages clé/valeur : adresse USDT, réseau, lien Telegram… */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

/** Hash USDT déjà soumis (anti-rejeu) : un paiement ne sert qu'une fois, tous produits confondus. */
export const paymentHashes = pgTable("payment_hashes", {
  hash: text("hash").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
}, (t) => [index("payment_hashes_user_idx").on(t.userId, t.createdAt)]);
