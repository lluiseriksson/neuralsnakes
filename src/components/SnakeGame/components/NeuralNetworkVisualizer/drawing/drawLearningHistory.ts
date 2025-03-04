
import { LearningEvent } from './types';

export const drawLearningHistory = (
  ctx: CanvasRenderingContext2D, 
  learningEvents: LearningEvent[],
  canvas: HTMLCanvasElement
) => {
  // Draw a small learning history chart at the bottom - moved lower to avoid text overlap
  const chartStartX = 40;
  const chartWidth = canvas.width - 80;
  const chartY = canvas.height - 25; // Moved further down to avoid text overlap
  const chartHeight = 20; // Made smaller to avoid text overlap
  
  // Background for chart with rounded corners
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  const cornerRadius = 5;
  
  // Draw rounded rectangle for chart background
  ctx.beginPath();
  ctx.moveTo(chartStartX + cornerRadius, chartY - chartHeight);
  ctx.lineTo(chartStartX + chartWidth - cornerRadius, chartY - chartHeight);
  ctx.arcTo(chartStartX + chartWidth, chartY - chartHeight, chartStartX + chartWidth, chartY - chartHeight + cornerRadius, cornerRadius);
  ctx.lineTo(chartStartX + chartWidth, chartY - cornerRadius);
  ctx.arcTo(chartStartX + chartWidth, chartY, chartStartX + chartWidth - cornerRadius, chartY, cornerRadius);
  ctx.lineTo(chartStartX + cornerRadius, chartY);
  ctx.arcTo(chartStartX, chartY, chartStartX, chartY - cornerRadius, cornerRadius);
  ctx.lineTo(chartStartX, chartY - chartHeight + cornerRadius);
  ctx.arcTo(chartStartX, chartY - chartHeight, chartStartX + cornerRadius, chartY - chartHeight, cornerRadius);
  ctx.fill();
  
  // Draw chart title
  ctx.fillStyle = '#AAAAAA';
  ctx.font = '9px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Learning History (last 20 events)', chartStartX + chartWidth / 2, chartY - chartHeight - 5);
  
  // Draw zero line for reference
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(chartStartX, chartY - chartHeight/2);
  ctx.lineTo(chartStartX + chartWidth, chartY - chartHeight/2);
  ctx.stroke();
  
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
      
      // Apply color gradient based on magnitude
      if (event.reward > 0) {
        // Positive rewards: green gradient
        const intensity = Math.min(255, Math.floor(Math.abs(event.reward) * 200));
        color = `rgb(${100 - intensity/3}, ${150 + intensity/3}, ${100 - intensity/3})`;
        
        // Draw bar upward from center
        ctx.fillStyle = color;
        const y = chartY - chartHeight/2;
        ctx.fillRect(x, y - barHeight, barWidth - 1, barHeight);
        
        // Add glow for significant positive rewards
        if (event.reward > 0.5) {
          ctx.shadowColor = 'rgba(0, 255, 0, 0.3)';
          ctx.shadowBlur = 4;
          ctx.fillRect(x, y - barHeight, barWidth - 1, barHeight);
          ctx.shadowBlur = 0;
        }
      } else {
        // Negative rewards: red gradient
        const intensity = Math.min(255, Math.floor(Math.abs(event.reward) * 200));
        color = `rgb(${150 + intensity/3}, ${100 - intensity/3}, ${100 - intensity/3})`;
        
        // Draw bar downward from center
        ctx.fillStyle = color;
        const y = chartY - chartHeight/2;
        ctx.fillRect(x, y, barWidth - 1, barHeight);
        
        // Add glow for significant negative rewards
        if (event.reward < -0.5) {
          ctx.shadowColor = 'rgba(255, 0, 0, 0.3)';
          ctx.shadowBlur = 4;
          ctx.fillRect(x, y, barWidth - 1, barHeight);
          ctx.shadowBlur = 0;
        }
      }
    }
  });
  
  // Simplified legend to save space
  ctx.font = '8px Arial';
  ctx.fillStyle = '#AAA';
  ctx.textAlign = 'left';
  ctx.fillText('Rewards:', chartStartX, chartY + 10);
  
  // Legend color boxes (made smaller)
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(chartStartX + 45, chartY + 5, 6, 6);
  ctx.fillStyle = '#AAA';
  ctx.fillText('Good', chartStartX + 53, chartY + 10);
  
  ctx.fillStyle = '#F44336';
  ctx.fillRect(chartStartX + 85, chartY + 5, 6, 6);
  ctx.fillStyle = '#AAA';
  ctx.fillText('Bad', chartStartX + 93, chartY + 10);
};
