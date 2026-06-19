import {
  changePasswordService,
  updateProfileService,
  getStudentDetailsService,
  submitOnboardingService,
  adaptPathService
} from "../services/student";
import { PasswordInfo } from "../types/student/student";
import END_POINTS from "../../constants/endpoints";

export const changePassword = (passwordInfo: PasswordInfo) => {
  return changePasswordService(END_POINTS.CHANGE_PASSWORD, passwordInfo);
};

export const updateProfile = (profileInfo: FormData) => {
  return updateProfileService(END_POINTS.UPDATE_PROFILE, profileInfo);
};

export const getStudentDetails = () => {
  return getStudentDetailsService(END_POINTS.GET_STUDENT_DETAILS);
};


export const submitOnboarding = (data: { skillLevel: string; learningGoal: string; hoursPerWeek: number; interests: string[] }) => {
  return submitOnboardingService(END_POINTS.ONBOARDING, data);
};

export const adaptPath = (data: { moduleId: string; lessonId: string }) => {
  return adaptPathService(END_POINTS.ADAPT_PATH, data);
};
