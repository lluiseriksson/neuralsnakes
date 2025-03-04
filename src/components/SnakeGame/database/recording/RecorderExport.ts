
import { GameRecording } from "./types";

export class RecorderExport {
  // Método para exportar la grabación como archivo
  static createRecordingDownload(recording: GameRecording): void {
    const blob = new Blob([JSON.stringify(recording, null, 2)], { type: 'application/json' });
    
    // Crear nombre descriptivo para el archivo
    const date = new Date(recording.created_at).toISOString().split('T')[0];
    const scoreInfo = recording.max_score > 0 ? `-score${recording.max_score}` : '';
    const genInfo = `-gen${recording.generation}`;
    const filename = `snake-recording-${date}${scoreInfo}${genInfo}.json`;
    
    // Generar enlace de descarga
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Limpieza
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}
