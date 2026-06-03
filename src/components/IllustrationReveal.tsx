import Image from "next/image";

/**
 * IllustrationReveal — presents a supplied artwork as a framed "paper" piece
 * and reveals it left→right like fresh ink (CSS: .ink-reveal-img), with a gold
 * nib riding the reveal front (.ink-nib). Loops; static under reduced motion.
 *
 * Drop the artwork in /public and pass its path as `src`.
 */
export function IllustrationReveal({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <figure
      className={`relative overflow-hidden rounded-md border border-line bg-white shadow-[var(--shadow-lg)] ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(max-width: 1024px) 90vw, 42vw"
        className="ink-reveal-img object-cover"
      />
      {/* gold nib that rides the reveal front */}
      <span className="ink-nib" aria-hidden>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21l3-1 11-11-2-2L4 18l-1 3z" fill="currentColor" stroke="none" />
          <path d="M14 7l3-3 2 2-3 3" />
        </svg>
      </span>
    </figure>
  );
}
