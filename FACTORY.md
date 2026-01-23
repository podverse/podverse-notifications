# Factory Function: createNotificationsContext

## Overview

The `createNotificationsContext` function is the factory function for creating a notifications context. This function initializes WebPush service for sending browser push notifications and provides helper functions for generating web URLs.

The WebPush service is only initialized if `enabled` is `true` and valid VAPID keys are provided. If initialization fails, the context will still be returned but with `webpushAdmin` set to `null` and `isWebPushEnabled` set to `false`.

## Function Signature

```typescript
export function createNotificationsContext(config: NotificationsConfig): NotificationsContext
```

## Parameters

### `config: NotificationsConfig` (Required)

The notifications configuration object with the following structure:

#### `brandName: string` (Required)

Brand name for notifications (e.g., `"Podverse"`)

#### `web: WebConfig` (Required)

Web configuration for helper functions:

- **`protocol: string`** (Required) - Web protocol (`http` or `https`)
- **`host: string`** (Required) - Web hostname (e.g., `localhost:3000` or `podverse.fm`)
- **`icon_image_path: string`** (Required) - Path to web icon image (e.g., `icon.png` or `/icon.png`)

#### `webpush: WebPushConfig` (Required)

WebPush configuration:

- **`enabled: boolean`** (Required) - Whether WebPush notifications are enabled
  - If `false`, WebPush will not be initialized
  - If `true`, VAPID keys must be provided

- **`vapid_public_key: string`** (Required)
  - VAPID public key for WebPush
  - Required when `enabled` is `true`
  - Must not be empty or whitespace

- **`vapid_private_key: string`** (Required)
  - VAPID private key for WebPush
  - Required when `enabled` is `true`
  - Must not be empty or whitespace

- **`vapid_subject: string`** (Required)
  - VAPID subject (usually an email address or URL)
  - Required when `enabled` is `true`
  - Example: `"mailto:admin@podverse.fm"` or `"https://podverse.fm"`

## Return Type

### `NotificationsContext`

Returns an object with the following properties:

- **`config: NotificationsConfig`** - The configuration object that was passed in
- **`webpushAdmin: typeof webpush | null`** - WebPush library instance, or `null` if not initialized
- **`isWebPushEnabled: boolean`** - Whether WebPush is enabled and successfully initialized
- **`getWebBaseUrl: () => string`** - Helper function that returns the base web URL (e.g., `https://podverse.fm`)
- **`getWebBaseUrlWithPath: (path: string) => string`** - Helper function that returns the base web URL with a path appended (automatically adds leading slash if missing)
- **`getWebIconImageUrl: () => string`** - Helper function that returns the full URL to the web icon image

## Important Notes

### WebPush Initialization

- WebPush is only initialized if `enabled` is `true`
- If `vapid_public_key` or `vapid_private_key` is missing or empty when `enabled` is `true`, initialization will fail and an error will be logged
- If initialization fails (e.g., invalid VAPID keys), the context will still be returned but with `webpushAdmin` set to `null`
- The VAPID details are set using `webpush.setVapidDetails()` which configures the library globally

### Error Handling

The factory function handles errors gracefully:
- If WebPush is disabled, a warning is logged
- If WebPush is enabled but VAPID keys are missing, an error is logged and `isWebPushEnabled` is set to `false`
- If WebPush initialization fails (e.g., invalid VAPID keys), an error is logged and `isWebPushEnabled` is set to `false`
- The function never throws - it always returns a valid `NotificationsContext` object

### Helper Functions

The helper functions are bound to the config and can be used to generate URLs:
- `getWebBaseUrl()` - Returns `${protocol}://${host}`
- `getWebBaseUrlWithPath(path)` - Returns `${protocol}://${host}${path}` (automatically adds leading slash to path if missing)
- `getWebIconImageUrl()` - Returns `${protocol}://${host}${icon_image_path}`

## Dependencies

This factory function has no dependencies on other factory functions. It can be called independently.

## Example Usage

```typescript
import { createNotificationsContext } from 'podverse-notifications';

// Build configuration from environment variables
const notificationsConfig = {
  brandName: process.env.BRAND_NAME || 'Podverse',
  web: {
    protocol: process.env.WEB_PROTOCOL || 'https',
    host: process.env.WEB_DOMAIN || 'podverse.fm',
    icon_image_path: process.env.WEB_ICON_IMAGE_PATH || '/icon.png',
  },
  webpush: {
    enabled: process.env.WEBPUSH_ENABLED === 'true',
    vapid_public_key: process.env.WEBPUSH_VAPID_PUBLIC_KEY || '',
    vapid_private_key: process.env.WEBPUSH_VAPID_PRIVATE_KEY || '',
    vapid_subject: process.env.WEBPUSH_VAPID_SUBJECT || 'mailto:admin@podverse.fm',
  }
};

// Create Notifications context
const notificationsContext = createNotificationsContext(notificationsConfig);

// Check if WebPush is enabled
if (notificationsContext.isWebPushEnabled) {
  // Use WebPush to send notifications
  await notificationsContext.webpushAdmin!.sendNotification(
    subscription,
    JSON.stringify(payload)
  );
} else {
  console.log('WebPush is not enabled or initialization failed');
}

// Use helper functions
const baseUrl = notificationsContext.getWebBaseUrl(); // "https://podverse.fm"
const profileUrl = notificationsContext.getWebBaseUrlWithPath('profile'); // "https://podverse.fm/profile"
const iconUrl = notificationsContext.getWebIconImageUrl(); // "https://podverse.fm/icon.png"
```

## Related Files

- **Factory implementation**: `src/factory.ts`
- **Configuration types**: `src/config/types.ts`
