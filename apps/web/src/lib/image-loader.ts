"use client";

/**
 * Custom Next.js Image loader that automatically prefixes basePath
 * (e.g. /a1-agency-website on GitHub Pages) to root-relative asset URLs.
 */
export default function imageLoader({
  src,
}: {
  src: string;
  width?: number;
  quality?: number;
}) {
  if (!src) return "";
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  ) {
    return src;
  }

  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const clean = src.startsWith("/") ? src : `/${src}`;
  if (base && clean.startsWith(`${base}/`)) {
    return clean;
  }
  return `${base}${clean}`;
}

