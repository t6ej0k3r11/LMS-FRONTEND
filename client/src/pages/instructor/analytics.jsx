import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Eye, Star, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function InstructorAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/instructor/analytics/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Analytics API error response:", response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("Analytics API response:", result);

      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch analytics data");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setError(error.message);
      toast({
        title: "Error",
        description: `Failed to load analytics data: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Loading your analytics data...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-bangladesh-green" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Failed to load analytics data</p>
        </div>
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchAnalyticsData}
              className="px-4 py-2 bg-bangladesh-green text-white rounded-lg hover:bg-bangladesh-green/90"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Insights into your course performance and student engagement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg hover:shadow-[0_25px_65px_rgba(10,143,99,0.15)] transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-3xl font-bold text-bangladesh-green">
                  {analyticsData?.totalViews?.toLocaleString() || 0}
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-green p-3">
                <Eye className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg hover:shadow-[0_25px_65px_rgba(227,38,54,0.15)] transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Completion</p>
                <p className="text-3xl font-bold text-bangladesh-red">
                  {analyticsData?.avgCompletion || 0}%
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-red p-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg hover:shadow-[0_25px_65px_rgba(10,143,99,0.15)] transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                <p className="text-3xl font-bold text-bangladesh-green">
                  {analyticsData?.activeStudents?.toLocaleString() || 0}
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-green p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg hover:shadow-[0_25px_65px_rgba(227,38,54,0.15)] transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Rating</p>
                <p className="text-3xl font-bold text-bangladesh-red">
                  {analyticsData?.avgRating || 0}
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-red p-3">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
            <p className="text-muted-foreground">Individual course statistics</p>
          </CardHeader>
          <CardContent>
            {analyticsData?.coursePerformance?.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.coursePerformance.map((course, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{course.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {course.enrollments} enrollments • {course.completions} completions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-bangladesh-green">
                        ৳{course.revenue?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {course.completionRate}% completion
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <p className="text-muted-foreground">No course data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Monthly Engagement</CardTitle>
            <p className="text-muted-foreground">Student activity over the last 12 months</p>
          </CardHeader>
          <CardContent>
            {analyticsData?.monthlyEngagement?.length > 0 ? (
              <div className="space-y-2">
                {analyticsData.monthlyEngagement.slice(0, 6).map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{month._id}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">
                        {month.activeStudents} active
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-bangladesh-green h-2 rounded-full"
                          style={{ width: `${Math.min(month.avgProgress || 0, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium w-8 text-right">
                        {Math.round(month.avgProgress || 0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <p className="text-muted-foreground">No engagement data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default InstructorAnalyticsPage;