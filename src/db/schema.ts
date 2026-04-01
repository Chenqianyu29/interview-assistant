import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  index,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

// ── users ──────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── user_settings ──────────────────────────────────────

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  globalIdentity: varchar("global_identity", { length: 20 })
    .notNull()
    .default("professional"),
  globalExperience: varchar("global_experience", { length: 10 }),
  globalScenario: varchar("global_scenario", { length: 20 })
    .notNull()
    .default("big-company"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── favorite_folders ───────────────────────────────────

export const favoriteFolders = pgTable(
  "favorite_folders",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("ff_user_idx").on(t.userId)],
);

// ── question_records ───────────────────────────────────

export const questionRecords = pgTable(
  "question_records",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    question: text("question").notNull(),

    roleIdentity: varchar("role_identity", { length: 20 }).notNull(),
    roleExperience: varchar("role_experience", { length: 10 }),
    roleScenario: varchar("role_scenario", { length: 20 }).notNull(),

    answer: text("answer").notNull().default(""),
    starAnswer: text("star_answer").notNull().default(""),
    followUps: jsonb("follow_ups").$type<string[]>().notNull().default([]),

    parentId: integer("parent_id").references(
      (): AnyPgColumn => questionRecords.id,
      { onDelete: "set null" },
    ),
    folderId: integer("folder_id").references(() => favoriteFolders.id, {
      onDelete: "set null",
    }),
    category: varchar("category", { length: 50 }).notNull().default(""),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("qr_user_idx").on(t.userId),
    index("qr_folder_idx").on(t.folderId),
    index("qr_parent_idx").on(t.parentId),
    index("qr_created_idx").on(t.userId, t.createdAt),
  ],
);
