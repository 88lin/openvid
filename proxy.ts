import { type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
  // Default every first-time visitor to the Chinese (defaultLocale) version
  // instead of auto-switching by the browser's Accept-Language header.
  // Set this back to `true` to re-enable automatic browser-language detection.
  localeDetection: false,
});

export default function proxy(request: NextRequest) {
  const country = request.headers.get("x-vercel-ip-country") || "UNKNOWN";
  const response = intlMiddleware(request);
  response.headers.set("x-user-country", country);
  return response;
}

export const config = {
  matcher: [
    "/((?!api|ffmpeg|models|hdri|_next/static|_next/image|sitemap.xml|robots.txt|site.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|avif|webm|wasm|js|glb|gltf|webmanifest|json|ico)$).*)",
  ],
};
