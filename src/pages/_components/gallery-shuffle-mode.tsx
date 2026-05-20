import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  Maximize2,
  Pause,
  Play,
  Shuffle,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { Photo } from "@/hooks/use-photos";
import { getShuffleYouTubeVideoId } from "@/lib/shuffle-youtube.ts";
import {
  loadYouTubeIframeAPI,
  type YtPlayerLike,
} from "@/lib/youtube-iframe-api.ts";
import { urlFor } from "@/lib/sanity";

/** Time each photo stays on screen (progress bar + auto-advance). */
const SLIDE_MS = 7800;

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Fast first paint + sharp final; WebP when supported by Sanity CDN. */
function buildShuffleImageUrl(photo: Photo, width: number): string {
  if (photo.image) {
    try {
      const chain = urlFor(photo.image).width(width).quality(width < 1100 ? 76 : 82);
      try {
        return chain.format("webp").url();
      } catch {
        return chain.url();
      }
    } catch {
      /* fall through */
    }
  }
  return photo.url ?? "";
}

type GalleryShuffleModeProps = {
  photos: Photo[];
  open: boolean;
  onClose: () => void;
};

export function GalleryShuffleMode({
  photos,
  open,
  onClose,
}: GalleryShuffleModeProps) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const ytHostRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YtPlayerLike | null>(null);
  const [ytPlayerReady, setYtPlayerReady] = useState(false);
  const pausedRef = useRef(false);
  const musicMutedRef = useRef(false);
  const youtubeVideoId = useMemo(() => getShuffleYouTubeVideoId(), []);

  const [session, setSession] = useState(0);
  const shuffled = useMemo(
    () => (photos.length ? shuffle(photos) : []),
    [photos, session],
  );
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"playing" | "done">("playing");
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [musicMuted, setMusicMuted] = useState(false);
  const [hiResReady, setHiResReady] = useState(false);
  /** Wall-clock for current slide; paused time excluded via pauseAccumRef + pauseAtRef. */
  const slideStartRef = useRef(Date.now());
  const pauseAccumRef = useRef(0);
  const pauseAtRef = useRef<number | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    musicMutedRef.current = musicMuted;
  }, [musicMuted]);

  useEffect(() => {
    if (!open || !youtubeVideoId) {
      setYtPlayerReady(false);
      try {
        ytPlayerRef.current?.destroy();
      } catch {
        /* ignore */
      }
      ytPlayerRef.current = null;
      return;
    }

    let cancelled = false;

    loadYouTubeIframeAPI().then(() => {
      if (cancelled) return;

      let rafAttempts = 0;
      const mount = () => {
        if (cancelled) return;
        const host = ytHostRef.current;
        if (!host) {
          if (rafAttempts++ < 120) requestAnimationFrame(mount);
          return;
        }

        const YT = (
          window as unknown as {
            YT: { Player: new (el: HTMLElement, opts: unknown) => void };
          }
        ).YT;

        new YT.Player(host, {
        videoId: youtubeVideoId,
        width: 1,
        height: 1,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          loop: 1,
          playlist: youtubeVideoId,
          enablejsapi: 1,
          fs: 0,
          ...(typeof window !== "undefined" && window.location.origin
            ? { origin: window.location.origin }
            : {}),
        },
        events: {
          onReady: (e: { target: YtPlayerLike }) => {
            if (cancelled) return;
            const p = e.target;
            ytPlayerRef.current = p;
            setYtPlayerReady(true);
            try {
              if (musicMutedRef.current) p.mute();
              else {
                p.unMute();
                p.setVolume?.(100);
              }
              if (pausedRef.current) p.pauseVideo();
              else p.playVideo();
            } catch {
              /* Mobile may block until a tap — user uses “Tap to enable audio” */
            }
          },
        },
      });
      };

      mount();
    });

    return () => {
      cancelled = true;
      setYtPlayerReady(false);
      try {
        ytPlayerRef.current?.destroy();
      } catch {
        /* ignore */
      }
      ytPlayerRef.current = null;
    };
  }, [open, youtubeVideoId]);

  useEffect(() => {
    const p = ytPlayerRef.current;
    if (!open || !youtubeVideoId || !ytPlayerReady || !p) return;
    if (paused) p.pauseVideo();
    else p.playVideo();
  }, [open, youtubeVideoId, ytPlayerReady, paused]);

  useEffect(() => {
    const p = ytPlayerRef.current;
    if (!open || !youtubeVideoId || !ytPlayerReady || !p) return;
    if (musicMuted) p.mute();
    else p.unMute();
  }, [open, youtubeVideoId, ytPlayerReady, musicMuted]);

  useEffect(() => {
    if (!open) return;
    setSession((s) => s + 1);
    setIndex(0);
    setPhase("playing");
    setPaused(false);
    setProgressKey((k) => k + 1);
    // Muted first matches browser autoplay rules; user unmutes with the control.
    setMusicMuted(Boolean(youtubeVideoId));
  }, [open, youtubeVideoId]);

  useEffect(() => {
    if (!open || phase === "done") return;
    slideStartRef.current = Date.now();
    pauseAccumRef.current = 0;
    pauseAtRef.current = null;
  }, [index, open, phase]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const current = shuffled[index];
  const total = shuffled.length;
  const isLast = index >= total - 1;

  const lowUrl = current ? buildShuffleImageUrl(current, 960) : "";
  const highUrl = current ? buildShuffleImageUrl(current, 1920) : "";
  const displayUrl = hiResReady && highUrl ? highUrl : lowUrl;

  useEffect(() => {
    setHiResReady(false);
    if (!highUrl || !current) return;
    const img = new Image();
    img.src = highUrl;
    img.onload = () => setHiResReady(true);
    img.onerror = () => setHiResReady(true);
  }, [highUrl, current?._id]);

  useEffect(() => {
    if (!open || total === 0) return;
    const links: HTMLLinkElement[] = [];
    for (let i = 1; i <= 4; i++) {
      const p = shuffled[(index + i) % total];
      if (!p) continue;
      const href = buildShuffleImageUrl(p, 1920);
      if (!href) continue;
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = href;
      document.head.appendChild(link);
      links.push(link);
    }
    return () => {
      links.forEach((l) => l.remove());
    };
  }, [open, index, shuffled, total]);

  const close = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      /* ignore */
    }
    onClose();
  }, [onClose]);

  const restartShuffle = useCallback(() => {
    setSession((s) => s + 1);
    setIndex(0);
    setPhase("playing");
    setPaused(false);
    setProgressKey((k) => k + 1);
  }, []);

  /** iOS/Android require unmute/play inside the same user gesture as the tap — not in useEffect. */
  const toggleMusicFromUser = useCallback(() => {
    const p = ytPlayerRef.current;
    if (!youtubeVideoId || !p) return;
    setMusicMuted((m) => {
      if (m) {
        try {
          p.setVolume?.(100);
          p.unMute();
          if (!pausedRef.current) p.playVideo();
        } catch {
          /* ignore */
        }
        return false;
      }
      try {
        p.mute();
      } catch {
        /* ignore */
      }
      return true;
    });
  }, [youtubeVideoId]);

  useLayoutEffect(() => {
    if (!open) {
      try {
        if (document.fullscreenElement) {
          void document.exitFullscreen();
        }
      } catch {
        /* ignore */
      }
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const req =
      el.requestFullscreen?.bind(el) ??
      (el as unknown as { webkitRequestFullscreen?: () => void })
        .webkitRequestFullscreen?.bind(el);
    if (req) {
      void req.call(el).catch(() => {
        /* fullscreen optional */
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open || phase === "done" || total === 0) return;

    if (paused) {
      if (pauseAtRef.current === null) {
        pauseAtRef.current = Date.now();
      }
      return;
    }

    if (pauseAtRef.current !== null) {
      pauseAccumRef.current += Date.now() - pauseAtRef.current;
      pauseAtRef.current = null;
    }

    const elapsed =
      Date.now() - slideStartRef.current - pauseAccumRef.current;
    const remaining = Math.max(0, SLIDE_MS - elapsed);

    const t = window.setTimeout(() => {
      if (isLast) {
        setPhase("done");
        return;
      }
      setIndex((i) => i + 1);
      setProgressKey((k) => k + 1);
    }, remaining);

    return () => window.clearTimeout(t);
  }, [open, phase, paused, index, isLast, total]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        void close();
      }
      if (phase === "done") return;
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        setPaused((p) => !p);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (isLast) setPhase("done");
        else {
          setIndex((i) => Math.min(i + 1, total - 1));
          setProgressKey((k) => k + 1);
        }
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
        setProgressKey((k) => k + 1);
      }
      if (e.key === "m" || e.key === "M") {
        if (!youtubeVideoId) return;
        e.preventDefault();
        toggleMusicFromUser();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, phase, isLast, total, youtubeVideoId, toggleMusicFromUser]);

  const swipeRef = useRef<{ x: number; t: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    swipeRef.current = { x: e.clientX, t: Date.now() };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipeRef.current;
    swipeRef.current = null;
    if (!s || phase === "done") return;
    const dx = e.clientX - s.x;
    const dt = Date.now() - s.t;
    if (dt > 600 || Math.abs(dx) < 48) return;
    if (dx < 0) {
      if (isLast) setPhase("done");
      else {
        setIndex((i) => Math.min(i + 1, total - 1));
        setProgressKey((k) => k + 1);
      }
    } else {
      setIndex((i) => Math.max(0, i - 1));
      setProgressKey((k) => k + 1);
    }
  };

  if (!open || total === 0) return null;

  const content = (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] flex cursor-auto flex-col bg-[#0c0a09] text-[#fafaf9] overflow-hidden font-serif"
      role="dialog"
      aria-modal="true"
      aria-label="Immersive gallery shuffle"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(168,152,122,0.5), transparent 55%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {youtubeVideoId ? (
        <div
          ref={ytHostRef}
          className="pointer-events-none fixed left-0 top-0 h-px w-px overflow-hidden opacity-0"
          aria-hidden
        />
      ) : null}

      <header className="relative z-10 flex shrink-0 items-start justify-between gap-4 px-4 pt-5 pb-2 md:px-10 md:pt-8">
        <AnimatePresence mode="wait">
          {phase === "playing" && current ? (
            <motion.div
              key={current._id + String(index)}
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, y: -16, filter: "blur(8px)" }
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={
                reduceMotion
                  ? undefined
                  : { opacity: 0, y: 12, filter: "blur(6px)" }
              }
              transition={{ duration: reduceMotion ? 0.15 : 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="min-w-0 flex-1"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-[#a8a29e] mb-2 md:text-[11px]">
                {/* <span className="text-[#d6d3d1]">{current.number}</span>
                <span className="mx-3 text-[#57534e]">·</span> */}
                <span>{current.year}</span>
              </p>
              {/* <h2 className="text-2xl font-light leading-tight tracking-tight text-[#fafaf9] md:text-4xl lg:text-5xl max-w-[90vw]">
                {current.title}
              </h2> */}
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={reduceMotion ? false : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-[#a8a29e] mb-2">
                End of shuffle
              </p>
              <h2 className="text-2xl font-light md:text-3xl text-[#fafaf9]">
                You’ve seen every frame in this run.
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex shrink-0 items-center gap-2">
          {phase === "playing" && (
            <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.25em] text-[#78716c]">
              {youtubeVideoId
                ? "Esc · Space · ← → · M music"
                : "Esc · Space · ← →"}
            </span>
          )}
          <motion.button
            type="button"
            onClick={() => void close()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#44403c] bg-[#1c1917]/80 text-[#e7e5e4] backdrop-blur-sm transition-colors hover:border-[#a8987a] hover:text-[#fafaf9]"
            aria-label="Close immersive view"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </motion.button>
        </div>
      </header>

      <div
        className="relative z-[1] flex min-h-0 flex-1 items-center justify-center px-2 pb-4 md:px-8"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <AnimatePresence mode="wait">
          {phase === "playing" && current && (
            <motion.div
              key={current._id + String(index)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.12 : 0.45 }}
              className="relative flex h-full max-h-[min(78vh,900px)] w-full max-w-6xl items-center justify-center"
            >
              <motion.img
                src={displayUrl}
                // alt={current.title}
                alt=""
                className={`max-h-full max-w-full object-contain grayscale shadow-2xl shadow-black/50 transition-[filter,transform] duration-500 ${
                  !hiResReady && highUrl ? "blur-[0.5px] opacity-95" : ""
                }`}
                decoding="async"
                fetchPriority="high"
                sizes="(max-width: 768px) 100vw, min(90vw, 1200px)"
                initial={reduceMotion ? false : { scale: 1.04 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: reduceMotion ? 0 : SLIDE_MS / 1000,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {phase === "done" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <p className="max-w-md font-light text-[#d6d3d1]">
              Shuffle again for a new order, or step back to the grid.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <motion.button
                type="button"
                onClick={restartShuffle}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-full border border-[#a8987a] bg-[#a8987a]/15 px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-[#fafaf9] transition-colors hover:bg-[#a8987a]/25"
              >
                <Shuffle className="h-4 w-4" />
                Shuffle again
              </motion.button>
              <motion.button
                type="button"
                onClick={() => void close()}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-full border border-[#44403c] px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-[#d6d3d1] hover:border-[#57534e]"
              >
                <Maximize2 className="h-4 w-4 opacity-70" />
                Exit
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      <footer className="relative z-10 shrink-0 px-4 pb-6 pt-2 md:px-10 md:pb-10">
        {phase === "playing" && (
          <>
            {youtubeVideoId && musicMuted && ytPlayerReady && phase === "playing" ? (
              <>
                <button
                  type="button"
                  onClick={toggleMusicFromUser}
                  className="mb-3 w-full rounded-lg border border-[#a8987a]/60 bg-[#a8987a]/15 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#fafaf9] transition-colors active:bg-[#a8987a]/25 md:hidden"
                >
                  Tap to enable audio
                </button>
                <p className="mb-3 hidden text-center font-mono text-[10px] uppercase tracking-[0.22em] text-[#a8987a]/90 md:block">
                  Tap the speaker (left) or press M to turn on sound
                </p>
              </>
            ) : null}
            <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-[#292524]">
              <div
                key={`${index}-${progressKey}`}
                className="h-full origin-left bg-linear-to-r from-[#57534e] via-[#a8987a] to-[#d6d3d1]"
                style={{
                  animation: `gallery-shuffle-progress ${SLIDE_MS}ms linear forwards`,
                  animationPlayState: paused ? "paused" : "running",
                }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="font-mono text-[11px] tabular-nums text-[#78716c]">
                <span className="text-[#d6d3d1]">{index + 1}</span>
                <span className="mx-2 text-[#44403c]">/</span>
                {total}
              </p>
              <div className="flex items-center gap-2">
                {youtubeVideoId ? (
                  <motion.button
                    type="button"
                    onClick={toggleMusicFromUser}
                    whileTap={{ scale: 0.95 }}
                    className={`rounded-full border p-2.5 text-[#d6d3d1] transition-colors hover:border-[#57534e] ${
                      musicMuted
                        ? "border-[#a8987a]/70 bg-[#a8987a]/10 ring-1 ring-[#a8987a]/30"
                        : "border-[#44403c]"
                    }`}
                    aria-label={
                      musicMuted ? "Unmute YouTube audio" : "Mute YouTube audio"
                    }
                    aria-pressed={musicMuted}
                  >
                    {musicMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </motion.button>
                ) : null}
                <motion.button
                  type="button"
                  onClick={() => {
                    setIndex((i) => Math.max(0, i - 1));
                    setProgressKey((k) => k + 1);
                  }}
                  disabled={index === 0}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full border border-[#44403c] p-2.5 text-[#d6d3d1] hover:border-[#57534e] disabled:opacity-25"
                  aria-label="Previous"
                >
                  <SkipBack className="h-4 w-4" />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full border border-[#a8987a]/50 bg-[#a8987a]/10 p-2.5 text-[#fafaf9] hover:bg-[#a8987a]/20"
                  aria-label={paused ? "Play" : "Pause"}
                >
                  {paused ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <Pause className="h-4 w-4" />
                  )}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => {
                    if (isLast) setPhase("done");
                    else {
                      setIndex((i) => i + 1);
                      setProgressKey((k) => k + 1);
                    }
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full border border-[#44403c] p-2.5 text-[#d6d3d1] hover:border-[#57534e]"
                  aria-label={isLast ? "Finish" : "Next"}
                >
                  <SkipForward className="h-4 w-4" />
                </motion.button>
              </div>
              <p className="hidden text-right font-mono text-[10px] uppercase tracking-[0.2em] text-[#57534e] sm:block max-w-[200px]">
                Swipe or controls
              </p>
            </div>
          </>
        )}
      </footer>
    </div>
  );

  return createPortal(content, document.body);
}
