import React, { useEffect, useRef, useState } from 'react';
import './Timer.css';

interface TimerProps {
  /** Total seconds for the countdown. */
  seconds: number;
  /** Called once when the countdown reaches zero. */
  onExpire: () => void;
}

export const Timer: React.FC<TimerProps> = ({ seconds, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, seconds));
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpireRef.current();
      }
      return;
    }

    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft]);

  const safeSeconds = seconds > 0 ? seconds : 1;
  const percent = Math.round((timeLeft / safeSeconds) * 100);
  const urgency = percent <= 10 ? 'critical' : percent <= 25 ? 'warning' : 'normal';

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const display = mins > 0
    ? `${mins}:${String(secs).padStart(2, '0')}`
    : `${secs}s`;

  return (
    <span className={`timer timer-${urgency}`} aria-label={`${timeLeft} seconds remaining`}>
      ⏱ {display}
    </span>
  );
};
