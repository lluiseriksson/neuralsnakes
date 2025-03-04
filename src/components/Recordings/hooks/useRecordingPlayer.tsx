import { useState, useEffect, useRef } from 'react';
import { useToast } from "../../../components/ui/use-toast";
import { GameRecording } from "../../SnakeGame/database/gameRecordingService";
import { GameState, Snake, NeuralNetwork } from "../../SnakeGame/types";

// Clase para crear una implementación mínima de cerebro para visualización
class MinimalBrain implements NeuralNetwork {
  private generationValue: number = 0;
  private scoreValue: number = 0;
  
  constructor(generation: number = 0, score: number = 0) {
    this.generationValue = generation;
    this.scoreValue = score;
  }
  
  // Implementar métodos requeridos
  predict(inputs: number[]): number[] { return [0, 0, 0, 0]; }
  learn(success: boolean, inputs?: number[], outputs?: number[], reward?: number): void {}
  clone(mutationRate?: number): NeuralNetwork { return new MinimalBrain(this.generationValue, this.scoreValue); }
  save(score?: number): Promise<string | null> { return Promise.resolve(null); }
  getId(): string | null { return null; }
  getWeights(): number[] { return []; }
  setWeights(weights: number[]): void {}
  getGeneration(): number { return this.generationValue; }
  updateGeneration(generation: number): void { this.generationValue = generation; }
  getBestScore(): number { return this.scoreValue; }
  getGamesPlayed(): number { return 1; }
  updateBestScore(score: number): void { this.scoreValue = score; }
  mutate(mutationRate?: number): void {}
  getProgressPercentage(): number { return 0; }
  saveTrainingData(): Promise<void> { return Promise.resolve(); }
  getPerformanceStats() { return { learningAttempts: 1, successfulMoves: 0, failedMoves: 0 }; }
  setScore(score: number): void { this.scoreValue = score; }
}

export function useRecordingPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentGameState, setCurrentGameState] = useState<GameState | null>(null);
  const [activeSnake, setActiveSnake] = useState<Snake | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [currentRecording, setCurrentRecording] = useState<GameRecording | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(200); // ms por frame
  const [totalFrames, setTotalFrames] = useState(0);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const frameTimerRef = useRef<number | null>(null);
  const framesRef = useRef<GameState[]>([]);
  const { toast } = useToast();

  // Procesar un snake para asegurar que tiene propiedades válidas de cerebro para visualización
  const processSnake = (snake: Snake): Snake => {
    if (!snake.brain || typeof snake.brain.getGeneration !== 'function') {
      // Obtener datos del cerebro del objeto snake si están disponibles
      let generation = 0;
      let score = snake.score || 0;
      
      // Intentar extraer la generación de diferentes fuentes
      if (typeof snake.brain === 'object' && snake.brain !== null) {
        if (typeof snake.brain.getGeneration === 'function') {
          try {
            generation = snake.brain.getGeneration();
          } catch (error) {
            console.error("Error calling getGeneration:", error);
          }
        } else if (snake.brain && typeof snake.brain.getGeneration === 'function') {
          // Fix: Use getGeneration() method instead of accessing property directly
          generation = snake.brain.getGeneration();
        }
      }
      
      // Crear una implementación adecuada de NeuralNetwork
      return {
        ...snake,
        brain: new MinimalBrain(generation, score)
      };
    }
    return snake;
  };

  // Procesar todos los snakes en un estado de juego
  const processGameState = (state: GameState): GameState => {
    if (!state || !state.snakes) {
      console.error("Estado de juego inválido - falta el array de snakes");
      return state;
    }
    
    return {
      ...state,
      snakes: state.snakes.map(processSnake)
    };
  };

  // Manejar la reproducción de una grabación
  const handlePlayRecording = (recording: GameRecording) => {
    // Reiniciar el estado
    cleanup();
    setProcessingError(null);
    
    if (!recording.game_data || !recording.game_data.frames || recording.game_data.frames.length === 0) {
      setProcessingError("Datos de grabación inválidos o vacíos");
      toast({
        title: "Error",
        description: "Este archivo de grabación no contiene datos válidos.",
        variant: "destructive"
      });
      return;
    }

    console.log(`Iniciando reproducción con ${recording.game_data.frames.length} frames`);
    setCurrentRecording(recording);
    
    try {
      // Preprocesar todos los frames para un acceso más rápido
      const processedFrames = recording.game_data.frames.map(processGameState);
      framesRef.current = processedFrames;
      setTotalFrames(processedFrames.length);
      
      // Configurar el primer frame
      if (processedFrames.length > 0) {
        const firstProcessedState = processedFrames[0];
        setCurrentGameState(firstProcessedState);
        setStartTime(Date.now());
        setCurrentFrame(0);
        
        // Establecer una serpiente activa por defecto (la primera)
        if (firstProcessedState.snakes && firstProcessedState.snakes.length > 0) {
          setActiveSnake(firstProcessedState.snakes[0]);
        }
      }
      
      setIsPlaying(true);
      
      console.log("Comenzó a reproducir la grabación con", recording.game_data.frames.length, "frames");
    } catch (error) {
      console.error("Error al procesar la grabación:", error);
      setProcessingError(`Error al procesar la grabación: ${error}`);
      toast({
        title: "Error",
        description: "No se pudo procesar la grabación.",
        variant: "destructive"
      });
    }
  };

  // Alternar reproducción/pausa
  const togglePlay = () => setIsPlaying(prevState => !prevState);

  // Seleccionar una serpiente
  const handleSelectSnake = (snake: Snake) => {
    console.log("Serpiente seleccionada:", snake.id);
    setActiveSnake(snake);
  };

  // Buscar un frame específico
  const seekToFrame = (frameIndex: number) => {
    if (frameIndex < 0 || !framesRef.current || frameIndex >= framesRef.current.length) {
      return;
    }
    
    setCurrentFrame(frameIndex);
    const targetFrame = framesRef.current[frameIndex];
    setCurrentGameState(targetFrame);
    
    // Si tenemos una serpiente activa, encontrar la correspondiente en el nuevo frame
    if (activeSnake && targetFrame.snakes) {
      const updatedActiveSnake = targetFrame.snakes.find(s => s.id === activeSnake.id);
      if (updatedActiveSnake) {
        setActiveSnake(updatedActiveSnake);
      }
    }
  };

  // Cambiar la velocidad de reproducción
  const changePlaybackSpeed = (newSpeed: number) => {
    setPlaybackSpeed(newSpeed);
    
    // Reiniciar el temporizador con la nueva velocidad
    if (isPlaying) {
      cleanup();
      startPlaybackTimer(newSpeed);
    }
  };

  // Iniciar el temporizador de reproducción
  const startPlaybackTimer = (speed: number = playbackSpeed) => {
    cleanup();
    
    if (!framesRef.current || framesRef.current.length <= 1) return;
    
    frameTimerRef.current = window.setInterval(() => {
      setCurrentFrame(prev => {
        const nextFrame = prev + 1;
        
        if (nextFrame >= framesRef.current.length) {
          setIsPlaying(false);
          cleanup();
          return prev; // Mantener en el último frame
        }
        
        try {
          // Procesar el siguiente frame
          const processedState = framesRef.current[nextFrame];
          setCurrentGameState(processedState);
          
          // Si tenemos una serpiente activa, encontrar la correspondiente en el nuevo frame
          if (activeSnake && processedState.snakes) {
            const updatedActiveSnake = processedState.snakes.find(s => s.id === activeSnake.id);
            if (updatedActiveSnake) {
              setActiveSnake(updatedActiveSnake);
            }
          }
        } catch (error) {
          console.error("Error al procesar el frame:", error);
          setIsPlaying(false);
          cleanup();
          return prev;
        }
        
        return nextFrame;
      });
    }, speed);
  };

  // Limpiar temporizadores
  const cleanup = () => {
    if (frameTimerRef.current) {
      clearInterval(frameTimerRef.current);
      frameTimerRef.current = null;
    }
  };

  // Limpiar al desmontar
  useEffect(() => {
    return cleanup;
  }, []);

  // Avanzar frames cuando se está reproduciendo
  useEffect(() => {
    if (isPlaying) {
      startPlaybackTimer();
    } else {
      cleanup();
    }
    
    return cleanup;
  }, [isPlaying, activeSnake]);

  return {
    isPlaying,
    currentFrame,
    currentGameState,
    activeSnake,
    startTime,
    currentRecording,
    playbackSpeed,
    totalFrames,
    processingError,
    togglePlay,
    handlePlayRecording,
    handleSelectSnake,
    changePlaybackSpeed,
    seekToFrame
  };
}
