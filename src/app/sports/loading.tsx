import { Skeleton } from "@/components/common/Skeleton";

export default function SportsLoading() {
  return (
    <div className="pb-10" aria-busy="true" aria-label="Loading sports">
      <div className="container-app border-b border-white/[0.05] pb-10 pt-28 sm:pt-36">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="mt-4 h-16 w-2/3 max-w-2xl sm:h-20" />
        <Skeleton className="mt-4 h-4 w-full max-w-lg" />
        <div className="mt-9 flex gap-3">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-[88px] w-32 rounded-2xl" />
          ))}
        </div>
      </div>

      <div className="container-app mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton
            key={index}
            className={
              index < 2
                ? "h-[220px] rounded-3xl sm:col-span-2"
                : "h-[184px] rounded-3xl"
            }
          />
        ))}
      </div>
    </div>
  );
}
