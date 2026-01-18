import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

// Interface para tenant context
interface TenantContext {
  id: string;
  slug: string;
  name: string;
}

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * NOTA: Admin é considerado GLOBAL (superadmin) nesta implementação.
   * Se precisar de admin por tenant, adicione tenantId como parâmetro
   * e filtre todas as queries por tenant.
   * 
   * Para habilitar filtro por tenant, descomente as linhas com tenantFilter
   * e passe tenant como parâmetro em cada método.
   */

  async getStats(tenant?: TenantContext) {
    // Filtro opcional por tenant (descomente para habilitar)
    const tenantFilter = tenant ? { tenantId: tenant.id } : {};
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeSubscriptions,
      pendingSubscriptions,
      canceledSubscriptions,
      pausedSubscriptions,
      newUsersLast30Days,
      newSubscriptionsLast30Days,
      canceledLast30Days,
      canceledPrevious30Days,
    ] = await Promise.all([
      this.prisma.user.count({ where: tenantFilter }),
      this.prisma.subscription.count({ where: { status: 'ACTIVE', ...tenantFilter } }),
      this.prisma.subscription.count({ where: { status: 'PENDING', ...tenantFilter } }),
      this.prisma.subscription.count({ where: { status: 'CANCELED', ...tenantFilter } }),
      this.prisma.subscription.count({ where: { status: 'PAUSED', ...tenantFilter } }),
      this.prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo }, ...tenantFilter },
      }),
      this.prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          createdAt: { gte: thirtyDaysAgo },
          ...tenantFilter,
        },
      }),
      this.prisma.subscription.count({
        where: {
          status: 'CANCELED',
          updatedAt: { gte: thirtyDaysAgo },
          ...tenantFilter,
        },
      }),
      this.prisma.subscription.count({
        where: {
          status: 'CANCELED',
          updatedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
          ...tenantFilter,
        },
      }),
    ]);

    // Buscar assinaturas ativas com preços
    const activeWithPlan = await this.prisma.subscription.findMany({
      where: { status: 'ACTIVE', ...tenantFilter },
      include: {
        plan: {
          include: {
            prices: {
              where: { active: true },
            },
          },
        },
      },
    });

    // Calcular MRR (Monthly Recurring Revenue)
    let mrr = 0;
    let monthlyCount = 0;
    let yearlyCount = 0;

    activeWithPlan.forEach((sub) => {
      const monthlyPrice = sub.plan?.prices?.find(p => p.interval === 'MONTHLY');
      const yearlyPrice = sub.plan?.prices?.find(p => p.interval === 'YEARLY');
      
      // Determinar qual preço usar baseado no stripePriceId da assinatura
      if (sub.stripePriceId && yearlyPrice?.stripePriceId === sub.stripePriceId) {
        // Assinatura anual - dividir por 12 para MRR
        mrr += (yearlyPrice.amountCents || 0) / 12;
        yearlyCount++;
      } else if (monthlyPrice) {
        mrr += monthlyPrice.amountCents || 0;
        monthlyCount++;
      }
    });

    // ARR (Annual Recurring Revenue)
    const arr = mrr * 12;

    // Churn rate (cancelados nos últimos 30 dias / ativos no início do período)
    const activeAtStartOfPeriod = activeSubscriptions + canceledLast30Days;
    const churnRate = activeAtStartOfPeriod > 0 
      ? (canceledLast30Days / activeAtStartOfPeriod) * 100 
      : 0;

    // Crescimento de churn (comparado ao período anterior)
    const previousChurnRate = (activeSubscriptions + canceledPrevious30Days) > 0
      ? (canceledPrevious30Days / (activeSubscriptions + canceledPrevious30Days)) * 100
      : 0;
    const churnTrend = churnRate - previousChurnRate;

    // Ticket médio mensal
    const averageTicket = activeSubscriptions > 0 ? mrr / activeSubscriptions : 0;

    // Dados históricos dos últimos 6 meses para gráfico
    const mrrHistory = await this.getMrrHistory(6);

    return {
      // Métricas básicas
      totalUsers,
      activeSubscriptions,
      pendingSubscriptions,
      canceledSubscriptions,
      pausedSubscriptions,
      
      // Métricas de receita
      mrr: Math.round(mrr),
      arr: Math.round(arr),
      monthlyRevenue: Math.round(mrr), // Mantém compatibilidade
      averageTicket: Math.round(averageTicket),
      
      // Distribuição de planos
      monthlySubscribers: monthlyCount,
      yearlySubscribers: yearlyCount,
      
      // Métricas de crescimento
      newUsersLast30Days,
      newSubscriptionsLast30Days,
      
      // Métricas de churn
      canceledLast30Days,
      churnRate: Math.round(churnRate * 100) / 100,
      churnTrend: Math.round(churnTrend * 100) / 100,

      // Histórico para gráficos
      mrrHistory,
    };
  }

  private async getMrrHistory(months: number) {
    const history = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      // Contar assinaturas ativas no final de cada mês
      const activeCount = await this.prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          createdAt: { lte: endOfMonth },
        },
      });

      // Contar novos usuários no mês
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const newUsers = await this.prisma.user.count({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      // Estimar MRR baseado em assinaturas ativas (simplificado)
      const avgTicket = 8990; // R$ 89,90 médio
      const estimatedMrr = activeCount * avgTicket;

      history.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
        year: date.getFullYear(),
        mrr: estimatedMrr,
        subscribers: activeCount,
        newUsers,
      });
    }

    return history;
  }

  async getUsers(page = 1, limit = 20, search?: string, tenant?: TenantContext) {
    const skip = (page - 1) * limit;
    const tenantFilter = tenant ? { tenantId: tenant.id } : {};
    
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
          ...tenantFilter,
        }
      : tenantFilter;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          subscriptions: {
            include: {
              plan: true,
            },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        subscription: user.subscriptions[0]
          ? {
              status: user.subscriptions[0].status,
              plan: user.subscriptions[0].plan,
            }
          : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSubscriptions(page = 1, limit = 20, status?: string, tenant?: TenantContext) {
    const skip = (page - 1) * limit;
    const tenantFilter = tenant ? { tenantId: tenant.id } : {};
    
    const where = status && status !== 'all' 
      ? { status: status as any, ...tenantFilter } 
      : tenantFilter;

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          plan: {
            select: {
              name: true,
            },
          },
        },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      data: subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSubscriptionById(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: {
              include: {
                address: true,
              },
            },
          },
        },
        plan: {
          include: {
            prices: {
              where: { active: true },
            },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!subscription) return null;

    // Determinar o intervalo de cobrança baseado no stripePriceId da assinatura
    let billingInterval = 'MONTHLY';
    if (subscription.stripePriceId) {
      const price = subscription.plan.prices.find(
        (p) => p.stripePriceId === subscription.stripePriceId,
      );
      if (price) {
        billingInterval = price.interval;
      }
    }

    return {
      ...subscription,
      billingInterval,
    };
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        subscriptions: {
          include: {
            plan: true,
            payments: true,
          },
        },
      },
    });
  }

  async getDeliveries(month?: number, year?: number, tenant?: TenantContext) {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();
    const tenantFilter = tenant ? { tenantId: tenant.id } : {};

    // Buscar assinaturas ativas com endereço
    const subscriptions = await this.prisma.subscription.findMany({
      where: { status: 'ACTIVE', ...tenantFilter },
      include: {
        user: {
          include: {
            profile: {
              include: {
                address: true,
              },
            },
          },
        },
        plan: {
          include: {
            prices: {
              where: { active: true },
            },
          },
        },
        deliveries: {
          where: {
            referenceMonth: targetMonth,
            referenceYear: targetYear,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return subscriptions.map((sub) => {
      // Determinar intervalo de cobrança
      let billingInterval = 'MONTHLY';
      if (sub.stripePriceId) {
        const price = sub.plan.prices.find(
          (p) => p.stripePriceId === sub.stripePriceId,
        );
        if (price) {
          billingInterval = price.interval;
        }
      }

      // Pegar entrega do mês atual ou null
      const delivery = sub.deliveries[0] || null;

      return {
        id: sub.id,
        subscriptionId: sub.id,
        deliveryId: delivery?.id || null,
        customerName: sub.user.name,
        customerEmail: sub.user.email,
        customerPhone: (sub.user as any).phone || null,
        planName: sub.plan.name,
        billingInterval,
        subscriptionStatus: sub.status,
        deliveryStatus: delivery?.status || 'PENDING',
        trackingCode: delivery?.trackingCode || null,
        trackingUrl: delivery?.trackingUrl || null,
        shippedAt: delivery?.shippedAt || null,
        deliveredAt: delivery?.deliveredAt || null,
        notes: delivery?.notes || null,
        address: sub.user.profile?.address
          ? {
              street: sub.user.profile.address.street,
              number: sub.user.profile.address.number,
              complement: sub.user.profile.address.complement,
              district: sub.user.profile.address.district,
              city: sub.user.profile.address.city,
              state: sub.user.profile.address.state,
              zipCode: sub.user.profile.address.zipCode,
            }
          : null,
        nextDelivery: sub.currentPeriodEnd,
        referenceMonth: targetMonth,
        referenceYear: targetYear,
      };
    });
  }

  async updateDeliveryStatus(
    subscriptionId: string,
    month: number,
    year: number,
    data: {
      status?: string;
      trackingCode?: string;
      trackingUrl?: string;
      notes?: string;
    },
  ) {
    // Buscar subscription para obter tenantId
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Upsert - criar ou atualizar entrega
    const delivery = await this.prisma.delivery.upsert({
      where: {
        subscriptionId_referenceMonth_referenceYear: {
          subscriptionId,
          referenceMonth: month,
          referenceYear: year,
        },
      },
      update: {
        status: data.status as any,
        trackingCode: data.trackingCode,
        trackingUrl: data.trackingUrl,
        notes: data.notes,
        shippedAt: data.status === 'SHIPPED' ? new Date() : undefined,
        deliveredAt: data.status === 'DELIVERED' ? new Date() : undefined,
      },
      create: {
        subscriptionId,
        tenantId: subscription.plan.tenantId,
        referenceMonth: month,
        referenceYear: year,
        status: (data.status as any) || 'PENDING',
        trackingCode: data.trackingCode,
        trackingUrl: data.trackingUrl,
        notes: data.notes,
      },
    });

    // Enviar email quando status mudar para SHIPPED
    if (data.status === 'SHIPPED') {
      const subscription = await this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { user: true },
      });

      if (subscription?.user) {
        const trackingUrl = data.trackingUrl || 
          (data.trackingCode ? `https://www.linkcorreios.com.br/?id=${data.trackingCode}` : null);
        
        this.emailService.sendDeliveryShippedEmail(
          subscription.user.email,
          subscription.user.name,
          data.trackingCode || null,
          trackingUrl,
        ).catch((err) => console.error('Error sending delivery email:', err));
      }
    }

    return delivery;
  }

  async bulkUpdateDeliveryStatus(
    subscriptionIds: string[],
    month: number,
    year: number,
    status: string,
  ) {
    const results = await Promise.all(
      subscriptionIds.map((id) =>
        this.updateDeliveryStatus(id, month, year, { status }),
      ),
    );
    return { updated: results.length };
  }

  async exportDeliveriesCSV() {
    const deliveries = await this.getDeliveries();

    // Cabeçalho CSV
    const headers = [
      'Nome',
      'Email',
      'Telefone',
      'Plano',
      'Tipo',
      'Rua',
      'Número',
      'Complemento',
      'Bairro',
      'Cidade',
      'Estado',
      'CEP',
      'Próxima Entrega',
    ];

    // Linhas de dados
    const rows = deliveries.map((d) => [
      d.customerName,
      d.customerEmail,
      d.customerPhone || '',
      d.planName,
      d.billingInterval === 'YEARLY' ? 'Anual' : 'Mensal',
      d.address?.street || '',
      d.address?.number || '',
      d.address?.complement || '',
      d.address?.district || '',
      d.address?.city || '',
      d.address?.state || '',
      d.address?.zipCode || '',
      d.nextDelivery
        ? new Date(d.nextDelivery).toLocaleDateString('pt-BR')
        : '',
    ]);

    // Montar CSV
    const csvContent = [
      headers.join(';'),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'),
      ),
    ].join('\n');

    // Adicionar BOM para Excel reconhecer UTF-8
    return '\uFEFF' + csvContent;
  }

  async getPayments(page = 1, limit = 20, status?: string, tenant?: TenantContext) {
    const skip = (page - 1) * limit;
    const tenantFilter = tenant ? { subscription: { tenantId: tenant.id } } : {};
    
    const where = status && status !== 'all' 
      ? { status: status as any, ...tenantFilter } 
      : tenantFilter;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          subscription: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
              plan: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments.map((payment) => ({
        id: payment.id,
        amount: payment.amountCents / 100,
        status: payment.status,
        createdAt: payment.createdAt,
        customerName: payment.subscription.user.name,
        customerEmail: payment.subscription.user.email,
        planName: payment.subscription.plan.name,
        stripePaymentIntentId: payment.stripePaymentIntentId,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async fixSubscriptionDates() {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        user: true,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const results = [];

    for (const sub of subscriptions) {
      const currentEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;
      
      if (!currentEnd || currentEnd <= today) {
        const newStart = new Date();
        const newEnd = new Date();
        newEnd.setMonth(newEnd.getMonth() + 1);

        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: {
            currentPeriodStart: newStart,
            currentPeriodEnd: newEnd,
          },
        });

        results.push({
          email: sub.user.email,
          oldEnd: currentEnd?.toISOString() || null,
          newEnd: newEnd.toISOString(),
          status: 'updated',
        });
      } else {
        results.push({
          email: sub.user.email,
          currentEnd: currentEnd.toISOString(),
          status: 'skipped',
        });
      }
    }

    return {
      total: subscriptions.length,
      results,
    };
  }

  async deleteUser(userId: string) {
    try {
      // Buscar profile para pegar addressId antes de deletar
      const profile = await this.prisma.customerProfile.findUnique({
        where: { userId },
      });
      
      const addressId = profile?.addressId;

      // Deletar usuário - cascade cuida de: profile, subscriptions, payments, tokens
      await this.prisma.user.delete({
        where: { id: userId },
      });

      // Deletar address órfão (não tem cascade)
      if (addressId) {
        await this.prisma.address.delete({
          where: { id: addressId },
        }).catch(() => {
          // Ignora se address não existe
        });
      }

      return { message: 'User deleted successfully' };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}
