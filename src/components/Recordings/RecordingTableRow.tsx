
import React from "react";
import { GameRecording } from "../../components/SnakeGame/database/gameRecordingService";
import { Button } from "../../components/ui/button";
import { TableCell, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { format } from "date-fns";
import { Loader2, Download, Clock, Brain, Award } from "lucide-react";

interface RecordingTableRowProps {
  recording: GameRecording;
  downloading: string | null;
  onDownload: (recording: GameRecording) => void;
}

const RecordingTableRow: React.FC<RecordingTableRowProps> = ({
  recording,
  downloading,
  onDownload,
}) => {
  // Formatear duración
  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <TableRow key={recording.id} className="hover:bg-gray-800/50">
      <TableCell>
        {format(new Date(recording.created_at), "dd/MM/yyyy HH:mm")}
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Brain className="w-4 h-4 mr-1 text-purple-400" />
          <span className="font-mono">{recording.generation}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge className="bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-800">
          {recording.max_score}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1 text-blue-400" />
          <span className="font-mono">{formatDuration(recording.duration)}</span>
        </div>
      </TableCell>
      <TableCell>{recording.snake_count}</TableCell>
      <TableCell>{recording.total_moves}</TableCell>
      <TableCell>
        {recording.winner_color ? (
          <div className="flex items-center">
            <Award className="w-4 h-4 mr-1 text-yellow-400" />
            <div 
              className="w-3 h-3 rounded-full mr-1" 
              style={{ backgroundColor: recording.winner_color }}
            />
            <span>#{recording.winner_id}</span>
          </div>
        ) : (
          <span className="text-gray-500">-</span>
        )}
      </TableCell>
      <TableCell>
        <Button
          size="sm"
          onClick={() => onDownload(recording)}
          disabled={downloading === recording.id}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {downloading === recording.id ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              Descargando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-1" />
              Descargar
            </>
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default RecordingTableRow;
