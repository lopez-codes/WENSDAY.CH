import {
  users,
  conversations,
  messages,
  aiProviders,
  userProviderConfigs,
  type User,
  type UpsertUser,
  type Conversation,
  type Message,
  type AiProvider,
  type UserProviderConfig,
  type InsertConversation,
  type InsertMessage,
  type InsertAiProvider,
  type InsertUserProviderConfig,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Subscription operations
  updateUserSubscription(
    userId: string,
    subscriptionTier: string,
    options?: {
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
      postfinanceSubscriptionId?: number;
      postfinanceTransactionId?: number;
      paymentMethod?: 'stripe' | 'postfinance';
    }
  ): Promise<User>;
  
  // Message rate limiting
  incrementDailyMessageCount(userId: string): Promise<User>;
  resetDailyMessageCount(userId: string): Promise<User>;
  
  // Conversation operations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  
  // Conversation delete operations
  deleteConversation(conversationId: string, userId: string): Promise<void>;
  deleteConversationsAfterDate(userId: string, afterDate: Date): Promise<void>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: string): Promise<Message[]>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  getSystemStats(): Promise<any>;
  
  // AI Provider operations
  createAiProvider(provider: InsertAiProvider): Promise<AiProvider>;
  getAllAiProviders(): Promise<AiProvider[]>;
  getAiProvider(id: string): Promise<AiProvider | undefined>;
  getAiProviderBySlug(slug: string): Promise<AiProvider | undefined>;
  updateAiProvider(id: string, updates: Partial<AiProvider>): Promise<AiProvider>;
  deleteAiProvider(id: string): Promise<void>;
  
  // User Provider Config operations
  createUserProviderConfig(config: InsertUserProviderConfig): Promise<UserProviderConfig>;
  getUserProviderConfigs(userId: string): Promise<UserProviderConfig[]>;
  getUserProviderConfig(userId: string, providerId: string): Promise<UserProviderConfig | undefined>;
  updateUserProviderConfig(id: string, updates: Partial<UserProviderConfig>): Promise<UserProviderConfig>;
  deleteUserProviderConfig(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Subscription operations (removed duplicate - using the one below with more options)

  // Message rate limiting
  async incrementDailyMessageCount(userId: string): Promise<User> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      throw new Error("User not found");
    }

    // Reset count if it's a new day
    const shouldReset = !user.lastMessageDate || user.lastMessageDate < today;
    
    const [updatedUser] = await db
      .update(users)
      .set({
        dailyMessageCount: shouldReset ? 1 : (user.dailyMessageCount || 0) + 1,
        lastMessageDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async resetDailyMessageCount(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        dailyMessageCount: 0,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Update user subscription info (supports both Stripe and PostFinance)
  async updateUserSubscription(
    userId: string,
    subscriptionTier: string,
    options: {
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
      postfinanceSubscriptionId?: number;
      postfinanceTransactionId?: number;
      paymentMethod?: 'stripe' | 'postfinance';
    } = {}
  ): Promise<User> {
    const updateData: any = {
      subscriptionTier,
      updatedAt: new Date(),
      ...options
    };

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Conversation operations
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db
      .insert(conversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation;
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  // Delete conversation and all its messages
  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    // Verify conversation belongs to user
    const conversation = await this.getConversation(conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new Error('Conversation not found or access denied');
    }

    // Delete messages first (foreign key constraint)
    await db.delete(messages).where(eq(messages.conversationId, conversationId));
    
    // Delete conversation
    await db.delete(conversations).where(eq(conversations.id, conversationId));
  }

  // Delete all conversations after a specific date
  async deleteConversationsAfterDate(userId: string, afterDate: Date): Promise<void> {
    // Get conversations to delete
    const conversationsToDelete = await db
      .select()
      .from(conversations)
      .where(and(
        eq(conversations.userId, userId),
        gte(conversations.createdAt, afterDate)
      ));

    // Delete messages for each conversation
    for (const conversation of conversationsToDelete) {
      await db.delete(messages).where(eq(messages.conversationId, conversation.id));
    }

    // Delete conversations
    await db.delete(conversations).where(and(
      eq(conversations.userId, userId),
      gte(conversations.createdAt, afterDate)
    ));
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async getSystemStats(): Promise<any> {
    // Get user counts by subscription tier
    const userStats = await db
      .select()
      .from(users);

    // Calculate statistics
    const totalUsers = userStats.length;
    const subscriptionCounts = userStats.reduce((acc: any, user: any) => {
      acc[user.subscriptionTier || 'free'] = (acc[user.subscriptionTier || 'free'] || 0) + 1;
      return acc;
    }, {});

    const coreUsers = userStats.filter((user: any) => user.hasCoreAccess).length;
    const adminUsers = userStats.filter((user: any) => user.isAdmin).length;

    // Get message count for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayMessages = await db
      .select()
      .from(messages)
      .where(gte(messages.createdAt, today));

    // Get total conversations
    const totalConversations = await db
      .select()
      .from(conversations);

    return {
      totalUsers,
      subscriptionCounts,
      coreUsers,
      adminUsers,
      messagesToday: todayMessages.length,
      totalConversations: totalConversations.length,
      activeUsers: userStats.filter((user: any) => user.lastMessageDate && 
        new Date(user.lastMessageDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
    };
  }

  // AI Provider operations
  async createAiProvider(provider: InsertAiProvider): Promise<AiProvider> {
    const [result] = await db.insert(aiProviders).values(provider).returning();
    return result;
  }

  async getAllAiProviders(): Promise<AiProvider[]> {
    return await db
      .select()
      .from(aiProviders)
      .orderBy(aiProviders.name);
  }

  async getAiProvider(id: string): Promise<AiProvider | undefined> {
    const [result] = await db
      .select()
      .from(aiProviders)
      .where(eq(aiProviders.id, id));
    return result;
  }

  async getAiProviderBySlug(slug: string): Promise<AiProvider | undefined> {
    const [result] = await db
      .select()
      .from(aiProviders)
      .where(eq(aiProviders.slug, slug));
    return result;
  }

  async updateAiProvider(id: string, updates: Partial<AiProvider>): Promise<AiProvider> {
    const [result] = await db
      .update(aiProviders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(aiProviders.id, id))
      .returning();
    return result;
  }

  async deleteAiProvider(id: string): Promise<void> {
    await db.delete(aiProviders).where(eq(aiProviders.id, id));
  }

  // User Provider Config operations
  async createUserProviderConfig(config: InsertUserProviderConfig): Promise<UserProviderConfig> {
    const [result] = await db.insert(userProviderConfigs).values(config).returning();
    return result;
  }

  async getUserProviderConfigs(userId: string): Promise<UserProviderConfig[]> {
    return await db
      .select()
      .from(userProviderConfigs)
      .where(eq(userProviderConfigs.userId, userId));
  }

  async getUserProviderConfig(userId: string, providerId: string): Promise<UserProviderConfig | undefined> {
    const [result] = await db
      .select()
      .from(userProviderConfigs)
      .where(and(
        eq(userProviderConfigs.userId, userId),
        eq(userProviderConfigs.providerId, providerId)
      ));
    return result;
  }

  async updateUserProviderConfig(id: string, updates: Partial<UserProviderConfig>): Promise<UserProviderConfig> {
    const [result] = await db
      .update(userProviderConfigs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProviderConfigs.id, id))
      .returning();
    return result;
  }

  async deleteUserProviderConfig(id: string): Promise<void> {
    await db.delete(userProviderConfigs).where(eq(userProviderConfigs.id, id));
  }
}

export const storage = new DatabaseStorage();
