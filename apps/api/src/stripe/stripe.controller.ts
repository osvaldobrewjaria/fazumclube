import {
  Controller,
  Post,
  Req,
  BadRequestException,
  Headers,
  HttpCode,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature');
    }

    if (!req.rawBody) {
      throw new BadRequestException(
        'Webhook rawBody missing. Ensure raw-body middleware is enabled.',
      );
    }

    let event;

    try {
      event = this.stripeService.constructWebhookEvent(
        req.rawBody as Buffer,
        signature,
      );
    } catch (err: any) {
      console.error('❌ Webhook signature error:', err.message);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    console.log('✅ Webhook event received:', event.type);

    // Processar eventos
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.subscriptionsService.handleCheckoutSessionCompleted(
            event.data.object.id,
          );
          break;

        case 'invoice.payment_succeeded':
          await this.subscriptionsService.handleInvoicePaymentSucceeded(
            event.data.object.id,
          );
          break;

        case 'invoice.payment_failed':
          await this.subscriptionsService.handleInvoicePaymentFailed(
            event.data.object.id,
          );
          break;

        case 'customer.subscription.deleted':
          await this.subscriptionsService.handleSubscriptionDeleted(
            event.data.object.id,
          );
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (err: any) {
      console.error('❌ Error processing webhook event:', err.message);
      // Não lançar erro para o Stripe não reenviar
    }

    return { received: true };
  }
}
