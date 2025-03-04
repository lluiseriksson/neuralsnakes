
import { useCallback } from 'react';
import { GameState } from '../types';
import { GameRecorder } from '../database/gameRecordingService';
import { useToast } from '../../../components/ui/use-toast';

export const useGameControls = (
  initializeGame: () => Promise<void>,
  gameLoopRef: React.MutableRefObject<NodeJS.Timeout | null>,
  isProcessingUpdate: React.MutableRefObject<boolean>,
  setIsGameRunning: React.Dispatch<React.SetStateAction<boolean>>,
  gameState?: GameState,
  recorderRef?: React.MutableRefObject<GameRecorder>,
  isRecordingRef?: React.MutableRefObject<boolean>
) => {
  const { toast } = useToast();

  // Restart game function
  const restartGame = useCallback(() => {
    console.log("useGameControls: Solicitando reinicio del juego");
    
    // Clear existing game loop
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    // Stop any active recording
    if (isRecordingRef?.current && recorderRef?.current) {
      try {
        stopRecordingInternal();
      } catch (error) {
        console.error("Error al detener grabación durante reinicio:", error);
      }
    }
    
    // Reset processing flag to avoid state updates getting stuck
    isProcessingUpdate.current = false;
    
    // Stop the game first
    setIsGameRunning(false);
    
    // Initialize a new game after a short delay
    setTimeout(() => {
      initializeGame().catch(error => {
        console.error("Error en el reinicio del juego:", error);
      });
    }, 500);
  }, [gameLoopRef, initializeGame, isProcessingUpdate, setIsGameRunning, isRecordingRef, recorderRef]);

  // Start recording function
  const startRecording = useCallback(() => {
    if (!recorderRef || !isRecordingRef || !gameState) {
      console.error("No se puede iniciar grabación: faltan dependencias");
      toast({
        title: "Error al iniciar grabación",
        description: "No se pueden inicializar los componentes de grabación.",
        variant: "destructive"
      });
      return;
    }
    
    if (isRecordingRef.current) {
      console.log("Ya hay una grabación en progreso");
      toast({
        title: "Grabación ya en curso",
        description: "Ya estás grabando esta partida.",
        variant: "default"
      });
      return;
    }
    
    try {
      // Iniciar grabación
      recorderRef.current.startRecording(gameState);
      isRecordingRef.current = true;
      
      toast({
        title: "Grabación iniciada",
        description: "Se está grabando la partida actual.",
        variant: "default"
      });
      
      console.log("Grabación iniciada");
    } catch (error) {
      console.error("Error al iniciar grabación:", error);
      toast({
        title: "Error al iniciar grabación",
        description: "Ocurrió un error al iniciar la grabación.",
        variant: "destructive"
      });
      isRecordingRef.current = false;
    }
  }, [recorderRef, isRecordingRef, gameState, toast]);

  // Función interna para detener la grabación
  const stopRecordingInternal = useCallback(async () => {
    if (!recorderRef || !isRecordingRef) {
      console.error("No se puede detener grabación: faltan dependencias");
      return null;
    }
    
    if (!isRecordingRef.current) {
      console.log("No hay grabación activa para detener");
      return null;
    }
    
    try {
      // Detener grabación
      const recording = recorderRef.current.stopRecording();
      isRecordingRef.current = false;
      
      if (!recording) {
        console.error("Error al detener la grabación: no hay datos");
        return null;
      }
      
      console.log("Grabación detenida");
      
      // Guardar grabación
      try {
        const recordingId = await recorderRef.current.saveRecording(recording);
        
        if (recordingId) {
          console.log(`Grabación guardada con ID: ${recordingId}`);
          return { id: recordingId, recording };
        } else {
          console.error("Error al guardar la grabación");
          return { recording };
        }
      } catch (error) {
        console.error("Error al guardar la grabación:", error);
        return { recording };
      }
    } catch (error) {
      console.error("Error al detener la grabación:", error);
      isRecordingRef.current = false;
      return null;
    }
  }, [recorderRef, isRecordingRef]);

  // Stop recording function (public)
  const stopRecording = useCallback(async () => {
    try {
      const result = await stopRecordingInternal();
      
      if (result) {
        toast({
          title: "Grabación completada",
          description: result.id 
            ? "La partida ha sido grabada y guardada correctamente." 
            : "La partida ha sido grabada pero no se pudo guardar en la base de datos.",
          variant: "default"
        });
        
        return result;
      } else {
        toast({
          title: "Error al grabar",
          description: "No se pudo completar la grabación de la partida.",
          variant: "destructive"
        });
        
        return null;
      }
    } catch (error) {
      console.error("Error en stopRecording:", error);
      toast({
        title: "Error al grabar",
        description: "Se produjo un error durante la grabación.",
        variant: "destructive"
      });
      return null;
    }
  }, [stopRecordingInternal, toast]);

  return { 
    restartGame, 
    startRecording, 
    stopRecording,
    isRecording: isRecordingRef?.current || false
  };
};
