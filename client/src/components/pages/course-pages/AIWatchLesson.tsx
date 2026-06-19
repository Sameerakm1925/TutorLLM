import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BiVideo } from "react-icons/bi";
import { useSelector, useDispatch } from "react-redux";
import { selectStudent, fetchStudentData } from "../../../redux/reducers/studentSlice";
import { adaptPathService } from "../../../api/services/student";
import END_POINTS from "../../../constants/endpoints";

import QuizModal from "./QuizModal";

const AIWatchLesson: React.FC = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const { studentDetails } = useSelector(selectStudent);

  // Use toString() to safely compare MongoDB ObjectId with URL string param
  const currentModule = studentDetails?.recommendedPath?.find((m: any) => m._id?.toString() === moduleId);
  
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const hasAutoJumped = useRef(false);

  // RESET auto-jump when moduleId changes to ensure we land on the right lesson of the NEW module
  useEffect(() => {
    hasAutoJumped.current = false;
    setCurrentLessonIndex(0);
  }, [moduleId]);

  useEffect(() => {
    // ONLY auto-jump to the first incomplete lesson once whenever the module loads
    if (currentModule && currentModule.lessons && !hasAutoJumped.current) {
      const firstIncompleteIdx = currentModule.lessons.findIndex((l: any) => l.status !== 'completed');
      if (firstIncompleteIdx !== -1) {
        setCurrentLessonIndex(firstIncompleteIdx);
        hasAutoJumped.current = true;
      }
    }
  }, [currentModule, moduleId]); // moduleId ensures we jump on navigation

  if (!currentModule || !currentModule.lessons || currentModule.lessons.length === 0) {
    return <div className="p-10 text-center text-xl font-bold">Module not found or empty.</div>;
  }

  const currentLesson = currentModule ? currentModule.lessons[currentLessonIndex] : null;
  const isLessonCompleted = currentLesson?.status === 'completed';

  // Guard: if lesson index is out of bounds (can happen mid-render after Redux update)
  if (currentLesson === null || currentLesson === undefined) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-2xl font-bold text-gray-700">Loading lesson...</div>
        <div className="text-sm text-gray-400">If this persists, go back and try again.</div>
        <button onClick={() => navigate("/dashboard/learning-path")} className="px-6 py-2 bg-blue-600 text-white rounded-lg">← Back to Roadmap</button>
      </div>
    );
  }

  const handleQuizSuccess = async (result: any) => {
    // Refresh student data to get new status
    await dispatch(fetchStudentData());
    
    // Auto-advance or redirect home regardless of pass/fail (since Continue anyway also advances path)
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonIndex(currentIdx => currentIdx + 1);
    } else {
      toast.success(result.passed ? "Module fully mastered!" : "Module completed!");
      navigate("/dashboard/learning-path");
    }
  };

  const handleNextLesson = async () => {
    if (!currentModule._id || !currentLesson._id) return;
    try {
      await adaptPathService(END_POINTS.ADAPT_PATH, {
        moduleId: currentModule._id,
        lessonId: currentLesson._id
      } as any);
      
      await dispatch(fetchStudentData());
      
      // Advance to next lesson
      if (currentLessonIndex < currentModule.lessons.length - 1) {
        setCurrentLessonIndex(currentIdx => currentIdx + 1);
      }
    } catch (error) {
      toast.error("Failed to advance lesson");
    }
  };

  const isLastLesson = currentLessonIndex === currentModule.lessons.length - 1;

  return (
    <div className="flex flex-col h-screen bg-gray-900 overflow-hidden">
      {/* Premium Lesson Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800/80 backdrop-blur-lg border-b border-gray-700/50 z-20">
        <button 
           onClick={() => navigate("/dashboard/learning-path")}
           className="flex items-center gap-2 text-gray-400 hover:text-white transition-all group"
        >
           <div className="p-2 rounded-lg bg-gray-700/50 group-hover:bg-blue-600 transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
           </div>
           <span className="text-sm font-bold uppercase tracking-widest hidden md:block">Back to Roadmap</span>
        </button>

        <div className="flex flex-col items-center">
           <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-0.5">Currently Learning</span>
           <h1 className="text-white font-bold text-lg leading-tight">{currentModule.moduleTitle}</h1>
        </div>

        <div className="w-10 md:w-40 flex justify-end">
           <div className="text-xs font-bold bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
              Lesson {currentLessonIndex + 1}/{currentModule.lessons.length}
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 bg-gray-50 overflow-hidden font-sans relative">
        
        {/* Video Content Area */}
        <div className="md:w-3/4 w-full h-full flex flex-col bg-black relative">
          <div className="flex-1 w-full bg-black relative">
          {currentLesson.videoId ? (
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${currentLesson.videoId}?modestbranding=1&rel=0`}
              title={currentLesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white absolute inset-0">Video Unavailable</div>
          )}
        </div>
        
        {/* Dynamic Action Bar */}
        <div className="bg-white p-4 border-t shadow-md flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{currentLesson.title}</h2>
            <p className="text-sm text-gray-500">{currentLesson.description}</p>
          </div>
          <div className="flex gap-4">
             {isLastLesson ? (
               <div className="flex gap-3">
                 <button
                   onClick={() => setIsQuizOpen(true)}
                   disabled={isLessonCompleted}
                   className={`px-8 py-3 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                     isLessonCompleted 
                       ? 'bg-green-50 text-green-600 border border-green-200 cursor-not-allowed' 
                       : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                   }`}
                 >
                   {isLessonCompleted ? (
                     <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Module Mastered</>
                   ) : "Take Module Quiz"}
                 </button>
                 {isLessonCompleted && (
                   <button 
                     onClick={() => {
                        const nextIdx = (studentDetails?.recommendedPath?.findIndex((m: any) => m._id?.toString() === currentModule._id?.toString()) ?? -1) + 1;
                        if (nextIdx > 0 && nextIdx < (studentDetails?.recommendedPath?.length ?? 0)) {
                           navigate(`/ai-course/${studentDetails?.recommendedPath?.[nextIdx]._id?.toString()}`);
                        } else {
                           navigate("/dashboard/learning-path");
                           toast.success("Path complete! Returning to roadmap.");
                        }
                     }}
                     className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black shadow-lg hover:bg-indigo-700 flex items-center gap-2 transition-all active:scale-95"
                   >
                     Go to Next Module
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                   </button>
                 )}
               </div>
             ) : (
               <button
                 onClick={handleNextLesson}
                 disabled={isLessonCompleted}
                 className={`px-8 py-3 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                   isLessonCompleted 
                     ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                     : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                 }`}
               >
                 {isLessonCompleted ? "✓ Lesson Done" : "Mark as Complete & Next"}
               </button>
             )}
          </div>
        </div>
      </div>

      {/* Sidebar Lesson Playlist */}
      <div className="w-full md:w-1/4 h-full bg-white border-l border-gray-200 overflow-y-auto pb-20">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h1 className="font-extrabold text-blue-900 text-xl">{currentModule.moduleTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">Personalized Curriculum</p>
        </div>
        
        <ul className="py-2">
          {currentModule.lessons
            .filter((l: any) => !l.title.includes('[REMEDIAL]'))
            .map((lesson: any, index: number) => {
              const isPlaying = lesson._id?.toString() === currentLesson._id?.toString();
              const isDone = lesson.status === 'completed';
              
              // Sequential lock logic for filtered list
              const filteredList = currentModule.lessons.filter((l: any) => !l.title.includes('[REMEDIAL]'));
              const isLocked = index > 0 && filteredList.slice(0, index).some((l: any) => l.status !== 'completed');

              return (
                <li
                  key={lesson._id || index}
                  onClick={() => !isLocked && setCurrentLessonIndex(currentModule.lessons.findIndex((l:any) => l._id === lesson._id))}
                  className={`flex items-start gap-4 p-5 border-b border-gray-100 transition-all ${
                    isLocked ? "opacity-50 grayscale cursor-not-allowed bg-gray-50" : "cursor-pointer"
                  } ${
                    isPlaying ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-gray-50 border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="mt-1">
                    {isLocked ? (
                       <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                       </div>
                    ) : isPlaying ? (
                       <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                         <BiVideo size={20} />
                       </div>
                    ) : isDone ? (
                       <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                       </div>
                    ) : (
                       <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-xs shadow-sm">
                         {index + 1}
                       </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold text-sm ${isPlaying ? 'text-blue-900' : isDone ? 'text-gray-900' : 'text-gray-700'}`}>
                      {lesson.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{lesson.description}</p>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>

      {/* Quiz Modal Integration */}
      {currentLesson && currentLesson._id && (
        <QuizModal 
          isOpen={isQuizOpen} 
          onClose={() => setIsQuizOpen(false)} 
          lessonId={currentLesson._id}
          moduleId={moduleId || ""}
          onSuccess={handleQuizSuccess}
        />
      )}
    </div>
    </div>
  );
};

export default AIWatchLesson;
