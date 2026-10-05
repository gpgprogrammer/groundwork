const TITLES = new Set(["mr", "mrs", "ms", "miss", "mx", "dr", "prof", "professor", "coach", "sr", "sra", "srta", "mme", "mlle", "herr", "frau", "dra"]);

/**
 * The name to greet someone by: their first name, or title and surname for names like
 * "Ms. Rivera" or "Dr. Okafor" (so a teacher isn't greeted as just "Ms.").
 */
export function greetingName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  const title = parts[0].replace(/\.$/, "").toLowerCase();
  if (TITLES.has(title) && parts.length > 1) return `${parts[0]} ${parts[parts.length - 1]}`;
  return parts[0];
}
