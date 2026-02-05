import React, { useRef, useEffect, useCallback } from "react";

export const useUpdateEffect = (
  fn: React.EffectCallback,
  deps?: React.DependencyList,
) => {
  const mounted = useRef(false);
  return useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    return fn && fn();
  }, deps);
};

export const useUnmountEffect = (
  fn: React.EffectCallback,
  deps?: React.DependencyList,
) => {
  const onDestroyFn = useCallback(fn, deps);

  const ref = useRef(onDestroyFn);
  ref.current = onDestroyFn;

  return useEffect(() => {
    return () => {
      ref.current?.();
    };
  }, []);
};
