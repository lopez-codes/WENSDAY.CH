// Stripe Accounting & Invoicing System for wensday.ch
// Automatische Rechnungserstellung für PostFinance-Zahlungen

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY not configured - accounting features disabled');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-07-30.basil",
    })
  : null;

export interface InvoiceData {
  userId: string;
  userEmail: string;
  userName: string;
  subscriptionTier: 'ultra' | 'pro';
  amount: number; // CHF
  currency: string;
  paymentMethod: 'postfinance' | 'stripe';
  postfinanceTransactionId?: number;
  description: string;
}

export class StripeAccounting {
  /**
   * Erstellt oder holt einen Stripe Customer für Buchhaltung
   */
  async getOrCreateCustomer(userId: string, email: string, name: string): Promise<string> {
    if (!stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      // Suche existierenden Customer
      const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0].id;
      }

      // Erstelle neuen Customer
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          wensday_user_id: userId,
          platform: 'wensday.ch',
          created_via: 'postfinance_accounting'
        }
      });

      console.log(`✅ Stripe Customer erstellt: ${customer.id} für ${email}`);
      return customer.id;
    } catch (error: any) {
      console.error('Fehler beim Customer-Erstellen:', error);
      throw error;
    }
  }

  /**
   * Erstellt eine Stripe-Rechnung für PostFinance-Zahlungen
   * Für Buchhaltung und Reporting
   */
  async createInvoiceForPostFinancePayment(data: InvoiceData): Promise<Stripe.Invoice> {
    if (!stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      // 1. Customer erstellen/holen
      const customerId = await this.getOrCreateCustomer(
        data.userId,
        data.userEmail,
        data.userName
      );

      // 2. Invoice Item erstellen
      const invoiceItem = await stripe.invoiceItems.create({
        customer: customerId,
        amount: Math.round(data.amount * 100), // CHF zu Rappen
        currency: data.currency.toLowerCase(),
        description: data.description,
        metadata: {
          wensday_user_id: data.userId,
          subscription_tier: data.subscriptionTier,
          payment_method: data.paymentMethod,
          postfinance_transaction_id: data.postfinanceTransactionId?.toString() || 'n/a',
          platform: 'wensday.ch'
        }
      });

      // 3. Invoice erstellen
      const invoice = await stripe.invoices.create({
        customer: customerId,
        collection_method: 'send_invoice', // Nur für Buchhaltung
        days_until_due: 0, // Sofort bezahlt via PostFinance
        auto_advance: true,
        metadata: {
          wensday_user_id: data.userId,
          payment_method: data.paymentMethod,
          postfinance_transaction_id: data.postfinanceTransactionId?.toString() || 'n/a'
        },
        description: `wensday.ch ${data.subscriptionTier.toUpperCase()} Subscription`,
        footer: 'Bezahlt via PostFinance Checkout. Diese Rechnung dient der Buchhaltung.'
      });

      // 4. Invoice als bezahlt markieren (wurde ja via PostFinance bezahlt)
      if (!invoice.id) {
        throw new Error('Invoice ID is undefined');
      }
      const paidInvoice = await stripe.invoices.pay(invoice.id, {
        paid_out_of_band: true, // Extern bezahlt
      });

      console.log(`✅ Stripe-Rechnung erstellt: ${paidInvoice.number} (${paidInvoice.hosted_invoice_url})`);
      
      return paidInvoice;
    } catch (error: any) {
      console.error('Fehler beim Rechnung-Erstellen:', error);
      throw error;
    }
  }

  /**
   * Erstellt monatliche Abo-Rechnung für PostFinance-Subscription
   */
  async createMonthlyInvoice(
    userId: string,
    userEmail: string,
    userName: string,
    tier: 'ultra' | 'pro',
    amount: number
  ): Promise<Stripe.Invoice> {
    const invoiceData: InvoiceData = {
      userId,
      userEmail,
      userName,
      subscriptionTier: tier,
      amount,
      currency: 'CHF',
      paymentMethod: 'postfinance',
      description: `wensday.ch ${tier.toUpperCase()} - Monatliches Abonnement`
    };

    return this.createInvoiceForPostFinancePayment(invoiceData);
  }

  /**
   * Holt alle Rechnungen eines Users für Buchhaltung
   */
  async getUserInvoices(userEmail: string): Promise<Stripe.Invoice[]> {
    if (!stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1
      });

      if (customers.data.length === 0) {
        return [];
      }

      const invoices = await stripe.invoices.list({
        customer: customers.data[0].id,
        limit: 100
      });

      return invoices.data;
    } catch (error: any) {
      console.error('Fehler beim Invoice-Abrufen:', error);
      throw error;
    }
  }

  /**
   * Exportiert Buchhaltungsdaten als CSV
   */
  async exportAccountingReport(startDate: Date, endDate: Date): Promise<any[]> {
    if (!stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      const invoices = await stripe.invoices.list({
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lte: Math.floor(endDate.getTime() / 1000)
        },
        limit: 100
      });

      return invoices.data.map(inv => ({
        invoice_number: inv.number,
        customer_email: inv.customer_email,
        amount: inv.amount_paid / 100,
        currency: inv.currency.toUpperCase(),
        status: inv.status,
        paid: inv.status === 'paid',
        created: new Date(inv.created * 1000).toISOString(),
        payment_method: inv.metadata?.payment_method || 'unknown',
        subscription_tier: inv.metadata?.subscription_tier || 'unknown',
        pdf_url: inv.invoice_pdf
      }));
    } catch (error: any) {
      console.error('Fehler beim Report-Erstellen:', error);
      throw error;
    }
  }

  /**
   * Sendet Rechnung per Email an Kunde
   */
  async sendInvoiceEmail(invoiceId: string): Promise<Stripe.Invoice> {
    if (!stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      const invoice = await stripe.invoices.sendInvoice(invoiceId);
      console.log(`✅ Rechnung per Email gesendet: ${invoice.number}`);
      return invoice;
    } catch (error: any) {
      console.error('Fehler beim Email-Senden:', error);
      throw error;
    }
  }
}

// Singleton Export
export const stripeAccounting = new StripeAccounting();
