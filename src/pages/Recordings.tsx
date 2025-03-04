
import React from "react";
import { useRecordingsData } from "../components/Recordings/hooks/useRecordingsData";
import { useRecordingUpload } from "../components/Recordings/hooks/useRecordingUpload";
import { useRecordingPlayer } from "../components/Recordings/hooks/useRecordingPlayer";
import RecordingTable from "../components/Recordings/RecordingTable";
import RecordingInstructions from "../components/Recordings/RecordingInstructions";
import RecordingsHeader from "../components/Recordings/RecordingsHeader";
import RecordingUploader from "../components/Recordings/RecordingUploader";
import RecordingVisualizer from "../components/Recordings/Player/RecordingVisualizer";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AlertCircle } from "lucide-react";

const RecordingsPage = () => {
  // Obtener datos de grabaciones y operaciones
  const { 
    recordings,
    loading,
    downloading,
    handleDownload,
    addUploadedRecording,
    refresh
  } = useRecordingsData();

  // Funcionalidad del reproductor de grabaciones
  const {
    isPlaying,
    currentFrame,
    currentGameState,
    activeSnake,
    startTime,
    togglePlay,
    handlePlayRecording,
    handleSelectSnake,
    totalFrames,
    playbackSpeed,
    changePlaybackSpeed,
    seekToFrame,
    processingError
  } = useRecordingPlayer();

  // Manejo de carga
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
        
        {processingError && (
          <Alert variant="destructive" className="mb-4 bg-red-900 border-red-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{processingError}</AlertDescription>
          </Alert>
        )}
        
        {showUploader && (
          <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="text-lg font-semibold mb-3">Subir una grabación</h3>
            <RecordingUploader onFileLoaded={handleFileLoaded} />
          </div>
        )}
        
        {/* Sección de visualización del juego */}
        {currentGameState && (
          <RecordingVisualizer
            currentGameState={currentGameState}
            startTime={startTime}
            isPlaying={isPlaying}
            currentFrame={currentFrame}
            totalFrames={totalFrames}
            activeSnake={activeSnake}
            playbackSpeed={playbackSpeed}
            onTogglePlay={togglePlay}
            onSelectSnake={handleSelectSnake}
            onChangeSpeed={changePlaybackSpeed}
            onSeekFrame={seekToFrame}
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
