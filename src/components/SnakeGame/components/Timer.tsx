
import React from 'react';

interface TimerProps {
  startTime: number;
}

const Timer: React.FC<TimerProps> = ({ startTime }) => {
  const [timeLeft, setTimeLeft] = React.useState(60);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 60 - Math.floor(elapsed / 1000));
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white font-bold text-2xl">
      {timeLeft}s
    </div>
  );
};

export default Timer;
