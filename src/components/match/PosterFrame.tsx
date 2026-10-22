import Image from "next/image";
import { getSport } from "@/lib/sports";
import { cn, initials } from "@/lib/utils";

export function PosterFrame({
  posterUrl,
  title,
  category,
  className,
  sizes = "(min-width: 1280px) 340px, (min-width: 640px) 320px, 80vw",
  priority = false,
}: {
  posterUrl: string | null;
  title: string;
  category: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const sport = getSport(category);
  const accent = sport.accent;

  return (
    <div className={cn("relative overflow-hidden bg-[#0b0b10]", className)}>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `radial-gradient(130% 140% at 12% 0%, ${accent}4d 0%, transparent 58%), linear-gradient(135deg, ${accent}1f 0%, #0b0b10 72%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #ffffff 0px, #ffffff 1px, transparent 1px, transparent 13px)",
        }}
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-7 -right-1 font-display text-[7.5rem] leading-none tracking-tight text-white/[0.06]"
      >
        {initials(title)}
      </span>
      <span
        aria-hidden="true"
        className="absolute left-4 top-1/2 h-px w-8 -translate-y-1/2 opacity-60"
        style={{ backgroundColor: accent }}
      />
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt=""
          fill
          sizes={sizes}
          className="object-cover"
          priority={priority}
          unoptimized
        />
      ) : null}
    </div>
  );
}
