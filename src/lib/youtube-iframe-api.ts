/** Loads https://www.youtube.com/iframe_api once; resolves when `window.YT.Player` exists. */
let iframeApiPromise: Promise<void> | null = null;

export function loadYouTubeIframeAPI(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  const w = window as Window & {
    YT?: { Player: new (el: HTMLElement | string, opts: unknown) => YtPlayerLike };
    onYouTubeIframeAPIReady?: () => void;
  };

  if (w.YT?.Player) return Promise.resolve();

  if (!iframeApiPromise) {
    iframeApiPromise = new Promise<void>((resolve) => {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const first = document.getElementsByTagName("script")[0];
      first.parentNode!.insertBefore(tag, first);
      const prev = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve();
      };
    });
  }

  return iframeApiPromise;
}

/** Minimal surface for shuffle ambient player. */
export type YtPlayerLike = {
  pauseVideo: () => void;
  playVideo: () => void;
  mute: () => void;
  unMute: () => void;
  destroy: () => void;
};
