import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../api/middlewares/protected-interceptor";
import CONFIG_KEYS from "../../../config";
import END_POINTS from "../../../constants/endpoints";

interface Course {
  _id: string;
  title: string;
  category: string;
  level: string;
  description: string;
  instructorId: string;
  createdAt: string;
}

const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUnverifiedCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `${CONFIG_KEYS.API_BASE_URL}/${END_POINTS.GET_UNVERIFIED_COURSES}`,
      );
      setCourses(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (courseId: string) => {
    try {
      await api.patch(
        `${CONFIG_KEYS.API_BASE_URL}/${END_POINTS.VERIFY_COURSE}/${courseId}`,
      );
      toast.success("Course verified successfully!");
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch (error) {
      toast.error("Failed to verify course");
    }
  };

  useEffect(() => {
    fetchUnverifiedCourses();
  }, []);

  if (loading)
    return <div className="p-10 text-center">Loading courses...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Pending Course Approvals
      </h1>
      {courses.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          <p className="text-xl">No pending courses!</p>
          <p className="text-sm mt-2">All courses have been verified.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex items-center justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {course.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Category: {course.category} | Level: {course.level}
                </p>
                <p className="text-sm text-gray-600 mt-2 max-w-xl line-clamp-2">
                  {course.description}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Added: {new Date(course.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleVerify(course._id)}
                className="ml-4 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCoursesPage;
