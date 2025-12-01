import { Skeleton } from '../../../../components/ui/skeleton';
import { Card } from '../../../../components/ui/card';

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Continue Watching Skeleton */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </Card>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity Skeleton */}
      <Card className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </Card>

      {/* Recommended Courses Skeleton */}
      <Card className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-32 w-full rounded-lg mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-3" />
              <Skeleton className="h-8 w-full" />
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};