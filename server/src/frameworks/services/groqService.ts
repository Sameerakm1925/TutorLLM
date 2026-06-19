import Groq from 'groq-sdk';
import AppError from '../../utils/appError';
import HttpStatusCodes from '../../constants/HttpStatusCodes';

export const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

export const generateLearningPath = async (
  studentAnswers: string
) => {
  const prompt = `
    You are an AI learning path and curriculum generator. A student has answered the following onboarding questions:
    ${studentAnswers}

    Create a unique, personalized learning curriculum for this student from scratch. 
    Design exactly 2-3 modules, and each module should contain EXACTLY 3 progressive lessons.
    For each lesson, provide a highly specific, optimized YouTube search query that would return the perfect tutorial video for that topic.
    CRITICAL: Ensure the query targets high-quality educational tutorials (e.g., from channels like freeCodeCamp, Traversy Media) and avoid queries that might return music videos or restricted content.
    
    Return ONLY a valid JSON object matching this exact format:
    {
      "modules": [
        {
          "moduleTitle": "String - Course Title",
          "lessons": [
            {
              "title": "String - Lesson Title",
              "description": "String - Brief 1-sentence description",
              "searchQuery": "String - YouTube search query (e.g. 'React Hooks Tutorial Beginner')"
            }
          ]
        }
      ]
    }
  `;

  try {
    const chatCompletion = await groqClient.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || '{"modules": []}';
    const parsed = JSON.parse(responseContent);
    return parsed.modules || [];
  } catch (error) {
    console.error("Groq API error:", error);
    throw new AppError('Failed to generate learning path', HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const generateQuiz = async (
  lessonTitle: string,
  lessonDescription: string
) => {
  const prompt = `
    You are an AI tutor generating a knowledge check for a student who just watched a video lesson.
    Lesson Title: ${lessonTitle}
    Lesson Description: ${lessonDescription}

    Create exactly 5 multiple-choice questions that test the core concepts of this lesson.
    Make the questions engaging and ensure they accurately reflect the topic.
    Each question must have exactly 4 options, and only 1 option must be marked as correct.
    
    Return ONLY a valid JSON object matching this exact format:
    {
      "questions": [
        {
          "question": "String - The question",
          "options": [
            { "option": "String - Option 1", "isCorrect": false },
            { "option": "String - Option 2", "isCorrect": true },
            { "option": "String - Option 3", "isCorrect": false },
            { "option": "String - Option 4", "isCorrect": false }
          ]
        }
      ]
    }
  `;

  try {
    const chatCompletion = await groqClient.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || '{"questions": []}';
    return JSON.parse(responseContent).questions;
  } catch (error) {
    console.error("Groq API error:", error);
    throw new AppError('Failed to generate quiz', HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const generateRemedialLesson = async (
  failedLessonTitle: string,
  failedConcepts: string
) => {
  const prompt = `
    You are an AI educational path optimization assistant. A student just failed a quiz on:
    "${failedLessonTitle}"
    
    They struggled with the following concepts based on their wrong answers:
    "${failedConcepts}"

    Generate ONE easier, remedial lesson that breaks down fundamental precursors to understanding ${failedLessonTitle}, focusing particularly on clarifying ${failedConcepts}.
    Provide a highly specific, optimized YouTube search query that would return the perfect tutorial video for this remedial topic.
    
    Return ONLY a valid JSON object matching this exact format:
    {
      "title": "String - Simplified Lesson Title",
      "description": "String - Brief 2-sentence description of this easier concept",
      "searchQuery": "String - YouTube search query (e.g. 'JavaScript Variables absolute beginner')"
    }
  `;

  try {
    const chatCompletion = await groqClient.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || '{}';
    return JSON.parse(responseContent);
  } catch (error) {
    console.error("Groq API error:", error);
    throw new AppError('Failed to generate remedial lesson', HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};
