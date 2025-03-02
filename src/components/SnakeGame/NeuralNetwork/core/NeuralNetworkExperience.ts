
import { sigmoid } from "../../NeuralNetworkActivations";

export type Experience = {
  inputs: number[];
  outputs: number[];
  success: boolean;
  reward: number;
  timestamp: number;
};

export class ExperienceManager {
  private experiences: Experience[] = [];
  private maxExperiences: number = 100;

  constructor(maxExperiences?: number) {
    if (maxExperiences) {
      this.maxExperiences = maxExperiences;
    }
  }

  getExperiences(): Experience[] {
    return [...this.experiences];
  }

  addExperience(inputs: number[], outputs: number[], success: boolean, reward: number): void {
    this.experiences.push({ 
      inputs, 
      outputs, 
      success, 
      reward,
      timestamp: Date.now()
    });
    
    if (this.experiences.length > this.maxExperiences) {
      this.experiences.shift();
    }
  }

  replayExperiences(count: number = 5, applyCallback: (success: boolean, inputs: number[], outputs: number[], reward: number) => void): void {
    if (this.experiences.length < 10) return;
    
    const prioritizedExperiences = [...this.experiences].sort((a, b) => {
      const recencyScoreA = (Date.now() - a.timestamp) / 60000;
      const recencyScoreB = (Date.now() - b.timestamp) / 60000;
      
      const priorityA = a.reward - (recencyScoreA * 0.1);
      const priorityB = b.reward - (recencyScoreB * 0.1);
      
      return priorityB - priorityA;
    });
    
    for (let i = 0; i < Math.min(count, prioritizedExperiences.length); i++) {
      const exp = prioritizedExperiences[i];
      
      const ageInMinutes = (Date.now() - exp.timestamp) / 60000;
      const recencyFactor = Math.max(0.5, 1 - (ageInMinutes / 30));
      
      applyCallback(exp.success, exp.inputs, exp.outputs, exp.reward * recencyFactor);
    }
  }
}
