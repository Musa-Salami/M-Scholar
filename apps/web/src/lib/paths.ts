/** Internal page URLs for static export + Firebase trailingSlash. */
export function pageHref(path: string): string {
  if (!path || path === "/") return "/";
  if (
    path.startsWith("mailto:") ||
    path.startsWith("tel:") ||
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("#")
  ) {
    return path;
  }
  const hashIndex = path.indexOf("#");
  const queryIndex = path.indexOf("?");
  let pathname = path;
  let suffix = "";
  if (hashIndex >= 0) {
    suffix = path.slice(hashIndex);
    pathname = path.slice(0, hashIndex);
  } else if (queryIndex >= 0) {
    suffix = path.slice(queryIndex);
    pathname = path.slice(0, queryIndex);
  }
  if (/\.[a-z0-9]+$/i.test(pathname)) return path;
  const withSlash = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return `${withSlash}${suffix}`;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function mailtoHref(email: string): string {
  return `mailto:${email}`;
}
