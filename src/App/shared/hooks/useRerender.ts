import { useCallback, useLayoutEffect, useRef, useState } from "react";

export interface RerenderFn {
  (): void;

  readonly renderCount: number;
}

export function useRerender(): RerenderFn {
  const mountedRef = useRef<boolean>(false);

  const [renderCount, setRenderCount] = useState(0);

  useLayoutEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  });

  const fn = useCallback(() => {
    if (!mountedRef.current) {
      return;
    }

    setRenderCount((value) => {
      return value + 1;
    });
  }, []);

  (fn as any).renderCount = renderCount;

  return fn as any;
}
