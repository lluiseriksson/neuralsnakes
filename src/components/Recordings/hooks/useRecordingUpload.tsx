
import { useState } from 'react';
import { useToast } from "../../../components/ui/use-toast";
import { GameRecording } from "../../SnakeGame/database/gameRecordingService";

interface UseRecordingUploadProps {
  onFileLoaded: (recording: GameRecording) => void;
}

export function useRecordingUpload({ onFileLoaded }: UseRecordingUploadProps) {
  const [showUploader, setShowUploader] = useState(false);
  const [uploadedRecording, setUploadedRecording] = useState<GameRecording | null>(null);
  const { toast } = useToast();

  const toggleUploader = () => {
    setShowUploader(!showUploader);
  };

  const handleFileLoaded = (recording: GameRecording) => {
    setUploadedRecording(recording);
    onFileLoaded(recording);
    
    toast({
      title: "Recording loaded",
      description: "The recording is ready to be viewed.",
    });
  };

  return {
    showUploader,
    uploadedRecording,
    toggleUploader,
    handleFileLoaded
  };
}
