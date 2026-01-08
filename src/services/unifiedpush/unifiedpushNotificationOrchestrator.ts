import { sendUPNotificationBatch } from './unifiedpushNotification';
import { UPSubscription } from './unifiedpushHelpers';

type UPOrchestratorParams = {
  subscriptions: UPSubscription[];
  finalText: string;
  icon?: string;
  link?: string;
  data?: Record<string, unknown>;
};

export async function unifiedpushNotificationBatchOrchestrator(params: UPOrchestratorParams) {
  const { subscriptions, finalText, icon, link, data } = params;

  const payload = {
    title: finalText,
    body: '',
    icon,
    link,
    data,
  };

  console.log(`[unifiedpushNotificationBatchOrchestrator] Sending to ${subscriptions.length} subscriptions`);

  return await sendUPNotificationBatch(subscriptions, payload);
}
