import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Eye, Clock, Star } from "lucide-react";

function InstructorAnalyticsPage() {
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
                <p className="text-3xl font-bold text-bangladesh-green">45,230</p>
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
                <p className="text-3xl font-bold text-bangladesh-red">78%</p>
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
                <p className="text-3xl font-bold text-bangladesh-green">342</p>
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
                <p className="text-3xl font-bold text-bangladesh-red">4.8</p>
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
            <p className="text-muted-foreground">Views and engagement over time</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-green/10 rounded-2xl">
              <BarChart3 className="h-16 w-16 text-bangladesh-green/50" />
              <p className="text-muted-foreground ml-4">Performance chart</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Student Engagement</CardTitle>
            <p className="text-muted-foreground">Time spent and activity patterns</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-red/10 rounded-2xl">
              <Clock className="h-16 w-16 text-bangladesh-red/50" />
              <p className="text-muted-foreground ml-4">Engagement metrics</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default InstructorAnalyticsPage;