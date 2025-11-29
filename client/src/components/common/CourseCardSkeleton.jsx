import { Skeleton } from "@/components/ui/skeleton";

function CourseCardSkeleton() {
  return (
    <div className="flex flex-col card-hover shadow-sm border-0 bg-white fade-in-up">
      <div className="p-0 flex-grow">
        <Skeleton className="h-32 sm:h-40 lg:h-48 w-full rounded-t-lg" />
        <div className="p-3 sm:p-4 lg:p-6">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-3 sm:mb-4" />
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-4 lg:p-6 pt-0">
        <Skeleton className="h-10 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default CourseCardSkeleton;