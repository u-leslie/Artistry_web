/** Parse a YouTube watch / embed / shorts / youtu.be URL or raw 11-char video id. */
export function parseYouTubeVideoId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  const short = s.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short?.[1]) return short[1];
  const v = s.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (v?.[1]) return v[1];
  const embed = s.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embed?.[1]) return embed[1];
  const shorts = s.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shorts?.[1]) return shorts[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  return null;
}

/** Set `VITE_SHUFFLE_YOUTUBE_URL` to any YouTube video URL or id (build-time). */
export function getShuffleYouTubeVideoId(): string | null {
  const raw = import.meta.env.VITE_SHUFFLE_YOUTUBE_URL?.trim();
  if (!raw) return null;
  return parseYouTubeVideoId(raw);
}

export function buildYouTubeEmbedSrc(
  videoId: string,
  opts: { muted: boolean; loop: boolean },
): string {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: opts.muted ? "1" : "0",
    controls: "0",
    modestbranding: "1",
    playsinline: "1",
    rel: "0",
    enablejsapi: "1",
  });
  if (opts.loop) {
    params.set("loop", "1");
    params.set("playlist", videoId);
  }
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}
