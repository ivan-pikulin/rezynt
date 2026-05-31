import { BaseApi } from './baseApi';
import { User } from './types';

export interface PaymentActivationResponse {
  ok: boolean;
  user: User;
  email_sent: boolean;
  email_queued: boolean;
  already_active: boolean;
}

export interface YookassaCheckoutResponse {
  payment_id: string;
  status: string;
  confirmation_url: string;
  return_url: string;
}

export class PaymentApi extends BaseApi {
  async createYookassaCheckout(): Promise<YookassaCheckoutResponse> {
    return this.post<YookassaCheckoutResponse>('/payment/checkout');
  }

  async simulateSuccessfulPayment(): Promise<PaymentActivationResponse> {
    return this.post<PaymentActivationResponse>('/payment/simulate-success');
  }
}

export const paymentApi = new PaymentApi();
