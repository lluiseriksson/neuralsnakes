
import React, { useState, useRef } from "react";
import { Button } from "../../components/ui/button";
import { Upload, FileUp, X } from "lucide-react";
import { useToast } from "../../components/ui/use-toast";
import { GameRecording } from "../../components/SnakeGame/database/gameRecordingService";

interface RecordingUploaderProps {
  onFileLoaded: (recording: GameRecording) => void;
}

const RecordingUploader: React.FC<RecordingUploaderProps> = ({ onFileLoaded }) => {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      toast({
        title: "Invalid format",
        description: "Please select a JSON recording file",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const recordingData = JSON.parse(content);
        
        // Basic validation
        if (!recordingData.game_data || !recordingData.game_data.frames) {
          throw new Error("Invalid file: Incorrect recording format");
        }
        
        onFileLoaded(recordingData);
        
        toast({
          title: "File loaded successfully",
          description: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        });
      } catch (error) {
        console.error("Error parsing recording file:", error);
        toast({
          title: "Error loading file",
          description: error instanceof Error ? error.message : "Invalid file format",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsText(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mb-6">
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed ${
            dragging ? "border-purple-500 bg-purple-500/10" : "border-gray-700"
          } rounded-lg p-6 text-center transition-colors cursor-pointer`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-300">
            Drag and drop a recording file or{" "}
            <span className="text-purple-400 underline">select a file</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Supported format: .json (game recordings)
          </p>
          <input
            type="file"
            className="hidden"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileInput}
          />
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileUp className="w-5 h-5 mr-2 text-purple-400" />
              <div>
                <p className="text-sm font-medium text-gray-200">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFile}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordingUploader;
