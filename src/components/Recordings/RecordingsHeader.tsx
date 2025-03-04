
import React from "react";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { UploadCloud, RefreshCw } from "lucide-react";

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
    <>
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Recorded Games
      </h1>
      
      <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Available Recordings</h2>
            <p className="text-gray-400 text-sm mt-1">
              Download recordings to analyze or replay them in another application
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={onToggleUploader}
              variant="outline"
              className={`border-gray-700 ${showUploader ? 'bg-purple-900/30 text-purple-300 border-purple-700' : ''}`}
            >
              <UploadCloud className="w-4 h-4 mr-1" />
              {showUploader ? 'Hide uploader' : 'Upload recording'}
            </Button>
            <Button
              onClick={onRefresh}
              variant="outline"
              className="border-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
        
        <Separator className="my-4 bg-gray-800" />
      </div>
    </>
  );
};

export default RecordingsHeader;
