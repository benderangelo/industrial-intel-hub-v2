import { useState } from "react";

import { cn } from "@/lib/utils";

interface EquipmentImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function EquipmentImage({ src, alt, className, fallbackLabel }: EquipmentImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-border bg-muted text-center text-xs font-medium text-muted-foreground", className)}>
        <span className="px-2 leading-tight">{fallbackLabel ?? alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={cn(
        "rounded-lg border border-border bg-muted p-2 object-contain object-center",
        className,
      )}
    />
  );
}