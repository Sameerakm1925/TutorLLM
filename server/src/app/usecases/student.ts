import { StudentsDbInterface } from '../repositories/studentDbRepository';
import AppError from '../../utils/appError';
import HttpStatusCodes from '../../constants/HttpStatusCodes';
import { AuthServiceInterface } from '../services/authServicesInterface';
import { CloudServiceInterface } from '../services/cloudServiceInterface';
import {
  StudentInterface,
  StudentUpdateInfo
} from '../../types/studentInterface';
import { generateLearningPath } from '../../frameworks/services/groqService';
import Students, { IAICourse } from '../../frameworks/database/mongodb/models/student';

export const changePasswordU = async (
  id: string | undefined,
  password: { currentPassword: string; newPassword: string },
  authService: ReturnType<AuthServiceInterface>,
  studentDbRepository: ReturnType<StudentsDbInterface>
) => {
  if (!id) {
    throw new AppError('Invalid student', HttpStatusCodes.BAD_REQUEST);
  }
  if (!password.currentPassword) {
    throw new AppError(
      'Please provide current password',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  const student: StudentInterface | null = await studentDbRepository.getStudent(
    id
  );
  if (!student) {
    throw new AppError('Unauthorized user', HttpStatusCodes.NOT_FOUND);
  }
  const isPasswordCorrect = await authService.comparePassword(
    password.currentPassword,
    student?.password
  );
  if (!isPasswordCorrect) {
    throw new AppError(
      'Sorry, your current password is incorrect.',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  if (!password.newPassword) {
    throw new AppError(
      'new password cannot be empty',
      HttpStatusCodes.UNAUTHORIZED
    );
  }
  const hashedPassword = await authService.hashPassword(password.newPassword);
  await studentDbRepository.changePassword(id, hashedPassword);
};

export const updateProfileU = async (
  id: string | undefined,
  studentInfo: StudentUpdateInfo,
  profilePic: Express.Multer.File,
  cloudService: ReturnType<CloudServiceInterface>,
  studentDbRepository: ReturnType<StudentsDbInterface>
) => {
  if (!id) {
    throw new AppError('Invalid student', HttpStatusCodes.BAD_REQUEST);
  }
  if (Object.keys(studentInfo).length === 0) {
    throw new AppError(
      'At least update a single field',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  if (profilePic) {
    const response = await cloudService.upload(profilePic);
    studentInfo.profilePic = response;
  }
  await studentDbRepository.updateProfile(id, studentInfo);
};

export const getStudentDetailsU = async (
  id: string | undefined,
  cloudService: ReturnType<CloudServiceInterface>,
  studentDbRepository: ReturnType<StudentsDbInterface>
) => {
  if (!id) {
    throw new AppError(
      'Please provide a valid student id',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  const studentDetails: StudentInterface | null =
    await studentDbRepository.getStudent(id);
  if (studentDetails?.profilePic?.key) {
    studentDetails.profilePic.url = await cloudService.getFile(
      studentDetails.profilePic.key
    );
  }
  if (studentDetails) {
    studentDetails.password = 'no password';
  }
  return studentDetails;
};

import ytSearch from 'yt-search';

export const submitOnboardingU = async (
  id: string | undefined,
  onboardingData: { skillLevel: string; learningGoal: string; hoursPerWeek: number; interests: string[] }
) => {
  if (!id) throw new AppError('Invalid student', HttpStatusCodes.BAD_REQUEST);

  const answers = `Skill level: ${onboardingData.skillLevel}, Goal: ${onboardingData.learningGoal}, Hours/week: ${onboardingData.hoursPerWeek}, Interests: ${onboardingData.interests.join(', ')}`;
  
  // 1. Ask Llama to invent the curriculum - STRICTLY CAP AT 3
  const rawAiModules = await generateLearningPath(answers);
  const aiModules = rawAiModules.slice(0, 3);

  // 2. Map YouTube videos to the AI lessons
  const recommendedPath = [];
  for (const module of aiModules) {
    const populatedLessons = [];
    for (const lesson of module.lessons) {
      try {
        // Append 'embeddable tutorial' to ensure better results for embedding
        const searchResult = await ytSearch(`${lesson.searchQuery} embeddable tutorial`);
        
        // Find the first video that is likely a tutorial (more than 2 minutes)
        const topVideo = searchResult?.videos.find(v => v.seconds > 120) || searchResult?.videos[0];
        
        populatedLessons.push({
          title: lesson.title,
          description: lesson.description,
          videoId: topVideo?.videoId || 'M5JJxdrCvJQ', // A reliable HTML tutorial as fallback
          status: 'pending'
        });
      } catch (err) {
        populatedLessons.push({
          title: lesson.title,
          description: lesson.description,
          videoId: 'M5JJxdrCvJQ',
          status: 'pending'
        });
      }
    }
    
    recommendedPath.push({
      moduleTitle: module.moduleTitle,
      status: 'pending',
      lessons: populatedLessons
    });
  }

  // Set the first module to in-progress immediately
  if (recommendedPath.length > 0) {
    recommendedPath[0].status = 'in-progress';
  }

  // 3. Find existing student to archive the OLD path
  const student = await Students.findById(id);
  if (!student) throw new AppError('Student not found', HttpStatusCodes.NOT_FOUND);

  console.log(`[ONBOARDING_HAMMER] Resetting student: ${student.firstName} (ID: ${id})`);
  
  // Archiving current path to the library...
  if (student.recommendedPath && student.recommendedPath.length > 0) {
    const oldTitle = student.learningGoal || 'Previous Journey';
    const isAlreadyArchived = student.aiCourses.some(c => c.courseTitle === oldTitle && c.modules.length > 0);
    
    if (!isAlreadyArchived) {
      console.log(`[ONBOARDING_HAMMER] Archiving "${oldTitle}"`);
      student.aiCourses.push({
        courseTitle: oldTitle,
        category: student.interests?.[0] || 'Learning',
        status: 'completed',
        modules: student.recommendedPath,
        masteryScore: 30, 
        createdAt: new Date()
      });
    }
  }

  // --- PASS 1: THE HAMMER WIPE ---
  console.log(`[ONBOARDING_HAMMER] PASS 1: Wiping old path...`);
  student.recommendedPath = []; 
  student.markModified('recommendedPath');
  await student.save();

  // --- PASS 2: THE NEW INSTALL ---
  console.log(`[ONBOARDING_HAMMER] PASS 2: Installing "${onboardingData.learningGoal}"`);
  
  const newAICourse: IAICourse = {
    courseTitle: onboardingData.learningGoal,
    category: onboardingData.interests[0] || 'General',
    status: 'in-progress',
    modules: recommendedPath as any,
    masteryScore: 0,
    createdAt: new Date()
  };
  
  student.aiCourses.push(newAICourse);
  student.skillLevel = onboardingData.skillLevel;
  student.learningGoal = onboardingData.learningGoal;
  student.hoursPerWeek = onboardingData.hoursPerWeek;
  student.interests = onboardingData.interests;
  student.isOnboardingComplete = true;
  student.recommendedPath = recommendedPath as any; 

  student.markModified('recommendedPath');
  student.markModified('aiCourses');
  
  const saved = await student.save();
  console.log(`[ONBOARDING_HAMMER] SUCCESS. Active modules: ${saved.recommendedPath?.length || 0}`);

  return saved;
};

export const adaptPathU = async (id: string | undefined, moduleId: string, lessonId: string, score?: number) => {
  if (!id) throw new AppError('Invalid student', HttpStatusCodes.BAD_REQUEST);
  
  const student = await Students.findById(id);
  if (!student) throw new AppError('Student not found', HttpStatusCodes.NOT_FOUND);
  if (!student.recommendedPath) return student;

  // 1. Find the module by ID or find the one that contains this lessonId
  let targetModule = student.recommendedPath.find(m => m._id?.toString() === moduleId);
  if (!targetModule) {
     // Fallback: search for module that contains this lesson
     targetModule = student.recommendedPath.find(m => m.lessons.some(l => l._id?.toString() === lessonId));
  }

  if (!targetModule) throw new AppError('Module not found', HttpStatusCodes.NOT_FOUND);

  // 2. Find the lesson
  const targetLesson = targetModule.lessons.find(l => l._id?.toString() === lessonId);
  if (!targetLesson) throw new AppError('Lesson not found', HttpStatusCodes.NOT_FOUND);

  // 3. Mark lesson complete
  targetLesson.status = 'completed';

  // 4. Update score if provided
  if (score !== undefined) {
    targetModule.masteryScore = score;
  }

  // 5. Update module status based on core lessons
  const coreLessons = targetModule.lessons.filter(l => !l.title.includes('[REMEDIAL]'));
  const allCoreDone = coreLessons.every(l => l.status === 'completed');
  
  if (allCoreDone) {
    targetModule.status = 'completed';
    // Unlock next module
    const currentIdx = student.recommendedPath.findIndex(m => m._id?.toString() === targetModule?._id?.toString());
    if (currentIdx !== -1 && currentIdx < student.recommendedPath.length - 1) {
      student.recommendedPath[currentIdx + 1].status = 'in-progress';
    }
  } else {
    targetModule.status = 'in-progress';
  }

  student.markModified('recommendedPath');
  await student.save();

  return student;
};
