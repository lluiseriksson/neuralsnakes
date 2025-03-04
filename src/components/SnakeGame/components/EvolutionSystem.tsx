
import React from 'react';

const EvolutionSystem: React.FC = () => {
  return (
    <div className="mt-6 p-4 bg-gray-900 rounded-xl border border-gray-700 text-white text-sm max-w-2xl shadow-lg">
      <p className="font-bold mb-2 text-purple-400">Sistema de evolución neural:</p>
      <div className="grid grid-cols-2 gap-4">
        <ul className="list-disc list-inside mt-1 text-xs space-y-1 text-gray-300">
          <li className="text-yellow-400">Serpiente amarilla: modelo óptimo (mutación baja)</li>
          <li className="text-blue-400">Serpiente azul: modelo combinado (mutación media)</li>
          <li className="text-gray-400">Otras serpientes: modelos experimentales (mutación alta)</li>
        </ul>
        <div className="bg-gray-800 p-2 rounded text-xs">
          <p className="text-green-400 font-semibold mb-1">Información:</p>
          <p>Generación actual: <span id="current-gen"></span></p>
          <p>Mejor puntuación: <span id="best-score"></span></p>
          <p>Serpientes vivas: <span id="alive-count"></span></p>
        </div>
      </div>
    </div>
  );
};

export default EvolutionSystem;
