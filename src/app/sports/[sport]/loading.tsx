import { Skeleton } from "@/components/common/Skeleton";

export default function SportLoading() {
  return (
    <div aria-busy="true" aria-label="Loading sport">
      <div className="border-b border-white/[0.05]">
        <div className="container-app pb-9 pt-28 sm:pt-36">
          <Skeleton className="h-7 w-24 rounded-full" />
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="mt-4 h-20 w-2/3 max-w-xl sm:h-24" />
              <Skeleton className="mt-4 h-4 w-full max-w-md" />
              <Skeleton className="mt-5 h-9 w-full max-w-sm rounded-full" />
            </div>
            <div className="flex gap-3">
              {[0, 1, 2].map((item) => (
                <Skeleton key={item} className="h-[88px] w-28 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-app mt-8">
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-9 w-28 rounded-full" />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-video w-full rounded-2xl" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
