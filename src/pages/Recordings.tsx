
import React, { useEffect, useState } from "react";
import { GameRecorder, GameRecording } from "../components/SnakeGame/database/gameRecordingService";
import { useToast } from "../components/ui/use-toast";
import RecordingTable from "../components/Recordings/RecordingTable";
import RecordingInstructions from "../components/Recordings/RecordingInstructions";
import RecordingsHeader from "../components/Recordings/RecordingsHeader";
import RecordingUploader from "../components/Recordings/RecordingUploader";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { GameState, Snake } from "../components/SnakeGame/types";
import GameVisualizer from "../components/SnakeGame/components/GameVisualizer";
import SnakeVisualizer from "../components/SnakeGame/components/SnakeVisualizer";
import { Play, Pause } from "lucide-react";

const RecordingsPage = () => {
  const [recordings, setRecordings] = useState<GameRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [uploadedRecording, setUploadedRecording] = useState<GameRecording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentGameState, setCurrentGameState] = useState<GameState | null>(null);
  const [activeSnake, setActiveSnake] = useState<Snake | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const { toast } = useToast();
  const navigate = useNavigate();

  // Cargar grabaciones al montar el componente
  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const data = await GameRecorder.getRecordings(50);
      setRecordings(data);
    } catch (error) {
      console.error("Error loading recordings:", error);
      toast({
        title: "Error",
        description: "Could not load recordings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  // Download recording
  const handleDownload = async (recording: GameRecording) => {
    try {
      setDownloading(recording.id);
      GameRecorder.createRecordingDownload(recording);
      
      toast({
        title: "Download started",
        description: "Your file is being downloaded.",
      });
    } catch (error) {
      console.error("Error downloading:", error);
      toast({
        title: "Error",
        description: "Could not download recording.",
        variant: "destructive"
      });
    } finally {
      setDownloading(null);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };
  
  // Handle uploaded file
  const handleFileLoaded = (recording: GameRecording) => {
    setUploadedRecording(recording);
    
    // Add to local recordings list for display
    const tempDisplayRecording = {
      ...recording,
      id: recording.id || `upload-${Date.now()}`,
      is_uploaded: true
    };
    
    // Add to the beginning of the list
    setRecordings(prev => [tempDisplayRecording, ...prev]);
    
    toast({
      title: "Recording loaded",
      description: "The recording is ready to be viewed.",
    });

    // Initialize player with the first frame
    if (recording.game_data && recording.game_data.frames && recording.game_data.frames.length > 0) {
      setCurrentGameState(recording.game_data.frames[0]);
      setStartTime(Date.now());
      setCurrentFrame(0);
    }
  };
  
  const toggleUploader = () => {
    setShowUploader(!showUploader);
  };

  // Play recording functions
  const handlePlayRecording = (recording: GameRecording) => {
    if (!recording.game_data || !recording.game_data.frames || recording.game_data.frames.length === 0) {
      toast({
        title: "Error",
        description: "The recording does not contain valid data to visualize.",
        variant: "destructive"
      });
      return;
    }

    setUploadedRecording(recording);
    setCurrentGameState(recording.game_data.frames[0]);
    setStartTime(Date.now());
    setCurrentFrame(0);
    setIsPlaying(true);

    // Process the snakes to ensure they have a valid brain object for visualization
    if (recording.game_data.frames[0].snakes) {
      const processedSnakes = recording.game_data.frames[0].snakes.map(snake => {
        // If brain is missing or incomplete, create a placeholder
        if (!snake.brain || typeof snake.brain.getGeneration !== 'function') {
          return {
            ...snake,
            brain: {
              getGeneration: () => 0,
              getPerformanceStats: () => ({ 
                learningAttempts: 1, 
                successfulMoves: 0 
              })
            }
          };
        }
        return snake;
      });
      
      const processedState = {
        ...recording.game_data.frames[0],
        snakes: processedSnakes
      };
      
      setCurrentGameState(processedState);
    }

    toast({
      title: "Playing recording",
      description: `Showing recording with ${recording.game_data.frames.length} frames.`,
    });
  };

  // Handle snake selection in visualizer
  const handleSelectSnake = (snake: Snake) => {
    setActiveSnake(snake);
  };

  // Advance frames when playing
  useEffect(() => {
    let frameTimer: number;
    
    if (isPlaying && uploadedRecording?.game_data?.frames) {
      const frames = uploadedRecording.game_data.frames;
      
      frameTimer = window.setInterval(() => {
        setCurrentFrame(prev => {
          const nextFrame = prev + 1;
          
          if (nextFrame >= frames.length) {
            setIsPlaying(false);
            return prev; // Stay on last frame
          }
          
          // Process the snakes to ensure they have a valid brain object
          if (frames[nextFrame].snakes) {
            const processedSnakes = frames[nextFrame].snakes.map(snake => {
              // If brain is missing or incomplete, create a placeholder
              if (!snake.brain || typeof snake.brain.getGeneration !== 'function') {
                return {
                  ...snake,
                  brain: {
                    getGeneration: () => 0,
                    getPerformanceStats: () => ({ 
                      learningAttempts: 1, 
                      successfulMoves: 0 
                    })
                  }
                };
              }
              return snake;
            });
            
            const processedState = {
              ...frames[nextFrame],
              snakes: processedSnakes
            };
            
            setCurrentGameState(processedState);
          } else {
            // Update game state with next frame
            setCurrentGameState(frames[nextFrame]);
          }
          
          return nextFrame;
        });
      }, 200); // Adjust speed as needed
    }
    
    return () => {
      if (frameTimer) clearInterval(frameTimer);
    };
  }, [isPlaying, uploadedRecording]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <RecordingsHeader 
          onRefresh={handleRefresh} 
          showUploader={showUploader}
          onToggleUploader={toggleUploader}
        />
        
        {showUploader && (
          <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="text-lg font-semibold mb-3">Upload a recording</h3>
            <RecordingUploader onFileLoaded={handleFileLoaded} />
          </div>
        )}
        
        {/* Game Visualizer Section */}
        {currentGameState && (
          <div className="mb-6">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Recording Visualization {uploadedRecording?.id && 
                    <span className="text-sm text-gray-400">
                      (Frame {currentFrame + 1}/{uploadedRecording.game_data.frames.length})
                    </span>
                  }
                </h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="border-gray-700"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Play
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <GameVisualizer 
                    gameState={currentGameState} 
                    startTime={startTime}
                    isRecording={false}
                    onSelectSnake={handleSelectSnake}
                  />
                </div>
                <div className="md:col-span-1">
                  <SnakeVisualizer 
                    snakes={currentGameState.snakes} 
                    activeSnake={activeSnake}
                    onSelectSnake={handleSelectSnake}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
          <RecordingTable 
            recordings={recordings}
            loading={loading}
            downloading={downloading}
            onDownload={handleDownload}
            onPlay={handlePlayRecording}
          />
        </div>
        
        <RecordingInstructions />
      </div>
    </div>
  );
};

export default RecordingsPage;
