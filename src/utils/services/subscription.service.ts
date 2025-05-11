import { SubscriptionRepo } from '@/features/subscription/subscription.repo';
import { subscriptionType } from '@/features/subscription/subscription.schema';

export class SubscriptionService {
  constructor(private subscriptionRepo = new SubscriptionRepo()) {}

  async getSubscription(userId: string): Promise<subscriptionType | null> {
    return this.subscriptionRepo.getPlanByUserId(userId);
  }

  async isActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getSubscription(userId);

    if (!subscription) return false;
    if (subscription.plan === 'free') return false;

    const now = new Date();
    const endAt = subscription.end_at ? new Date(subscription.end_at) : null;

    return !!(endAt && now <= endAt);
  }

  calculateRoomPlanPrice({
    isSubscribed,
    roomPlan,
    days,
  }: {
    isSubscribed: boolean;
    roomPlan: { price: number; subscription_price: number };
    days: number;
  }): number {
    const unitPrice = isSubscribed ? roomPlan.subscription_price : roomPlan.price;
    return unitPrice * days;
  }
}
