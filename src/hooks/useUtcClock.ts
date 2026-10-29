import { useEffect, useState } from "react";

const formatUtcTime = (date: Date) => date.toISOString().slice(11, 19);

export function useUtcClock(): string {
  const [time, setTime] = useState(() => formatUtcTime(new Date()));

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setTime(formatUtcTime(new Date()));
    }, 1000);
    return () => window.clearInterval(timerId);
  }, []);

  return time;
}
