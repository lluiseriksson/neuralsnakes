
import { Snake, Apple } from '../types';
import { createSnake, generateSnakeSpawnConfig } from './useSnakeCreation';

export const checkCollisions = (snakes: Snake[], currentApples: Apple[]) => {
  const newSnakes = [...snakes];
  let newApples = [...currentApples];

  for (let i = 0; i < newSnakes.length; i++) {
    const snake = newSnakes[i];
    if (!snake.alive) continue;
    
    const head = snake.positions[0];

    // Verificar colisión con sí misma
    for (let j = 1; j < snake.positions.length; j++) {
      if (head.x === snake.positions[j].x && head.y === snake.positions[j].y) {
        // Antes de morir, aprender del error
        const lastInputs = [
          head.x / snake.gridSize,
          head.y / snake.gridSize,
          // Valores aproximados para los demás inputs
          0.5, 0.5, // Posición de la manzana aproximada
          1, 0, 0, 0 // Obstáculo detectado en la dirección que causó la muerte
        ];
        
        // Aplicar aprendizaje negativo - la serpiente aprendió que esta acción fue mala
        snake.brain.learn(false, lastInputs, [], 0.5);
        
        // Convertir todas las posiciones de la serpiente en manzanas cuando colisiona consigo misma
        const explosionApples = snake.positions.map(position => ({
          position: { ...position }
        }));
        
        // Agregar las manzanas al juego
        newApples = [...newApples, ...explosionApples];

        // Respawnear la serpiente - Marcamos como no viva mientras se regenera
        snake.alive = false;
        
        // Generamos los datos para el respawn
        const [spawnX, spawnY, direction, color] = generateSnakeSpawnConfig(snake.id);
        
        // Actualizamos la configuración de la serpiente existente en lugar de crear una nueva promesa
        setTimeout(() => {
          createSnake(snake.id, spawnX, spawnY, direction, color)
            .then(newSnake => {
              Object.assign(newSnakes[i], newSnake);
              newSnakes[i].alive = true;
            });
        }, 1000);
        
        break;
      }
    }

    // Si ya no está viva, continuar con la siguiente serpiente
    if (!snake.alive) continue;

    // Colisión con otras serpientes
    for (let j = 0; j < newSnakes.length; j++) {
      if (i === j || !newSnakes[j].alive) continue;
      
      const otherSnake = newSnakes[j];
      
      for (let k = 0; k < otherSnake.positions.length; k++) {
        const segment = otherSnake.positions[k];
        
        if (head.x === segment.x && head.y === segment.y) {
          if (k === 0) {
            // Colisión cabeza con cabeza
            // Aplicar aprendizaje negativo para ambas serpientes
            const lastInputs = [
              head.x / snake.gridSize,
              head.y / snake.gridSize,
              // Valores aproximados
              0.5, 0.5,
              1, 0, 0, 0 // Obstáculo que causó la muerte
            ];
            
            snake.brain.learn(false, lastInputs, [], 0.5);
            otherSnake.brain.learn(false, lastInputs, [], 0.5);
            
            // Convertir todas las posiciones de ambas serpientes en manzanas
            const explosionApples1 = snake.positions.map(position => ({
              position: { ...position }
            }));
            const explosionApples2 = otherSnake.positions.map(position => ({
              position: { ...position }
            }));
            
            // Agregar todas las manzanas al juego
            newApples = [...newApples, ...explosionApples1, ...explosionApples2];
            
            // Marcamos ambas serpientes como no vivas mientras se regeneran
            snake.alive = false;
            otherSnake.alive = false;
            
            // Generamos los datos para los respawns
            const [spawnX1, spawnY1, direction1, color1] = generateSnakeSpawnConfig(snake.id);
            const [spawnX2, spawnY2, direction2, color2] = generateSnakeSpawnConfig(otherSnake.id);
            
            // Actualizamos la configuración de las serpientes existentes en lugar de crear nuevas promesas
            setTimeout(() => {
              createSnake(snake.id, spawnX1, spawnY1, direction1, color1)
                .then(newSnake => {
                  Object.assign(newSnakes[i], newSnake);
                  newSnakes[i].alive = true;
                });
                
              createSnake(otherSnake.id, spawnX2, spawnY2, direction2, color2)
                .then(newSnake => {
                  Object.assign(newSnakes[j], newSnake);
                  newSnakes[j].alive = true;
                });
            }, 1000);
            
          } else {
            // Colisión con el cuerpo
            // Aplicar aprendizaje negativo para la serpiente que murió
            const lastInputs = [
              head.x / snake.gridSize,
              head.y / snake.gridSize,
              // Valores aproximados
              0.5, 0.5,
              1, 0, 0, 0 // Obstáculo que causó la muerte
            ];
            
            snake.brain.learn(false, lastInputs, [], 0.5);
            
            // La serpiente ganadora obtiene los puntos
            const totalSegmentsToAdd = snake.positions.length;
            otherSnake.score += totalSegmentsToAdd;
            
            // Añadir todos los segmentos de la serpiente perdedora a la ganadora
            for (let n = 0; n < totalSegmentsToAdd; n++) {
              otherSnake.positions.push({ ...otherSnake.positions[otherSnake.positions.length - 1] });
            }
            
            // Respawnear la serpiente perdedora
            snake.alive = false;
            
            // Generamos los datos para el respawn
            const [spawnX, spawnY, direction, color] = generateSnakeSpawnConfig(snake.id);
            
            // Actualizamos la configuración de la serpiente existente en lugar de crear una nueva promesa
            setTimeout(() => {
              createSnake(snake.id, spawnX, spawnY, direction, color)
                .then(newSnake => {
                  Object.assign(newSnakes[i], newSnake);
                  newSnakes[i].alive = true;
                });
            }, 1000);
          }
          
          break;
        }
      }
      
      // Si ya no está viva, salir del bucle de colisiones con otras serpientes
      if (!snake.alive) break;
    }
  }

  return { newSnakes, newApples };
};
