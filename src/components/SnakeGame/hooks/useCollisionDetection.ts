
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
        // Convertir todas las posiciones de la serpiente en manzanas
        const explosionApples = snake.positions.map(position => ({
          position: { ...position }
        }));
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
            if (snake.positions.length > otherSnake.positions.length) {
              snake.score += otherSnake.positions.length;
              for (let k = 0; k < otherSnake.positions.length; k++) {
                snake.positions.push({ ...snake.positions[snake.positions.length - 1] });
              }
              const [spawnX, spawnY, direction, color] = generateSnakeSpawnConfig(otherSnake.id);
              const respawnSnake = createSnake(otherSnake.id, spawnX, spawnY, direction, color);
              newSnakes[j] = respawnSnake;
            } else {
              otherSnake.score += snake.positions.length;
              for (let k = 0; k < snake.positions.length; k++) {
                otherSnake.positions.push({ ...otherSnake.positions[otherSnake.positions.length - 1] });
              }
              const [spawnX, spawnY, direction, color] = generateSnakeSpawnConfig(snake.id);
              const respawnSnake = createSnake(snake.id, spawnX, spawnY, direction, color);
              newSnakes[i] = respawnSnake;
            }
          } else {
            otherSnake.score += snake.positions.length;
            for (let k = 0; k < snake.positions.length; k++) {
              otherSnake.positions.push({ ...otherSnake.positions[otherSnake.positions.length - 1] });
            }
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
