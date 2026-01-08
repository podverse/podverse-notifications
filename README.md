# podverse-notifications

Push notification module for Podverse. Handles notification orchestration for multiple services.

## Features

- **Web Push** - Native browser push notifications using the W3C Push API (no third-party dependency)
- **Firebase FCM** - Firebase Cloud Messaging for mobile apps (via podverse-external-services)
- **i18n Support** - Localized notification prefixes
- **Service Orchestration** - Unified API for sending notifications across multiple services

## Services

### Web Push (Native)

Web Push uses the W3C Push API standard. It's built into modern browsers and doesn't require any third-party service. The browser's built-in push service handles message delivery:

- **Chrome/Edge**: Google's push service
- **Firefox**: Mozilla's push service  
- **Safari**: Apple's push service

### Firebase FCM (Third-Party)

Firebase Cloud Messaging is used for mobile app notifications (iOS/Android). This is handled by `podverse-external-services` since it's a third-party dependency.

## Installation

```bash
npm install podverse-notifications
```

## Configuration

### Environment Variables

```env
# Web Push Configuration
WEBPUSH_ENABLED=true
WEBPUSH_VAPID_PUBLIC_KEY=your-vapid-public-key
WEBPUSH_VAPID_PRIVATE_KEY=your-vapid-private-key
WEBPUSH_VAPID_SUBJECT=mailto:contact@podverse.fm

# Web URL Configuration (for notification links)
WEB_PROTOCOL=https
WEB_DOMAIN=podverse.fm
WEB_ICON_IMAGE_PATH=https://podverse.fm/favicon/web-app-manifest-192x192.png
```

### Environment-Specific Configuration

#### Local Development

For local development, set environment variables in your `.env` file or shell:

```env
WEBPUSH_ENABLED=true
WEBPUSH_VAPID_PUBLIC_KEY=your-dev-vapid-public-key
WEBPUSH_VAPID_PRIVATE_KEY=your-dev-vapid-private-key
WEBPUSH_VAPID_SUBJECT=mailto:dev@example.com

WEB_PROTOCOL=http
WEB_DOMAIN=localhost:3000
```

#### Alpha/Staging

For alpha/staging environments, configure via Docker environment or secrets:

```env
WEBPUSH_ENABLED=true
WEBPUSH_VAPID_PUBLIC_KEY=your-alpha-vapid-public-key
WEBPUSH_VAPID_PRIVATE_KEY=your-alpha-vapid-private-key
WEBPUSH_VAPID_SUBJECT=mailto:contact@podverse.fm

WEB_PROTOCOL=https
WEB_DOMAIN=alpha.podverse.fm
```

#### Production

For production, use secrets management (Kubernetes secrets, Docker secrets, etc.):

```env
WEBPUSH_ENABLED=true
WEBPUSH_VAPID_PUBLIC_KEY=your-production-vapid-public-key
WEBPUSH_VAPID_PRIVATE_KEY=your-production-vapid-private-key  # Keep secret!
WEBPUSH_VAPID_SUBJECT=mailto:contact@podverse.fm

WEB_PROTOCOL=https
WEB_DOMAIN=podverse.fm
```

### Key Matching Requirement

**Important:** The VAPID public key in `podverse-notifications` (backend) must match the key in `podverse-web` (frontend):

| Service | Environment Variable | Key Type |
|---------|---------------------|----------|
| podverse-web | `NEXT_PUBLIC_WEBPUSH_VAPID_PUBLIC_KEY` | Public only |
| podverse-notifications | `WEBPUSH_VAPID_PUBLIC_KEY` | Public |
| podverse-notifications | `WEBPUSH_VAPID_PRIVATE_KEY` | Private (secret) |

If keys don't match, push notifications will fail with authentication errors.

## Generating VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for Web Push notifications.

### Method 1: Using web-push CLI (Recommended)

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

Output:
```
=======================================

Public Key:
BNxIq7...your-public-key...

Private Key:
AkT3Xy...your-private-key...

=======================================
```

### Method 2: Using npx (No Install)

```bash
npx web-push generate-vapid-keys
```

### Method 3: Using Node.js Script

```javascript
const webpush = require('web-push');
const keys = webpush.generateVAPIDKeys();
console.log('Public Key:', keys.publicKey);
console.log('Private Key:', keys.privateKey);
```

### Important Notes

- **Keep the private key secret** - Only the backend needs it
- **Use the same key pair everywhere** - Frontend (public only) and backend (public + private) must use the same key pair
- **Don't regenerate unnecessarily** - Changing keys invalidates all existing push subscriptions
- **VAPID subject** - Should be a `mailto:` or `https://` URL identifying your service

## Usage

### Notification Orchestrator

The main entry point for sending notifications:

```typescript
import { notificationOrchestrator } from 'podverse-notifications';

// Send Web Push notifications (native, no third-party)
// The endpoint URL is provided by the browser when the user subscribes
await notificationOrchestrator({
  service: 'webpush',
  subscriptions: [
    {
      endpoint: 'https://push.example.com/...', // Browser-provided endpoint
      keys: {
        p256dh: 'public-key-from-subscription',
        auth: 'auth-secret-from-subscription'
      }
    }
  ],
  messageText: 'New Episode: My Podcast',
  messageType: 'new-episode',
  locale: 'en',
  linkIdText: 'episode-id-text'
});

// Send Firebase FCM notifications (for mobile apps)
await notificationOrchestrator({
  service: 'firebase',
  tokens: ['fcm-token-1', 'fcm-token-2'],
  platform: 'android', // or 'ios'
  messageText: 'New Episode: My Podcast',
  messageType: 'new-episode',
  locale: 'en',
  linkIdText: 'episode-id-text'
});
```

### Message Types

Supported notification message types:

| Type | Description |
|------|-------------|
| `new` | Generic new content |
| `new-episode` | New podcast episode |
| `new-podcast` | New podcast added |
| `new-video` | New video |
| `new-video-channel` | New video channel |
| `new-track` | New music track |
| `new-album` | New music album |
| `livestream-started` | Livestream is now live |
| `livestream-scheduled` | Livestream scheduled |

### Direct Web Push API

For lower-level access:

```typescript
import { 
  sendWebPushNotificationBatch,
  WebPushSubscription 
} from 'podverse-notifications';

const subscriptions: WebPushSubscription[] = [
  {
    endpoint: 'https://...',
    keys: { p256dh: '...', auth: '...' }
  }
];

const results = await sendWebPushNotificationBatch(subscriptions, {
  title: 'Notification Title',
  body: 'Notification body text',
  icon: 'https://example.com/icon.png',
  link: '/episode/abc123'
});
```

## Architecture

```
podverse-notifications/
├── src/
│   ├── config/
│   │   └── index.ts              # Configuration and URL helpers
│   ├── services/
│   │   ├── notifications/
│   │   │   ├── i18nNotifications.ts    # Localized message prefixes
│   │   │   ├── notificationOrchestrator.ts  # Main orchestrator
│   │   │   └── index.ts
│   │   └── webpush/
│   │       ├── webpushAdmin.ts         # web-push initialization
│   │       ├── webpushHelpers.ts       # Types and utilities
│   │       ├── webpushNotification.ts  # Send notifications
│   │       ├── webpushNotificationOrchestrator.ts
│   │       └── index.ts
│   └── index.ts
```

## License

AGPLv3
