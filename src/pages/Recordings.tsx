
import React from "react";
import { useRecordingsData } from "../components/Recordings/hooks/useRecordingsData";
import { useRecordingUpload } from "../components/Recordings/hooks/useRecordingUpload";
import { useRecordingPlayer } from "../components/Recordings/hooks/useRecordingPlayer";
import RecordingTable from "../components/Recordings/RecordingTable";
import RecordingInstructions from "../components/Recordings/RecordingInstructions";
import RecordingsHeader from "../components/Recordings/RecordingsHeader";
import RecordingUploader from "../components/Recordings/RecordingUploader";
import RecordingVisualizer from "../components/Recordings/Player/RecordingVisualizer";

const RecordingsPage = () => {
  // Get recordings data and operations
  const { 
    recordings,
    loading,
    downloading,
    handleDownload,
    addUploadedRecording,
    refresh
  } = useRecordingsData();

  // Recording player functionality
  const {
    isPlaying,
    currentFrame,
    currentGameState,
    activeSnake,
    startTime,
    togglePlay,
    handlePlayRecording,
    handleSelectSnake,
    totalFrames
  } = useRecordingPlayer();

  // Upload handling
  const {
    showUploader,
    toggleUploader,
    handleFileLoaded
  } = useRecordingUpload({
    onFileLoaded: (recording) => {
      addUploadedRecording(recording);
      handlePlayRecording(recording);
    }
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <RecordingsHeader 
          onRefresh={refresh} 
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
          <RecordingVisualizer
            currentGameState={currentGameState}
            startTime={startTime}
            isPlaying={isPlaying}
            currentFrame={currentFrame}
            totalFrames={totalFrames}
            activeSnake={activeSnake}
            onTogglePlay={togglePlay}
            onSelectSnake={handleSelectSnake}
          />
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
