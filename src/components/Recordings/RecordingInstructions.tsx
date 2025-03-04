
import React from "react";
import { Separator } from "../../components/ui/separator";

const RecordingInstructions: React.FC = () => {
  return (
    <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
      <h2 className="text-xl font-semibold mb-2">Instructions</h2>
      <p className="text-gray-400 mb-4">
        Recordings contain all the game data for analysis or replay
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-lg font-medium mb-2 text-purple-400">Recording Games</h3>
          <p className="text-sm text-gray-400">
            To record a game, use the "Record" button on the main game screen.
            Recording starts immediately and stops when the game ends or when you press
            "Stop Recording".
          </p>
        </div>
        
        <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-lg font-medium mb-2 text-blue-400">Download and Usage</h3>
          <p className="text-sm text-gray-400">
            Download the JSON files with game data to analyze or replay them
            in compatible applications. Each file contains all the moves and events of the game.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecordingInstructions;
