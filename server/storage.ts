import {
  users,
  conversations,
  messages,
  type User,
  type UpsertUser,
  type Conversation,
  type Message,
  type InsertConversation,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
}

export const storage = new DatabaseStorage();
