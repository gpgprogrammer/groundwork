/**
 * Writes src/data/youtube-live.json: only the videos for courses that are live on the site (math, by
 * default), so each new server starts by reading ~1/3 of the full library. The full library stays in
 * src/data/youtube.json. Runs before every build (npm "prebuild").
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildCurriculum } from "../src/lib/catalog/build";
import type { Library } from "../src/lib/types";

const dir = path.join(process.cwd(), "src", "data");
const lib = JSON.parse(readFileSync(path.join(dir, "youtube.json"), "utf8")) as Library;
const live = new Set(buildCurriculum().courses.map((c) => c.id));
const videos = lib.videos.filter((v) => live.has(v.courseId));
const used = new Set(videos.map((v) => v.channelId));
const out: Library = { ...lib, videos, channels: lib.channels.filter((c) => used.has(c.id)) };
writeFileSync(path.join(dir, "youtube-live.json"), JSON.stringify(out));
console.log(`[live library] ${videos.length.toLocaleString()} of ${lib.videos.length.toLocaleString()} videos (${live.size} live courses)`);
