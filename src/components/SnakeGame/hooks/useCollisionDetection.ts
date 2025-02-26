
import { Snake, Apple } from '../types';
import { createSnake, generateSnakeSpawnConfig } from './useSnakeCreation';

export const checkCollisions = (snakes: Snake[], currentApples: Apple[]) => {
  const newSnakes = [...snakes];
  let newApples = [...currentApples];

  // Verificar colisiones entre serpientes primero
  for (let i = 0; i < newSnakes.length; i++) {
    const snake = newSnakes[i];
    if (!snake.alive) continue;
    
    const head = snake.positions[0];

    // Colisión con sí misma
    for (let j = 1; j < snake.positions.length; j++) {
      if (head.x === snake.positions[j].x && head.y === snake.positions[j].y) {
        // Mantener el score actual antes de resetear
        const currentScore = snake.score;
        const [spawnX, spawnY, direction, color] = generateSnakeSpawnConfig(snake.id);
        newSnakes[i] = createSnake(snake.id, spawnX, spawnY, direction, color);
        newSnakes[i].score = currentScore; // Mantener el score
        break;
      }
    }

    // Colisión con otras serpientes
    for (let j = 0; j < newSnakes.length; j++) {
      if (i === j) continue;
      const otherSnake = newSnakes[j];
      if (!otherSnake.alive) continue;

      const otherHead = otherSnake.positions[0];
      
      // Colisión cabeza con cabeza
      if (head.x === otherHead.x && head.y === otherHead.y) {
        // Mantener los scores actuales
        const score1 = snake.score;
        const score2 = otherSnake.score;
        
        // Resetear ambas serpientes manteniendo sus scores
        const [spawnX1, spawnY1, direction1, color1] = generateSnakeSpawnConfig(snake.id);
        const [spawnX2, spawnY2, direction2, color2] = generateSnakeSpawnConfig(otherSnake.id);
        
        newSnakes[i] = createSnake(snake.id, spawnX1, spawnY1, direction1, color1);
        newSnakes[j] = createSnake(otherSnake.id, spawnX2, spawnY2, direction2, color2);
        
        newSnakes[i].score = score1;
        newSnakes[j].score = score2;
        continue;
      }

      // Colisión con el cuerpo de otra serpiente
      for (let k = 1; k < otherSnake.positions.length; k++) {
        if (head.x === otherSnake.positions[k].x && head.y === otherSnake.positions[k].y) {
          // La serpiente que colisiona pierde, la otra gana puntos
          const currentScore = snake.score;
          const [spawnX, spawnY, direction, color] = generateSnakeSpawnConfig(snake.id);
          newSnakes[i] = createSnake(snake.id, spawnX, spawnY, direction, color);
          newSnakes[i].score = currentScore; // Mantener el score del perdedor
          newSnakes[j].score += 1; // Solo dar 1 punto por eliminación
          break;
        }
      }
    }
  }

  return { newSnakes, newApples };
};
