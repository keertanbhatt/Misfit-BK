export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function uniqueSlug(base: string, suffix?: string): string {
  const slug = slugify(base) || "item";
  const extra =
    suffix ??
    Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  return `${slug}-${extra}`;
}
