import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectStudent } from '../../../redux/reducers/studentSlice';
import { CheckCircleIcon, PlayCircleIcon } from '@heroicons/react/24/solid';
import { Typography } from "@material-tailwind/react";

const RecommendedPath = () => {
  const { studentDetails } = useSelector(selectStudent);
  const navigate = useNavigate();

  if (!studentDetails?.isOnboardingComplete) {
    return (
      <div className="flex flex-col items-center justify-center p-10 h-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">No Learning Path Found</h2>
        <button 
          onClick={() => navigate('/onboarding')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
        >
          Take the Survey
        </button>
      </div>
    );
  }

  const { recommendedPath } = studentDetails;

  // Calculate Overall Course Mastery - Check lessons directly for 100% accuracy
  const completedModules = recommendedPath?.filter((m: any) => {
    const coreLessons = m.lessons?.filter((l: any) => !l.title.includes('[REMEDIAL]')) || [];
    return m.status === 'completed' || (coreLessons.length > 0 && coreLessons.every((l: any) => l.status === 'completed'));
  }) || [];

  // Absolute Mastery Calculation - Total Points / Total Tests Taken
  const modulesWithQuizzes = recommendedPath?.filter((m: any) => m.masteryScore > 0) || [];
  const averageScore = modulesWithQuizzes.length > 0 
    ? Math.round(modulesWithQuizzes.reduce((acc: number, m: any) => acc + (m.masteryScore || 0), 0) / modulesWithQuizzes.length) 
    : 0;

  console.log(`Scores used for roadmap average:`, modulesWithQuizzes.map((m: any) => m.masteryScore));

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
          Your Personalized Journey
        </h1>
        <p className="text-gray-600 text-lg">Curated specifically for your goal to {studentDetails.learningGoal?.replace('-', ' ')} at a {studentDetails.skillLevel} level.</p>
        
        {/* Always show course performance once at least one module is complete or course is finished */}
        {(completedModules.length > 0 || studentDetails.recommendedPath?.every((m: any) => m.status === 'completed')) && (
           <div className="mt-8 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden group">
              <div className="relative z-10">
                 <Typography variant="h5" className="opacity-80 font-medium mb-1">Overall Learning Mastery</Typography>
                 <div className="flex items-center justify-center gap-4">
                    <Typography variant="h1" className="text-7xl font-black">{averageScore}%</Typography>
                    <div className="text-left border-l border-white/20 pl-4">
                       <Typography variant="h6" className="font-bold leading-tight">Course Performance</Typography>
                       <Typography variant="small" className="opacity-70">{completedModules.length} of {recommendedPath?.length} Modules Mastered</Typography>
                    </div>
                 </div>
              </div>
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl" />
           </div>
        )}
      </div>

      <div className="relative border-l-4 border-blue-200 ml-6 md:ml-12 mt-12 space-y-12 pb-12">
        {recommendedPath?.map((module: any, index: number) => {
          // FILTER OUT REMEDIAL LESSONS FOR PROGRESS ACCURACY
          const coreLessons = module.lessons?.filter((l: any) => !l.title.includes('[REMEDIAL]')) || [];
          const allCoreLessonsDone = coreLessons.length > 0 && coreLessons.every((l: any) => l.status === 'completed');
          
          // A module is completed if either the status says so OR all its core lessons are done
          const isCompleted = module.status === 'completed' || allCoreLessonsDone;
          
          // A module is unlocked if it's first, or the previous module is fully completed
          const previousModuleCompleted = index === 0 || 
            (recommendedPath[index - 1]?.status === 'completed' || 
             (recommendedPath[index - 1]?.lessons?.filter((l: any) => !l.title.includes('[REMEDIAL]')).every((l: any) => l.status === 'completed')));
          
          const isUnlocked = isCompleted || module.status === 'in-progress' || previousModuleCompleted;
          
          // EXCLUSIVE check for isInProgress
          const isInProgress = !isCompleted && isUnlocked;

          const completedLessonsCount = coreLessons.filter((l: any) => l.status === 'completed').length || 0;
          const totalLessonsCount = coreLessons.length || 1;
          const progressPercent = Math.round((completedLessonsCount / totalLessonsCount) * 100);

          return (
             <div key={module._id || index} className="relative pl-10 md:pl-16">
              {/* Timeline Marker */}
              <div className={`absolute -left-[22px] top-1 h-10 w-10 rounded-full border-4 border-white flex items-center justify-center shadow-md ${
                isCompleted ? 'bg-green-500' : isInProgress ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'
              }`}>
                {isCompleted ? (
                   <CheckCircleIcon className="text-white w-6 h-6" />
                ) : (
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                )}
              </div>

              {/* Content Card */}
              <div className={`bg-white rounded-2xl shadow-lg border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                isInProgress ? 'border-blue-400 ring-2 ring-blue-100' : isUnlocked && !isCompleted ? 'border-blue-200' : 'border-gray-100'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block ${
                      isCompleted ? 'bg-green-100 text-green-700' : isInProgress ? 'bg-blue-100 text-blue-700' : isUnlocked ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isCompleted ? 'Completed' : isInProgress ? 'Up Next' : isUnlocked ? 'Start' : 'Locked'}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {module.moduleTitle || 'AI Recommended Module'}
                    </h3>
                    <p className="text-gray-500 mt-1 flex gap-2 font-medium">
                       {totalLessonsCount} AI Generated Lessons
                    </p>
                    
                    {/* Display Lessons list explicitly - FILTER REMEDIAL */}
                    <div className="mt-4 space-y-2">
                       {coreLessons.map((lesson: any, lIdx: number) => (
                         <div key={lesson._id || lIdx} className="flex items-center gap-3 text-sm">
                           <div className={`w-2 h-2 rounded-full ${lesson.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                           <span className={lesson.status === 'completed' ? 'text-gray-400 line-through font-medium opacity-60' : 'text-gray-700 font-medium'}>
                             {lesson.title}
                           </span>
                         </div>
                       ))}
                    </div>
                  </div>
                  
                  {/* Action Button — visible to all unlocked modules */}
                  {(isUnlocked || isCompleted) && (
                    <button 
                      onClick={() => navigate(`/ai-course/${module._id}`)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                        isCompleted ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                      }`}
                    >
                      <PlayCircleIcon className="w-5 h-5" />
                      {isCompleted ? 'Review Module' : 'Start Module'}
                    </button>
                  )}
                </div>

                {/* Granular Lesson Progress Bar */}
                {(isInProgress || isCompleted) && (
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-6 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-1000 ease-in-out" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                )}
                {(isInProgress || isCompleted) && (
                  <p className="text-right text-xs font-bold text-gray-500 mt-2">{progressPercent}% Completed</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default RecommendedPath;
