
import React, { useEffect, useState } from "react";
import { GameRecorder, GameRecording } from "../components/SnakeGame/database/gameRecordingService";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { format } from "date-fns";
import { useToast } from "../components/ui/use-toast";
import { Loader2, Download, ExternalLink, Clock, Brain, Award } from "lucide-react";

const RecordingsPage = () => {
  const [recordings, setRecordings] = useState<GameRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { toast } = useToast();

  // Cargar grabaciones al montar el componente
  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        setLoading(true);
        const data = await GameRecorder.getRecordings(50);
        setRecordings(data);
      } catch (error) {
        console.error("Error al cargar grabaciones:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las grabaciones.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();
  }, [toast]);

  // Descargar grabación
  const handleDownload = async (recording: GameRecording) => {
    try {
      setDownloading(recording.id);
      GameRecorder.createRecordingDownload(recording);
      
      toast({
        title: "Descarga iniciada",
        description: "Tu archivo se está descargando.",
      });
    } catch (error) {
      console.error("Error al descargar:", error);
      toast({
        title: "Error",
        description: "No se pudo descargar la grabación.",
        variant: "destructive"
      });
    } finally {
      setDownloading(null);
    }
  };

  // Formatear duración
  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Partidas Grabadas
        </h1>
        
        <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Partidas disponibles</h2>
              <p className="text-gray-400 text-sm mt-1">
                Descarga las partidas para analizarlas o reproducirlas en otra aplicación
              </p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-gray-700"
            >
              Actualizar
            </Button>
          </div>
          
          <Separator className="my-4 bg-gray-800" />
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <p className="ml-3 text-gray-400">Cargando grabaciones...</p>
            </div>
          ) : recordings.length === 0 ? (
            <div className="text-center p-10 border border-dashed border-gray-800 rounded-lg bg-gray-900/50">
              <p className="text-gray-400">No hay grabaciones disponibles</p>
              <p className="text-sm text-gray-500 mt-2">
                Graba una partida para poder descargarla
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>Lista de partidas grabadas ({recordings.length})</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Generación</TableHead>
                    <TableHead>Puntuación</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Serpientes</TableHead>
                    <TableHead>Movimientos</TableHead>
                    <TableHead>Ganador</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recordings.map((recording) => (
                    <TableRow key={recording.id} className="hover:bg-gray-800/50">
                      <TableCell>
                        {format(new Date(recording.created_at), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Brain className="w-4 h-4 mr-1 text-purple-400" />
                          <span className="font-mono">{recording.generation}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-800">
                          {recording.max_score}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-blue-400" />
                          <span className="font-mono">{formatDuration(recording.duration)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{recording.snake_count}</TableCell>
                      <TableCell>{recording.total_moves}</TableCell>
                      <TableCell>
                        {recording.winner_color ? (
                          <div className="flex items-center">
                            <Award className="w-4 h-4 mr-1 text-yellow-400" />
                            <div 
                              className="w-3 h-3 rounded-full mr-1" 
                              style={{ backgroundColor: recording.winner_color }}
                            />
                            <span>#{recording.winner_id}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(recording)}
                          disabled={downloading === recording.id}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {downloading === recording.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Descargando...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-1" />
                              Descargar
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        
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
      </div>
    </div>
  );
};

export default RecordingsPage;
