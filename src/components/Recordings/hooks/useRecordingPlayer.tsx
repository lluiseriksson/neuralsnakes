
import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { GameRecording } from "../../SnakeGame/database/gameRecordingService";
import { GameState, Snake } from "../../SnakeGame/types";
import { processGameState } from "./player/brainProcessing";
import { prepareFrames, seekToFrame as seekToSpecificFrame } from "./player/frameManagement";
import { startPlaybackTimer, changePlaybackSpeed as changePbSpeed } from "./player/playbackControl";

export function useRecordingPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentGameState, setCurrentGameState] = useState<GameState | null>(null);
  const [activeSnake, setActiveSnake] = useState<Snake | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [currentRecording, setCurrentRecording] = useState<GameRecording | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(200); // ms per frame
  const [totalFrames, setTotalFrames] = useState(0);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const frameTimerRef = useRef<number | null>(null);
  const framesRef = useRef<GameState[]>([]);
  const { toast } = useToast();

  // Handle the playback of a recording
  const handlePlayRecording = (recording: GameRecording) => {
    // Reset state
    cleanup();
    setProcessingError(null);
    
    if (!recording.game_data || !recording.game_data.frames || recording.game_data.frames.length === 0) {
      setProcessingError("Invalid or empty recording data");
      toast({
        title: "Error",
        description: "This recording file does not contain valid data.",
        variant: "destructive"
      });
      return;
    }

    console.log(`Starting playback with ${recording.game_data.frames.length} frames`);
    setCurrentRecording(recording);
    
    try {
      // Preprocess all frames for faster access
      const processedFrames = prepareFrames(recording.game_data.frames);
      framesRef.current = processedFrames;
      setTotalFrames(processedFrames.length);
      
      // Set up the first frame
      if (processedFrames.length > 0) {
        const firstProcessedState = processedFrames[0];
        setCurrentGameState(firstProcessedState);
        setStartTime(Date.now());
        setCurrentFrame(0);
        
        // Set a default active snake (the first one)
        if (firstProcessedState.snakes && firstProcessedState.snakes.length > 0) {
          setActiveSnake(firstProcessedState.snakes[0]);
        }
      }
      
      setIsPlaying(true);
      
      console.log("Started playing recording with", recording.game_data.frames.length, "frames");
    } catch (error) {
      console.error("Error processing recording:", error);
      setProcessingError(`Error processing recording: ${error}`);
      toast({
        title: "Error",
        description: "Could not process the recording.",
        variant: "destructive"
      });
    }
  };

  // Toggle play/pause
  const togglePlay = () => setIsPlaying(prevState => !prevState);

  // Select a snake
  const handleSelectSnake = (snake: Snake) => {
    console.log("Selected snake:", snake.id);
    setActiveSnake(snake);
  };

  // Seek to a specific frame
  const seekToFrame = (frameIndex: number) => {
    seekToSpecificFrame(
      frameIndex,
      framesRef.current,
      activeSnake,
      setCurrentFrame,
      setCurrentGameState,
      setActiveSnake
    );
  };

  // Change playback speed
  const changePlaybackSpeed = (newSpeed: number) => {
    changePbSpeed(
      newSpeed,
      isPlaying,
      framesRef.current,
      activeSnake,
      currentFrame,
      setPlaybackSpeed,
      setCurrentFrame,
      setCurrentGameState,
      setActiveSnake,
      setIsPlaying,
      cleanup
    );
  };

  // Clean up timers
  const cleanup = () => {
    if (frameTimerRef.current !== null) {
      clearInterval(frameTimerRef.current);
      frameTimerRef.current = null;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  // Advance frames when playing
  useEffect(() => {
    if (isPlaying) {
      frameTimerRef.current = startPlaybackTimer(
        framesRef.current,
        activeSnake,
        currentFrame,
        playbackSpeed,
        setCurrentFrame,
        setCurrentGameState,
        setActiveSnake,
        setIsPlaying,
        cleanup
      );
    } else {
      cleanup();
    }
    
    return cleanup;
  }, [isPlaying, activeSnake]);

  return {
    isPlaying,
    currentFrame,
    currentGameState,
    activeSnake,
    startTime,
    currentRecording,
    playbackSpeed,
    totalFrames,
    processingError,
    togglePlay,
    handlePlayRecording,
    handleSelectSnake,
    changePlaybackSpeed,
    seekToFrame
  };
}
