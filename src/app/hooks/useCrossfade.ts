"use client";

import { useState, useRef, useCallback } from "react";

export type CrossfadeLayers = {
  layerA: string | null;
  layerB: string | null;
  activeLayer: "a" | "b";
}

export const useCrossfade = () => {
  const [layerA, setLayerA] = useState<string | null>(null);
  const [layerB, setLayerB] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<"a" | "b">("a");
  const currentRef = useRef<string | null>(null);

  const setImage = useCallback((image: string) => {
    if (image === currentRef.current) return;

    currentRef.current = image;

    setActiveLayer((prev) => {
      if (prev === "a") {
        setLayerB(image);
        return "b";
      } else {
        setLayerA(image);
        return "a";
      }
    });
  }, []);

  const layers: CrossfadeLayers = { layerA, layerB, activeLayer };

  return { layers, setImage };
};
