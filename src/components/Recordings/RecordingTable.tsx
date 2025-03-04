
import React from "react";
import { GameRecording } from "../../components/SnakeGame/database/gameRecordingService";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { format } from "date-fns";
import { Loader2, Download, Clock, Brain, Award } from "lucide-react";

interface RecordingTableProps {
  recordings: GameRecording[];
  loading: boolean;
  downloading: string | null;
  onDownload: (recording: GameRecording) => void;
}

const RecordingTable: React.FC<RecordingTableProps> = ({
  recordings,
  loading,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="ml-3 text-gray-400">Cargando grabaciones...</p>
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="text-center p-10 border border-dashed border-gray-800 rounded-lg bg-gray-900/50">
        <p className="text-gray-400">No hay grabaciones disponibles</p>
        <p className="text-sm text-gray-500 mt-2">
          Graba una partida para poder descargarla
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableCaption>Lista de partidas grabadas ({recordings.length})</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Generación</TableHead>
            <TableHead>Puntuación</TableHead>
            <TableHead>Duración</TableHead>
            <TableHead>Serpientes</TableHead>
            <TableHead>Movimientos</TableHead>
            <TableHead>Ganador</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recordings.map((recording) => (
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecordingTable;
