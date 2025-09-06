import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Enhanced for business users
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  subscriptionTier: varchar("subscription_tier").default("free"), // free, ultra, pro, wensday_core
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  postfinanceSubscriptionId: integer("postfinance_subscription_id"),
  postfinanceTransactionId: integer("postfinance_transaction_id"),
  paymentMethod: varchar("payment_method").default("stripe"), // stripe, postfinance
  preferredAiModel: varchar("preferred_ai_model"), // user's preferred AI model
  isAdmin: boolean("is_admin").default(false), // admin permissions
  adminLevel: varchar("admin_level"), // "super_admin", "admin", "moderator"
  adminId: varchar("admin_id"), // unique admin identifier (e.g., "00" for super admin)
  canManageUsers: boolean("can_manage_users").default(false),
  canManageSubscriptions: boolean("can_manage_subscriptions").default(false),
  canAccessStats: boolean("can_access_stats").default(false),
  canManageCore: boolean("can_manage_core").default(false),
  dailyMessageCount: integer("daily_message_count").default(0),
  lastMessageDate: timestamp("last_message_date"),
  // Business Enhancement Fields
  companyName: varchar("company_name"), // Business company
  jobTitle: varchar("job_title"), // User's position
  industry: varchar("industry"), // Business industry
  companySize: varchar("company_size"), // "startup", "sme", "enterprise"
  businessGoals: jsonb("business_goals"), // Primary business objectives
  qualitySettings: jsonb("quality_settings"), // AI quality preferences
  errorToleranceLevel: varchar("error_tolerance_level").default("medium"), // "low", "medium", "high"
  
  // wensday-core exclusive features (Premium Developer Access)
  hasCoreAccess: boolean("has_core_access").default(false),
  coreApiKey: varchar("core_api_key"), // Personal API key for direct integrations
  unlimitedAccess: boolean("unlimited_access").default(false),
  directKiIntegration: boolean("direct_ki_integration").default(false),
  fullControlMode: boolean("full_control_mode").default(false),
  coreConnectors: jsonb("core_connectors"), // Custom connector configurations
  developerResponsibility: boolean("developer_responsibility").default(false), // User takes full responsibility
  
  // Firebase Migration Preparation
  firebaseUid: varchar("firebase_uid"), // Future Firebase user ID
  migrationStatus: varchar("migration_status").default("pending"), // Migration tracking
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Conversations table - Enhanced for business workflows
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  // Business Enhancement Fields
  businessType: varchar("business_type"), // "analysis", "strategy", "research", "planning"
  priority: varchar("priority").default("medium"), // "low", "medium", "high", "urgent"
  isArchived: boolean("is_archived").default(false),
  collaborators: jsonb("collaborators"), // Future: team collaboration
  tags: jsonb("tags"), // Business tags for organization
  projectId: varchar("project_id"), // Future: link to business projects
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages table - Enhanced for business use and error detection
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  role: varchar("role").notNull(), // user, assistant
  content: text("content").notNull(),
  aiModel: varchar("ai_model"), // gemini-2.5-flash, gemini-2.5-pro
  // Business & Quality Control Features
  hasErrors: boolean("has_errors").default(false), // AI error detection
  errorDetails: text("error_details"), // Specific error descriptions
  confidenceScore: integer("confidence_score"), // 0-100 confidence in response
  businessCategory: varchar("business_category"), // e.g., "finance", "marketing", "legal"
  isVerified: boolean("is_verified").default(false), // Manual verification by user
  needsReview: boolean("needs_review").default(false), // Flagged for human review
  factChecked: boolean("fact_checked").default(false), // Automated fact checking
  sources: jsonb("sources"), // Referenced sources for business claims
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin Actions Log Table
export const adminLogs = pgTable("admin_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: varchar("action").notNull(), // "user_update", "subscription_change", "core_access", etc.
  targetUserId: varchar("target_user_id"), // User being acted upon
  details: jsonb("details"), // Action details and changes
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// System Settings Table
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  settingKey: varchar("setting_key").unique().notNull(),
  settingValue: jsonb("setting_value").notNull(),
  description: text("description"),
  lastUpdatedBy: varchar("last_updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertAdminLogSchema = createInsertSchema(adminLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type AdminLog = typeof adminLogs.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
