export const config = {
  web: {
    protocol: process.env.WEB_PROTOCOL || "http",
    host: process.env.WEB_DOMAIN || "localhost",
    icon_image_path: process.env.WEB_ICON_IMAGE_PATH || ""
  },
  webpush: {
    enabled: process.env.WEBPUSH_ENABLED === "true",
    vapid_public_key: process.env.WEBPUSH_VAPID_PUBLIC_KEY || "",
    vapid_private_key: process.env.WEBPUSH_VAPID_PRIVATE_KEY || "",
    vapid_subject: process.env.WEBPUSH_VAPID_SUBJECT || "mailto:contact@podverse.fm"
  }
}

export function getWebBaseUrl(): string {
  return `${config.web.protocol}://${config.web.host}`;
}

export function getWebBaseUrlWithPath(path: string): string {
  const base = getWebBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export function getWebIconImageUrl(): string {
  return `${getWebBaseUrl()}${config.web.icon_image_path}`;
}
