import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Typography,
  Avatar,
  IconButton,
  Button,
} from "@material-tailwind/react";
import {
  UsersIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";
import { getMyStudents } from "../../../api/endpoints/instructor";
import { getCourseByInstructor } from "../../../api/endpoints/course/course";
import { Students } from "../../../api/types/student/student";
import { CourseInterface } from "../../../types/course";
import { formatDate } from "../../../utils/helpers";

const InstructorDashboard: React.FC = () => {
  const [students, setStudents] = useState<Students[]>([]);
  const [courses, setCourses] = useState<CourseInterface[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, coursesRes] = await Promise.all([
          getMyStudents(),
          getCourseByInstructor(),
        ]);
        setStudents(studentsRes.data);
        setCourses(coursesRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    {
      title: "Total Students",
      value: students.length,
      icon: UsersIcon,
      color: "blue",
    },
    {
      title: "Active Courses",
      value: courses.length,
      icon: BookOpenIcon,
      color: "green",
    },
    {
      title: "Course Completion",
      value: "84%",
      icon: AcademicCapIcon,
      color: "orange",
    },
    {
      title: "Total Earnings",
      value: "$4,250",
      icon: ChartBarIcon,
      color: "pink",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Typography>Loading Dashboard...</Typography>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <Typography variant="h3" color="blue-gray" className="font-bold">
          Instructor Dashboard
        </Typography>
        <Typography color="gray" className="mt-1 font-normal">
          Welcome back! Here's what's happening with your courses today.
        </Typography>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map(({ title, value, icon: Icon, color }) => (
          <Card key={title} className="shadow-sm border border-gray-100">
            <CardBody className="flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-${color}-50`}>
                <Icon className={`h-8 w-8 text-${color}-500`} />
              </div>
              <div>
                <Typography variant="small" color="gray" className="font-medium uppercase tracking-wider">
                  {title}
                </Typography>
                <Typography variant="h4" color="blue-gray" className="font-bold">
                  {value}
                </Typography>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Students */}
        <Card className="shadow-sm border border-gray-100">
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <Typography variant="h5" color="blue-gray" className="font-bold">
                Recent Students
              </Typography>
              <Button variant="text" size="sm" className="text-blue-500">
                View All
              </Button>
            </div>
            <div className="divide-y divide-gray-100">
              {students.slice(0, 5).map((student, index) => (
                <div key={index} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={student.isGoogleUser ? student.profilePic?.url : student.profileUrl}
                      alt={student.firstName}
                      size="sm"
                    />
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-bold">
                        {student.firstName} {student.lastName}
                      </Typography>
                      <Typography variant="small" color="gray" className="font-normal opacity-70">
                        {student.email}
                      </Typography>
                    </div>
                  </div>
                  <Typography variant="small" color="gray" className="font-medium">
                    {formatDate(student.dateJoined)}
                  </Typography>
                </div>
              ))}
              {students.length === 0 && (
                <Typography color="gray" className="text-center py-10">
                  No students enrolled yet.
                </Typography>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Your Courses */}
        <Card className="shadow-sm border border-gray-100">
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <Typography variant="h5" color="blue-gray" className="font-bold">
                Your Courses
              </Typography>
              <Button variant="text" size="sm" className="text-blue-500">
                View All
              </Button>
            </div>
            <div className="divide-y divide-gray-100">
              {courses.slice(0, 5).map((course, index) => (
                <div key={index} className="py-3 flex items-center justify-between">
                  <div>
                    <Typography variant="small" color="blue-gray" className="font-bold">
                      {course.title}
                    </Typography>
                    <Typography variant="small" color="gray" className="font-normal">
                      {course.category} • {course.level}
                    </Typography>
                  </div>
                  <div className="text-right">
                    <Typography variant="small" color="blue-gray" className="font-bold">
                      {course.isPaid ? `$${course.price}` : "Free"}
                    </Typography>
                    <Typography variant="small" color="green" className="font-medium">
                      Active
                    </Typography>
                  </div>
                </div>
              ))}
              {courses.length === 0 && (
                <Typography color="gray" className="text-center py-10">
                  No courses added yet.
                </Typography>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default InstructorDashboard;
