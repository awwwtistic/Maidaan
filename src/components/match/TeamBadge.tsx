import { cn, initials } from "@/lib/utils";

export function TeamBadge({
  name,
  badgeUrl,
  size = 36,
  className,
}: {
  name: string | null | undefined;
  badgeUrl: string | null | undefined;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-white/[0.08] ring-1 ring-white/10",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <span
        className="absolute font-bold uppercase tracking-wide text-white/45"
        style={{ fontSize: Math.max(8, size * 0.34) }}
      >
        {initials(name)}
      </span>
      {badgeUrl ? (
        <span
          className="absolute inset-[16%] bg-contain bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${badgeUrl.replace(/"/g, "%22")}")`,
          }}
        />
      ) : null}
    </span>
  );
}
