
import { Snake, Apple } from '../types';
import { createSnake, generateSnakeSpawnConfig } from './useSnakeCreation';

export const checkCollisions = (snakes: Snake[], currentApples: Apple[]) => {
  const newSnakes = [...snakes];
  let newApples = [...currentApples];

  newSnakes.forEach((snake, i) => {
    if (!snake.alive) return;
    
    const head = snake.positions[0];

    // Verificar colisión con sí misma
    for (let j = 1; j < snake.positions.length; j++) {
      if (head.x === snake.positions[j].x && head.y === snake.positions[j].y) {
        // Convertir todas las posiciones de la serpiente en manzanas cuando colisiona consigo misma
        const explosionApples = snake.positions.map(position => ({
          position: { ...position }
        }));
        
        // Agregar las manzanas al juego
        newApples = [...newApples, ...explosionApples];

        // Respawnear la serpiente
        const [spawnX, spawnY, direction, color] = generateSnakeSpawnConfig(snake.id);
        const respawnSnake = createSnake(snake.id, spawnX, spawnY, direction, color);
        newSnakes[i] = respawnSnake;
        return;
      }
    }

    // Colisión con otras serpientes
    newSnakes.forEach((otherSnake, j) => {
      if (i === j || !otherSnake.alive) return;

      otherSnake.positions.forEach((segment, index) => {
        if (head.x === segment.x && head.y === segment.y) {
          if (index === 0) {
            // Colisión cabeza con cabeza - ambas serpientes explotan y resetean
            const [spawnX1, spawnY1, direction1, color1] = generateSnakeSpawnConfig(snake.id);
            const [spawnX2, spawnY2, direction2, color2] = generateSnakeSpawnConfig(otherSnake.id);
            
            // Resetear ambas serpientes
            newSnakes[i] = createSnake(snake.id, spawnX1, spawnY1, direction1, color1);
            newSnakes[j] = createSnake(otherSnake.id, spawnX2, spawnY2, direction2, color2);
          } else {
            // Colisión con el cuerpo
            otherSnake.score += snake.positions.length;
            for (let k = 0; k < snake.positions.length; k++) {
              otherSnake.positions.push({ ...otherSnake.positions[otherSnake.positions.length - 1] });
            }
            
            // Respawnear la serpiente perdedora
            const [spawnX, spawnY, direction, color] = generateSnakeSpawnConfig(snake.id);
            const respawnSnake = createSnake(snake.id, spawnX, spawnY, direction, color);
            newSnakes[i] = respawnSnake;
          }
        }
      });
    });
  });

  return { newSnakes, newApples };
};
