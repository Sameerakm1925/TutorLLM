import mongoose from 'mongoose';
import Discussions from '../models/discussions';
import { AddDiscussionInterface } from '@src/types/discussion';
import Students from '../models/student';
export const discussionRepositoryMongoDb = () => {
  const addDiscussion = async (discussion: AddDiscussionInterface) => {
    const newDiscussion = new Discussions(discussion);
    await newDiscussion.save();
  };

  const getDiscussionsByLesson = async (lessonId: string) => {
    const discussionsWithUserDetails = await Discussions.aggregate([
      {
        $match: { lessonId: new mongoose.Types.ObjectId(lessonId) }
      },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'studentDetails'
        }
      },
      {
        $unwind: '$studentDetails'
      },
      {
        $project: {
          _id: 1,
          message: 1,
          lessonId: 1,
          replies: 1,
          createdAt: 1,
          updatedAt: 1,
          'studentDetails._id': 1,
          'studentDetails.firstName': 1,
          'studentDetails.lastName': 1,
          'studentDetails.profilePic': 1,
          'studentDetails.dateJoined': 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);
    return discussionsWithUserDetails;
  };

  const editDiscussion = async (id: string, message: string) => {
    await Discussions.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { message, updatedAt: Date.now() }
    );
  };

  const deleteDiscussionById = async (id: string) => {
    await Discussions.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
  };

  const replyDiscussion = async (
    id: string,
    reply: { userId: string; role: string; message: string }
  ) => {
    await Discussions.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $push: { replies: reply } }
    );
  };

  const getRepliesByDiscussionId = async (id: string) => {
    const result = await Discussions.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) }
      },
      {
        $project: {
          replies: 1
        }
      },
      {
        $unwind: '$replies'
      },
      {
        $lookup: {
          from: 'students',
          localField: 'replies.userId',
          foreignField: '_id',
          as: 'repliesWithStudent'
        }
      },
      {
        $lookup: {
          from: 'instructor',
          localField: 'replies.userId',
          foreignField: '_id',
          as: 'repliesWithInstructor'
        }
      },
      {
        $addFields: {
          userDetailsArray: {
            $concatArrays: ['$repliesWithStudent', '$repliesWithInstructor']
          }
        }
      },
      {
        $unwind: {
          path: '$userDetailsArray',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$_id',
          replies: {
            $push: {
              _id: '$replies._id',
              message: '$replies.message',
              createdAt: '$replies.createdAt',
              updatedAt: '$replies.updatedAt',
              role: '$replies.role',
              userDetails: '$userDetailsArray'
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          'replies._id': 1,
          'replies.message': 1,
          'replies.createdAt': 1,
          'replies.updatedAt': 1,
          'replies.role': 1,
          'replies.userDetails._id': 1,
          'replies.userDetails.firstName': 1,
          'replies.userDetails.lastName': 1,
          'replies.userDetails.dateJoined': 1,
          'replies.userDetails.profilePic': 1
        }
      }
    ]);
    const replies = result.length > 0 ? result[0].replies : [];

    return replies;
  };

  return {
    addDiscussion,
    getDiscussionsByLesson,
    editDiscussion,
    deleteDiscussionById,
    replyDiscussion,
    getRepliesByDiscussionId
  };
};

export type DiscussionRepoMongodbInterface = typeof discussionRepositoryMongoDb;
