import { BaseApi } from './baseApi';
import { User } from './types';

export interface PaymentActivationResponse {
  ok: boolean;
  user: User;
  email_sent: boolean;
  email_queued: boolean;
  already_active: boolean;
}

export class PaymentApi extends BaseApi {
  async simulateSuccessfulPayment(): Promise<PaymentActivationResponse> {
    return this.post<PaymentActivationResponse>('/payment/simulate-success');
  }
}

export const paymentApi = new PaymentApi();
