
import React, { useEffect, useRef, useState } from 'react';
import { GameState } from './types';
import { CELL_SIZE, GRID_SIZE } from './constants';

interface GameCanvasProps {
  gameState: GameState;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frameCount, setFrameCount] = useState(0);
  const lastDrawnStateRef = useRef<string>('');

  // Función mejorada para dibujar el juego
  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("Canvas no encontrado");
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      console.log("Contexto 2D no disponible");
      return;
    }

    // Verificar si el estado ha cambiado desde el último dibujado
    const currentStateHash = JSON.stringify({
      snakes: gameState.snakes.map(s => ({ 
        pos: s.positions, 
        alive: s.alive,
        direction: s.direction
      })),
      apples: gameState.apples
    });
    
    if (currentStateHash === lastDrawnStateRef.current) {
      // console.log("Estado no ha cambiado, omitiendo redibujado");
      return;
    }
    
    lastDrawnStateRef.current = currentStateHash;
    // console.log("Dibujando nuevo estado", frameCount);

    // Limpiar el canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar manzanas
    if (gameState.apples && gameState.apples.length > 0) {
      ctx.fillStyle = '#ff0000';
      gameState.apples.forEach(apple => {
        if (apple && apple.position) {
          ctx.beginPath();
          ctx.arc(
            apple.position.x * CELL_SIZE + CELL_SIZE / 2,
            apple.position.y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 2 - 2,
            0,
            2 * Math.PI
          );
          ctx.fill();
        }
      });

      // Dibujar brillos de manzanas (solo cada 3 frames)
      if (frameCount % 3 === 0) {
        ctx.fillStyle = '#ff6666';
        gameState.apples.forEach(apple => {
          if (apple && apple.position) {
            ctx.beginPath();
            ctx.arc(
              apple.position.x * CELL_SIZE + CELL_SIZE / 3,
              apple.position.y * CELL_SIZE + CELL_SIZE / 3,
              2,
              0,
              2 * Math.PI
            );
            ctx.fill();
          }
        });
      }
    }

    // Dibujar serpientes - Verificación adicional
    if (gameState.snakes && Array.isArray(gameState.snakes) && gameState.snakes.length > 0) {
      console.log(`Dibujando ${gameState.snakes.length} serpientes en el canvas`);
      const aliveSnakes = gameState.snakes.filter(s => s && s.alive);
      console.log(`${aliveSnakes.length} serpientes vivas`);
      
      // Dibujar cada serpiente
      gameState.snakes.forEach((snake, index) => {
        // Verificación robusta de la serpiente
        if (!snake) {
          console.log(`Serpiente ${index} es null o undefined`);
          return;
        }
        
        if (!snake.positions || !Array.isArray(snake.positions) || snake.positions.length === 0) {
          console.log(`Serpiente ${index} tiene posiciones inválidas:`, snake.positions);
          return;
        }
        
        if (!snake.alive) {
          console.log(`Serpiente ${index} está muerta, no se dibuja`);
          return;
        }
        
        const snakeColor = snake.color || '#ffffff';
        console.log(`Dibujando serpiente ${index} con color ${snakeColor} y ${snake.positions.length} segmentos`);
        
        // Dibujar el cuerpo completo de la serpiente con degradado para mejor visibilidad
        snake.positions.forEach((pos, segIdx) => {
          if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
            console.log(`Posición inválida en segmento ${segIdx} de serpiente ${index}:`, pos);
            return;
          }
          
          // Calcular color con degradado basado en posición en la serpiente
          const brightness = Math.max(0.6, 1 - segIdx * 0.03); // Oscurecer gradualmente
          const r = parseInt(snakeColor.substring(1, 3), 16) * brightness;
          const g = parseInt(snakeColor.substring(3, 5), 16) * brightness;
          const b = parseInt(snakeColor.substring(5, 7), 16) * brightness;
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          
          // Usar fillRect con esquinas redondeadas para mejor visibilidad
          const x = pos.x * CELL_SIZE;
          const y = pos.y * CELL_SIZE;
          const size = CELL_SIZE - 2;
          
          // Si es la cabeza, dibujar un poco más grande
          if (segIdx === 0) {
            ctx.fillRect(x, y, size, size);
            
            // Dibujar ojos para la cabeza
            ctx.fillStyle = 'white';
            
            // Ajustar posición de los ojos según dirección
            let leftEyeX = x + CELL_SIZE / 4;
            let leftEyeY = y + CELL_SIZE / 4;
            let rightEyeX = x + CELL_SIZE * 2/3;
            let rightEyeY = y + CELL_SIZE / 4;
            
            if (snake.direction === 'DOWN') {
              leftEyeY = rightEyeY = y + CELL_SIZE * 2/3;
            } else if (snake.direction === 'LEFT') {
              leftEyeX = rightEyeX = x + CELL_SIZE / 4;
              rightEyeY = y + CELL_SIZE * 2/3;
            } else if (snake.direction === 'RIGHT') {
              leftEyeX = rightEyeX = x + CELL_SIZE * 2/3;
              rightEyeY = y + CELL_SIZE * 2/3;
            }
            
            ctx.fillRect(
              leftEyeX,
              leftEyeY,
              CELL_SIZE / 6, 
              CELL_SIZE / 6
            );
            ctx.fillRect(
              rightEyeX,
              rightEyeY,
              CELL_SIZE / 6, 
              CELL_SIZE / 6
            );
          } else {
            // Para segmentos del cuerpo, dibujar un poco más pequeños
            ctx.fillRect(
              x + 1,
              y + 1,
              size - 2,
              size - 2
            );
          }
        });
      });
    } else {
      console.log('No hay serpientes para dibujar:', gameState.snakes);
    }

    // Incrementar contador de frames
    setFrameCount(prev => (prev + 1) % 30);
  };

  // Configurar canvas cuando se monta el componente
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Establecer dimensiones del canvas de manera explícita
    canvas.width = GRID_SIZE * CELL_SIZE;
    canvas.height = GRID_SIZE * CELL_SIZE;
    
    console.log(`Canvas inicializado: ${canvas.width}x${canvas.height}`);

    // Configurar loop de animación
    let animationFrameId: number;
    const render = () => {
      drawGame();
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);  // Solo ejecutar una vez al montar

  // Actualizar el juego cuando cambia el estado
  useEffect(() => {
    drawGame();
  }, [gameState]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        style={{
          width: `${GRID_SIZE * CELL_SIZE}px`,
          height: `${GRID_SIZE * CELL_SIZE}px`,
        }}
        className="border border-gray-800 bg-black rounded-lg shadow-lg"
      />
      {(!gameState.snakes || gameState.snakes.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
          Cargando serpientes...
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
