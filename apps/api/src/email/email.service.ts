import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

// Interface para dados do tenant usados em emails
export interface TenantEmailConfig {
  name: string;
  slug: string;
  brandName?: string;
  supportEmail?: string;
  primaryColor?: string;
  logoUrl?: string;
}

// Fallback genérico da plataforma (nunca usar dados de tenant específico)
const PLATFORM_DEFAULTS: TenantEmailConfig = {
  name: 'ClubSaaS',
  slug: 'platform',
  brandName: 'ClubSaaS',
  supportEmail: 'suporte@clubsaas.com.br',
  primaryColor: '#4f46e5',
};

@Injectable()
export class EmailService {
  private resend: Resend | null = null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
      console.log('✅ Resend email service initialized');
    } else {
      console.warn('⚠️ RESEND_API_KEY not set - email service disabled (emails will be logged only)');
    }
  }

  // Helper para obter config do tenant com fallbacks
  private getTenantConfig(tenant?: TenantEmailConfig): TenantEmailConfig {
    return {
      name: tenant?.name || PLATFORM_DEFAULTS.name,
      slug: tenant?.slug || PLATFORM_DEFAULTS.slug,
      brandName: tenant?.brandName || tenant?.name || PLATFORM_DEFAULTS.brandName,
      supportEmail: tenant?.supportEmail || PLATFORM_DEFAULTS.supportEmail,
      primaryColor: tenant?.primaryColor || PLATFORM_DEFAULTS.primaryColor,
      logoUrl: tenant?.logoUrl,
    };
  }

  // Helper para gerar URL do tenant
  private getTenantUrl(tenantSlug: string, path: string = ''): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/t/${tenantSlug}${path}`;
  }

  async sendPasswordResetEmail(to: string, resetLink: string, tenant?: TenantEmailConfig) {
    const config = this.getTenantConfig(tenant);
    const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #1a1a2e; font-family: Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a2e; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #16213e; border-radius: 12px; overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 900; color: ${config.primaryColor};">
                        ${config.brandName}
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 20px 40px;">
                      <h2 style="color: #ffffff; margin: 0 0 20px; font-size: 22px;">Redefinição de Senha</h2>
                      <p style="color: #b0b0b0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Você solicitou a redefinição da sua senha. Clique no botão abaixo para criar uma nova senha:
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Button -->
                  <tr>
                    <td style="padding: 10px 40px 30px; text-align: center;">
                      <a href="${resetLink}" style="display: inline-block; background-color: ${config.primaryColor}; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Redefinir Senha
                      </a>
                    </td>
                  </tr>
                  
                  <!-- Warning -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <p style="color: #888888; font-size: 14px; line-height: 1.5; margin: 0;">
                        Este link expira em <strong>1 hora</strong>.<br>
                        Se você não solicitou esta redefinição, ignore este email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 40px; background-color: #0f1629; text-align: center;">
                      <p style="color: #666666; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} ${config.name}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

    // Se Resend não está configurado, apenas loga o email (modo dev)
    if (!this.resend) {
      console.log('📧 [DEV MODE] Password reset email would be sent to:', to);
      console.log('📧 [DEV MODE] Reset link:', resetLink);
      console.log('📧 [DEV MODE] Tenant:', config.name);
      return true;
    }

    try {
      // Usar email genérico da plataforma como remetente (domínio verificado)
      const { data, error } = await this.resend.emails.send({
        from: `${config.name} <noreply@clubsaas.com.br>`,
        to: [to],
        subject: `Redefinição de Senha - ${config.name}`,
        html: emailHtml,
      });

      if (error) {
        console.error('❌ Error sending email:', error);
        throw error;
      }

      console.log('✅ Password reset email sent to:', to, 'ID:', data?.id);
      return true;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, userName: string, tenant?: TenantEmailConfig, planFeatures?: string[]) {
    const config = this.getTenantConfig(tenant);
    const features = planFeatures || ['Produtos selecionados todo mês', 'Frete grátis', 'Acesso exclusivo'];
    
    const featuresHtml = features.map(f => `
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #ffffff10;">
          <table width="100%">
            <tr>
              <td style="width: 30px; vertical-align: top;">
                <span style="color: #22c55e; font-size: 16px;">✓</span>
              </td>
              <td>
                <p style="color: #ffffff; font-size: 15px; margin: 0; font-weight: 500;">${f}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #12121a; border-radius: 16px; overflow: hidden; border: 1px solid ${config.primaryColor}30;">
                <!-- Header with Logo -->
                <tr>
                  <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(180deg, #1a1a25 0%, #12121a 100%);">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 900; color: ${config.primaryColor};">
                      ${config.brandName}
                    </h1>
                  </td>
                </tr>
                
                <!-- Welcome Badge -->
                <tr>
                  <td style="padding: 0 40px 20px; text-align: center;">
                    <div style="display: inline-block; background-color: ${config.primaryColor}20; border: 1px solid ${config.primaryColor}40; border-radius: 50px; padding: 8px 20px;">
                      <span style="color: ${config.primaryColor}; font-size: 14px; font-weight: 600;">Bem-vindo ao Clube!</span>
                    </div>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 10px 40px 30px;">
                    <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 10px; text-align: center;">
                      Olá <strong style="color: #ffffff;">${userName}</strong>,
                    </p>
                    <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0; text-align: center;">
                      Sua assinatura foi confirmada com sucesso!
                    </p>
                  </td>
                </tr>

                <!-- Features Card -->
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; border-radius: 12px; border: 1px solid #ffffff10;">
                      ${featuresHtml}
                    </table>
                  </td>
                </tr>
                
                <!-- Button -->
                <tr>
                  <td style="padding: 0 40px 40px; text-align: center;">
                    <a href="${this.getTenantUrl(config.slug, '/minha-assinatura')}" style="display: inline-block; background: ${config.primaryColor}; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 700; font-size: 15px;">
                      Ver Minha Assinatura
                    </a>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #0a0a0f; border-top: 1px solid #ffffff10; text-align: center;">
                    <p style="color: #444444; font-size: 12px; margin: 0 0 10px;">
                      © ${new Date().getFullYear()} ${config.name}
                    </p>
                    <p style="color: #666666; font-size: 12px; margin: 0;">
                      Dúvidas? <a href="mailto:${config.supportEmail}" style="color: ${config.primaryColor}; text-decoration: none;">${config.supportEmail}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    if (!this.resend) {
      console.log('📧 [DEV MODE] Welcome email would be sent to:', to);
      console.log('📧 [DEV MODE] Tenant:', config.name);
      return true;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: `${config.name} <noreply@clubsaas.com.br>`,
        to: [to],
        subject: `Bem-vindo ao ${config.name}!`,
        html: emailHtml,
      });

      if (error) {
        console.error('❌ Error sending welcome email:', error);
        return false;
      }

      console.log('✅ Welcome email sent to:', to, 'ID:', data?.id);
      return true;
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      return false;
    }
  }

  async sendPaymentConfirmationEmail(
    to: string,
    userName: string,
    planName: string,
    amount: string,
    nextBillingDate: string,
    tenant?: TenantEmailConfig,
  ) {
    const config = this.getTenantConfig(tenant);
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #12121a; border-radius: 16px; overflow: hidden; border: 1px solid ${config.primaryColor}30;">
                <!-- Header with Logo -->
                <tr>
                  <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(180deg, #1a1a25 0%, #12121a 100%);">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 900; color: ${config.primaryColor};">
                      ${config.brandName}
                    </h1>
                  </td>
                </tr>
                
                <!-- Success Badge -->
                <tr>
                  <td style="padding: 0 40px 20px; text-align: center;">
                    <div style="display: inline-block; background-color: #22c55e20; border: 1px solid #22c55e40; border-radius: 50px; padding: 8px 20px;">
                      <span style="color: #22c55e; font-size: 14px; font-weight: 600;">✓ Pagamento Confirmado</span>
                    </div>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 10px 40px 30px;">
                    <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 10px; text-align: center;">
                      Olá <strong style="color: #ffffff;">${userName}</strong>,
                    </p>
                    <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0; text-align: center;">
                      Seu pagamento foi processado com sucesso!
                    </p>
                  </td>
                </tr>

                <!-- Payment Details Card -->
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; border-radius: 12px; border: 1px solid #ffffff10;">
                      <tr>
                        <td style="padding: 20px; border-bottom: 1px solid #ffffff10;">
                          <p style="color: #666666; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Plano</p>
                          <p style="color: #ffffff; font-size: 18px; margin: 5px 0 0; font-weight: 600;">${planName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px; border-bottom: 1px solid #ffffff10;">
                          <p style="color: #666666; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Valor Pago</p>
                          <p style="color: ${config.primaryColor}; font-size: 28px; margin: 5px 0 0; font-weight: 700;">${amount}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px;">
                          <p style="color: #666666; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Próxima Cobrança</p>
                          <p style="color: #ffffff; font-size: 18px; margin: 5px 0 0; font-weight: 500;">${nextBillingDate}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Button -->
                <tr>
                  <td style="padding: 0 40px 40px; text-align: center;">
                    <a href="${this.getTenantUrl(config.slug, '/minha-assinatura')}" style="display: inline-block; background: ${config.primaryColor}; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 700; font-size: 15px;">
                      Ver Minha Assinatura
                    </a>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #0a0a0f; border-top: 1px solid #ffffff10; text-align: center;">
                    <p style="color: #444444; font-size: 12px; margin: 0 0 10px;">
                      © ${new Date().getFullYear()} ${config.name}
                    </p>
                    <p style="color: #666666; font-size: 12px; margin: 0;">
                      Dúvidas? <a href="mailto:${config.supportEmail}" style="color: ${config.primaryColor}; text-decoration: none;">${config.supportEmail}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    if (!this.resend) {
      console.log('📧 [DEV MODE] Payment confirmation email would be sent to:', to);
      console.log('📧 [DEV MODE] Tenant:', config.name);
      return true;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: `${config.name} <noreply@clubsaas.com.br>`,
        to: [to],
        subject: `✅ Pagamento Confirmado - ${config.name}`,
        html: emailHtml,
      });

      if (error) {
        console.error('❌ Error sending payment confirmation email:', error);
        return false;
      }

      console.log('✅ Payment confirmation email sent to:', to, 'ID:', data?.id);
      return true;
    } catch (error) {
      console.error('❌ Error sending payment confirmation email:', error);
      return false;
    }
  }

  async sendDeliveryShippedEmail(
    to: string,
    userName: string,
    trackingCode: string | null,
    trackingUrl: string | null,
    tenant?: TenantEmailConfig,
  ) {
    const config = this.getTenantConfig(tenant);
    const trackingSection = trackingCode
      ? `
        <tr>
          <td style="padding: 20px;">
            <p style="color: #666666; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Código de Rastreio</p>
            <p style="color: ${config.primaryColor}; font-size: 20px; margin: 5px 0 0; font-weight: 700; font-family: monospace;">${trackingCode}</p>
            ${trackingUrl ? `<a href="${trackingUrl}" style="color: ${config.primaryColor}; font-size: 13px; text-decoration: underline;">Rastrear pedido →</a>` : ''}
          </td>
        </tr>
      `
      : '';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #12121a; border-radius: 16px; overflow: hidden; border: 1px solid ${config.primaryColor}30;">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(180deg, #1a1a25 0%, #12121a 100%);">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 900; color: ${config.primaryColor};">
                      ${config.brandName}
                    </h1>
                  </td>
                </tr>
                
                <!-- Badge -->
                <tr>
                  <td style="padding: 0 40px 20px; text-align: center;">
                    <div style="display: inline-block; background-color: #8b5cf620; border: 1px solid #8b5cf640; border-radius: 50px; padding: 8px 20px;">
                      <span style="color: #8b5cf6; font-size: 14px; font-weight: 600;">📦 Pedido Enviado!</span>
                    </div>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 10px 40px 30px;">
                    <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 10px; text-align: center;">
                      Olá <strong style="color: #ffffff;">${userName}</strong>,
                    </p>
                    <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0; text-align: center;">
                      Seu pedido está a caminho!
                    </p>
                  </td>
                </tr>

                <!-- Tracking Card -->
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; border-radius: 12px; border: 1px solid #ffffff10;">
                      ${trackingSection}
                      <tr>
                        <td style="padding: 20px; ${trackingCode ? 'border-top: 1px solid #ffffff10;' : ''}">
                          <p style="color: #888888; font-size: 14px; margin: 0; line-height: 1.5;">
                            Prazo estimado: <strong style="color: #ffffff;">3 a 7 dias úteis</strong><br>
                            Você receberá atualizações sobre a entrega.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #0a0a0f; border-top: 1px solid #ffffff10; text-align: center;">
                    <p style="color: #444444; font-size: 12px; margin: 0 0 10px;">
                      © ${new Date().getFullYear()} ${config.name}
                    </p>
                    <p style="color: #666666; font-size: 12px; margin: 0;">
                      Dúvidas? <a href="mailto:${config.supportEmail}" style="color: ${config.primaryColor}; text-decoration: none;">${config.supportEmail}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    if (!this.resend) {
      console.log('📧 [DEV MODE] Delivery shipped email would be sent to:', to);
      console.log('📧 [DEV MODE] Tenant:', config.name);
      return true;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: `${config.name} <noreply@clubsaas.com.br>`,
        to: [to],
        subject: `📦 Seu pedido foi enviado! - ${config.name}`,
        html: emailHtml,
      });

      if (error) {
        console.error('❌ Error sending delivery shipped email:', error);
        return false;
      }

      console.log('✅ Delivery shipped email sent to:', to, 'ID:', data?.id);
      return true;
    } catch (error) {
      console.error('❌ Error sending delivery shipped email:', error);
      return false;
    }
  }
}
