import { Skeleton } from "@/components/common/Skeleton";

export default function SearchLoading() {
  return (
    <div aria-busy="true" aria-label="Loading search">
      <div className="border-b border-white/[0.05]">
        <div className="container-app pb-9 pt-28 sm:pb-11 sm:pt-36">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-4 h-16 w-2/3 max-w-xl sm:h-20" />
          <Skeleton className="mt-4 h-4 w-full max-w-md" />
          <Skeleton className="mt-7 h-14 w-full max-w-2xl rounded-2xl sm:h-16" />
        </div>
      </div>

      <div className="container-app mt-7">
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-28 shrink-0 rounded-full" />
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-2xl border border-white/[0.05] p-2.5"
            >
              <Skeleton className="aspect-video w-[108px] shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-2.5 w-24" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
