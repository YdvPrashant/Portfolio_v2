"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Photo } from "@/lib/unsplash";
import { unsplashLoader } from "@/lib/unsplash-loader";

/* One photograph, whole and uncropped, in a native modal dialog: it traps
   focus, closes on Escape and hands focus back to the frame that opened it.
   The arrow keys step through the set. */

type Props = {
  photos: Photo[];
  index: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
};

export function PhotoViewer({ photos, index, onClose, onChange }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const n = photos.length;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (index !== null && !d.open) d.showModal();
    if (index === null && d.open) d.close();
  }, [index]);

  useEffect(() => {
    if (index === null) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onChange((index + 1) % n);
      if (e.key === "ArrowLeft") onChange((index - 1 + n) % n);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [index, n, onChange]);

  const photo = index !== null ? photos[index] : null;

  return (
    <dialog
      ref={dialog}
      className="photo-viewer"
      aria-label={photo ? `Photograph ${index! + 1} of ${n}` : "Photograph"}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {photo && (
        <div className="grid h-full grid-rows-[auto_1fr_auto] gap-4 p-[var(--pad)]">
          <div className="t-mono flex items-center justify-between gap-6">
            <p>
              {String(index! + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </p>
            <div className="flex items-center gap-6">
              <a href={photo.link} target="_blank" rel="noopener" className="hit link-line">
                On Unsplash &#8599;
              </a>
              <button type="button" onClick={onClose} className="hit link-line" autoFocus>
                Close
              </button>
            </div>
          </div>

          <figure className="relative min-h-0" onClick={onClose}>
            <Image
              key={photo.id}
              loader={unsplashLoader}
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="100vw"
              className="viewer-img object-contain"
            />
          </figure>

          <div className="t-small flex items-center justify-between gap-6">
            <button type="button" onClick={() => onChange((index! - 1 + n) % n)} className="hit link-line">
              &larr; Previous
            </button>
            {photo.alt && <p className="hidden text-center text-[var(--muted)] sm:block">{photo.alt}</p>}
            <button type="button" onClick={() => onChange((index! + 1) % n)} className="hit link-line">
              Next &rarr;
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
