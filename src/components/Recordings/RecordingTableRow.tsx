
import React from "react";
import { TableCell, TableRow } from "../../components/ui/table";
import { Download, Play } from "lucide-react";
import { Button } from "../../components/ui/button";
import { GameRecording } from "../../components/SnakeGame/database/gameRecordingService";

interface RecordingTableRowProps {
  recording: GameRecording;
  downloading: boolean;
  onDownload: () => void;
  onPlay: () => void;
}

const RecordingTableRow: React.FC<RecordingTableRowProps> = ({ 
  recording, 
  downloading,
  onDownload,
  onPlay
}) => {
  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Format duration in seconds to mm:ss
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Check if recording is uploaded (not from database)
  const isUploaded = 'is_uploaded' in recording;
  
  return (
    <TableRow className={`border-b border-gray-800 ${isUploaded ? 'bg-blue-900/20' : ''}`}>
      <TableCell className="font-mono text-xs">
        {isUploaded ? (
          <span className="bg-blue-500/30 text-blue-200 px-2 py-1 rounded text-xs">Uploaded</span>
        ) : (
          recording.id.substring(0, 8)
        )}
      </TableCell>
      <TableCell>{formatDate(recording.created_at)}</TableCell>
      <TableCell>{formatDuration(recording.duration || 0)}</TableCell>
      <TableCell>
        {recording.max_score > 0 ? (
          <span className="text-green-400">{recording.max_score}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </TableCell>
      <TableCell>{recording.generation || 1}</TableCell>
      <TableCell>{recording.snake_count || '-'}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-green-800 bg-green-950/30 hover:bg-green-900/50 text-green-400"
            onClick={onPlay}
          >
            <Play className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            disabled={downloading}
            className="border-blue-800 bg-blue-950/30 hover:bg-blue-900/50 text-blue-400"
          >
            {downloading ? (
              <span className="animate-pulse">Downloading...</span>
            ) : (
              <>
                <Download className="w-4 h-4 mr-1" />
                Download
              </>
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default RecordingTableRow;
