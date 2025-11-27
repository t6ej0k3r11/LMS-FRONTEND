import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function InstructorEarningsPage() {
  const [earningsData, setEarningsData] = useState(null);
  const [courseEarnings, setCourseEarnings] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      const [summaryResponse, courseResponse, graphResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/instructor/earnings/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/instructor/earnings/by-course`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/instructor/earnings/graph-data?period=monthly`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (summaryResponse.ok) {
        const summaryResult = await summaryResponse.json();
        console.log("Earnings summary response:", summaryResult);
        if (summaryResult.success) {
          setEarningsData(summaryResult.data);
        } else {
          console.error("Earnings summary API error:", summaryResult);
        }
      } else {
        console.error("Earnings summary HTTP error:", summaryResponse.status, await summaryResponse.text());
      }

      if (courseResponse.ok) {
        const courseResult = await courseResponse.json();
        console.log("Earnings by course response:", courseResult);
        if (courseResult.success) {
          setCourseEarnings(courseResult.data);
        } else {
          console.error("Earnings by course API error:", courseResult);
        }
      } else {
        console.error("Earnings by course HTTP error:", courseResponse.status, await courseResponse.text());
      }

      if (graphResponse.ok) {
        const graphResult = await graphResponse.json();
        console.log("Earnings graph response:", graphResult);
        if (graphResult.success) {
          setGraphData(graphResult.data);
        } else {
          console.error("Earnings graph API error:", graphResult);
        }
      } else {
        console.error("Earnings graph HTTP error:", graphResponse.status, await graphResponse.text());
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setError(error.message);
      toast({
        title: "Error",
        description: `Failed to load earnings data: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const calculateMetrics = () => {
    if (!earningsData || !courseEarnings.length) return null;

    const totalEarnings = earningsData.totalEarnings || 0;
    const totalStudents = courseEarnings.reduce((sum, course) => sum + (course.transactionCount || 0), 0);
    const avgPerStudent = totalStudents > 0 ? Math.round(totalEarnings / totalStudents) : 0;

    // Calculate this month's earnings (simplified - using last month's data if available)
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const thisMonthData = graphData.find(item => item._id === currentMonth);
    const thisMonthEarnings = thisMonthData ? thisMonthData.earnings : 0;

    // Calculate growth (comparing with previous month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthKey = lastMonth.toISOString().slice(0, 7);
    const lastMonthData = graphData.find(item => item._id === lastMonthKey);
    const lastMonthEarnings = lastMonthData ? lastMonthData.earnings : 0;
    const growth = lastMonthEarnings > 0 ? Math.round(((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100) : 0;

    return {
      totalEarnings,
      thisMonthEarnings,
      avgPerStudent,
      growth,
      totalStudents
    };
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Earnings & Revenue</h1>
          <p className="text-muted-foreground">Loading your earnings data...</p>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Earnings & Revenue</h1>
          <p className="text-muted-foreground">Failed to load earnings data</p>
        </div>
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchEarningsData}
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Earnings & Revenue</h1>
        <p className="text-muted-foreground">Track your course revenue and financial performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg hover:shadow-[0_25px_65px_rgba(10,143,99,0.15)] transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-3xl font-bold text-bangladesh-green">
                  ৳{metrics?.totalEarnings?.toLocaleString() || 0}
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-green p-3">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg hover:shadow-[0_25px_65px_rgba(227,38,54,0.15)] transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-3xl font-bold text-bangladesh-red">
                  ৳{metrics?.thisMonthEarnings?.toLocaleString() || 0}
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-red p-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg hover:shadow-[0_25px_65px_rgba(10,143,99,0.15)] transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. per Student</p>
                <p className="text-3xl font-bold text-bangladesh-green">
                  ৳{metrics?.avgPerStudent?.toLocaleString() || 0}
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
                <p className="text-sm font-medium text-muted-foreground">Growth</p>
                <p className={`text-3xl font-bold ${metrics?.growth >= 0 ? 'text-bangladesh-red' : 'text-red-600'}`}>
                  {metrics?.growth >= 0 ? '+' : ''}{metrics?.growth || 0}%
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-red p-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Earnings by Course</CardTitle>
            <p className="text-muted-foreground">Revenue breakdown by individual courses</p>
          </CardHeader>
          <CardContent>
            {courseEarnings.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {courseEarnings.map((course, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{course.courseTitle}</h4>
                      <p className="text-xs text-muted-foreground">
                        {course.transactionCount || 0} enrollments
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-bangladesh-green">
                        ৳{course.totalEarnings?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ৳{course.totalRevenue?.toLocaleString() || 0} revenue
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <p className="text-muted-foreground">No course earnings data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Monthly Earnings Trend</CardTitle>
            <p className="text-muted-foreground">Earnings over the last 12 months</p>
          </CardHeader>
          <CardContent>
            {graphData.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {graphData.slice(-12).map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{month._id}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">
                        {month.transactions || 0} sales
                      </span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-bangladesh-green h-2 rounded-full"
                          style={{
                            width: graphData.length > 1
                              ? `${Math.max((month.earnings / Math.max(...graphData.map(d => d.earnings))) * 100, 5)}%`
                              : '100%'
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-bangladesh-green min-w-[60px] text-right">
                        ৳{month.earnings?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <p className="text-muted-foreground">No earnings trend data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default InstructorEarningsPage;