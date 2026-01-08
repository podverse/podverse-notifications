import webpush from 'web-push';
import { config } from '../../config';

let webpushInitialized = false;

if (!config.webpush.enabled) {
  console.warn("Web Push notifications are disabled in the configuration.");
} else if (!config.webpush.vapid_public_key || !config.webpush.vapid_private_key) {
  console.warn("Web Push VAPID keys are not configured.");
} else {
  console.log("Web Push notifications are enabled in the configuration.");
  
  try {
    webpush.setVapidDetails(
      config.webpush.vapid_subject,
      config.webpush.vapid_public_key,
      config.webpush.vapid_private_key
    );
    webpushInitialized = true;
    console.log("Web Push Admin Initialized Successfully");
  } catch (error) {
    console.error("Web Push Admin Initialization Failed:", error);
  }
}

export const webpushAdmin = webpushInitialized ? webpush : null;
export const isWebPushEnabled = webpushInitialized;
