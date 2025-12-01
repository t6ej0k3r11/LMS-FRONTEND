import { Skeleton } from '../../../../components/ui/skeleton';
import { Card } from '../../../../components/ui/card';

export const CourseCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </Card>
  );
};