import crypto from 'crypto';
import { z } from 'zod';

// PostFinance Checkout configuration
export const postfinanceConfig = {
  spaceId: process.env.POSTFINANCE_SPACE_ID,
  userId: process.env.POSTFINANCE_USER_ID,
  apiSecret: process.env.POSTFINANCE_API_SECRET,
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://checkout.postfinance.ch/api'
    : 'https://checkout.postfinance.ch/api', // Same endpoint for both environments
};

export interface PostFinanceTransaction {
  id: number;
  version: number;
  amount: number;
  currency: string;
  state: 'CREATE' | 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'AUTHORIZED' | 'COMPLETED' | 'FULFILL' | 'DECLINE' | 'VOIDED' | 'FAILED';
  lineItems: Array<{
    name: string;
    quantity: number;
    amountIncludingTax: number;
    type: 'PRODUCT' | 'SHIPPING' | 'FEE' | 'DISCOUNT';
  }>;
  billingAddress?: {
    givenName?: string;
    familyName?: string;
    emailAddress?: string;
    country?: string;
    city?: string;
    postalCode?: string;
    street?: string;
  };
  successUrl: string;
  failureUrl: string;
}

export interface PostFinanceSubscription {
  id: number;
  version: number;
  state: 'CREATE' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATING' | 'TERMINATED';
  subscriber: {
    id: number;
    emailAddress: string;
    reference?: string;
  };
  product: {
    id: number;
    name: string;
    reference: string;
  };
  currency: string;
  token?: {
    id: number;
  };
}

// MAC Authentication for PostFinance API
function generateMacSignature(
  method: string,
  path: string,
  userId: string,
  timestamp: string,
  body?: string
): string {
  if (!postfinanceConfig.apiSecret) {
    throw new Error('PostFinance API secret not configured');
  }

  const contentToSign = [
    method.toUpperCase(),
    path,
    userId,
    timestamp,
    body || ''
  ].join('|');

  const hmac = crypto.createHmac('sha512', Buffer.from(postfinanceConfig.apiSecret, 'base64'));
  hmac.update(contentToSign, 'utf-8');
  return hmac.digest('base64');
}

// PostFinance API Client
class PostFinanceClient {
  private async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<any> {
    if (!postfinanceConfig.spaceId || !postfinanceConfig.userId || !postfinanceConfig.apiSecret) {
      throw new Error('PostFinance configuration incomplete. Please configure POSTFINANCE_SPACE_ID, POSTFINANCE_USER_ID, and POSTFINANCE_API_SECRET');
    }

    const path = `/space/${postfinanceConfig.spaceId}${endpoint}`;
    const url = `${postfinanceConfig.baseUrl}${path}`;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = data ? JSON.stringify(data) : undefined;

    const macSignature = generateMacSignature(
      method,
      path,
      postfinanceConfig.userId,
      timestamp,
      body
    );

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-mac-version': '1',
      'x-mac-userid': postfinanceConfig.userId,
      'x-mac-timestamp': timestamp,
      'x-mac-value': macSignature,
    };

    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`PostFinance API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`PostFinance API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async createTransaction(transaction: Omit<PostFinanceTransaction, 'id' | 'version' | 'state'>): Promise<PostFinanceTransaction> {
    return this.makeRequest('POST', '/transaction/create', transaction);
  }

  async getTransaction(transactionId: number): Promise<PostFinanceTransaction> {
    return this.makeRequest('GET', `/transaction/read?id=${transactionId}`);
  }

  async createSubscription(subscription: {
    product: number; // Product ID
    subscriber: {
      emailAddress: string;
      reference?: string;
    };
    currency: string;
    initialTransactionId?: number;
  }): Promise<PostFinanceSubscription> {
    return this.makeRequest('POST', '/subscription/create', subscription);
  }

  async getSubscription(subscriptionId: number): Promise<PostFinanceSubscription> {
    return this.makeRequest('GET', `/subscription/read?id=${subscriptionId}`);
  }

  async suspendSubscription(subscriptionId: number): Promise<PostFinanceSubscription> {
    return this.makeRequest('POST', `/subscription/suspend`, { id: subscriptionId });
  }

  async reactivateSubscription(subscriptionId: number): Promise<PostFinanceSubscription> {
    return this.makeRequest('POST', `/subscription/reactivate`, { id: subscriptionId });
  }

  async terminateSubscription(subscriptionId: number, endInstantly: boolean = false): Promise<PostFinanceSubscription> {
    return this.makeRequest('POST', `/subscription/terminate`, { 
      id: subscriptionId,
      respectTerminationPeriod: !endInstantly
    });
  }
}

export const postfinanceClient = new PostFinanceClient();

// Swiss subscription tiers with PostFinance integration
export const POSTFINANCE_PRODUCTS = {
  ultra: {
    name: 'Ultra Access',
    reference: 'ultra-access-chf',
    price: 150.00, // CHF
    currency: 'CHF',
    description: 'Erweiterte AI-Funktionen mit 500 Nachrichten pro Tag'
  },
  pro: {
    name: 'Pro',
    reference: 'pro-unlimited-chf',
    price: 350.00, // CHF
    currency: 'CHF',
    description: 'Unbegrenzte Nachrichten mit Premium Gemini 2.5 Pro Modell'
  }
};

// Webhook validation
export function validatePostFinanceWebhook(body: string, signature: string): boolean {
  if (!postfinanceConfig.apiSecret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha512', Buffer.from(postfinanceConfig.apiSecret, 'base64'))
    .update(body, 'utf-8')
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'base64'),
    Buffer.from(expectedSignature, 'base64')
  );
}

// Transaction line item helpers
export function createSubscriptionLineItem(tier: 'ultra' | 'pro'): PostFinanceTransaction['lineItems'][0] {
  const product = POSTFINANCE_PRODUCTS[tier];
  return {
    name: product.name,
    quantity: 1,
    amountIncludingTax: product.price,
    type: 'PRODUCT'
  };
}