import VideoPlayer from "@/components/video-player";
import ResourcesBox from "./ResourcesBox";
import { Play, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PropTypes from 'prop-types';
import { loadLectureProgress } from "@/lib/progressUtils";
import { useState, useEffect } from "react";

function VideoPlayerSection({
  currentLecture,
  courseId,
  onProgressUpdate,
  onVideoEnded,
  completedLessons = [],
}) {
  const [lectureProgress, setLectureProgress] = useState(null);
  
  // Load saved progress when lecture changes
  useEffect(() => {
    if (currentLecture?._id && courseId) {
      const savedProgress = loadLectureProgress(courseId, currentLecture._id);
      setLectureProgress(savedProgress);
    } else {
      setLectureProgress(null);
    }
  }, [currentLecture?._id, courseId]);

  // Check if current lecture is completed
  const isCompleted = completedLessons.includes(currentLecture?._id) ||
                      lectureProgress?.completed;

  if (!currentLecture) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
        <div className="flex items-center justify-center h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-10 w-10 text-green-600" />
            </div>
            <p className="text-xl font-semibold text-gray-700 mb-2">No lecture selected</p>
            <p className="text-gray-500">Please select a lecture from the sidebar to begin watching.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6 overflow-hidden rounded-b-xl">
      {/* Lecture header with completion status */}
      <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-800 truncate max-w-md">
            {currentLecture.title}
          </h3>
          {isCompleted && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Completed
            </Badge>
          )}
        </div>
        {lectureProgress?.progressPercentage > 0 && !isCompleted && (
          <span className="text-xs text-gray-500">
            {Math.round(lectureProgress.progressPercentage)}% watched
          </span>
        )}
      </div>
      
      {currentLecture?.videoUrl ? (
        <div className="relative aspect-video">
          <VideoPlayer
            width="100%"
            url={currentLecture.videoUrl}
            onProgressUpdate={onProgressUpdate}
            onVideoEnded={onVideoEnded}
            lectureId={currentLecture._id}
            courseId={courseId}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-10 w-10 text-green-600" />
            </div>
            <p className="text-xl font-semibold text-gray-700 mb-2">Video not available</p>
            <p className="text-gray-500">The video for this lecture is currently being processed.</p>
          </div>
        </div>
      )}

      {/* Resources box below video */}
      <ResourcesBox
        lecture={currentLecture}
        courseId={courseId}
      />
    </div>
  );
}

VideoPlayerSection.propTypes = {
  currentLecture: PropTypes.object,
  courseId: PropTypes.string,
  onProgressUpdate: PropTypes.func.isRequired,
  onVideoEnded: PropTypes.func,
  completedLessons: PropTypes.array,
};

export default VideoPlayerSection;