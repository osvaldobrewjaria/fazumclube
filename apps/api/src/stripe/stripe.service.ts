import { Injectable, BadRequestException } from '@nestjs/common';
import { Stripe } from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
  }

  constructWebhookEvent(rawBody: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  }

  async createCustomer(user: { id: string; email: string; name: string }) {
    const customer = await this.stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });

    return customer.id;
  }

  async createCheckoutSession(data: {
    customerId: string;
    priceId: string;
    customerEmail: string;
    subscriptionId: string;
    tenantId: string;
    tenantSlug: string;
    // Stripe Connect: conta do tenant (opcional, para quando implementar Connect)
    stripeAccountId?: string;
  }) {
    const baseUrl = process.env.WEB_URL || 'http://localhost:3000';
    
    // URLs dinâmicas por tenant
    const successUrl = `${baseUrl}/t/${data.tenantSlug}/assinatura/sucesso?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/t/${data.tenantSlug}/assinatura/cancelada`;

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      customer: data.customerId,
      line_items: [
        {
          price: data.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        subscriptionId: data.subscriptionId,
        // Multi-tenancy: SEMPRE incluir tenant para rastreabilidade
        tenantId: data.tenantId,
        tenantSlug: data.tenantSlug,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    // Stripe Connect: se tenant tem conta conectada, criar sessão na conta dele
    // (preparado para implementação futura)
    if (data.stripeAccountId) {
      return await this.stripe.checkout.sessions.create(sessionConfig, {
        stripeAccount: data.stripeAccountId,
      });
    }

    return await this.stripe.checkout.sessions.create(sessionConfig);
  }

  async getCheckoutSession(sessionId: string) {
    return await this.stripe.checkout.sessions.retrieve(sessionId);
  }

  async cancelSubscription(stripeSubscriptionId: string) {
    return this.stripe.subscriptions.cancel(stripeSubscriptionId);
  }

  async getInvoice(invoiceId: string) {
    return await this.stripe.invoices.retrieve(invoiceId);
  }

  async handleEvent(event: any) {
    console.log('[Stripe] Event received:', event.type);
  }
}
