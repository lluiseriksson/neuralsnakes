
import React from "react";
import { Separator } from "../../components/ui/separator";

const RecordingInstructions: React.FC = () => {
  return (
    <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
      <h2 className="text-xl font-semibold mb-2">Instrucciones</h2>
      <p className="text-gray-400 mb-4">
        Las grabaciones contienen todos los datos de la partida para poder analizarla o reproducirla
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-lg font-medium mb-2 text-purple-400">Grabación de partidas</h3>
          <p className="text-sm text-gray-400">
            Para grabar una partida, utiliza el botón "Grabar" en la pantalla principal del juego.
            La grabación se inicia inmediatamente y se detiene al finalizar la partida o al presionar
            "Detener grabación".
          </p>
        </div>
        
        <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-lg font-medium mb-2 text-blue-400">Descarga y uso</h3>
          <p className="text-sm text-gray-400">
            Descarga los archivos JSON con los datos de la partida para analizarlos o reproducirlos
            en aplicaciones compatibles. Cada archivo contiene todos los movimientos y eventos de la partida.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecordingInstructions;
