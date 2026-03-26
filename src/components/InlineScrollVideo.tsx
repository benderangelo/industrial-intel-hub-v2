import { useEffect, useRef } from "react";

interface Props {
  src: string;
  height?: number;
  /** Quantidade de scroll (deltaY acumulado) necessária para percorrer o vídeo inteiro */
  scrollLength?: number;
}

export function InlineScrollVideo({ src, height = 680, scrollLength = 1400 }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const progressPxRef = useRef(0);
  const durationRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    const wrap = wrapRef.current;
    if (!video || !wrap) return;

    const normalizeDelta = (event: WheelEvent) => {
      let delta = event.deltaY;

      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 16;
      if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) delta *= window.innerHeight;

      // Trackpads podem gerar deltas muito pequenos e parecer "travado"
      if (Math.abs(delta) < 4) delta *= 4;

      return delta;
    };

    const onMeta = () => {
      durationRef.current = Number.isFinite(video.duration) ? video.duration : 0;
      progressPxRef.current = 0;
      video.currentTime = 0;
      video.pause();
    };

    const onWheel = (event: WheelEvent) => {
      const dur = durationRef.current || video.duration;
      if (!dur || !isFinite(dur)) return;

      const delta = normalizeDelta(event);
      if (!delta) return;

      const prevPx = progressPxRef.current;
      const nextPx = Math.min(scrollLength, Math.max(0, prevPx + delta));

      const tryingBeyondEnd = delta > 0 && prevPx >= scrollLength;
      const tryingBeyondStart = delta < 0 && prevPx <= 0;
      const shouldLockPageScroll = !(tryingBeyondEnd || tryingBeyondStart);

      if (shouldLockPageScroll) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (nextPx === prevPx) return;

      progressPxRef.current = nextPx;
      const nextTime = (nextPx / scrollLength) * dur;

      if (Math.abs(video.currentTime - nextTime) > 0.001) {
        video.currentTime = nextTime;
      }
    };

    if (video.readyState >= 1) onMeta();
    else video.addEventListener("loadedmetadata", onMeta, { once: true });

    wrap.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      wrap.removeEventListener("wheel", onWheel);
      video.removeEventListener("loadedmetadata", onMeta);
    };
  }, [src, scrollLength]);

  return (
    <div
      ref={wrapRef}
      className="rounded-lg border border-border bg-secondary/20 overflow-hidden"
      style={{ height }}
    >
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        preload="auto"
        className="w-full h-full block pointer-events-none"
        style={{ objectFit: "contain", objectPosition: "center center" }}
      />
    </div>
  );
}
