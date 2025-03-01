
import { supabase } from "@/integrations/supabase/client";

export class NeuralNetwork {
  private weights: number[];
  private id: string | null = null;
  private score: number = 0;
  private generation: number = 1;
  
  constructor(inputSize: number, hiddenSize: number, outputSize: number, weights?: number[], id?: string, score?: number, generation?: number) {
    // Inicializar pesos con valores aleatorios entre -1 y 1 o usar los proporcionados
    this.weights = weights || Array.from({ length: inputSize * hiddenSize + hiddenSize * outputSize }, 
      () => Math.random() * 2 - 1
    );
    
    // Si se proporciona un ID, este es un modelo existente
    if (id) {
      this.id = id;
      this.score = score || 0;
      this.generation = generation || 1;
    }
  }

  predict(inputs: number[]): number[] {
    // Retorna 4 valores para las 4 posibles direcciones
    return [
      Math.random() + (inputs[0] * this.weights[0]),
      Math.random() + (inputs[1] * this.weights[1]),
      Math.random() + (inputs[2] * this.weights[2]),
      Math.random() + (inputs[3] * this.weights[3])
    ];
  }

  // Método para ajustar los pesos basado en el éxito
  learn(success: boolean) {
    if (success) {
      // Si fue exitoso, reforzamos los pesos actuales
      this.weights = this.weights.map(w => w * 1.1);
    } else {
      // Si no fue exitoso, reducimos los pesos
      this.weights = this.weights.map(w => w * 0.9);
    }
  }

  // Método para clonar la red
  clone(): NeuralNetwork {
    const clone = new NeuralNetwork(8, 12, 4, [...this.weights], this.id, this.score, this.generation);
    return clone;
  }

  // Método para obtener los pesos
  getWeights(): number[] {
    return this.weights;
  }

  // Método para establecer los pesos
  setWeights(weights: number[]): void {
    this.weights = weights;
  }

  // Método para guardar el modelo en Supabase
  async save(score: number): Promise<string | null> {
    try {
      this.score = score;
      
      if (this.id) {
        // Actualizar modelo existente
        const { error } = await supabase
          .from('neural_networks')
          .update({
            weights: this.weights,
            score: this.score,
            updated_at: new Date().toISOString()
          })
          .eq('id', this.id);
        
        if (error) {
          console.error('Error updating neural network:', error);
          return null;
        }
        
        return this.id;
      } else {
        // Crear nuevo modelo
        const { data, error } = await supabase
          .from('neural_networks')
          .insert({
            weights: this.weights,
            score: this.score,
            generation: this.generation
          })
          .select('id');
        
        if (error || !data || data.length === 0) {
          console.error('Error saving neural network:', error);
          return null;
        }
        
        this.id = data[0].id;
        return this.id;
      }
    } catch (err) {
      console.error('Exception saving neural network:', err);
      return null;
    }
  }

  // Método para guardar datos de entrenamiento
  async saveTrainingData(inputs: number[], outputs: number[], success: boolean): Promise<void> {
    if (!this.id) return;
    
    try {
      const { error } = await supabase
        .from('training_data')
        .insert({
          inputs: inputs,
          outputs: outputs,
          success: success,
          neural_network_id: this.id
        });
      
      if (error) {
        console.error('Error saving training data:', error);
      }
    } catch (err) {
      console.error('Exception saving training data:', err);
    }
  }

  // Método para cargar el mejor modelo desde Supabase
  static async loadBest(): Promise<NeuralNetwork | null> {
    try {
      const { data, error } = await supabase
        .from('neural_networks')
        .select('*')
        .order('score', { ascending: false })
        .limit(1);
      
      if (error || !data || data.length === 0) {
        console.error('Error loading best neural network:', error);
        return null;
      }
      
      const model = data[0];
      return new NeuralNetwork(
        8, 
        12, 
        4, 
        model.weights, 
        model.id, 
        model.score, 
        model.generation
      );
    } catch (err) {
      console.error('Exception loading best neural network:', err);
      return null;
    }
  }

  // Método para combinar modelos (para implementar evolución genética)
  static async combineModels(count: number = 5): Promise<NeuralNetwork | null> {
    try {
      const { data, error } = await supabase
        .from('neural_networks')
        .select('*')
        .order('score', { ascending: false })
        .limit(count);
      
      if (error || !data || data.length === 0) {
        console.error('Error loading models for combination:', error);
        return null;
      }
      
      // Tomar el tamaño de pesos del primer modelo
      const weightsLength = data[0].weights.length;
      
      // Calcular nuevos pesos combinando los mejores modelos
      // Los modelos con mejor puntuación tienen más influencia
      const combinedWeights = new Array(weightsLength).fill(0);
      
      let totalScore = data.reduce((sum, model) => sum + model.score, 0);
      if (totalScore === 0) totalScore = data.length; // Evitar división por cero
      
      for (const model of data) {
        const influence = model.score / totalScore;
        
        for (let i = 0; i < weightsLength; i++) {
          combinedWeights[i] += model.weights[i] * influence;
        }
      }
      
      // Crear un nuevo modelo con los pesos combinados
      const newGeneration = Math.max(...data.map(model => model.generation)) + 1;
      const combinedModel = new NeuralNetwork(8, 12, 4, combinedWeights, null, 0, newGeneration);
      
      // Añadir algo de mutación para explorar nuevas soluciones
      const mutatedWeights = combinedModel.getWeights().map(w => {
        // 10% de probabilidad de mutación
        if (Math.random() < 0.1) {
          return w + (Math.random() * 0.2 - 0.1); // Pequeña mutación
        }
        return w;
      });
      
      combinedModel.setWeights(mutatedWeights);
      
      // Guardar el modelo combinado
      await combinedModel.save(0);
      
      return combinedModel;
    } catch (err) {
      console.error('Exception combining models:', err);
      return null;
    }
  }

  // Método para obtener todos los modelos disponibles
  static async getAllModels(): Promise<NeuralNetwork[]> {
    try {
      const { data, error } = await supabase
        .from('neural_networks')
        .select('*')
        .order('score', { ascending: false });
      
      if (error || !data) {
        console.error('Error loading all neural networks:', error);
        return [];
      }
      
      return data.map(model => new NeuralNetwork(
        8, 
        12, 
        4, 
        model.weights, 
        model.id, 
        model.score, 
        model.generation
      ));
    } catch (err) {
      console.error('Exception loading all neural networks:', err);
      return [];
    }
  }
}
