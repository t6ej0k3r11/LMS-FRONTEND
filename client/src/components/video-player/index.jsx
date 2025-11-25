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

function VideoPlayer({
  width = "100%",
  height = "100%",
  url,
  onProgressUpdate,
  progressData,
  lectureId,
}) {
  VideoPlayer.propTypes = {
    width: PropTypes.string,
    height: PropTypes.string,
    url: PropTypes.string,
    onProgressUpdate: PropTypes.func.isRequired,
    progressData: PropTypes.object.isRequired,
    lectureId: PropTypes.string,
  };

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [duration, setDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [chapters, setChapters] = useState([]);

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  function handlePlayAndPause() {
    setPlaying(!playing);
  }

  // Remember last position functionality
  useEffect(() => {
    if (lectureId && url) {
      const savedPosition = localStorage.getItem(`video_position_${lectureId}`);
      if (savedPosition) {
        const position = parseFloat(savedPosition);
        setPlayed(position);
        // Seek to saved position after player is ready
        setTimeout(() => {
          playerRef.current?.seekTo(position);
        }, 1000);
      }
    }
  }, [lectureId, url]);

  // Save position periodically
  useEffect(() => {
    if (lectureId && played > 0) {
      const savePosition = () => {
        localStorage.setItem(`video_position_${lectureId}`, played.toString());
      };

      const timeoutId = setTimeout(savePosition, 5000); // Save every 5 seconds
      return () => clearTimeout(timeoutId);
    }
  }, [lectureId, played]);

  function handleProgress(state) {
    if (!seeking) {
      setPlayed(state.played);
    }
  }

  function handleDuration(duration) {
    setDuration(duration);
    // Mock chapters - in real implementation, this would come from video metadata
    const mockChapters = [
      { time: 0, title: "Introduction" },
      { time: duration * 0.25, title: "Main Concepts" },
      { time: duration * 0.5, title: "Examples" },
      { time: duration * 0.75, title: "Summary" }
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

  useEffect(() => {
    // Debounce progress updates to avoid too many API calls
    const timeoutId = setTimeout(() => {
      onProgressUpdate({
        ...progressData,
        progressValue: played,
      });
    }, 100); // Update every 100ms for smoother real-time progress

    return () => clearTimeout(timeoutId);
  }, [played, onProgressUpdate, progressData]);

  return (
    <div
      ref={playerContainerRef}
      className={`relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ease-in-out
      ${isFullScreen ? "w-screen h-screen" : ""}
      `}
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
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
          className={`absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 p-4 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <Slider
            value={[played * 100]}
            max={100}
            step={0.1}
            onValueChange={(value) => handleSeekChange([value[0] / 100])}
            onValueCommit={handleSeekMouseUp}
            className="w-full mb-4"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlayAndPause}
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
              >
                {playing ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>
              <Button
                onClick={handleRewind}
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                variant="ghost"
                size="icon"
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button
                onClick={handleForward}
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                variant="ghost"
                size="icon"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
              <Button
                onClick={handleToggleMute}
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                variant="ghost"
                size="icon"
              >
                {muted ? (
                  <VolumeX className="h-6 w-6" />
                ) : (
                  <Volume2 className="h-6 w-6" />
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
      {played > 0 && played < 0.9 && (
        <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
          Resume from {formatTime(played * duration)}
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
