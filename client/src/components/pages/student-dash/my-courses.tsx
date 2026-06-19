import React, { useState, useEffect } from "react";
import MyCourseCard from "./my-course-card";
import { getCourseByStudent } from "../../../api/endpoints/course/course";
import { toast } from "react-toastify";
import { CourseInterface } from "../../../types/course";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectStudent } from "../../../redux/reducers/studentSlice";
import ProfileCardShimmer from "../../shimmer/profile-card-shimmer";

type Props = {};

const MyCourses: React.FC = (props: Props) => {
  const [courses, setCourse] = useState<CourseInterface[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { studentDetails } = useSelector(selectStudent);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await getCourseByStudent();
      setCourse(response.data);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error: any) {
      setLoading(false);
      toast.success(error?.data?.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const standardCourses = courses || [];
  const archivedCourses = studentDetails?.aiCourses || [];
  const activePathModules = studentDetails?.recommendedPath || [];
  
  const allAiCourses = [...archivedCourses];
  
  // Only show the active recommendedPath as a fallback entry if the vault is empty
  // (i.e., the course hasn't been archived yet). Once archived, the vault entry
  // has the real completed/in-progress status written by submitQuiz.
  if (activePathModules.length > 0 && archivedCourses.length === 0) {
    const allModulesDone = activePathModules.length > 0 && activePathModules.every((m: any) => {
      const coreLessons = m.lessons?.filter((l: any) => !l.title?.includes('[REMEDIAL]')) || [];
      return m.status === 'completed' || (coreLessons.length > 0 && coreLessons.every((l: any) => l.status === 'completed'));
    });
    allAiCourses.unshift({
      courseTitle: studentDetails?.learningGoal || 'Active Journey',
      category: studentDetails?.interests?.[0] || 'Learning',
      status: allModulesDone ? 'completed' : 'in-progress',
      modules: activePathModules,
      createdAt: new Date().toISOString() as any,
      masteryScore: 0 
    });
  }

  const [expandedCourse, setExpandedCourse] = useState<string | null>(allAiCourses[0]?.courseTitle || null);

  const toggleCourse = (id: string) => {
    setExpandedCourse(expandedCourse === id ? null : id);
  };

  const getIsModuleDone = (m: any) => {
    const coreLessons = m.lessons?.filter((l: any) => !l.title.includes('[REMEDIAL]')) || [];
    return m.status === "completed" || (coreLessons.length > 0 && coreLessons.every((l: any) => l.status === "completed"));
  };

  return (
    <div className='w-full flex justify-center items-center pb-32 bg-gray-50/30'>
      <div className='w-11/12'>
        <div className='pt-12 pb-8 w-full border-b border-gray-200 mb-10'>
          <h2 className='text-4xl font-black text-gray-900 tracking-tight'>
            My Learning <span className="text-blue-600">Vault</span>
          </h2>
          <p className="text-gray-500 font-medium mt-1">Manage your personalized AI curricula and enrolled catalog.</p>
        </div>

        <div className='space-y-16'>

          {allAiCourses.length > 0 && (
            <section>
              <div className='mb-8 flex items-center gap-3'>
                <div className="p-2 bg-purple-100 rounded-lg">
                   <div className="w-5 h-5 bg-purple-500 rounded-full"></div>
                </div>
                <h5 className='text-gray-900 font-black uppercase tracking-widest text-xs'>
                  🤖 Personalized AI Journey Library
                </h5>
              </div>

              <div className='flex flex-wrap gap-x-8 gap-y-8'>
                {allAiCourses.flatMap((course: any) =>
                  (course.modules || []).map((module: any) => (
                    <Link to={`/ai-course/${module._id}`} key={module._id} className="group">
                      <MyCourseCard
                        _id={module._id}
                        title={module.moduleTitle}
                        description={`${module.lessons?.length || 0} Personalized Lessons`}
                        thumbnailUrl="/ai-thumbnail.png"
                        duration={module.lessons?.length || 1}
                        coursesEnrolled={[]}
                        instructorId="ai-tutor"
                        category="AI Module"
                        level="Adaptive"
                        tags={["AI", "Custom"]}
                        price={0}
                        isPaid={false}
                        about="Tailored for you by TutorLLM"
                        syllabus={module.lessons?.map((l: any) => l.title) || []}
                        requirements={["Curiosity"]}
                        introduction={{ _id: "i", key: "i", name: "i" }}
                        guidelinesUrl="#"
                        rating={5}
                        isVerified={true}
                        createdAt={new Date().toISOString()}
                        completionStatus={getIsModuleDone(module) ? 100 : 0}
                        __v={0}
                      />
                    </Link>
                  ))
                )}
              </div>
            </section>
          )}



          {standardCourses.length > 0 && (
            <section>
              <div className='mb-8 flex items-center gap-3'>
                <div className="p-2 bg-blue-100 rounded-lg">
                   <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                </div>
                <h5 className='text-gray-900 font-black uppercase tracking-widest text-xs'>
                   Catalog Enrolled Courses
                </h5>
              </div>
              <div className='flex flex-wrap gap-x-10 gap-y-10'>
                {standardCourses.map((course) => (
                  <Link to={`/courses/${course._id}`} key={course._id}>
                    <MyCourseCard {...course} />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {standardCourses.length === 0 && allAiCourses.length === 0 && !loading && (
            <div className='text-center py-24 px-10 bg-white border-2 border-dashed border-gray-200 rounded-[3rem]'>
              <div className="text-7xl mb-8">🔭</div>
              <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Expand Your Horizons</h3>
              <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium text-lg">Your vault is currently empty. Visit our catalog or generate a personalized AI path to begin your journey.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to='/courses' className='bg-blue-600 text-white px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-blue-700 transition-all font-black'>
                  Explore Catalog
                </Link>
                <Link to='/onboarding' className='bg-purple-600 text-white px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-purple-700 transition-all font-black'>
                  Generate AI Path
                </Link>
              </div>
            </div>
          )}

          {loading && (
             <div className="flex flex-wrap gap-10 justify-center py-20">
                {Array.from({ length: 3 }).map((_, index) => <ProfileCardShimmer key={index} />)}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
