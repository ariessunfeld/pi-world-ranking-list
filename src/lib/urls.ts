export function withBase(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export function canonicalUrl(path: string) {
  const site = "https://ariessunfeld.github.io";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${site}${withBase(cleanPath)}`;
}
