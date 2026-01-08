import { sendUPNotificationBatch } from './unifiedpushNotification';
import { UPSubscription } from './unifiedpushHelpers';

type UPOrchestratorParams = {
  subscriptions: UPSubscription[];
  finalText: string;
  body?: string;  // Secondary text (e.g., channel title)
  image?: string;  // Item/channel artwork for X-Attach
  link?: string;
  data?: Record<string, unknown>;
};

export async function unifiedpushNotificationBatchOrchestrator(params: UPOrchestratorParams) {
  const { subscriptions, finalText, body, image, link, data } = params;

  const payload = {
    title: finalText,
    body,
    image,
    link,
    data,
  };

  console.log(`[unifiedpushNotificationBatchOrchestrator] Sending to ${subscriptions.length} subscriptions`);

  return await sendUPNotificationBatch(subscriptions, payload);
}
