import React, { useEffect, useState } from 'react';
import { formatDuration } from '../../utils/time';

/**
 * Live call duration counter — starts from 0 when mounted.
 */
export default function CallTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-text-second">
      <span className="w-2 h-2 rounded-full bg-emerald animate-pulse-green" />
      {formatDuration(seconds)}
    </div>
  );
}
