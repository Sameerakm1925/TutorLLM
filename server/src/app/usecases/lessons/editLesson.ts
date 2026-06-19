import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import { CreateLessonInterface } from '../../../types/lesson';
import { CloudServiceInterface } from '@src/app/services/cloudServiceInterface';
import { QuizDbInterface } from '@src/app/repositories/quizDbRepository';
import { LessonDbRepositoryInterface } from '@src/app/repositories/lessonDbRepository';

export const editLessonsU = async (
  media: Express.Multer.File[] | undefined,
  lessonId: string,
  lesson: CreateLessonInterface,
  lessonDbRepository: ReturnType<LessonDbRepositoryInterface>,
  cloudService: ReturnType<CloudServiceInterface>,
  quizDbRepository: ReturnType<QuizDbInterface>
) => {
  if (!lesson) {
    throw new AppError('Data is not provided', HttpStatusCodes.BAD_REQUEST);
  }

  if (!lesson.media) lesson.media = [];

  if (lesson.videoUrl) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = lesson.videoUrl.match(regExp);
    if (match && match[2].length === 11) {
      lesson.videoUrl = `https://www.youtube.com/embed/${match[2]}`;
    }
  }

  const response = await lessonDbRepository.editLesson(lessonId, lesson);
  if (!response) {
    throw new AppError('Failed to edit lesson', HttpStatusCodes.BAD_REQUEST);
  }

  if (lesson.questions) {
    await quizDbRepository.editQuiz(lessonId, { questions: lesson.questions });
  }
};