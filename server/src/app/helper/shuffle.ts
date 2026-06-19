import { QuizInterface } from '@src/types/quiz';
export function shuffleQuiz(quiz: QuizInterface | null): QuizInterface | null {
  if (!quiz) return null;

  // Shuffles an array using the Fisher-Yates shuffle algorithm
  function shuffleArray<T>(array: T[]): T[] {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  }

  // Shuffle ONLY the options for each question, NOT the questions themselves
  // This ensures the indexing stays consistent for the backend grading
  const stabilizedQuestions = quiz.questions.map((question) => ({
    ...question,
    options: shuffleArray(question.options)
  }));

  const shuffledQuiz: QuizInterface = { ...quiz, questions: stabilizedQuestions as any };
  return shuffledQuiz;
}
