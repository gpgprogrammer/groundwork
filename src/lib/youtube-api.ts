import "server-only";

/** The official YouTube Data API v3. Merit's only automated source of YouTube data. */

export const youtubeApiKey = () => process.env.YOUTUBE_API_KEY || null;

export type ApiVideo = { id: string; title: string; description: string; channelId: string; channelTitle: string; thumbnail: string; durationSec: number; views: number; publishedAt: string };

function isoDuration(d: string) {
  const m = d.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return m ? (+(m[1] ?? 0) * 86400 + +(m[2] ?? 0) * 3600 + +(m[3] ?? 0) * 60 + +(m[4] ?? 0)) : 0;
}

/** Up to 50 videos per call (1 quota unit). Missing ids are private, deleted, or blocked. */
export async function videosList(ids: string[]): Promise<ApiVideo[]> {
  const key = youtubeApiKey();
  if (!key) throw new Error("YOUTUBE_API_KEY is not set");
  const qs = new URLSearchParams({ part: "snippet,contentDetails,statistics,status", id: ids.slice(0, 50).join(","), key, maxResults: "50" });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${qs}`, { cache: "no-store", signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`YouTube API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as {
    items?: {
      id: string;
      snippet: { title: string; description: string; channelId: string; channelTitle: string; publishedAt: string; thumbnails: Record<string, { url: string }> };
      contentDetails: { duration: string };
      statistics: { viewCount?: string };
      status: { privacyStatus: string; embeddable?: boolean; uploadStatus?: string };
    }[];
  };
  return (data.items ?? [])
    .filter((i) => i.status.privacyStatus === "public")
    .map((i) => ({
      id: i.id,
      title: i.snippet.title,
      description: i.snippet.description.slice(0, 1500),
      channelId: i.snippet.channelId,
      channelTitle: i.snippet.channelTitle,
      thumbnail: (i.snippet.thumbnails.high ?? i.snippet.thumbnails.medium ?? i.snippet.thumbnails.default)?.url ?? `https://i.ytimg.com/vi/${i.id}/hqdefault.jpg`,
      durationSec: isoDuration(i.contentDetails.duration),
      views: Number(i.statistics.viewCount ?? 0),
      publishedAt: i.snippet.publishedAt,
    }));
}
