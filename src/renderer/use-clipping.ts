import { useCallback, useReducer } from 'react';
import type { Clipping } from '../clipping';
import { clippingReducer, createClipping } from './clipping-state';

export const useClippings = (initialClippings: Clipping[] = []) => {
  const [clippings, dispatch] = useReducer(clippingReducer, initialClippings);

  const addClipping = useCallback(
    (value: Clipping['value']) => {
      const clipping = createClipping(value);
      dispatch({ type: 'add', clipping });
    },
    [dispatch],
  );

  const removeClipping = useCallback(
    (id: string) => dispatch({ type: 'remove', id }),
    [dispatch],
  );

  const updateClipping = useCallback(
    (id: string, value: string) => dispatch({ type: 'update', id, value }),
    [dispatch],
  );

  return {
    clippings,
    addClipping,
    removeClipping,
    updateClipping,
  } as const;
};
