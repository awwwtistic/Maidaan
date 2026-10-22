import { RailSkeleton, Skeleton } from "@/components/common/Skeleton";

export default function HomeLoading() {
  return (
    <div aria-busy="true" aria-label="Loading matches">
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(80%_70%_at_75%_0%,rgba(255,53,77,0.12),transparent_60%)]"
        />
        <div className="container-app relative grid items-center gap-12 pb-12 pt-28 sm:pt-32 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-16 lg:pb-20 lg:pt-40">
          <div className="max-w-2xl space-y-5">
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-16 w-full max-w-xl sm:h-20" />
            <Skeleton className="h-16 w-3/4 max-w-md sm:h-20" />
            <div className="flex items-center gap-3 pt-2">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex items-center gap-4 pt-3">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-12 w-40 rounded-full" />
              <Skeleton className="h-12 w-36 rounded-full" />
            </div>
          </div>
          <Skeleton className="hidden aspect-video rounded-[1.75rem] lg:block" />
        </div>
      </section>

      <div className="container-app mt-10 space-y-12 sm:mt-12 sm:space-y-16">
        <RailSkeleton />
        <RailSkeleton />
      </div>
    </div>
  );
}
