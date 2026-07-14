import Image from "next/image";

// Standard credit-card proportions (85.6mm x 53.98mm), so a gradient placeholder
// and real artwork occupy exactly the same box.
const WIDTH = 108;
const HEIGHT = 68;

export function CardArt({
  src,
  gradient,
  mask,
  alt,
}: {
  src: string | null;
  gradient: string;
  mask: string | null;
  alt: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={WIDTH}
        height={HEIGHT}
        className="shrink-0 rounded-md object-cover shadow-sm ring-1 ring-black/10"
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`${alt} (no artwork added)`}
      style={{ width: WIDTH, height: HEIGHT, background: gradient }}
      className="relative shrink-0 overflow-hidden rounded-md shadow-sm ring-1 ring-black/10"
    >
      {/* Chip and last-four, so the placeholder still reads as a card. */}
      <span className="absolute left-2.5 top-2.5 h-3.5 w-4.5 rounded-[2px] bg-white/25" />
      <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/25 to-transparent" />
      {mask && (
        <span className="absolute bottom-2 left-2.5 font-mono text-[0.6rem] tracking-wider text-white/70">
          ••{mask}
        </span>
      )}
    </div>
  );
}
