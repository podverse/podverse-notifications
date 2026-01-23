import { NotificationsContext } from '../../factory';
import { sendWebPushNotificationBatch } from './webpushNotification';
import { WebPushSubscription } from './webpushHelpers';

type WebPushOrchestratorParams = {
  subscriptions: WebPushSubscription[];
  finalText: string;
  body?: string;  // Secondary text (e.g., channel title)
  image?: string;  // Item/channel artwork for large preview
  link?: string;
  data?: Record<string, unknown>;
};

export async function webpushNotificationBatchOrchestrator(
  ctx: NotificationsContext,
  params: WebPushOrchestratorParams
) {
  const { subscriptions, finalText, body, image, link, data } = params;
  
  const payload = {
    title: finalText,
    body,
    image,
    link,
    data,
  };

  console.log(`[webpushNotificationBatchOrchestrator] Sending to ${subscriptions.length} subscriptions`);
  
  return await sendWebPushNotificationBatch(ctx, subscriptions, payload);
}
