import AppError from '../../../utils/appError';
import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import { QuizDbInterface } from '../../repositories/quizDbRepository';
import { shuffleQuiz } from '../../../app/helper/shuffle';
import { QuizInterface } from '../../../types/quiz';
import { LessonDbRepositoryInterface } from '../../repositories/lessonDbRepository';
import { StudentsDbInterface } from '../../repositories/studentDbRepository';
import { generateQuiz } from '../../../frameworks/services/groqService';

export const getQuizzesLessonU = async (
  lessonId: string,
  quizDbRepository: ReturnType<QuizDbInterface>,
  lessonDbRepository: ReturnType<LessonDbRepositoryInterface>,
  studentDbRepository: ReturnType<StudentsDbInterface>
) => {
  if (!lessonId) {
    throw new AppError('Lesson id not found', HttpStatusCodes.BAD_REQUEST);
  }

  // 1. Check if quiz already exists
  let quiz: QuizInterface | null = await quizDbRepository.getQuizByLessonId(lessonId);
  
  // SELF-HEALING: If quiz exists but is broken (missing question text), purge it
  if (quiz && (!quiz.questions || quiz.questions.length === 0 || !quiz.questions[0].question)) {
    console.warn(`[QUIZ_HEAL] Broken quiz found for lesson ${lessonId}. Purging for regeneration...`);
    // Note: We don't have an explicit delete in the repo, but overwriting via addQuiz (ID based) or 
    // simply ignoring and letting the AI regenerate is safer.
    quiz = null; 
  }

  if (quiz) {
    return shuffleQuiz(quiz);
  }

  // 2. Find lesson details for AI prompting
  let lessonTitle = '';
  let lessonDescription = '';
  let courseId = '';

  const standardLesson = await lessonDbRepository.getLessonById(lessonId);
  if (standardLesson) {
    lessonTitle = standardLesson.title;
    lessonDescription = standardLesson.description;
    courseId = standardLesson.courseId.toString();
  } else {
    const personalizedLessonData = await studentDbRepository.getLessonInRecommendedPath(lessonId);
    if (personalizedLessonData) {
      lessonTitle = personalizedLessonData.lesson.title;
      lessonDescription = personalizedLessonData.lesson.description;
      courseId = personalizedLessonData.courseId.toString();
    }
  }

  if (!lessonTitle) {
    throw new AppError('Lesson details not found to generate quiz', HttpStatusCodes.NOT_FOUND);
  }

  // 3. Generate quiz using AI
  console.log(`[QUIZ_SYNC] Generating fresh AI quiz for: ${lessonTitle}`);
  const aiQuestions = await generateQuiz(lessonTitle, lessonDescription);

  // 4. Map AI format to Database format - NEW SYNCED FORMAT
  const formattedQuestions = aiQuestions.map((q: any) => ({
    question: q.question || q.questionText || q.text || "Assessment Question",
    options: q.options.map((opt: any) => ({
      option: opt.option,
      isCorrect: opt.isCorrect
    }))
  }));

  console.log(`[QUIZ_SYNC] Final normalized mapping for ${lessonId}`);

  // 5. Store quiz in DB
  await quizDbRepository.addQuiz({
    courseId,
    lessonId,
    questions: formattedQuestions
  });

  const newQuiz = await quizDbRepository.getQuizByLessonId(lessonId);
  console.log(`[QUIZ_SYNC] Success. Generated ${newQuiz?.questions.length} questions.`);
    
  return newQuiz;
};
