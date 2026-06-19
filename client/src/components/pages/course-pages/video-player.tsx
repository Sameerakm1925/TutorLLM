import React from "react";
import { useNavigate, useParams } from "react-router-dom";

interface VideoPlayerProps {
  videoKey: string | null;
  isCoursePurchased: boolean | null;
  videoUrl?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoKey,
  isCoursePurchased,
  videoUrl,
}) => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/courses/${courseId}`);
  };

  if (!isCoursePurchased) {
    return (
      <div className="relative h-full bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-semibold mt-4">This video is locked</h2>
          <p className="text-lg text-gray-400 mt-2">
            Please purchase the course to unlock the content
          </p>
          <button
            onClick={handleClick}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-md"
          >
            Purchase Now
          </button>
        </div>
      </div>
    );
  }

  if (videoUrl) {
    return (
      <div className="relative h-full bg-black">
        <iframe
          width="100%"
          height="100%"
          src={videoUrl}
          title="Lesson Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className="relative h-full bg-gray-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-6xl mb-4">📹</div>
        <p className="text-lg text-gray-400">
          No video available for this lesson
        </p>
      </div>
    </div>
  );
};

export default VideoPlayer;
