import { Skeleton } from "@/components/common/Skeleton";

export default function WatchLoading() {
  return (
    <div aria-busy="true" aria-label="Preparing the player">
      <div className="container-app pb-10 pt-24 sm:pt-28">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-28 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>

        <div className="mt-5 xl:grid xl:grid-cols-[minmax(0,1fr)_336px] xl:items-start xl:gap-8">
          <div>
            <Skeleton className="h-8 w-2/3 max-w-md" />
            <Skeleton className="mt-3 h-4 w-1/2 max-w-sm" />
            <Skeleton className="mt-4 aspect-video w-full rounded-2xl" />
            <div className="mt-3 flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-9 w-64 rounded-full" />
            </div>
            <Skeleton className="mt-4 h-[152px] w-full rounded-2xl" />
          </div>
          <div className="mt-8 space-y-4 xl:mt-0">
            <div className="overflow-hidden rounded-2xl border border-white/[0.05]">
              <Skeleton className="aspect-video w-full" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            </div>
            <Skeleton className="h-[140px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
