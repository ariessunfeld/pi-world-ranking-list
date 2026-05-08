export function withBase(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export function canonicalUrl(path: string) {
  const site = "https://www.ariessunfeld.com";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${site}${withBase(cleanPath)}`;
}
