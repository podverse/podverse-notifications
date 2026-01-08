import { firebaseNotificationBatchOrchestrator } from 'podverse-external-services';
import { webpushNotificationBatchOrchestrator } from '../webpush';
import { WebPushSubscription } from '../webpush';
import { unifiedpushNotificationBatchOrchestrator } from '../unifiedpush';
import { UPSubscription } from '../unifiedpush';
import { i18nNotifications, NotificationMessageType } from './i18nNotifications';

export type NotificationPlatform = 'web' | 'android' | 'ios';
export type NotificationService = 'firebase' | 'webpush' | 'unifiedpush';

/**
 * Gets the URL path prefix for a given notification message type
 */
function getLinkPathFromMessageType(messageType: NotificationMessageType): string {
  switch (messageType) {
  case 'new-episode':
    return '/episode';
  case 'new-podcast':
    return '/podcast';
  case 'new-video':
    return '/video';
  case 'new-video-channel':
    return '/channel';
  case 'new-track':
    return '/track';
  case 'new-album':
    return '/album';
  case 'livestream-started':
  case 'livestream-scheduled':
    return '/livestream';
  case 'new':
  default:
    return '';
  }
}

// Base params common to all services
type BaseNotificationOrchestratorParams = {
  messageText: string;
  messageType: NotificationMessageType;
  locale: string;
  icon?: string;
  linkIdText?: string;
  data?: Record<string, unknown>;
};

// Firebase-specific params
type FirebaseNotificationOrchestratorParams = BaseNotificationOrchestratorParams & {
  service: 'firebase';
  tokens: string[];
  platform: NotificationPlatform;
  channelId?: string;
  badge?: number;
  sound?: string;
};

// WebPush-specific params
type WebPushNotificationOrchestratorParams = BaseNotificationOrchestratorParams & {
  service: 'webpush';
  subscriptions: WebPushSubscription[];
};

// UnifiedPush-specific params
type UnifiedPushNotificationOrchestratorParams = BaseNotificationOrchestratorParams & {
  service: 'unifiedpush';
  subscriptions: UPSubscription[];
};

export type NotificationOrchestratorParams = 
  | FirebaseNotificationOrchestratorParams 
  | WebPushNotificationOrchestratorParams
  | UnifiedPushNotificationOrchestratorParams;

function getFinalText(messageText: string, messageType: NotificationMessageType, locale: string) {
  const baseLocale = locale.includes('-') ? locale.split('-')[0] : locale;
  const localeMap = i18nNotifications[locale] || i18nNotifications[baseLocale] || i18nNotifications.en;
  const prefix = localeMap[messageType] || i18nNotifications.en[messageType];
  return `${prefix}${messageText}`;
}

export async function notificationOrchestrator(params: NotificationOrchestratorParams) {
  const { service, messageText, messageType, locale, linkIdText, icon, data } = params;
  const finalText = getFinalText(messageText, messageType, locale);

  // Construct the link from messageType and linkIdText
  let link: string | undefined;
  if (linkIdText) {
    const pathPrefix = getLinkPathFromMessageType(messageType);
    link = pathPrefix ? `${pathPrefix}/${linkIdText}` : undefined;
  }

  switch (service) {
  case 'firebase': {
    const firebaseParams = params as FirebaseNotificationOrchestratorParams;
    return await firebaseNotificationBatchOrchestrator({
      tokens: firebaseParams.tokens,
      platform: firebaseParams.platform,
      finalText,
      link,
      icon,
      channelId: firebaseParams.channelId,
      badge: firebaseParams.badge,
      sound: firebaseParams.sound,
      data,
    });
  }

  case 'webpush': {
    const webpushParams = params as WebPushNotificationOrchestratorParams;
    return await webpushNotificationBatchOrchestrator({
      subscriptions: webpushParams.subscriptions,
      finalText,
      link,
      icon,
      data,
    });
  }

  case 'unifiedpush': {
    const upParams = params as UnifiedPushNotificationOrchestratorParams;
    return await unifiedpushNotificationBatchOrchestrator({
      subscriptions: upParams.subscriptions,
      finalText,
      link,
      icon,
      data,
    });
  }

  default:
    throw new Error(`Unsupported notification service: ${service}`);
  }
}
