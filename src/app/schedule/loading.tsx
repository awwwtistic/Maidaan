import { Skeleton } from "@/components/common/Skeleton";

export default function ScheduleLoading() {
  return (
    <div aria-busy="true" aria-label="Loading schedule">
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(65%_85%_at_15%_0%,rgba(255,53,77,0.1),transparent_60%)]"
        />
        <div className="container-app relative pb-9 pt-28 sm:pb-11 sm:pt-36">
          <div className="lg:flex lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-2xl space-y-4">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-16 w-full max-w-lg sm:h-20" />
              <Skeleton className="h-4 w-full max-w-xl" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="mt-8 flex gap-3 lg:mt-0">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-[94px] min-w-[7rem] flex-1 rounded-2xl lg:w-28 lg:flex-none"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container-app mt-9 space-y-8 sm:mt-10">
        <Skeleton className="h-[104px] w-full rounded-2xl" />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-[96px] w-full rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-7 w-32" />
          <div className="grid gap-2 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[96px] w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
