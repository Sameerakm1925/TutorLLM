import mongoose, { Schema, model, Document } from 'mongoose';

interface ProfilePic {
  name: string;
  key?: string;
  url?: string;
}
export interface IRecommendedLesson {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  videoId: string;
  status: 'pending' | 'completed';
}

export interface IRecommendedModule {
  _id?: mongoose.Types.ObjectId;
  moduleTitle: string;
  status: 'pending' | 'in-progress' | 'completed';
  masteryScore?: number;
  lessons: IRecommendedLesson[];
}

export interface IAICourse {
  _id?: mongoose.Types.ObjectId;
  courseTitle: string;
  category: string;
  status: 'pending' | 'in-progress' | 'completed';
  masteryScore?: number;
  modules: IRecommendedModule[];
  createdAt?: Date;
}

interface IStudent extends Document {
  firstName: string;
  lastName: string;
  email: string;
  profilePic: ProfilePic;
  mobile?: string;
  password?: string;
  interests: Array<string>;
  coursesEnrolled: mongoose.Schema.Types.ObjectId[];
  dateJoined: Date;
  isGoogleUser: boolean;
  isBlocked: boolean;
  blockedReason: string;
  skillLevel?: string;
  learningGoal?: string;
  hoursPerWeek?: number;
  isOnboardingComplete?: boolean;
  recommendedPath?: IRecommendedModule[];
  aiCourses: IAICourse[];
}

const ProfileSchema = new Schema<ProfilePic>({
  name: {
    type: String,
    required: true
  },
  key: {
    type: String
  },
  url: {
    type: String
  }
});

const studentSchema = new Schema<IStudent>({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  profilePic: {
    type: ProfileSchema,
    required: false
  },
  mobile: {
    type: String,
    required: function (this: IStudent) {
      return !this.isGoogleUser; // Required for non-Google users
    },
    trim: true,
    // unique:true,
    sparse: true, // Allow multiple null values
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  interests: {
    type: [String],
    required: true,
    default: []
  },
  password: {
    type: String,
    required: function (this: IStudent) {
      return !this.isGoogleUser;
    },
    minlength: 8
  },
  dateJoined: {
    type: Date,
    default: Date.now
  },
  isGoogleUser: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedReason: {
    type: String,
    default: ''
  },
  skillLevel: { type: String, default: '' },
  learningGoal: { type: String, default: '' },
  hoursPerWeek: { type: Number, default: 0 },
  isOnboardingComplete: { type: Boolean, default: false },
  recommendedPath: [
    {
      moduleTitle: { type: String, required: true },
      status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
      masteryScore: { type: Number, default: 0 },
      lessons: [
        {
          title: { type: String, required: true },
          description: { type: String, required: true },
          videoId: { type: String, required: true },
          status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
        }
      ]
    }
  ],
  aiCourses: [
    {
      courseTitle: { type: String, required: true },
      category: { type: String, default: '' },
      status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
      masteryScore: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now },
      modules: [
        {
          moduleTitle: { type: String, required: true },
          status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
          masteryScore: { type: Number, default: 0 },
          lessons: [
            {
              title: { type: String, required: true },
              description: { type: String, required: true },
              videoId: { type: String, required: true },
              status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
            }
          ]
        }
      ]
    }
  ]
});


const Students = model<IStudent>('Students', studentSchema, 'students');

export default Students;
