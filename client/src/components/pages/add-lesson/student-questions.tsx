import React from "react";
import { useParams } from "react-router-dom";
import Discussion from "../course-pages/discussion-page";

const StudentQuestions: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();

  if (!lessonId) return <div>Lesson ID not found</div>;

  return (
    <div className="p-8 pb-32 mb-10 w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Student Questions</h1>
      <div className="bg-white rounded-xl shadow-md p-6">
        <Discussion lessonId={lessonId} />
      </div>
    </div>
  );
};

export default StudentQuestions;
