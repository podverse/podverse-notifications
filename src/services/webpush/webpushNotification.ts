import { chunkArray } from 'podverse-helpers';
import { webpushAdmin } from './webpushAdmin';
import { WebPushSubscription } from './webpushHelpers';
import { getWebBaseUrl, getWebBaseUrlWithPath, getWebIconImageUrl } from '../../config';

type WebPushPayload = {
  title: string;
  body?: string;
  icon?: string;
  image?: string;
  link?: string;
  data?: Record<string, unknown>;
};

type WebPushResult = {
  success: boolean;
  endpoint: string;
  error?: string;
};

export async function sendWebPushNotificationBatch(
  subscriptions: WebPushSubscription[],
  payload: WebPushPayload
): Promise<WebPushResult[]> {
  if (!webpushAdmin) {
    throw new Error("Web Push Admin is not initialized");
  }

  const webpush = webpushAdmin;
  const chunks = chunkArray(subscriptions, 100);
  const allResults: WebPushResult[] = [];

  for (const chunk of chunks) {
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body || "",
      icon: payload.icon || getWebIconImageUrl(),
      image: payload.image,
      link: payload.link ? getWebBaseUrlWithPath(payload.link) : getWebBaseUrl(),
      data: payload.data,
    });

    const chunkResults = await Promise.allSettled(
      chunk.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys,
            },
            notificationPayload,
            {
              TTL: 86400, // 24 hours
              urgency: 'normal',
            }
          );
          return { success: true, endpoint: subscription.endpoint };
        } catch (error: any) {
          console.error(`Web Push send failed for ${subscription.endpoint}:`, error.message);
          return { 
            success: false, 
            endpoint: subscription.endpoint, 
            error: error.message || 'Unknown error' 
          };
        }
      })
    );

    for (const result of chunkResults) {
      if (result.status === 'fulfilled') {
        allResults.push(result.value);
      } else {
        allResults.push({ 
          success: false, 
          endpoint: 'unknown', 
          error: result.reason?.message || 'Promise rejected' 
        });
      }
    }
  }

  return allResults;
}
