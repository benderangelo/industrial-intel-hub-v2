import { useEffect, useRef, useState } from "react";

interface ScrollVideoProps {
  src: string;
  className?: string;
  /** Height of the visible video area, e.g. "200px". Defaults to "100vh". */
  height?: string;
  /** Extra scroll distance (px) mapped to the video duration. Defaults to 3× viewport. */
  scrollLength?: number;
}

export function ScrollVideo({ src, className, height = "100vh", scrollLength: scrollLengthProp }: ScrollVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [pinned, setPinned] = useState(true);
  const rafRef = useRef<number>(0);

  const parsedHeight = parseInt(height, 10) || window.innerHeight;
  const scrollLen = scrollLengthProp ?? parsedHeight * 3;

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const onLoaded = () => {
      const duration = video.duration;
      if (!duration || !isFinite(duration)) return;

      container.style.height = `${parsedHeight + scrollLen}px`;

      const update = () => {
        const rect = container.getBoundingClientRect();
        const scrollDistance = -rect.top;
        const maxScroll = container.offsetHeight - parsedHeight;

        if (scrollDistance < 0) {
          video.currentTime = 0;
          setPinned(true);
        } else if (scrollDistance >= maxScroll) {
          video.currentTime = duration;
          setPinned(false);
        } else {
          const progress = scrollDistance / maxScroll;
          video.currentTime = progress * duration;
          setPinned(true);
        }
      };

      const onScroll = () => {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(update);
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      update();

      return () => {
        window.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(rafRef.current);
      };
    };

    if (video.readyState >= 1) {
      const cleanup = onLoaded();
      return cleanup;
    }

    video.addEventListener("loadedmetadata", onLoaded, { once: true });
    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      cancelAnimationFrame(rafRef.current);
    };
  }, [src, parsedHeight, scrollLen]);

  return (
    <div ref={containerRef} className={className} style={{ position: "relative" }}>
      <div
        style={{
          position: pinned ? "sticky" : "relative",
          top: 0,
          width: "100%",
          height: height,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="auto"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  );
}
