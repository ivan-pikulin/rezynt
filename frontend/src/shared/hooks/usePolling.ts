import { useState, useEffect, useRef } from 'react';

type UsePollingOptions<T> = {
  fetchFn: () => Promise<T>;
  shouldStop: (data: T) => boolean;
  interval?: number;
  enabled?: boolean;
};

export function usePolling<T>({
  fetchFn,
  shouldStop,
  interval = 3000,
  enabled = true,
}: UsePollingOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState(enabled);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevEnabledRef = useRef(enabled);

  useEffect(() => {
    if (prevEnabledRef.current !== enabled) {
      if (enabled) {
        setIsPolling(true);
        setData(null);
        setError(null);
      } else {
        setIsPolling(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
      prevEnabledRef.current = enabled;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !isPolling) return;

    const poll = async () => {
      try {
        const result = await fetchFn();
        setData(result);
        setError(null);

        if (shouldStop(result)) {
          setIsPolling(false);
          return;
        }

        // Schedule next poll
        timeoutRef.current = setTimeout(poll, interval);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Polling failed'));
        // Retry with longer delay on error
        timeoutRef.current = setTimeout(poll, interval * 2);
      }
    };

    poll();

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, isPolling, fetchFn, shouldStop, interval]);

  return { data, error, isPolling };
}
