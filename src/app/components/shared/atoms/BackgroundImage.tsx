import type { CrossfadeLayers } from "../../../hooks/useCrossfade";

type BackgroundImageProps = {
  /** Static image URL (takes priority over crossfade) */
  image?: string | null;
  /** Crossfade layers for animated backgrounds */
  crossfade?: CrossfadeLayers;
  /** Opacity of the visible layer (default 0.3) */
  opacity?: number;
  /** Transition duration in seconds for crossfade (default 2) */
  transitionDuration?: number;
}

const bgBase: React.CSSProperties = {
  backgroundSize: "cover",
  backgroundPosition: "center top",
  backgroundAttachment: "fixed",
  backgroundRepeat: "no-repeat",
};

const vignette: React.CSSProperties = {
  maskImage: "linear-gradient(to right, transparent 0%, black 30%, black 70%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 30%, black 70%, transparent 100%)",
};

export const BackgroundImage = ({
  image,
  crossfade,
  opacity = 0.3,
  transitionDuration = 2,
}: BackgroundImageProps) => {
  if (image) {
    return (
      <div
        className="absolute inset-0 z-0"
        style={{
          ...bgBase,
          ...vignette,
          backgroundImage: `url(${image})`,
          opacity,
        }}
      />
    );
  }

  if (crossfade) {
    return (
      <>
        <div
          className="absolute inset-0 z-0"
          style={{
            ...bgBase,
            ...vignette,
            backgroundImage: crossfade.layerA ? `url(${crossfade.layerA})` : "none",
            opacity: crossfade.activeLayer === "a" ? opacity : 0,
            transition: `opacity ${transitionDuration}s ease-in-out`,
          }}
        />
        <div
          className="absolute inset-0 z-0"
          style={{
            ...bgBase,
            ...vignette,
            backgroundImage: crossfade.layerB ? `url(${crossfade.layerB})` : "none",
            opacity: crossfade.activeLayer === "b" ? opacity : 0,
            transition: `opacity ${transitionDuration}s ease-in-out`,
          }}
        />
      </>
    );
  }

  return null;
};
