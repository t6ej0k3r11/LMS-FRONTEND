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
import { DollarSign, Users, BookOpen, Eye, Sparkles, TrendingUp } from "lucide-react";

function InstructorDashboard({ listOfCourses }) {
  function calculateTotalStudentsAndProfit() {
    const { totalStudents, totalProfit, studentList, totalRewatches } = listOfCourses.reduce(
      (acc, course) => {
        const studentCount = course.students.length;
        acc.totalStudents += studentCount;
        acc.totalProfit += course.pricing * studentCount;

        course.students.forEach((student) => {
          acc.studentList.push({
            courseTitle: course.title,
            studentName: student.studentName,
            studentEmail: student.studentEmail,
            rewatchCount: student.rewatchCount || 0,
          });
          acc.totalRewatches += student.rewatchCount || 0;
        });

        return acc;
      },
      {
        totalStudents: 0,
        totalProfit: 0,
        studentList: [],
        totalRewatches: 0,
      }
    );

    return {
      totalProfit,
      totalStudents,
      studentList,
      totalRewatches,
    };
  }

  console.log(calculateTotalStudentsAndProfit());

  const { totalStudents, totalProfit, totalRewatches, studentList } =
    calculateTotalStudentsAndProfit();

  const highlightCourse = listOfCourses.reduce(
    (top, course) => {
      const score = course.students.length * course.pricing;
      if (score > top.score) {
        return {
          score,
          title: course.title,
          students: course.students.length,
          revenue: course.students.length * course.pricing,
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
      label: "Total Revenue",
      value: `$${totalProfit.toLocaleString()}`,
      meta: "Lifetime",
    },
    {
      icon: BookOpen,
      label: "Total Courses",
      value: listOfCourses.length,
      meta: "Published",
    },
    {
      icon: Eye,
      label: "Total Rewatches",
      value: totalRewatches,
      meta: "Engagement",
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
              Track students, revenue, and rewatches across every Bangla Learn cohort.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-[hsl(var(--brand-red))]" />
              {totalStudents || 0} students thriving this week
            </div>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/85 p-5 shadow-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Top Course</p>
            <h3 className="mt-2 text-xl font-semibold text-foreground">{highlightCourse.title}</h3>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-3xl font-bold text-[hsl(var(--brand-green))]">
                  ${highlightCourse.revenue.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-2xl font-semibold text-foreground">{highlightCourse.students}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-primary">
              <TrendingUp className="h-4 w-4" /> Real-time performance chart
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {config.map((item, index) => (
          <Card
            key={index}
            className="rounded-3xl border-white/60 bg-white/85 shadow-[0_20px_55px_rgba(3,106,78,0.12)] transition-transform duration-300 hover:-translate-y-1"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{item.meta}</p>
              </div>
              <div className="rounded-2xl bg-[hsla(var(--brand-green)/0.12)] p-3">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-[30px] border-white/60 bg-white/90 shadow-[0_35px_80px_rgba(9,42,31,0.14)]">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground">Students List</CardTitle>
            <p className="text-sm text-muted-foreground">Recent enrollments and engagement levels</p>
          </div>
          <span className="rounded-full bg-[hsla(var(--brand-green)/0.12)] px-4 py-1 text-xs font-medium text-primary">
            {studentList.length} learners tracked
          </span>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-white/70">
                  <TableHead className="text-muted-foreground">Course Name</TableHead>
                  <TableHead className="text-muted-foreground">Student Name</TableHead>
                  <TableHead className="text-muted-foreground">Student Email</TableHead>
                  <TableHead className="text-muted-foreground">Rewatch Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentList.length ? (
                  studentList.map((studentItem, index) => (
                    <TableRow
                      key={`${studentItem.studentEmail}-${index}`}
                      className="border-white/60 bg-white/60 transition-colors hover:bg-white/80"
                    >
                      <TableCell className="font-semibold text-foreground">
                        {studentItem.courseTitle}
                      </TableCell>
                      <TableCell>{studentItem.studentName}</TableCell>
                      <TableCell className="text-muted-foreground">{studentItem.studentEmail}</TableCell>
                      <TableCell>
                        <span className="rounded-full bg-[hsla(var(--brand-green)/0.15)] px-3 py-1 text-sm font-medium text-primary">
                          {studentItem.rewatchCount}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      No students enrolled yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
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
