export interface IRecommendedLesson {
  _id?: string;
  title: string;
  description: string;
  videoId: string;
  status: 'pending' | 'completed';
}

export interface IRecommendedModule {
  _id?: string;
  moduleTitle: string;
  status: 'pending' | 'in-progress' | 'completed';
  masteryScore?: number;
  lessons: IRecommendedLesson[];
}

export interface IAICourse {
  _id?: string;
  courseTitle: string;
  category: string;
  status: 'pending' | 'in-progress' | 'completed';
  masteryScore?: number;
  modules: IRecommendedModule[];
  createdAt?: string;
}

export interface ApiResponseStudent {
  _id: string
  firstName: string
  lastName: string
  email: string
  mobile: string
  coursesEnrolled: any[]
  isGoogleUser: boolean
  dateJoined: string
  interests: string[]
  profilePic: ProfilePic
  skillLevel?: string;
  learningGoal?: string;
  hoursPerWeek?: number;
  isOnboardingComplete?: boolean;
  recommendedPath?: IRecommendedModule[];
  aiCourses?: IAICourse[];
}

export interface ProfilePic {
    name: string
    key?: string
    url?:string;
    _id: string
  }
  