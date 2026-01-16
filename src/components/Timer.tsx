import React, { useEffect, useState, useRef } from 'react';
import { formatTimeLeft } from '../utils/timeFormat';
import './Timer.css';

interface TimerProps {
  totalTime: number; // Total time in seconds
  onTimeUp: () => void; // Callback when timer reaches 0
  formatString: string; // Format string for display
  isActive: boolean; // Whether the timer should be counting down
}

export const Timer: React.FC<TimerProps> = ({
  totalTime,
  onTimeUp,
  formatString,
  isActive,
}) => {
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep onTimeUp ref updated
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Reset timer when totalTime changes (new turn starts)
  useEffect(() => {
    setTimeLeft(totalTime);
  }, [totalTime]);

  // Countdown logic
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  // Calculate warning states
  const percent = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
  const isWarning = percent <= 25 && percent > 10;
  const isCritical = percent <= 10;

  const formattedTime = formatTimeLeft(timeLeft, totalTime, formatString);

  return (
    <div 
      className={`timer ${isWarning ? 'timer-warning' : ''} ${isCritical ? 'timer-critical' : ''}`}
      aria-label={`Time remaining: ${formattedTime}`}
    >
      <span className="timer-icon">⏱️</span>
      <span className="timer-text">{formattedTime}</span>
    </div>
  );
};
