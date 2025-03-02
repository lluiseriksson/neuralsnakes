
import { LearningEvent } from './types';

export const drawLearningHistory = (
  ctx: CanvasRenderingContext2D, 
  learningEvents: LearningEvent[],
  canvas: HTMLCanvasElement
) => {
  // Draw a small learning history chart at the bottom
  const chartStartX = 40;
  const chartWidth = canvas.width - 80;
  const chartY = canvas.height - 50;
  const chartHeight = 30;
  
  // Background for chart
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(chartStartX, chartY - chartHeight, chartWidth, chartHeight);
  
  // Draw chart border
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  ctx.strokeRect(chartStartX, chartY - chartHeight, chartWidth, chartHeight);
  
  // Draw chart title
  ctx.fillStyle = '#AAAAAA';
  ctx.font = '9px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Learning History', chartStartX + chartWidth / 2, chartY - chartHeight - 5);
  
  // Draw learning events (only show the last 20)
  const events = learningEvents.slice(-20);
  const barWidth = Math.min(10, chartWidth / events.length);
  
  events.forEach((event, index) => {
    const x = chartStartX + (index * (chartWidth / events.length));
    let barHeight = 0;
    let color = '#777';
    
    if (event.reward !== undefined) {
      // Normalize reward to chart height
      barHeight = Math.min(chartHeight, Math.abs(event.reward) * chartHeight / 2);
      color = event.reward > 0 ? '#4CAF50' : '#F44336';
      
      // Draw bar
      ctx.fillStyle = color;
      if (event.reward > 0) {
        ctx.fillRect(x, chartY - barHeight, barWidth - 1, barHeight);
      } else {
        ctx.fillRect(x, chartY - 1, barWidth - 1, barHeight);
      }
    }
  });
};
