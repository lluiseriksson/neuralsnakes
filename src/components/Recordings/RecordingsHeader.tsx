
import React from 'react';
import { Button } from "../../components/ui/button";
import { RefreshCw, Upload } from "lucide-react";

interface RecordingsHeaderProps {
  onRefresh: () => void;
  showUploader: boolean;
  onToggleUploader: () => void;
}

const RecordingsHeader: React.FC<RecordingsHeaderProps> = ({
  onRefresh,
  showUploader,
  onToggleUploader
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Recorded Games</h1>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-white"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
        <Button 
          variant={showUploader ? "default" : "outline"}
          size="sm" 
          onClick={onToggleUploader}
          className={showUploader 
            ? "bg-blue-600 hover:bg-blue-700 text-white" 
            : "border-gray-700 bg-gray-800 hover:bg-gray-700 text-white"}
        >
          <Upload className="w-4 h-4 mr-1" />
          Upload Recording
        </Button>
      </div>
    </div>
  );
};

export default RecordingsHeader;
