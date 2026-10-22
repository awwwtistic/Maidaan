import { Skeleton } from "@/components/common/Skeleton";

export default function MyListLoading() {
  return (
    <div aria-busy="true" aria-label="Loading your list">
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(60%_85%_at_12%_0%,rgba(255,53,77,0.11),transparent_60%)]"
        />
        <div className="container-app relative pb-9 pt-28 sm:pb-11 sm:pt-36">
          <div className="lg:flex lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-2xl space-y-4">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-16 w-full max-w-lg sm:h-20" />
              <Skeleton className="h-4 w-full max-w-xl" />
              <Skeleton className="h-4 w-3/4 max-w-md" />
            </div>
            <div className="mt-8 flex gap-3 lg:mt-0">
              {[0, 1].map((item) => (
                <Skeleton key={item} className="h-[94px] min-w-[7rem] flex-1 rounded-2xl lg:w-32 lg:flex-none" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container-app mt-8 sm:mt-10">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
