"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Horizontal product rail with arrow buttons and a progress line. Works with touch scrolling too. */
export function Rail({ label, children }: { label: string; children: React.ReactNode }) {
  const track = useRef<HTMLUListElement>(null);
  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 1);
    setAtStart(el.scrollLeft < 4);
    setAtEnd(el.scrollLeft > max - 4);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const move = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="rail">
      <div className="rail-arrows">
        <button type="button" onClick={() => move(-1)} disabled={atStart} aria-label={`Scroll ${label} back`}>
          <ChevronLeft size={18} />
        </button>
        <button type="button" onClick={() => move(1)} disabled={atEnd} aria-label={`Scroll ${label} forward`}>
          <ChevronRight size={18} />
        </button>
      </div>
      <ul className="rail-track" ref={track} onScroll={update} aria-label={label}>
        {children}
      </ul>
      <div className="rail-progress" aria-hidden="true">
        <span style={{ width: `${Math.max(12, progress * 100)}%` }} />
      </div>
    </div>
  );
}
