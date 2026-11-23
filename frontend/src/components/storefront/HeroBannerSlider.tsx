import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroTransition } from "../../types";

interface HeroBannerSliderProps {
  images: string[];
  alt: string;
  transition?: HeroTransition;
  intervalMs?: number;
  className?: string;
  showControls?: boolean;
  controlsPosition?: "bottom" | "bottom-right";
}

export function HeroBannerSlider({
  images,
  alt,
  transition = "fade",
  intervalMs = 5000,
  className = "h-full w-full",
  showControls = true,
  controlsPosition = "bottom",
}: HeroBannerSliderProps) {
  const validImages = images.filter(Boolean);
  const count = validImages.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  useEffect(() => {
    if (count <= 1 || paused || intervalMs <= 0) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [count, paused, intervalMs]);

  if (count === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const next = () => setIndex((i) => (i + 1) % count);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    setPaused(true);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    const end = e.changedTouches[0]?.clientX ?? null;
    if (start !== null && end !== null && Math.abs(start - end) > 40) {
      if (start > end) next();
      else prev();
    }
    touchStartX.current = null;
    setPaused(false);
  };

  const posClass = className.includes("absolute") ? "" : "relative";

  return (
    <div
      className={`${posClass} overflow-hidden select-none ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {transition === "slide" ? (
        <div
          className="flex h-full w-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {validImages.map((src, i) => (
            <img
              key={`${src}-${i}`}
              src={src}
              alt={`${alt} ${i + 1}`}
              className="h-full w-full shrink-0 object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
          ))}
        </div>
      ) : (
        validImages.map((src, i) => {
          const active = i === index;
          return (
            <img
              key={`${src}-${i}`}
              src={src}
              alt={`${alt} ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              className={`absolute inset-0 h-full w-full object-cover transition-all ${
                transition === "zoom" ? "duration-1000 ease-out" : "duration-700 ease-in-out"
              }`}
              style={{
                opacity: active ? 1 : 0,
                transform:
                  transition === "zoom"
                    ? active
                      ? "scale(1.0)"
                      : "scale(1.07)"
                    : undefined,
                zIndex: active ? 1 : 0,
              }}
            />
          );
        })
      )}

      {/* Subtle Prev / Next arrows & dots when multiple slides exist */}
      {showControls && count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Banner sebelumnya"
            className="absolute left-2.5 top-1/2 z-20 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-xs transition hover:bg-black/70 sm:h-9 sm:w-9"
          >
            <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Banner berikutnya"
            className="absolute right-2.5 top-1/2 z-20 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-xs transition hover:bg-black/70 sm:h-9 sm:w-9"
          >
            <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
          </button>

          <div
            className={`absolute bottom-3 z-20 flex items-center gap-1.5 ${
              controlsPosition === "bottom-right"
                ? "right-3.5"
                : "left-1/2 -translate-x-1/2"
            }`}
          >
            {validImages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className="h-2 rounded-full transition-all"
                style={{
                  width: i === index ? "20px" : "8px",
                  backgroundColor: i === index ? "#FFFFFF" : "rgba(255,255,255,0.48)",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
