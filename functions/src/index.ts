import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Import route handlers
import { authRoutes } from './routes/auth';
import { chatRoutes } from './routes/chat';
import { adminRoutes } from './routes/admin';
import { userRoutes } from './routes/users';
import { providerRoutes } from './routes/providers';

// Register routes
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);
app.use('/admin', adminRoutes);
app.use('/users', userRoutes);
app.use('/providers', providerRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Main API function
export const api = onRequest({
  region: 'europe-west1',
  memory: '1GiB',
  timeoutSeconds: 540,
  maxInstances: 100
}, app);

// User Creation Trigger - Set up default permissions
export const onUserCreate = onDocumentCreated('users/{userId}', async (event) => {
  const userData = event.data?.data();
  if (!userData) return;

  const userId = event.params.userId;
  
  try {
    // Set default permissions based on subscription tier
    const defaultPermissions = getDefaultPermissions(userData.subscriptionTier || 'free');
    
    await admin.firestore().collection('users').doc(userId).update({
      permissions: defaultPermissions,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Log user creation
    await admin.firestore().collection('adminLogs').add({
      action: 'user_created',
      targetUserId: userId,
      details: { subscriptionTier: userData.subscriptionTier },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

  } catch (error) {
    console.error('Error setting up new user:', error);
  }
});

// Subscription Change Trigger - Update permissions
export const onSubscriptionChange = onDocumentUpdated('users/{userId}', async (event) => {
  const beforeData = event.data?.before.data();
  const afterData = event.data?.after.data();
  
  if (!beforeData || !afterData) return;
  
  const oldTier = beforeData.subscriptionTier;
  const newTier = afterData.subscriptionTier;
  
  if (oldTier !== newTier) {
    const userId = event.params.userId;
    
    try {
      // Update permissions based on new tier
      const newPermissions = getDefaultPermissions(newTier);
      
      await admin.firestore().collection('users').doc(userId).update({
        permissions: newPermissions,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Log subscription change
      await admin.firestore().collection('adminLogs').add({
        action: 'subscription_changed',
        targetUserId: userId,
        details: { 
          oldTier,
          newTier,
          upgradeDate: admin.firestore.FieldValue.serverTimestamp()
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    } catch (error) {
      console.error('Error updating user permissions:', error);
    }
  }
});

// Daily Cleanup - Reset daily message counts
export const dailyCleanup = onSchedule({
  schedule: '0 0 * * *', // Daily at midnight
  timeZone: 'Europe/Zurich'
}, async () => {
  try {
    const batch = admin.firestore().batch();
    
    // Reset daily message counts for all users
    const usersSnapshot = await admin.firestore().collection('users').get();
    
    usersSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        dailyMessageCount: 0,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    
    console.log(`Daily cleanup completed: Reset message counts for ${usersSnapshot.size} users`);
    
  } catch (error) {
    console.error('Error in daily cleanup:', error);
  }
});

// Analytics Aggregation - Weekly reports
export const weeklyAnalytics = onSchedule({
  schedule: '0 6 * * 1', // Weekly on Monday at 6 AM
  timeZone: 'Europe/Zurich'
}, async () => {
  try {
    // Generate weekly analytics
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const [users, conversations, messages] = await Promise.all([
      admin.firestore().collection('users').get(),
      admin.firestore().collection('conversations')
        .where('createdAt', '>=', lastWeek).get(),
      admin.firestore().collection('messages')
        .where('createdAt', '>=', lastWeek).get()
    ]);

    const analytics = {
      totalUsers: users.size,
      newUsersThisWeek: users.docs.filter(doc => 
        doc.data().createdAt.toDate() >= lastWeek
      ).length,
      conversationsThisWeek: conversations.size,
      messagesThisWeek: messages.size,
      generatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Store analytics
    await admin.firestore().collection('systemSettings').doc('weeklyAnalytics').set(analytics);
    
    console.log('Weekly analytics generated:', analytics);
    
  } catch (error) {
    console.error('Error generating weekly analytics:', error);
  }
});

// Helper function to get default permissions
function getDefaultPermissions(tier: string): string[] {
  const permissionMap: Record<string, string[]> = {
    guest: ['user.chat.basic'],
    free: ['user.chat.basic', 'user.chat.authenticated', 'user.profile.read', 'user.profile.write'],
    ultra: [
      'user.chat.basic', 'user.chat.authenticated', 'user.chat.advanced',
      'user.profile.read', 'user.profile.write', 'user.providers.select',
      'user.export.conversations', 'user.analytics.basic'
    ],
    pro: [
      'user.chat.basic', 'user.chat.authenticated', 'user.chat.advanced',
      'user.profile.read', 'user.profile.write', 'user.providers.select',
      'user.export.conversations', 'user.analytics.basic'
    ],
    wensday_core: [
      'user.chat.basic', 'user.chat.authenticated', 'user.chat.advanced',
      'user.profile.read', 'user.profile.write', 'user.providers.select',
      'user.export.conversations', 'user.analytics.basic',
      'core.api.access', 'core.providers.unlimited', 'core.integrations.custom',
      'core.analytics.advanced', 'core.support.priority'
    ]
  };
  
  return permissionMap[tier] || permissionMap.free;
}