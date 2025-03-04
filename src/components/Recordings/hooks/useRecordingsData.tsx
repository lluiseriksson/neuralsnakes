
import { useState, useEffect } from 'react';
import { useToast } from "../../../components/ui/use-toast";
import { GameRecorder, GameRecording } from "../../SnakeGame/database/gameRecordingService";

export function useRecordingsData() {
  const [recordings, setRecordings] = useState<GameRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { toast } = useToast();

  // Load recordings
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

  // Initial load
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

  // Add uploaded recording to the list
  const addUploadedRecording = (recording: GameRecording) => {
    const tempDisplayRecording = {
      ...recording,
      id: recording.id || `upload-${Date.now()}`,
      is_uploaded: true
    };
    
    // Add to the beginning of the list
    setRecordings(prev => [tempDisplayRecording, ...prev]);
  };

  return {
    recordings,
    loading,
    downloading,
    fetchRecordings,
    handleDownload,
    addUploadedRecording,
    refresh: () => window.location.reload()
  };
}
