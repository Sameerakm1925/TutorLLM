import React from "react";
import { useSelector } from "react-redux";
import { selectStudent } from "../../../redux/reducers/studentSlice";
import {
  Card,
  CardBody,
  Typography,
  Progress,
  Chip,
} from "@material-tailwind/react";
import { CheckCircleIcon, TrophyIcon, BeakerIcon } from "@heroicons/react/24/solid";

const CourseProgress: React.FC = () => {
  const { studentDetails } = useSelector(selectStudent);
  const recommendedPath = studentDetails?.recommendedPath || [];

  const getIsModuleDone = (m: any) => {
    const coreLessons = m.lessons?.filter((l: any) => !l.title.includes('[REMEDIAL]')) || [];
    return m.status === "completed" || (coreLessons.length > 0 && coreLessons.every((l: any) => l.status === "completed"));
  };

  const completedCount = recommendedPath.filter(getIsModuleDone).length;
  const totalCount = recommendedPath.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Calculate stats
  const totalLessons = recommendedPath.reduce((acc: number, m: any) => 
    acc + (m.lessons?.filter((l: any) => !l.title.includes('[REMEDIAL]')).length || 0), 0);
  const completedLessons = recommendedPath.reduce((acc: number, m: any) => 
    acc + (m.lessons?.filter((l: any) => l.status === 'completed' && !l.title.includes('[REMEDIAL]')).length || 0), 0);

  const modulesWithQuizzes = recommendedPath.filter((m: any) => m.masteryScore > 0);
  const averageMastery = modulesWithQuizzes.length > 0 
    ? Math.round(modulesWithQuizzes.reduce((acc: number, m: any) => acc + (m.masteryScore || 0), 0) / modulesWithQuizzes.length) 
    : 0;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <Typography variant="h2" color="blue-gray" className="font-black">
            Progress Tracking
          </Typography>
          <Typography color="gray" className="mt-1 font-medium">
            Monitor your journey through your AI-personalized curriculum.
          </Typography>
        </div>
        {progressPercent === 100 && (
          <Chip
            variant="gradient"
            color="green"
            value="Course Completed"
            icon={<TrophyIcon className="h-5 w-5" />}
            className="rounded-full px-6 py-2"
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border border-gray-100 bg-gradient-to-br from-blue-50 to-white">
          <CardBody className="p-6">
            <Typography variant="small" color="blue" className="font-bold uppercase tracking-wider mb-2">
              Overall Completion
            </Typography>
            <div className="flex items-baseline gap-1">
              <Typography variant="h2" color="blue-gray" className="font-black">
                {progressPercent}%
              </Typography>
            </div>
            <Progress value={progressPercent} color="blue" size="sm" className="mt-4" />
          </CardBody>
        </Card>

        <Card className="shadow-sm border border-gray-100 bg-gradient-to-br from-green-50 to-white">
          <CardBody className="p-6">
            <Typography variant="small" color="green" className="font-bold uppercase tracking-wider mb-2">
              Mastery Score
            </Typography>
            <div className="flex items-baseline gap-1">
              <Typography variant="h2" color="blue-gray" className="font-black">
                {averageMastery}%
              </Typography>
            </div>
            <Typography variant="small" color="gray" className="mt-4 font-medium italic">
              Based on {modulesWithQuizzes.length} Knowledge Checks
            </Typography>
          </CardBody>
        </Card>

        <Card className="shadow-sm border border-gray-100 bg-gradient-to-br from-purple-50 to-white">
          <CardBody className="p-6">
            <Typography variant="small" color="purple" className="font-bold uppercase tracking-wider mb-2">
              Lessons Completed
            </Typography>
            <div className="flex items-baseline gap-1">
              <Typography variant="h2" color="blue-gray" className="font-black">
                {completedLessons}
              </Typography>
              <Typography variant="h5" color="gray" className="font-medium">
                / {totalLessons}
              </Typography>
            </div>
            <div className="flex gap-1 mt-4">
               {Array.from({length: Math.min(totalLessons, 10)}).map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i < completedLessons ? 'bg-purple-500' : 'bg-gray-200'}`} />
               ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="space-y-4">
        <Typography variant="h4" color="blue-gray" className="font-bold">
          Detailed Module Breakdown
        </Typography>
        <div className="grid grid-cols-1 gap-4">
          {recommendedPath.map((module: any, idx: number) => {
            const isDone = getIsModuleDone(module);
            return (
              <Card key={module._id || idx} className={`shadow-sm border ${isDone ? 'border-green-100 bg-green-50/20' : 'border-gray-100'}`}>
                <CardBody className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isDone ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {isDone ? <CheckCircleIcon className="h-6 w-6" /> : <BeakerIcon className="h-6 w-6" />}
                    </div>
                    <div>
                      <Typography variant="h6" color="blue-gray" className="font-bold">
                        {module.moduleTitle}
                      </Typography>
                      <Typography variant="small" color="gray" className="font-medium">
                         {module.lessons?.filter((l:any) => l.status === 'completed').length || 0} of {module.lessons?.length || 0} Lessons Finished
                      </Typography>
                    </div>
                  </div>
                  <div className="text-right">
                    <Typography variant="h6" color={isDone ? "green" : "blue-gray"} className="font-black">
                      {isDone ? "COMPLETE" : "IN PROGRESS"}
                    </Typography>
                    {module.masteryScore > 0 && (
                      <Typography variant="small" color="blue" className="font-bold">
                        Quiz Score: {module.masteryScore}%
                      </Typography>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>

      {progressPercent === 100 && (
         <div className="bg-indigo-900 rounded-3xl p-10 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
               <TrophyIcon className="h-16 w-16 text-yellow-400 mx-auto mb-6 drop-shadow-lg" />
               <Typography variant="h2" color="white" className="font-black mb-4">
                  Course Fully Mastered!
               </Typography>
               <Typography variant="lead" color="white" className="opacity-80 max-w-2xl mx-auto mb-8 font-medium">
                  You have successfully navigated through your entire AI-personalized curriculum. Your adaptability and commitment to learning have been exceptional.
               </Typography>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full -ml-20 -mb-20 blur-3xl" />
         </div>
      )}
    </div>
  );
};

export default CourseProgress;
