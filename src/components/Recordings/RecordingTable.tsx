
import React from "react";
import { GameRecording } from "../../components/SnakeGame/database/gameRecordingService";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Loader2 } from "lucide-react";
import RecordingTableRow from "./RecordingTableRow";

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
            <RecordingTableRow
              key={recording.id}
              recording={recording}
              downloading={downloading}
              onDownload={onDownload}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecordingTable;
