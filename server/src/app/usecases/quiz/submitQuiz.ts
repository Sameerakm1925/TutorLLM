import AppError from '../../../utils/appError';
import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import { QuizDbInterface } from '../../repositories/quizDbRepository';
import { StudentsDbInterface } from '../../repositories/studentDbRepository';
import { QuizInterface } from '../../../types/quiz';

export const submitQuizU = async (
  studentId: string,
  lessonId: string,
  userAnswers: number[],
  quizDbRepository: ReturnType<QuizDbInterface>,
  studentDbRepository: ReturnType<StudentsDbInterface>,
  attempt: number = 1
) => {
  if (!studentId || !lessonId) {
    throw new AppError('Missing required details', HttpStatusCodes.BAD_REQUEST);
  }

  // 1. Fetch the quiz (Raw DB order)
  const quiz = await quizDbRepository.getQuizByLessonId(lessonId);
  if (!quiz) {
    throw new AppError('Quiz not found for this lesson', HttpStatusCodes.NOT_FOUND);
  }

  // 2. Calculate score
  let correctCount = 0;
  const totalQuestions = quiz.questions.length;
  
  quiz.questions.forEach((question, index) => {
    const correctAnswerIndex = question.options.findIndex(opt => opt.isCorrect);
    // Compare direct indexing (stable since shuffle is disabled)
    if (userAnswers[index] === correctAnswerIndex) {
      correctCount++;
    }
  });

  const scorePercentage = (correctCount / totalQuestions) * 100;
  const passed = scorePercentage >= 60;

  // 3. Find student 
  const student: any = await studentDbRepository.getStudent(studentId);
  if (!student) throw new AppError('Student not found', HttpStatusCodes.NOT_FOUND);

  if (passed) {
    // --- PASS LOGIC: Unlock lesson and update Mastery ---
    let lessonFound = false;

    for (const module of student.recommendedPath) {
      const lesson = module.lessons.find((l: any) => l._id.toString() === lessonId);
      if (lesson) {
        lesson.status = 'completed';
        lessonFound = true;
        
        // Auto-complete module if all lessons are done
        const allCompleted = module.lessons.every((l: any) => l.status === 'completed');
        if (allCompleted) {
           module.status = 'completed';
        }
        break;
      }
    }
    
    if (lessonFound) {
       // --- BOOST VAULT MASTERY ---
       const courseInVault = student.aiCourses.find((c: any) => c.courseTitle === student.learningGoal);
       if (courseInVault) {
          courseInVault.masteryScore = Math.min((courseInVault.masteryScore || 0) + 10, 100);
          courseInVault.modules = student.recommendedPath; 
          if (courseInVault.masteryScore === 100) courseInVault.status = 'completed';
       }

       student.markModified('recommendedPath');
       student.markModified('aiCourses');
       await student.save();
       console.log(`[PROGRESS] Mastery updated to ${courseInVault?.masteryScore}% for ${student.learningGoal}`);
    }

    return {
      passed: true,
      score: scorePercentage,
      message: 'Great job! You have demonstrated a solid understanding of this lesson.',
      questions: quiz.questions
    };
  } else {
    // --- FAIL LOGIC ---
    return {
      passed: false,
      score: scorePercentage,
      canRetry: attempt === 1,
      message: attempt === 1 
        ? 'Mastery not yet reached. Would you like to try again to improve your score, or continue anyway?' 
        : 'Lesson assessment complete. Your score is recorded.',
      questions: quiz.questions
    };
  }
};
