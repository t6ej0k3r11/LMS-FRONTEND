import { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import PropTypes from "prop-types";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Settings,
  SkipBack,
  SkipForward,
  Subtitles,
  Clock,
} from "lucide-react";
import {
  saveLectureProgress,
  loadLectureProgress,
  LECTURE_COMPLETION_THRESHOLD
} from "@/lib/progressUtils";

function VideoPlayer({
  width = "100%",
  height = "100%",
  url,
  onProgressUpdate = () => {},
  onVideoEnded = () => {},
  lectureId,
  courseId,
}) {

  VideoPlayer.propTypes = {
    width: PropTypes.string,
    height: PropTypes.string,
    url: PropTypes.string,
    onProgressUpdate: PropTypes.func,
    onVideoEnded: PropTypes.func,
    lectureId: PropTypes.string,
    courseId: PropTypes.string,
  };

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [duration, setDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false);

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressUpdateTimeoutRef = useRef(null);
  const lastSavedProgressRef = useRef(0);

  function handlePlayAndPause() {
    setPlaying(!playing);
  }

  // Reset completion flag when lecture changes
  useEffect(() => {
    setHasMarkedComplete(false);
    setPlayed(0);
    setPlayedSeconds(0);
  }, [lectureId]);

  // Remember last position functionality - load from localStorage
  useEffect(() => {
    if (lectureId && courseId && url) {
      const savedProgress = loadLectureProgress(courseId, lectureId);
      if (savedProgress && savedProgress.currentTime > 0) {
        const position = savedProgress.progressValue || 0;
        setPlayed(position);
        setPlayedSeconds(savedProgress.currentTime || 0);
        
        // Check if already completed
        if (savedProgress.completed) {
          setHasMarkedComplete(true);
        }
        
        // Seek to saved position after player is ready
        setTimeout(() => {
          if (playerRef.current && savedProgress.currentTime > 0) {
            playerRef.current.seekTo(savedProgress.currentTime, 'seconds');
          }
        }, 500);
      }
    }
  }, [lectureId, courseId, url]);

  // Save position periodically using the new utility
  useEffect(() => {
    if (lectureId && courseId && playedSeconds > 0 && duration > 0) {
      // Only save if progress changed significantly (more than 2 seconds)
      if (Math.abs(playedSeconds - lastSavedProgressRef.current) >= 2) {
        const savePosition = () => {
          const isCompleted = played >= LECTURE_COMPLETION_THRESHOLD;
          saveLectureProgress(courseId, lectureId, playedSeconds, duration, isCompleted);
          lastSavedProgressRef.current = playedSeconds;
        };

        const timeoutId = setTimeout(savePosition, 3000); // Save every 3 seconds
        return () => clearTimeout(timeoutId);
      }
    }
  }, [lectureId, courseId, playedSeconds, duration, played]);

  // Handle progress updates from ReactPlayer
  function handleProgress(state) {
    if (!seeking) {
      setPlayed(state.played);
      setPlayedSeconds(state.playedSeconds);
      
      // Debounce progress updates to parent
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }
      
      progressUpdateTimeoutRef.current = setTimeout(() => {
        // Call onProgressUpdate with detailed progress data
        onProgressUpdate({
          progressValue: state.played,
          currentTime: state.playedSeconds,
          duration: duration,
          progressPercentage: Math.round(state.played * 100),
        });
        
        // Auto-mark as complete when reaching threshold
        if (state.played >= LECTURE_COMPLETION_THRESHOLD && !hasMarkedComplete) {
          setHasMarkedComplete(true);
          // Save completed state to localStorage
          saveLectureProgress(courseId, lectureId, state.playedSeconds, duration, true);
        }
      }, 250); // Update every 250ms for smooth progress
    }
  }

  // Handle video ended event
  function handleEnded() {
    // Mark as complete
    if (!hasMarkedComplete) {
      setHasMarkedComplete(true);
      saveLectureProgress(courseId, lectureId, duration, duration, true);
    }
    
    // Call the onVideoEnded callback
    onVideoEnded({
      lectureId,
      courseId,
      completed: true,
      progressValue: 1,
      currentTime: duration,
      duration: duration,
    });
  }

  function handleDuration(dur) {
    setDuration(dur);
    // Mock chapters - in real implementation, this would come from video metadata
    const mockChapters = [
      { time: 0, title: "Introduction" },
      { time: dur * 0.25, title: "Main Concepts" },
      { time: dur * 0.5, title: "Examples" },
      { time: dur * 0.75, title: "Summary" }
    ];
    setChapters(mockChapters);
  }

  function handleRewind() {
    playerRef?.current?.seekTo(playerRef?.current?.getCurrentTime() - 10);
  }

  function handleForward() {
    playerRef?.current?.seekTo(playerRef?.current?.getCurrentTime() + 10);
  }

  function handleToggleMute() {
    setMuted(!muted);
  }

  function handleSeekChange(newValue) {
    setPlayed(newValue[0]);
    setSeeking(true);
  }

  function handleSeekMouseUp() {
    setSeeking(false);
    playerRef.current?.seekTo(played);
  }

  function handleVolumeChange(newValue) {
    setVolume(newValue[0]);
  }

  function handlePlaybackRateChange(rate) {
    setPlaybackRate(parseFloat(rate));
  }

  function handleChapterClick(chapterTime) {
    playerRef.current?.seekTo(chapterTime / duration);
  }

  function pad(string) {
    return ("0" + string).slice(-2);
  }

  function formatTime(seconds) {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = pad(date.getUTCSeconds());

    if (hh) {
      return `${hh}:${pad(mm)}:${ss}`;
    }

    return `${mm}:${ss}`;
  }

  const handleFullScreen = useCallback(() => {
    if (!isFullScreen) {
      if (playerContainerRef?.current.requestFullscreen) {
        playerContainerRef?.current?.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullScreen]);

  function handleMouseMove() {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  }

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }
      // Save final progress on unmount
      if (lectureId && courseId && playedSeconds > 0 && duration > 0) {
        const isCompleted = played >= LECTURE_COMPLETION_THRESHOLD;
        saveLectureProgress(courseId, lectureId, playedSeconds, duration, isCompleted);
      }
    };
  }, [lectureId, courseId, playedSeconds, duration, played]);

  return (
    <div
      ref={playerContainerRef}
      className={`relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ease-in-out
      ${isFullScreen ? "w-screen h-screen" : ""}
      `}
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
      role="region"
      aria-label="Video player"
      aria-describedby="video-controls"
    >
      <ReactPlayer
        ref={playerRef}
        className="absolute top-0 left-0"
        width="100%"
        height="100%"
        url={url}
        playing={playing}
        volume={volume}
        muted={muted}
        playbackRate={playbackRate}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onEnded={handleEnded}
        progressInterval={500}
      />

      {/* Chapters overlay */}
      {chapters.length > 0 && showControls && !isFullScreen && (
        <div className="absolute top-4 left-4 right-4 bg-black/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-white text-sm">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Chapters:</span>
            <div className="flex space-x-3 overflow-x-auto">
              {chapters.map((chapter, index) => (
                <button
                  key={index}
                  onClick={() => handleChapterClick(chapter.time)}
                  className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded whitespace-nowrap transition-colors"
                >
                  {chapter.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showControls && (
        <div
          id="video-controls"
          className={`absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 p-4 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
          role="toolbar"
          aria-label="Video controls"
        >
          <Slider
            value={[played * 100]}
            max={100}
            step={0.1}
            onValueChange={(value) => handleSeekChange([value[0] / 100])}
            onValueCommit={handleSeekMouseUp}
            className="w-full mb-4"
            aria-label="Video progress"
            aria-valuetext={`${Math.round(played * 100)}% played`}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlayAndPause}
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                aria-label={playing ? "Pause video" : "Play video"}
              >
                {playing ? (
                  <Pause className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Play className="h-6 w-6" aria-hidden="true" />
                )}
              </Button>
              <Button
                onClick={handleRewind}
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                variant="ghost"
                size="icon"
                aria-label="Rewind 10 seconds"
              >
                <SkipBack className="h-5 w-5" aria-hidden="true" />
              </Button>
              <Button
                onClick={handleForward}
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                variant="ghost"
                size="icon"
                aria-label="Forward 10 seconds"
              >
                <SkipForward className="h-5 w-5" aria-hidden="true" />
              </Button>
              <Button
                onClick={handleToggleMute}
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                variant="ghost"
                size="icon"
                aria-label={muted ? "Unmute video" : "Mute video"}
              >
                {muted ? (
                  <VolumeX className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-6 w-6" aria-hidden="true" />
                )}
              </Button>
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={(value) => handleVolumeChange([value[0] / 100])}
                className="w-24"
              />
            </div>

            <div className="flex items-center space-x-3">
              {/* Playback Speed */}
              <Select value={playbackRate.toString()} onValueChange={handlePlaybackRateChange}>
                <SelectTrigger className="w-20 h-8 bg-transparent border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="0.75">0.75x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.25">1.25x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                </SelectContent>
              </Select>

              {/* Subtitles Toggle */}
              <Button
                onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                className={`text-white bg-transparent hover:text-white hover:bg-gray-700 ${
                  subtitlesEnabled ? 'text-blue-400' : ''
                }`}
                variant="ghost"
                size="icon"
              >
                <Subtitles className="h-5 w-5" />
              </Button>

              {/* Settings */}
              <Button
                onClick={() => setShowSettings(!showSettings)}
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                variant="ghost"
                size="icon"
              >
                <Settings className="h-5 w-5" />
              </Button>

              <div className="text-white text-sm font-mono min-w-20 text-center">
                {formatTime(played * duration)} / {formatTime(duration)}
              </div>

              <Button
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                variant="ghost"
                size="icon"
                onClick={handleFullScreen}
              >
                {isFullScreen ? (
                  <Minimize className="h-6 w-6" />
                ) : (
                  <Maximize className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Resume indicator */}
      {played > 0 && played < LECTURE_COMPLETION_THRESHOLD && (
        <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
          Resume from {formatTime(playedSeconds)}
        </div>
      )}
      
      {/* Completion indicator */}
      {hasMarkedComplete && (
        <div className="absolute top-4 right-4 bg-green-600/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Completed
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
