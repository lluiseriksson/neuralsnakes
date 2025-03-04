
import React, { useEffect, useState } from "react";
import { GameRecorder, GameRecording } from "../components/SnakeGame/database/gameRecordingService";
import { useToast } from "../components/ui/use-toast";
import RecordingTable from "../components/Recordings/RecordingTable";
import RecordingInstructions from "../components/Recordings/RecordingInstructions";
import RecordingsHeader from "../components/Recordings/RecordingsHeader";

const RecordingsPage = () => {
  const [recordings, setRecordings] = useState<GameRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <RecordingsHeader onRefresh={handleRefresh} />
        
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
