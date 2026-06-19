import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Radio,
} from "@material-tailwind/react";
import { getQuizzesByLessonService, submitQuizService } from "../../../api/services/course/quiz-service";
import { adaptPathService } from "../../../api/services/student";
import END_POINTS from "../../../constants/endpoints";
import { toast } from "react-toastify";
import { SyncLoader } from "react-spinners";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  moduleId: string;
  onSuccess: (result: any) => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, lessonId, moduleId, onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [result, setResult] = useState<any>(null);
  const [attempt, setAttempt] = useState(1);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (isOpen && lessonId) {
      fetchQuiz();
      setAttempt(1);
      setResult(null);
      setSelectedAnswers({});
      setShowReview(false);
    }
  }, [isOpen, lessonId]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const response = await getQuizzesByLessonService(END_POINTS.GET_QUIZZES_BY_LESSON, lessonId);
      setQuiz(response.data);
    } catch (error) {
      toast.error("Failed to load quiz");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length < quiz.questions.length) {
      toast.warn("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const answersArray = Object.keys(selectedAnswers)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => selectedAnswers[Number(key)]);

      const response = await submitQuizService(END_POINTS.SUBMIT_QUIZ, lessonId, answersArray, attempt);
      setResult(response.data);
      if (response.data.passed) {
        toast.success("Knowledge Check Passed!");
      } else {
        if (response.data.canRetry) {
          toast.info("Mastery not yet reached. One attempt remaining.");
        } else {
          toast.error("Review recommended before proceeding.");
        }
      }
    } catch (error) {
      toast.error("Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setSelectedAnswers({});
    setAttempt(2);
  };

  const handleContinueAnyway = async () => {
    setSubmitting(true);
    try {
      // Identify the module and lesson to mark as progressed
      await adaptPathService(END_POINTS.ADAPT_PATH, {
        moduleId: moduleId,
        lessonId: lessonId,
        score: result?.score // Pass the final score even on skip
      } as any);
      
      onSuccess(result || { passed: true });
      onClose();
      toast.info("Moving to next part of your roadmap...");
    } catch (error) {
      toast.error("Failed to advance. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    if (result) {
      onSuccess(result);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} handler={onClose} size="lg" className="overflow-hidden">
      <DialogHeader className="bg-blue-600 text-white p-6 justify-between">
        <Typography variant="h4" color="white">
          Knowledge Check
        </Typography>
        <Typography variant="small" className="bg-blue-700 px-3 py-1 rounded-full text-blue-100 font-bold border border-blue-500">
          Attempt {attempt}/2
        </Typography>
      </DialogHeader>
      
      <DialogBody divider className="h-[28rem] overflow-y-auto p-6 scrollbar-hide">
        {loading || submitting && !result ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <SyncLoader color="#2563eb" />
            <Typography className="animate-pulse font-medium text-blue-600">
              {submitting ? "Evaluating your mastery..." : "AI Tutor is preparing your unique quiz..."}
            </Typography>
          </div>
        ) : result ? (
          <div className="flex flex-col items-center justify-center p-4">
             <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg ${result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {result.passed ? (
                   <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : (
                   <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                )}
             </div>
             <Typography variant="h3" color={result.passed ? "green" : "red"} className="mb-2 uppercase tracking-tighter font-black">
               {result.passed ? "Lesson Mastered!" : "Mastery Not Yet Reached"}
             </Typography>
             <Typography variant="h1" className={`text-6xl font-black mb-4 ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
               {result.score}%
             </Typography>
             <Typography className="max-w-md text-gray-700 font-medium leading-relaxed text-center mb-8">
               {result.message}
             </Typography>

             <Button 
                variant="text" 
                color="blue" 
                onClick={() => setShowReview(!showReview)}
                className="mb-8 flex items-center gap-2"
             >
                {showReview ? "Hide Quiz Summary" : "Show Quiz Summary"}
                <svg className={`w-4 h-4 transition-transform ${showReview ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
             </Button>

             {showReview && result.questions && (
                <div className="w-full space-y-6 text-left border-t border-gray-100 pt-8 mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                   {result.questions.map((q: any, qIdx: number) => {
                      const userAnsIdx = selectedAnswers[qIdx];
                      const correctAnsIdx = q.options.findIndex((o: any) => o.isCorrect);
                      const isCorrect = userAnsIdx === correctAnsIdx;

                      return (
                         <div key={qIdx} className={`p-5 rounded-xl border ${isCorrect ? 'bg-green-50/30 border-green-100' : 'bg-red-50/30 border-red-100'}`}>
                            <div className="flex gap-3 mb-3">
                               <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                  {qIdx + 1}
                               </span>
                               <Typography variant="h6" color="blue-gray" className="leading-tight">
                                  {q.question}
                                </Typography>
                            </div>
                            <div className="ml-9 space-y-2">
                               <div className="flex items-start gap-2">
                                  <span className="text-xs font-bold text-gray-400 uppercase mt-1">Your Answer:</span>
                                  <Typography variant="small" className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                     {q.options[userAnsIdx]?.option}
                                  </Typography>
                               </div>
                               {!isCorrect && (
                                  <div className="flex items-start gap-2">
                                     <span className="text-xs font-bold text-gray-400 uppercase mt-1">Correct Answer:</span>
                                     <Typography variant="small" className="text-green-700 font-semibold">
                                        {q.options[correctAnsIdx]?.option}
                                     </Typography>
                                  </div>
                               )}
                            </div>
                         </div>
                      );
                   })}
                </div>
             )}
          </div>
        ) : quiz ? (
          <div className="space-y-8">
            {quiz.questions.map((q: any, qIdx: number) => (
              <div key={q._id || qIdx} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
                <Typography variant="h6" color="blue-gray" className="mb-4 flex gap-2">
                  <span className="text-blue-600 font-black">Q{qIdx + 1}.</span> {q.question || q.questionText || q.text}
                </Typography>
                <div className="flex flex-col gap-1">
                  {q.options.map((opt: any, oIdx: number) => (
                    <Radio
                      key={opt._id || oIdx}
                      name={`question-${qIdx}`}
                      label={
                        <Typography color="blue-gray" className="font-medium">
                          {opt.option}
                        </Typography>
                      }
                      ripple={true}
                      className="hover:before:opacity-0"
                      checked={selectedAnswers[qIdx] === oIdx}
                      onChange={() => handleSelect(qIdx, oIdx)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-10">No questions found.</div>
        )}
      </DialogBody>

      <DialogFooter className="p-4 bg-gray-50 flex justify-between">
        <Typography variant="small" color="gray" className="font-normal opacity-70">
          {result ? (result.passed ? "Module Mastered" : result.canRetry ? "Pick your preference" : "Performance Review") : `${Object.keys(selectedAnswers).length} of ${quiz?.questions?.length || 0} answered`}
        </Typography>
        <div className="flex gap-2">
           {!result ? (
              <>
                <Button variant="text" color="red" onClick={onClose} className="rounded-lg">
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  color="blue"
                  onClick={handleSubmit}
                  disabled={submitting || !quiz}
                  className="rounded-lg flex items-center gap-2"
                >
                  {submitting ? "Checking..." : "Submit Answers"}
                </Button>
              </>
           ) : result.passed || !result.canRetry ? (
              <Button
                variant="gradient"
                color={result.passed ? "green" : "blue-gray"}
                onClick={result.passed ? handleFinish : handleContinueAnyway}
                className="rounded-lg px-10"
              >
                {result.passed ? "Continue to Next Module" : "Continue anyway"}
              </Button>
           ) : (
             <>
               <Button variant="text" color="blue" onClick={handleRetry} className="rounded-lg">
                  Retry Quiz
               </Button>
               <Button
                  variant="gradient"
                  color="blue-gray"
                  onClick={handleContinueAnyway}
                  className="rounded-lg"
                >
                  Continue Anyway
                </Button>
             </>
           )}
        </div>
      </DialogFooter>
    </Dialog>
  );
};

export default QuizModal;
