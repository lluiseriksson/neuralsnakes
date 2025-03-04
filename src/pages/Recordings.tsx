
import React, { useEffect, useState } from "react";
import { GameRecorder, GameRecording } from "../components/SnakeGame/database/gameRecordingService";
import { useToast } from "../components/ui/use-toast";
import RecordingTable from "../components/Recordings/RecordingTable";
import RecordingInstructions from "../components/Recordings/RecordingInstructions";
import RecordingsHeader from "../components/Recordings/RecordingsHeader";
import RecordingUploader from "../components/Recordings/RecordingUploader";
import { useNavigate } from "react-router-dom";

const RecordingsPage = () => {
  const [recordings, setRecordings] = useState<GameRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [uploadedRecording, setUploadedRecording] = useState<GameRecording | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Cargar grabaciones al montar el componente
  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const data = await GameRecorder.getRecordings(50);
      setRecordings(data);
    } catch (error) {
      console.error("Error al cargar grabaciones:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las grabaciones.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, [toast]);

  // Descargar grabación
  const handleDownload = async (recording: GameRecording) => {
    try {
      setDownloading(recording.id);
      GameRecorder.createRecordingDownload(recording);
      
      toast({
        title: "Descarga iniciada",
        description: "Tu archivo se está descargando.",
      });
    } catch (error) {
      console.error("Error al descargar:", error);
      toast({
        title: "Error",
        description: "No se pudo descargar la grabación.",
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
    
    // Navigate to replay with data
    // This would normally be a route like `/replay/${id}`, but since
    // we're using an uploaded file, we'll need to pass the data through state
    // Assuming there's a replay page that can handle this
    toast({
      title: "Grabación cargada",
      description: "La grabación está lista para visualizarse.",
    });
  };
  
  const toggleUploader = () => {
    setShowUploader(!showUploader);
  };

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
            <h3 className="text-lg font-semibold mb-3">Cargar una grabación</h3>
            <RecordingUploader onFileLoaded={handleFileLoaded} />
          </div>
        )}
        
        <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
          <RecordingTable 
            recordings={recordings}
            loading={loading}
            downloading={downloading}
            onDownload={handleDownload}
          />
        </div>
        
        <RecordingInstructions />
      </div>
    </div>
  );
};

export default RecordingsPage;
