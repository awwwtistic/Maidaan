import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton rounded-lg", className)} />;
}

export function CardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className="w-[78vw] max-w-[340px] shrink-0 space-y-3 sm:w-[310px] lg:w-[330px]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function RailSkeleton({ count = 5 }: { count?: number }) {
  return (
    <section className="space-y-5" aria-hidden="true">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: count }).map((_, index) => (
          <CardSkeleton key={index} index={index} />
        ))}
      </div>
    </section>
  );
}
