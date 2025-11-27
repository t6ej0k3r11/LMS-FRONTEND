import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Users, BookOpen, Sparkles, TrendingUp, Bell, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchEnrolledStudentsService } from "@/services";
import { toast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function InstructorDashboard({ listOfCourses }) {
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [earningsData, setEarningsData] = useState(null);
  const [loadingEarnings, setLoadingEarnings] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const response = await fetchEnrolledStudentsService();
        if (response?.success) {
          setEnrolledStudents(response.data);
        } else {
          toast({
            title: "Error",
            description: response?.message || "Failed to fetch enrolled students",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching enrolled students:", error);
        toast({
          title: "Error",
          description: "An error occurred while fetching enrolled students",
          variant: "destructive",
        });
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoadingEarnings(true);
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/instructor/earnings/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setEarningsData(data.data);
          }
        } else {
          console.error("Failed to fetch earnings data");
        }
      } catch (error) {
        console.error("Error fetching earnings:", error);
      } finally {
        setLoadingEarnings(false);
      }
    };

    fetchEarnings();
  }, []);

  function calculateTotalStudentsAndProfit() {
    const { totalStudents, totalProfit, totalRewatches } = listOfCourses.reduce(
      (acc, course) => {
        const studentCount = course.students.length;
        acc.totalStudents += studentCount;
        acc.totalProfit += course.pricing * studentCount;

        course.students.forEach((student) => {
          acc.totalRewatches += student.rewatchCount || 0;
        });

        return acc;
      },
      {
        totalStudents: 0,
        totalProfit: 0,
        totalRewatches: 0,
      }
    );

    return {
      totalProfit,
      totalStudents,
      totalRewatches,
    };
  }

  const { totalStudents } = calculateTotalStudentsAndProfit();

  const highlightCourse = listOfCourses.reduce(
    (top, course) => {
      const score = course.students.length;
      if (score > top.score) {
        return {
          score,
          title: course.title,
          students: course.students.length,
          revenue: course.pricing, // Just show course price as example
        };
      }
      return top;
    },
    { score: 0, title: "—", students: 0, revenue: 0 }
  );

  const config = [
    {
      icon: Users,
      label: "Total Students",
      value: totalStudents,
      meta: "Active enrollments",
    },
    {
      icon: DollarSign,
      label: "Total Earnings",
      value: loadingEarnings ? "..." : `৳${earningsData?.totalEarnings?.toLocaleString() || 0}`,
      meta: "After commission",
    },
    {
      icon: BookOpen,
      label: "Total Courses",
      value: listOfCourses.length,
      meta: "Published",
    },
    {
      icon: DollarSign,
      label: "Available Payout",
      value: loadingEarnings ? "..." : `৳${earningsData?.availableForPayout?.toLocaleString() || 0}`,
      meta: "Ready to withdraw",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="glass-effect rounded-[32px] border border-white/50 px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Instructor Pulse</p>
            <h2 className="mt-2 text-3xl font-bold text-foreground">Dashboard Overview</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Track students, revenue, and rewatches across every DeshGory cohort.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-green text-white px-4 py-2 text-sm shadow-lg">
              <Sparkles className="h-4 w-4" />
              {totalStudents || 0} students thriving this week
            </div>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/85 p-5 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Top Course</p>
            <h3 className="mt-2 text-xl font-semibold text-foreground">{highlightCourse.title}</h3>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-3xl font-bold text-bangladesh-green">
                  ৳{highlightCourse.revenue.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-2xl font-semibold text-foreground">{highlightCourse.students}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-bangladesh-red">
              <TrendingUp className="h-4 w-4" /> Real-time performance chart
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {config.map((item, index) => (
          <Card
            key={index}
            className="rounded-3xl border border-white/60 bg-white/90 shadow-[0_20px_55px_rgba(10,143,99,0.12)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_25px_65px_rgba(10,143,99,0.18)] hover:border-bangladesh-green/30"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{item.meta}</p>
              </div>
              <div className="rounded-2xl bg-gradient-green p-3 shadow-lg">
                <item.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Earnings Overview Card */}
      <Card className="rounded-[30px] border border-white/60 bg-white/90 shadow-[0_35px_80px_rgba(10,143,99,0.14)] hover:shadow-[0_40px_90px_rgba(10,143,99,0.18)] transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">Earnings Overview</CardTitle>
          <p className="text-sm text-muted-foreground">Your income breakdown and payout status</p>
        </CardHeader>
        <CardContent>
          {loadingEarnings ? (
            <div className="text-center py-8 text-muted-foreground">Loading earnings data...</div>
          ) : earningsData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-3xl font-bold text-bangladesh-green">
                  ৳{earningsData.totalEarnings?.toLocaleString() || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Paid Out</p>
                <p className="text-3xl font-bold text-bangladesh-red">
                  ৳{earningsData.paidOut?.toLocaleString() || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Available for Payout</p>
                <p className="text-3xl font-bold text-foreground">
                  ৳{earningsData.availableForPayout?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No earnings data available</div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[30px] border border-white/60 bg-white/90 shadow-[0_35px_80px_rgba(10,143,99,0.14)] hover:shadow-[0_40px_90px_rgba(10,143,99,0.18)] transition-shadow duration-300">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground">Enrolled Students</CardTitle>
            <p className="text-sm text-muted-foreground">Students enrolled in your courses</p>
          </div>
          <span className="rounded-full bg-gradient-green text-white px-4 py-1 text-xs font-medium shadow-lg">
            {enrolledStudents.length} learners enrolled
          </span>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-white/70">
                  <TableHead className="text-muted-foreground">Student Name</TableHead>
                  <TableHead className="text-muted-foreground">Student Email</TableHead>
                  <TableHead className="text-muted-foreground">Enrolled Courses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingStudents ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      Loading students...
                    </TableCell>
                  </TableRow>
                ) : enrolledStudents.length ? (
                  enrolledStudents.map((student) => (
                    <TableRow
                      key={student.id}
                      className="border-white/60 bg-white/60 transition-all duration-300 hover:bg-white/80 hover:shadow-sm"
                    >
                      <TableCell className="font-semibold text-foreground">
                        {student.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{student.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {student.enrolledCourses.map((course, idx) => (
                            <span
                              key={idx}
                              className="rounded-full bg-bangladesh-green-light text-bangladesh-green px-2 py-1 text-xs font-medium hover:bg-bangladesh-green hover:text-white transition-colors duration-200"
                            >
                              {course.title}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      No students enrolled yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="rounded-[30px] border border-white/60 bg-white/90 shadow-[0_35px_80px_rgba(10,143,99,0.14)] hover:shadow-[0_40px_90px_rgba(10,143,99,0.18)] transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-bangladesh-green" />
              Recent Activity
            </CardTitle>
            <p className="text-sm text-muted-foreground">Latest updates from your courses</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-bangladesh-green-light/20 hover:bg-bangladesh-green-light/30 transition-colors duration-200">
                <CheckCircle className="h-5 w-5 text-bangladesh-green mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">New student enrolled</p>
                  <p className="text-xs text-muted-foreground">John Doe joined React Fundamentals</p>
                  <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-bangladesh-red-light/20 hover:bg-bangladesh-red-light/30 transition-colors duration-200">
                <AlertCircle className="h-5 w-5 text-bangladesh-red mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Course submitted for review</p>
                  <p className="text-xs text-muted-foreground">Advanced JavaScript is pending approval</p>
                  <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-bangladesh-green-light/20 hover:bg-bangladesh-green-light/30 transition-colors duration-200">
                <CheckCircle className="h-5 w-5 text-bangladesh-green mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Quiz completed</p>
                  <p className="text-xs text-muted-foreground">Sarah completed CSS Grid Mastery quiz</p>
                  <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Panel */}
        <Card className="rounded-[30px] border border-white/60 bg-white/90 shadow-[0_35px_80px_rgba(227,38,54,0.14)] hover:shadow-[0_40px_90px_rgba(227,38,54,0.18)] transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5 text-bangladesh-red" />
              Notifications
            </CardTitle>
            <p className="text-sm text-muted-foreground">Important updates and alerts</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-gradient-red text-white shadow-lg">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Payment received</p>
                  <p className="text-xs opacity-90">৳299.00 from course enrollment</p>
                  <p className="text-xs opacity-75 mt-1">Just now</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-bangladesh-red-light/20 hover:bg-bangladesh-red-light/30 transition-colors duration-200">
                <Bell className="h-5 w-5 text-bangladesh-red mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Course approved</p>
                  <p className="text-xs text-muted-foreground">Node.js Backend Development is now live</p>
                  <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-bangladesh-green-light/20 hover:bg-bangladesh-green-light/30 transition-colors duration-200">
                <CheckCircle className="h-5 w-5 text-bangladesh-green mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Weekly report ready</p>
                  <p className="text-xs text-muted-foreground">Your performance analytics are available</p>
                  <p className="text-xs text-muted-foreground mt-1">1 week ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

InstructorDashboard.propTypes = {
  listOfCourses: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      pricing: PropTypes.number.isRequired,
      students: PropTypes.arrayOf(
        PropTypes.shape({
          studentName: PropTypes.string.isRequired,
          studentEmail: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
};

export default InstructorDashboard;
