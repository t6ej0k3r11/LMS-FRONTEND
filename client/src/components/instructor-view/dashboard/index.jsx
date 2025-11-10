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
import { DollarSign, Users, BookOpen, Eye } from "lucide-react";

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

  const config = [
    {
      icon: Users,
      label: "Total Students",
      value: calculateTotalStudentsAndProfit().totalStudents,
    },
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: calculateTotalStudentsAndProfit().totalProfit,
    },
    {
      icon: BookOpen,
      label: "Total Courses",
      value: listOfCourses.length,
    },
    {
      icon: Eye,
      label: "Total Rewatches",
      value: calculateTotalStudentsAndProfit().totalRewatches,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold hero-text">Dashboard Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {config.map((item, index) => (
          <Card key={index} className="stats-card hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {item.label}
              </CardTitle>
              <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                <item.icon className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="stats-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">Students List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="font-semibold text-gray-700">Course Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Student Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Student Email</TableHead>
                  <TableHead className="font-semibold text-gray-700">Rewatch Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculateTotalStudentsAndProfit().studentList.map(
                  (studentItem, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium text-gray-900">
                        {studentItem.courseTitle}
                      </TableCell>
                      <TableCell className="text-gray-700">{studentItem.studentName}</TableCell>
                      <TableCell className="text-gray-700">{studentItem.studentEmail}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {studentItem.rewatchCount}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
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
