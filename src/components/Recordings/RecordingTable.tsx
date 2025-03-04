
import React from "react";
import { Table, TableBody, TableCaption, TableHead, TableHeader } from "../../components/ui/table";
import { Skeleton } from "../../components/ui/skeleton";
import { GameRecording } from "../../components/SnakeGame/database/gameRecordingService";
import RecordingTableRow from "./RecordingTableRow";

interface RecordingTableProps {
  recordings: GameRecording[];
  loading: boolean;
  downloading: string | null;
  onDownload: (recording: GameRecording) => void;
  onPlay: (recording: GameRecording) => void; // New prop for playing recordings
}

const RecordingTable: React.FC<RecordingTableProps> = ({
  recordings,
  loading,
  downloading,
  onDownload,
  onPlay
}) => {
  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableCaption>Lista de grabaciones disponibles</TableCaption>
        
        <TableHeader className="bg-gray-800">
          <tr>
            <TableHead className="text-gray-300">ID</TableHead>
            <TableHead className="text-gray-300">Fecha</TableHead>
            <TableHead className="text-gray-300">Duración</TableHead>
            <TableHead className="text-gray-300">Puntuación Máx</TableHead>
            <TableHead className="text-gray-300">Generación</TableHead>
            <TableHead className="text-gray-300">Serpientes</TableHead>
            <TableHead className="text-gray-300"></TableHead>
          </tr>
        </TableHeader>
        
        <TableBody>
          {loading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="border-b border-gray-800">
                <td className="py-3 px-4"><Skeleton className="h-4 w-16 bg-gray-700" /></td>
                <td className="py-3 px-4"><Skeleton className="h-4 w-32 bg-gray-700" /></td>
                <td className="py-3 px-4"><Skeleton className="h-4 w-20 bg-gray-700" /></td>
                <td className="py-3 px-4"><Skeleton className="h-4 w-16 bg-gray-700" /></td>
                <td className="py-3 px-4"><Skeleton className="h-4 w-16 bg-gray-700" /></td>
                <td className="py-3 px-4"><Skeleton className="h-4 w-16 bg-gray-700" /></td>
                <td className="py-3 px-4"><Skeleton className="h-8 w-24 bg-gray-700" /></td>
              </tr>
            ))
          ) : recordings.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-4 text-center text-gray-400">
                No hay grabaciones disponibles. Juega algunas partidas para generar grabaciones.
              </td>
            </tr>
          ) : (
            recordings.map((recording) => (
              <RecordingTableRow 
                key={recording.id} 
                recording={recording} 
                downloading={downloading === recording.id}
                onDownload={() => onDownload(recording)}
                onPlay={() => onPlay(recording)}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecordingTable;
