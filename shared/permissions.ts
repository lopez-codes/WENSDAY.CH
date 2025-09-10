// Comprehensive Permission System for wensday.ch MVP
// Supports all user roles from free users to super admins

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'user' | 'admin' | 'core' | 'system';
  level: number; // 0=public, 1=authenticated, 2=paid, 3=core, 4=admin, 5=super_admin
}

export interface UserRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  maxDailyMessages: number;
  maxConversations: number;
  canAccessProviders: string[];
  priceChf: number | null;
  features: string[];
}

// Core Permissions Definitions
export const PERMISSIONS: Record<string, Permission> = {
  // Basic User Permissions (Level 0-1)
  'user.chat.basic': {
    id: 'user.chat.basic',
    name: 'Basic Chat',
    description: 'Use basic chat functionality',
    category: 'user',
    level: 0
  },
  'user.chat.authenticated': {
    id: 'user.chat.authenticated',
    name: 'Authenticated Chat',
    description: 'Save and load conversation history',
    category: 'user',
    level: 1
  },
  'user.profile.read': {
    id: 'user.profile.read',
    name: 'Read Profile',
    description: 'View own profile information',
    category: 'user',
    level: 1
  },
  'user.profile.write': {
    id: 'user.profile.write',
    name: 'Edit Profile',
    description: 'Edit own profile information',
    category: 'user',
    level: 1
  },

  // Paid User Permissions (Level 2)
  'user.chat.advanced': {
    id: 'user.chat.advanced',
    name: 'Advanced Chat',
    description: 'Access advanced chat features and higher limits',
    category: 'user',
    level: 2
  },
  'user.providers.select': {
    id: 'user.providers.select',
    name: 'Select AI Providers',
    description: 'Choose from multiple AI providers',
    category: 'user',
    level: 2
  },
  'user.export.conversations': {
    id: 'user.export.conversations',
    name: 'Export Conversations',
    description: 'Export conversation history',
    category: 'user',
    level: 2
  },
  'user.analytics.basic': {
    id: 'user.analytics.basic',
    name: 'Basic Analytics',
    description: 'View usage statistics and analytics',
    category: 'user',
    level: 2
  },

  // wensday-core Permissions (Level 3)
  'core.api.access': {
    id: 'core.api.access',
    name: 'Direct API Access',
    description: 'Direct API access with personal API keys',
    category: 'core',
    level: 3
  },
  'core.providers.unlimited': {
    id: 'core.providers.unlimited',
    name: 'Unlimited Providers',
    description: 'Access to all AI providers without restrictions',
    category: 'core',
    level: 3
  },
  'core.integrations.custom': {
    id: 'core.integrations.custom',
    name: 'Custom Integrations',
    description: 'Create custom AI integrations and workflows',
    category: 'core',
    level: 3
  },
  'core.analytics.advanced': {
    id: 'core.analytics.advanced',
    name: 'Advanced Analytics',
    description: 'Detailed analytics and usage insights',
    category: 'core',
    level: 3
  },
  'core.support.priority': {
    id: 'core.support.priority',
    name: 'Priority Support',
    description: 'Priority customer support and direct developer access',
    category: 'core',
    level: 3
  },

  // Admin Permissions (Level 4)
  'admin.users.read': {
    id: 'admin.users.read',
    name: 'View Users',
    description: 'View all user accounts and information',
    category: 'admin',
    level: 4
  },
  'admin.users.write': {
    id: 'admin.users.write',
    name: 'Manage Users',
    description: 'Edit user accounts and subscriptions',
    category: 'admin',
    level: 4
  },
  'admin.providers.read': {
    id: 'admin.providers.read',
    name: 'View AI Providers',
    description: 'View AI provider configurations',
    category: 'admin',
    level: 4
  },
  'admin.providers.write': {
    id: 'admin.providers.write',
    name: 'Manage AI Providers',
    description: 'Configure and manage AI providers',
    category: 'admin',
    level: 4
  },
  'admin.analytics.full': {
    id: 'admin.analytics.full',
    name: 'Full Analytics',
    description: 'Access to all system analytics and reports',
    category: 'admin',
    level: 4
  },
  'admin.logs.read': {
    id: 'admin.logs.read',
    name: 'Read System Logs',
    description: 'Access to system and admin logs',
    category: 'admin',
    level: 4
  },

  // Super Admin Permissions (Level 5)
  'system.settings.write': {
    id: 'system.settings.write',
    name: 'System Settings',
    description: 'Modify system-wide settings and configuration',
    category: 'system',
    level: 5
  },
  'system.admin.create': {
    id: 'system.admin.create',
    name: 'Create Admins',
    description: 'Grant admin privileges to other users',
    category: 'system',
    level: 5
  },
  'system.core.manage': {
    id: 'system.core.manage',
    name: 'Manage Core Access',
    description: 'Grant and revoke wensday-core access',
    category: 'system',
    level: 5
  },
  'system.backup.full': {
    id: 'system.backup.full',
    name: 'Full System Backup',
    description: 'Create and restore full system backups',
    category: 'system',
    level: 5
  },
  'system.database.direct': {
    id: 'system.database.direct',
    name: 'Direct Database Access',
    description: 'Direct database access and manipulation',
    category: 'system',
    level: 5
  }
};

// User Role Definitions
export const USER_ROLES: Record<string, UserRole> = {
  guest: {
    id: 'guest',
    name: 'guest',
    displayName: 'Gast',
    description: 'Unangemeldete Benutzer mit Basis-Chat-Zugang',
    permissions: [
      'user.chat.basic'
    ],
    maxDailyMessages: 3,
    maxConversations: 0,
    canAccessProviders: ['google'], // Only Gemini for guests
    priceChf: null,
    features: [
      'Basis-Chat ohne Registrierung',
      '3 Nachrichten pro Tag',
      'Keine Gesprächsspeicherung'
    ]
  },

  free: {
    id: 'free',
    name: 'free',
    displayName: 'Free',
    description: 'Kostenlose registrierte Benutzer',
    permissions: [
      'user.chat.basic',
      'user.chat.authenticated',
      'user.profile.read',
      'user.profile.write'
    ],
    maxDailyMessages: 10,
    maxConversations: 5,
    canAccessProviders: ['google'],
    priceChf: null,
    features: [
      '10 Nachrichten pro Tag',
      'Gesprächsspeicherung (5 Gespräche)',
      'Profil-Verwaltung',
      'Basis AI-Provider (Gemini)'
    ]
  },

  ultra: {
    id: 'ultra',
    name: 'ultra',
    displayName: 'Ultra',
    description: 'Erweiterte Benutzer mit mehr Features',
    permissions: [
      'user.chat.basic',
      'user.chat.authenticated',
      'user.chat.advanced',
      'user.profile.read',
      'user.profile.write',
      'user.providers.select',
      'user.export.conversations',
      'user.analytics.basic'
    ],
    maxDailyMessages: 500,
    maxConversations: 50,
    canAccessProviders: ['google', 'openai', 'anthropic'],
    priceChf: 19,
    features: [
      '500 Nachrichten pro Tag',
      'Unbegrenzte Gesprächsspeicherung',
      'Mehrere AI-Provider (GPT, Claude, Gemini)',
      'Export-Funktionen',
      'Basis-Analytics',
      'E-Mail-Support'
    ]
  },

  pro: {
    id: 'pro',
    name: 'pro',
    displayName: 'Pro',
    description: 'Professionelle Benutzer für Business-Anwendungen',
    permissions: [
      'user.chat.basic',
      'user.chat.authenticated',
      'user.chat.advanced',
      'user.profile.read',
      'user.profile.write',
      'user.providers.select',
      'user.export.conversations',
      'user.analytics.basic'
    ],
    maxDailyMessages: -1, // unlimited
    maxConversations: -1, // unlimited
    canAccessProviders: ['google', 'openai', 'anthropic', 'perplexity'],
    priceChf: 49,
    features: [
      'Unbegrenzte Nachrichten',
      'Unbegrenzte Gesprächsspeicherung',
      'Alle öffentlichen AI-Provider',
      'Erweiterte Analytics',
      'Export in verschiedene Formate',
      'Priority E-Mail-Support',
      'Business-Features'
    ]
  },

  wensday_core: {
    id: 'wensday_core',
    name: 'wensday_core',
    displayName: 'wensday-core',
    description: 'Exklusive Premium Developer Access',
    permissions: [
      'user.chat.basic',
      'user.chat.authenticated',
      'user.chat.advanced',
      'user.profile.read',
      'user.profile.write',
      'user.providers.select',
      'user.export.conversations',
      'user.analytics.basic',
      'core.api.access',
      'core.providers.unlimited',
      'core.integrations.custom',
      'core.analytics.advanced',
      'core.support.priority'
    ],
    maxDailyMessages: -1,
    maxConversations: -1,
    canAccessProviders: ['*'], // All providers
    priceChf: 199,
    features: [
      'Alle Pro-Features',
      'Direkte API-Zugang',
      'Eigene API-Keys verwenden',
      'Custom AI-Integrationen',
      'Alle AI-Provider (inkl. experimentelle)',
      'Developer-Tools und SDKs',
      'Direkter Developer-Support',
      'White-Label-Optionen',
      'Enterprise-Integrations'
    ]
  },

  admin: {
    id: 'admin',
    name: 'admin',
    displayName: 'Administrator',
    description: 'System-Administratoren',
    permissions: [
      'user.chat.basic',
      'user.chat.authenticated',
      'user.chat.advanced',
      'user.profile.read',
      'user.profile.write',
      'user.providers.select',
      'user.export.conversations',
      'user.analytics.basic',
      'core.api.access',
      'core.providers.unlimited',
      'core.integrations.custom',
      'core.analytics.advanced',
      'core.support.priority',
      'admin.users.read',
      'admin.users.write',
      'admin.providers.read',
      'admin.providers.write',
      'admin.analytics.full',
      'admin.logs.read'
    ],
    maxDailyMessages: -1,
    maxConversations: -1,
    canAccessProviders: ['*'],
    priceChf: null,
    features: [
      'Alle wensday-core Features',
      'Benutzer-Verwaltung',
      'AI-Provider-Management',
      'System-Analytics',
      'Admin-Dashboard',
      'System-Logs'
    ]
  },

  super_admin: {
    id: 'super_admin',
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Vollzugriff auf alle System-Funktionen',
    permissions: Object.keys(PERMISSIONS),
    maxDailyMessages: -1,
    maxConversations: -1,
    canAccessProviders: ['*'],
    priceChf: null,
    features: [
      'Vollzugriff auf alle Funktionen',
      'System-Konfiguration',
      'Admin-Erstellung',
      'Core-Access-Verwaltung',
      'Database-Zugriff',
      'System-Backups',
      'Alle Developer-Tools'
    ]
  }
};

// Permission Helper Functions
export function hasPermission(userRole: string, permission: string): boolean {
  const role = USER_ROLES[userRole];
  if (!role) return false;
  return role.permissions.includes(permission);
}

export function getUserPermissions(userRole: string): Permission[] {
  const role = USER_ROLES[userRole];
  if (!role) return [];
  
  return role.permissions.map(permId => PERMISSIONS[permId]).filter(Boolean);
}

export function canAccessProvider(userRole: string, providerSlug: string): boolean {
  const role = USER_ROLES[userRole];
  if (!role) return false;
  
  return role.canAccessProviders.includes('*') || 
         role.canAccessProviders.includes(providerSlug);
}

export function getMaxDailyMessages(userRole: string): number {
  const role = USER_ROLES[userRole];
  return role?.maxDailyMessages || 0;
}

export function getMaxConversations(userRole: string): number {
  const role = USER_ROLES[userRole];
  return role?.maxConversations || 0;
}

export function getRoleDisplayInfo(userRole: string) {
  const role = USER_ROLES[userRole];
  if (!role) return null;
  
  return {
    name: role.displayName,
    description: role.description,
    price: role.priceChf,
    features: role.features,
    limits: {
      dailyMessages: role.maxDailyMessages,
      conversations: role.maxConversations
    }
  };
}