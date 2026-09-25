import { useEffect, useRef } from "react";

export function useAutoSave(
  data: unknown,
  onSave: (data: unknown) => void,
  delay = 1500,
) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handler = setTimeout(() => {
      onSave(data);
    }, delay);

    return () => clearTimeout(handler);
  }, [data, delay, onSave]);
}
