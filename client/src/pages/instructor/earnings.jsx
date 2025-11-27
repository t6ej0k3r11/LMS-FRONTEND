import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react";

function InstructorEarningsPage() {
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
                <p className="text-3xl font-bold text-bangladesh-green">$12,450</p>
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
                <p className="text-3xl font-bold text-bangladesh-red">$2,180</p>
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
                <p className="text-3xl font-bold text-bangladesh-green">$89</p>
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
                <p className="text-3xl font-bold text-bangladesh-red">+23%</p>
              </div>
              <div className="rounded-2xl bg-gradient-red p-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle>Earnings Analytics</CardTitle>
          <p className="text-muted-foreground">Detailed breakdown of your revenue streams</p>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gradient-green/10 rounded-2xl">
            <p className="text-muted-foreground">Earnings chart will be displayed here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default InstructorEarningsPage;