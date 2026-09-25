import { useEffect, useRef, useLayoutEffect } from "react";

export function useAutoSave(
  data: unknown,
  onSave: (data: unknown) => void,
  delay = 1500,
) {
  const dataRef = useRef(data);
  const onSaveRef = useRef(onSave);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    dataRef.current = data;
    onSaveRef.current = onSave;
  });

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      onSaveRef.current(dataRef.current);
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, delay]);
}
