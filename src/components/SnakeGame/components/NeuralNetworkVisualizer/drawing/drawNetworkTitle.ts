
// Draw the title and explanation text for the network visualization
export const drawNetworkTitle = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  // Draw title with subtle animation effect (achieved with sin wave)
  const titleYOffset = Math.sin(Date.now() / 1000) * 2;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Neural Network Decision Visualization', canvas.width / 2, 20 + titleYOffset);

  // Draw explanation text with a slight fade effect
  const textOpacity = 0.7 + Math.sin(Date.now() / 1500) * 0.3;
  ctx.fillStyle = `rgba(170, 170, 170, ${textOpacity})`;
  ctx.font = '11px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Inputs represent apple locations and obstacles in each direction', canvas.width / 2, canvas.height - 30);
  ctx.fillText('Yellow outline shows the selected direction', canvas.width / 2, canvas.height - 15);
};
