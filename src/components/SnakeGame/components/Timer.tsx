
import React, { useState, useEffect, useRef } from 'react';

interface TimerProps {
  startTime: number;
}

const Timer: React.FC<TimerProps> = ({ startTime }) => {
  const [timeLeft, setTimeLeft] = useState(120);
  const timerRef = useRef<number | null>(null);
  const hasDispatchedEndEvent = useRef(false);
  
  // Create a custom event for when timer reaches zero
  const dispatchTimerEndEvent = () => {
    if (hasDispatchedEndEvent.current) return; // Prevent multiple dispatches
    
    hasDispatchedEndEvent.current = true;
    const timerEndEvent = new CustomEvent('timer-end', { detail: { timeEnded: true } });
    window.dispatchEvent(timerEndEvent);
    console.log('Timer end event dispatched with detail payload');
  };

  useEffect(() => {
    // Clear any existing interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Reset the dispatch flag when startTime changes
    hasDispatchedEndEvent.current = false;
    
    // Set initial time left
    const initialElapsed = Date.now() - startTime;
    const initialRemaining = Math.max(0, 120 - Math.floor(initialElapsed / 1000));
    setTimeLeft(initialRemaining);
    
    // Start new interval
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 120 - Math.floor(elapsed / 1000));
      setTimeLeft(remaining);
      
      // When time reaches 0, dispatch the event and clean up
      if (remaining <= 0) {
        dispatchTimerEndEvent();
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
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
    <div className="flex items-center justify-center bg-black/50 px-4 py-2 rounded-full text-white font-bold text-2xl">
      {timeLeft}s
    </div>
  );
};

export default Timer;
