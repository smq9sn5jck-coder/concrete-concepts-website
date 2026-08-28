/**
 * OptimizedImage — Performance-optimized image component
 * Features:
 * - Explicit width/height to prevent CLS (layout shift)
 * - Native lazy loading for below-the-fold images
 * - Blur-up placeholder effect while loading
 * - fetchpriority="high" for LCP images
 * - decoding="async" for non-blocking decode
 */
import { useState, useCallback } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  /** Set to true for above-the-fold / LCP images */
  priority?: boolean;
  /** loading attribute override */
  loading?: "lazy" | "eager";
  /** Additional style */
  style?: React.CSSProperties;
  /** onClick handler */
  onClick?: () => void;
  /** aria-hidden for decorative images */
  "aria-hidden"?: boolean | "true" | "false";
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  loading,
  style,
  onClick,
  ...rest
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  // Determine loading strategy
  const imgLoading = loading ?? (priority ? "eager" : "lazy");

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={imgLoading}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : undefined}
      onLoad={handleLoad}
      onClick={onClick}
      className={`${className} ${!loaded ? "animate-pulse bg-muted" : ""}`}
      style={{
        ...style,
        transition: "opacity 0.3s ease",
        opacity: loaded ? 1 : 0.7,
      }}
      {...rest}
    />
  );
}
