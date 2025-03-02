
import React, { useState, useEffect, useRef } from 'react';

interface TimerProps {
  startTime: number;
}

const Timer: React.FC<TimerProps> = ({ startTime }) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Set initial time left
    const initialElapsed = Date.now() - startTime;
    const initialRemaining = Math.max(0, 60 - Math.floor(initialElapsed / 1000));
    setTimeLeft(initialRemaining);
    
    // Start new interval
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 60 - Math.floor(elapsed / 1000));
      setTimeLeft(remaining);
      
      // Auto-cleanup when time reaches 0
      if (remaining <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [startTime]);

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white font-bold text-2xl">
      {timeLeft}s
    </div>
  );
};

export default Timer;
