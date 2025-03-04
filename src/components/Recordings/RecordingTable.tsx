
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { GameRecording } from "../SnakeGame/database/gameRecordingService";
import RecordingTableRow from "./RecordingTableRow";

interface RecordingTableProps {
  recordings: GameRecording[];
  loading: boolean;
  downloading: { [key: string]: boolean };
  onDownload: (recording: GameRecording) => void;
  onPlay: (recording: GameRecording) => void;
}

const RecordingTable: React.FC<RecordingTableProps> = ({
  recordings, 
  loading, 
  downloading, 
  onDownload,
  onPlay
}) => {
  // Sort recordings by date (newest first)
  const sortedRecordings = [...recordings].sort((a, b) => {
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-2"></div>
        <p className="text-gray-400">Loading recordings...</p>
      </div>
    );
  }

  if (sortedRecordings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No recordings found. Play a game and enable recording to create one.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Max Score</TableHead>
            <TableHead>Generation</TableHead>
            <TableHead>Snakes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRecordings.map(recording => (
            <RecordingTableRow 
              key={recording.id}
              recording={recording} 
              downloading={downloading[recording.id || '']} 
              onDownload={() => onDownload(recording)}
              onPlay={() => onPlay(recording)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecordingTable;
