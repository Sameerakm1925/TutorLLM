import React from "react";
import { Tooltip, Typography } from "@material-tailwind/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectStudent } from "../../../redux/reducers/studentSlice";

type Props = {};

const DashHome: React.FC = (props: Props) => {
  const student = useSelector(selectStudent);
  const navigate = useNavigate();
  const recommendedPath = student.studentDetails?.recommendedPath;

  // Find effectively completed modules by checking lessons
  const getIsModuleDone = (m: any) => {
    const coreLessons = m.lessons?.filter((l: any) => !l.title.includes('[REMEDIAL]')) || [];
    return m.status === "completed" || (coreLessons.length > 0 && coreLessons.every((l: any) => l.status === "completed"));
  };

  const completedCount = recommendedPath?.filter(getIsModuleDone).length || 0;
  const totalCount = recommendedPath?.length || 0;
  const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllDone = totalCount > 0 && overallProgress === 100;

  // Absolute Mastery Calculation - Total Points / Total Tests Taken
  const modulesWithQuizzes = recommendedPath?.filter((m: any) => m.masteryScore > 0) || [];
  const quizCount = modulesWithQuizzes.length;
  const averageMasteryScore = quizCount > 0 
    ? Math.round(modulesWithQuizzes.reduce((acc: number, m: any) => acc + (m.masteryScore || 0), 0) / quizCount) 
    : 0;

  // Find the current active module or default to the last one for display if all are finished
  const activeModule = recommendedPath?.find((m: any) => m.status === 'in-progress' || !getIsModuleDone(m));
  const displayModule = activeModule || (recommendedPath && recommendedPath[recommendedPath.length - 1]);

  return (
    <div className="w-full flex justify-center items-center">
      <div className="w-11/12">
        <div>
          <div className="pt-5 pb-2 w-full">
            <h2 className="text-3xl font-semibold text-customFontColorBlack">
              Welcome back,{" "}
              {student.studentDetails?.firstName +
                " " +
                student.studentDetails?.lastName}
            </h2>
          </div>

          {/* AI Path Progress Banner */}
          {displayModule && (
            <div className={`mb-6 mt-2 ${isAllDone ? 'bg-gradient-to-r from-green-600 to-teal-700' : 'bg-gradient-to-r from-blue-600 to-indigo-700'} rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-4`}>
              <div className="flex-1 w-full">
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
                  {isAllDone ? "🏆 Course Completed" : "🤖 AI Personalized Curriculum"}
                </p>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                  <h3 className="text-2xl font-extrabold">
                    {displayModule.moduleTitle}
                  </h3>
                  {isAllDone && averageMasteryScore > 0 && (
                     <div className="bg-white/30 px-3 py-1.5 rounded-xl border border-white/40 flex items-center gap-2 backdrop-blur-sm">
                        <span className="text-[10px] font-black uppercase opacity-80">Course Mastery:</span>
                        <span className="text-xl font-black">{averageMasteryScore}%</span>
                     </div>
                  )}
                </div>
                <p className="text-white/80 text-sm mb-4 font-medium">
                   {isAllDone ? "Congratulations! You have successfully mastered every module in this curriculum." : `Currently mastering ${completedCount + 1} of ${totalCount} modules — Keep it up!`}
                </p>
                <div className="w-full bg-black/20 rounded-full h-3 mb-1">
                  <div
                    className="bg-white h-3 rounded-full transition-all duration-1000 shadow-sm"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                   <p className="text-xs text-white/70 font-bold uppercase tracking-wider">
                     {isAllDone ? "Goal Achieved" : "Course Completion"}
                   </p>
                   <p className="text-xs text-white font-black">
                     {overallProgress}%
                   </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate(`/ai-course/${displayModule._id}`)}
                  className={`px-8 py-3 bg-white ${isAllDone ? 'text-green-700' : 'text-blue-700'} font-extrabold rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all whitespace-nowrap`}
                >
                  {isAllDone ? "↺ Review Course" : "▶ Resume Module"}
                </button>
                {isAllDone && (
                   <button
                    onClick={() => navigate('/onboarding')}
                    className="px-8 py-3 bg-green-900/30 text-white border-2 border-white/50 backdrop-blur-md font-extrabold rounded-xl shadow-lg hover:bg-green-900/50 hover:border-white transition-all whitespace-nowrap flex items-center gap-2"
                  >
                    ✨ Discover New Concept
                  </button>
                )}
              </div>
            </div>
          )}

          {/* View full roadmap shortcut */}
          {recommendedPath && recommendedPath.length > 0 && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => navigate("/dashboard/learning-path")}
                className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                View Full AI Roadmap →
              </button>
            </div>
          )}

          <div className="mb-2 pt-1">
            <h5 className="text-customFontColorBlack font-semibold">
              MY ASSIGNMENTS
            </h5>
          </div>
        </div>

        <div className="h-[30rem] flex flex-col md:flex-row gap-x-10">
          <div className="border md:w-8/12 w-full h-full bg-white rounded-md border-gray-300">
            <div className="flex h-full flex-col justify-center items-center">
              <h2 className="text-xl font-semibold p-1 text-customFontColorBlack">
                There's nothing harder than starting from a blank canvas.
              </h2>
              <div className="w-7/12">
                <p className="text-sm whitespace-pre-line text">
                  Set a goal and we'll be your accountability partner with
                </p>
                <p className="text-sm ml-4 whitespace-pre-line text">
                  custom reminders and weekly progress reports.
                </p>
              </div>
              <button className="bg-blue-500 mt-5 hover:bg-blue-600 rounded-md text-white p-2">
                Set yourself a goal
              </button>
            </div>
          </div>
          <div className="border my-5 md:mt-0 md:w-4/12 w-full h-full bg-white rounded-md border-gray-300">
            <div className="p-2 flex">
              <h2 className="text-customFontColorBlack font-bold pt-2 pl-2">
                My weekly goal
              </h2>
              <Tooltip
                content={
                  <div className="w-80">
                    <Typography color="white" className="font-medium">
                      Info
                    </Typography>
                    <Typography
                      variant="small"
                      color="white"
                      className="font-normal opacity-80"
                    >
                      To achieve your goal for a day, complete any lectures
                    </Typography>
                  </div>
                }
              >
                <InformationCircleIcon
                  strokeWidth={2}
                  className="text-blue-gray-500 w-4 h-4 mt-3 ml-0.5 cursor-pointer"
                />
              </Tooltip>
            </div>
            <div></div>
            <div className="m-4 bg-gray-200 rounded-md">
              <h2 className="text-sm font-light p-2">
                Make it a habit! Each day that you complete a lecture, practice
                with a lab, or take a quiz or exam you'll build your learning
                streak.
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashHome;
