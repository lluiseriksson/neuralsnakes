
import React from "react";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";

interface RecordingsHeaderProps {
  onRefresh: () => void;
}

const RecordingsHeader: React.FC<RecordingsHeaderProps> = ({ onRefresh }) => {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Partidas Grabadas
      </h1>
      
      <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Partidas disponibles</h2>
            <p className="text-gray-400 text-sm mt-1">
              Descarga las partidas para analizarlas o reproducirlas en otra aplicación
            </p>
          </div>
          <Button
            onClick={onRefresh}
            variant="outline"
            className="border-gray-700"
          >
            Actualizar
          </Button>
        </div>
        
        <Separator className="my-4 bg-gray-800" />
      </div>
    </>
  );
};

export default RecordingsHeader;
