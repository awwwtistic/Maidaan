export const SITE_NAME = "Maidaan";
export const SITE_TAGLINE = "Every Game. One Maidaan";
export const SITE_DESCRIPTION =
  "Maidaan is a fast, cinematic way to find live sport, upcoming fixtures and 24/7 channels, with streams from around the world in one place.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const STREAMED_URL = "https://streamed.pk";
export const STREAMED_DOCS_URL = "https://streamed.pk/docs";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/sports", label: "Sports" },
  { href: "/schedule", label: "Schedule" },
  { href: "/my-list", label: "My List" },
] as const;

export const MOBILE_NAV_LINKS = NAV_LINKS;
