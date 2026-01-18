import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { EmailService } from '../email/email.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private emailService: EmailService,
  ) {}

  async createCheckoutSession(userId: string, dto: CreateCheckoutSessionDto) {
    const { planSlug, billingInterval } = dto;

    // Buscar plano com preços
    const plan = await this.prisma.plan.findUnique({
      where: { slug: planSlug },
      include: {
        prices: {
          where: { interval: billingInterval, active: true },
        },
      },
    });

    if (!plan || plan.prices.length === 0) {
      throw new BadRequestException('Plan or pricing not found');
    }

    const planPrice = plan.prices[0];

    // Garantir que esse preço tem vínculo com Stripe
    const stripePriceId = planPrice.stripePriceId;
    if (!stripePriceId) {
      throw new BadRequestException('Plan price is not linked to Stripe');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.tenantId) {
      throw new BadRequestException('User does not have a tenant assigned');
    }

    // Verificar se já existe assinatura ATIVA para este usuário
    const existingActiveSubscription = await this.prisma.subscription.findFirst({
      where: { 
        userId, 
        status: 'ACTIVE' 
      },
    });

    // Se já tem assinatura ativa, não permitir criar nova
    if (existingActiveSubscription) {
      throw new BadRequestException('Você já possui uma assinatura ativa. Cancele a atual antes de assinar novamente.');
    }

    // Criar ou reutilizar o customer no Stripe
    let stripeCustomerId: string | null = null;

    const existingSubscription = await this.prisma.subscription.findFirst({
      where: { userId, planId: plan.id },
    });

    if (existingSubscription?.stripeCustomerId) {
      stripeCustomerId = existingSubscription.stripeCustomerId;
    } else {
      stripeCustomerId = await this.stripeService.createCustomer(user);
    }

    // Se já existe uma assinatura PENDING para este plano, reutilizar
    // Se não existe, criar nova
    let subscription;
    
    if (existingSubscription && existingSubscription.status === 'PENDING') {
      // Reutilizar assinatura pendente existente
      subscription = existingSubscription;
    } else if (!existingSubscription) {
      // Criar nova assinatura apenas se não existir
      subscription = await this.prisma.subscription.create({
        data: {
          userId,
          planId: plan.id,
          tenantId: user.tenantId,
          stripeCustomerId,
          status: 'PENDING',
        },
      });
    } else {
      // Assinatura existe mas não está PENDING nem ACTIVE (CANCELED, PAST_DUE)
      // Atualizar para PENDING para reativar
      subscription = await this.prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          stripeCustomerId,
          status: 'PENDING',
        },
      });
    }

    // Buscar tenant para incluir no metadata do Stripe
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { id: true, slug: true },
    });

    // Criar sessão de checkout no Stripe
    if (!tenant) {
      throw new Error('Tenant não encontrado para criar sessão de checkout');
    }
    
    const session = await this.stripeService.createCheckoutSession({
      customerId: stripeCustomerId!,
      priceId: stripePriceId,
      subscriptionId: subscription.id,
      customerEmail: user.email,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async getSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId },
      include: {
        plan: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!subscription) {
      return null;
    }

    return {
      id: subscription.id,
      status: subscription.status,
      plan: subscription.plan,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      payments: subscription.payments,
    };
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.stripeSubscriptionId) {
      await this.stripeService.cancelSubscription(
        subscription.stripeSubscriptionId,
      );
    }

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'CANCELED' },
    });

    return { message: 'Subscription canceled' };
  }

  async handleCheckoutSessionCompleted(sessionId: string) {
    const session = await this.stripeService.getCheckoutSession(sessionId);

    if (!session.metadata?.subscriptionId) {
      throw new BadRequestException('Invalid session metadata');
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { id: session.metadata.subscriptionId },
      include: {
        user: true,
        plan: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Normalizar tipos do Stripe para string | null
    const stripeCustomerId =
      typeof session.customer === 'string' ? session.customer : null;

    const stripeSubscriptionId =
      typeof session.subscription === 'string' ? session.subscription : null;

    // Calcular período da assinatura
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    // Atualizar assinatura com IDs do Stripe e período
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        stripeCustomerId,
        stripeSubscriptionId,
        status: 'ACTIVE',
        currentPeriodStart,
        currentPeriodEnd,
      },
    });

    // Enviar email de boas-vindas
    try {
      await this.emailService.sendWelcomeEmail(
        subscription.user.email,
        subscription.user.name,
      );
      console.log('✅ Welcome email sent to:', subscription.user.email);
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      // Não falhar o webhook por causa do email
    }

    return subscription;
  }

  async handleInvoicePaymentSucceeded(invoiceId: string) {
    const invoice = await this.stripeService.getInvoice(invoiceId);

    const stripeSubscriptionId =
      typeof invoice.subscription === 'string' ? invoice.subscription : null;

    if (!stripeSubscriptionId) {
      // Nada para vincular
      return;
    }

    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId },
      include: {
        user: true,
        plan: {
          include: { tenant: true },
        },
      },
    });

    if (!subscription) {
      return;
    }

    // Normalizar payment_intent para string | null
    const stripePaymentIntentId =
      typeof invoice.payment_intent === 'string'
        ? invoice.payment_intent
        : invoice.payment_intent &&
          typeof (invoice.payment_intent as any).id === 'string'
        ? ((invoice.payment_intent as any).id as string)
        : null;

    // Criar registro de pagamento
    await this.prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        tenantId: subscription.plan.tenantId,
        stripePaymentIntentId,
        amountCents: invoice.amount_paid,
        status: 'PAID',
      },
    });

    // Atualizar período da assinatura
    // Calcular próxima cobrança: se period_end for hoje ou passado, adicionar 1 mês
    let nextBillingDate = new Date(invoice.period_end * 1000);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (nextBillingDate <= today) {
      // Se a data do Stripe for hoje ou passado, calcular próximo mês
      nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }
    
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: new Date(invoice.period_start * 1000),
        currentPeriodEnd: nextBillingDate,
      },
    });

    // Enviar email de confirmação de pagamento
    try {
      const amountFormatted = `R$ ${(invoice.amount_paid / 100).toFixed(2).replace('.', ',')}`;
      const nextBillingFormatted = nextBillingDate.toLocaleDateString('pt-BR');
      
      await this.emailService.sendPaymentConfirmationEmail(
        subscription.user.email,
        subscription.user.name,
        subscription.plan.name,
        amountFormatted,
        nextBillingFormatted,
      );
      console.log('✅ Payment confirmation email sent to:', subscription.user.email);
    } catch (error) {
      console.error('❌ Failed to send payment confirmation email:', error);
      // Não falhar o webhook por causa do email
    }
  }

  async handleInvoicePaymentFailed(invoiceId: string) {
    const invoice = await this.stripeService.getInvoice(invoiceId);

    const stripeSubscriptionId =
      typeof invoice.subscription === 'string' ? invoice.subscription : null;

    if (!stripeSubscriptionId) {
      return;
    }

    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      return;
    }

    const stripePaymentIntentId =
      typeof invoice.payment_intent === 'string'
        ? invoice.payment_intent
        : invoice.payment_intent &&
          typeof (invoice.payment_intent as any).id === 'string'
        ? ((invoice.payment_intent as any).id as string)
        : null;

    // Registrar pagamento falho
    await this.prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        tenantId: subscription.plan.tenantId,
        stripePaymentIntentId,
        amountCents: invoice.amount_due,
        status: 'FAILED',
      },
    });

    // Atualizar status da assinatura
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'PAST_DUE' },
    });
  }

  async handleSubscriptionDeleted(stripeSubscriptionId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId },
    });

    if (!subscription) {
      return;
    }

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'CANCELED' },
    });
  }

  async pauseSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (!subscription) {
      throw new NotFoundException('Assinatura ativa não encontrada');
    }

    // Pausar no Stripe (se tiver integração)
    if (subscription.stripeSubscriptionId) {
      try {
        // Stripe permite pausar cobranças usando pause_collection
        // Por simplicidade, vamos apenas atualizar o status local
        // Em produção, você pode usar: stripe.subscriptions.update(id, { pause_collection: { behavior: 'void' } })
      } catch (error) {
        console.error('Erro ao pausar no Stripe:', error);
      }
    }

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'PAUSED' },
    });

    return { message: 'Assinatura pausada com sucesso' };
  }

  async resumeSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: 'PAUSED' },
    });

    if (!subscription) {
      throw new NotFoundException('Assinatura pausada não encontrada');
    }

    // Reativar no Stripe (se tiver integração)
    if (subscription.stripeSubscriptionId) {
      try {
        // Em produção: stripe.subscriptions.update(id, { pause_collection: '' })
      } catch (error) {
        console.error('Erro ao reativar no Stripe:', error);
      }
    }

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'ACTIVE' },
    });

    return { message: 'Assinatura reativada com sucesso' };
  }
}
