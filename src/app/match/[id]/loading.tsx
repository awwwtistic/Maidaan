import { Skeleton } from "@/components/common/Skeleton";

export default function MatchLoading() {
  return (
    <div aria-busy="true" aria-label="Loading match">
      <div className="container-app pb-12 pt-28 sm:pt-36">
        <Skeleton className="h-7 w-24 rounded-full" />
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
          <Skeleton className="aspect-video w-full rounded-[1.6rem]" />
          <div className="space-y-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-14 w-11/12" />
            <Skeleton className="h-14 w-2/3" />
            <div className="flex items-center gap-3 pt-2">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-4 w-52" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-12 w-36 rounded-full" />
              <Skeleton className="h-12 w-32 rounded-full" />
              <Skeleton className="h-12 w-24 rounded-full" />
            </div>
            <Skeleton className="mt-3 h-[76px] w-full rounded-2xl" />
          </div>
        </div>
      </div>

      <div className="container-app mt-10 space-y-5">
        <Skeleton className="h-8 w-44" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="aspect-video w-[300px] shrink-0 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
