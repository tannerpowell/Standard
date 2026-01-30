"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryImage } from "@/data/gallery";

const NAV_BUTTON =
  "absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70";

interface PhotoGalleryProps {
  images: GalleryImage[];
}

export function PhotoGallery({ images }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Guard against invalid lightbox index when images change
  const safeIndex =
    lightboxIndex !== null && images.length > 0
      ? Math.min(lightboxIndex, images.length - 1)
      : lightboxIndex;

  const isOpen = safeIndex !== null && images.length > 0;

  const navigate = useCallback(
    (dir: 1 | -1) => {
      setLightboxIndex((prev) => {
        if (prev === null || images.length === 0) return null;
        const nextIndex = (prev + dir + images.length) % images.length;
        return Math.max(0, Math.min(nextIndex, images.length - 1));
      });
    },
    [images.length],
  );

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, navigate]);

  return (
    <>
      <div className="grid auto-rows-[280px] grid-cols-2 gap-2 md:auto-rows-[320px] md:grid-cols-4 md:gap-3">
        {images.map((img, i) => (
          <button
            type="button"
            key={img.src}
            onClick={() => setLightboxIndex(i)}
            className={[
              "group relative overflow-hidden",
              img.colSpan === 2 && "col-span-2",
              img.rowSpan === 2 && "row-span-2",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes={
                img.colSpan === 2
                  ? "(max-width: 768px) 100vw, 50vw"
                  : "(max-width: 768px) 50vw, 25vw"
              }
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => { if (!open) closeLightbox(); }}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
          <DialogPrimitive.Content
            className="fixed inset-0 z-50 flex items-center justify-center outline-none"
            aria-describedby={undefined}
          >
            <DialogPrimitive.Title className="sr-only">
              Gallery image {safeIndex !== null ? safeIndex + 1 : ""} of{" "}
              {images.length}
            </DialogPrimitive.Title>

            <DialogPrimitive.Close type="button" className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70">
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>

            <button type="button" onClick={() => navigate(-1)} className={`left-4 ${NAV_BUTTON}`}>
              <ChevronLeft className="h-8 w-8" />
              <span className="sr-only">Previous image</span>
            </button>

            <button type="button" onClick={() => navigate(1)} className={`right-4 ${NAV_BUTTON}`}>
              <ChevronRight className="h-8 w-8" />
              <span className="sr-only">Next image</span>
            </button>

            <AnimatePresence mode="wait">
              {safeIndex !== null && images[safeIndex] != null && (
                <motion.div
                  key={safeIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="relative h-[80vh] w-[90vw] max-w-5xl"
                >
                  <Image
                    src={images[safeIndex].src}
                    alt={images[safeIndex].alt}
                    fill
                    sizes="90vw"
                    className="object-contain"
                    priority
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {safeIndex !== null && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 font-[family-name:var(--font-jost)] text-sm text-white/80">
                {safeIndex + 1} / {images.length}
              </div>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
