import { sendWebPushNotificationBatch } from './webpushNotification';
import { WebPushSubscription } from './webpushHelpers';

type WebPushOrchestratorParams = {
  subscriptions: WebPushSubscription[];
  finalText: string;
  icon?: string;
  link?: string;
  data?: Record<string, unknown>;
};

export async function webpushNotificationBatchOrchestrator(params: WebPushOrchestratorParams) {
  const { subscriptions, finalText, icon, link, data } = params;
  
  const payload = {
    title: finalText,
    body: '',
    icon,
    link,
    data,
  };

  console.log(`[webpushNotificationBatchOrchestrator] Sending to ${subscriptions.length} subscriptions`);
  
  return await sendWebPushNotificationBatch(subscriptions, payload);
}
