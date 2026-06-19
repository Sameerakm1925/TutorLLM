import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import { CreateLessonInterface } from '../../../types/lesson';
import { QuizDbInterface } from '@src/app/repositories/quizDbRepository';
import { LessonDbRepositoryInterface } from '@src/app/repositories/lessonDbRepository';

export const addLessonsU = async (
  media: Express.Multer.File[] | undefined,
  courseId: string | undefined,
  instructorId: string | undefined,
  lesson: CreateLessonInterface,
  lessonDbRepository: ReturnType<LessonDbRepositoryInterface>,
  cloudService: any,
  quizDbRepository: ReturnType<QuizDbInterface>
) => {
  if (!courseId) {
    throw new AppError('Please provide a course id', HttpStatusCodes.BAD_REQUEST);
  }
  if (!instructorId) {
    throw new AppError('Please provide an instructor id', HttpStatusCodes.BAD_REQUEST);
  }
  if (!lesson) {
    throw new AppError('Data is not provided', HttpStatusCodes.BAD_REQUEST);
  }

  if (lesson.videoUrl) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = lesson.videoUrl.match(regExp);
    if (match && match[2].length === 11) {
      lesson.videoUrl = `https://www.youtube.com/embed/${match[2]}`;
    }
  }

  const lessonId = await lessonDbRepository.addLesson(
    courseId,
    instructorId,
    lesson
  );

  if (!lessonId) {
    throw new AppError('Data is not provided', HttpStatusCodes.BAD_REQUEST);
  }

  if (lesson.questions && lesson.questions.length > 0 && lesson.questions[0].question) {
    const quiz = {
      courseId,
      lessonId: lessonId.toString(),
      questions: lesson.questions
    };
    await quizDbRepository.addQuiz(quiz);
  }
};