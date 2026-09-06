import type { Clipping, ClippingAction } from '../clipping';

export const createClipping = (value: string): Clipping => ({
  id: crypto.randomUUID(),
  value,
});

export const clippingReducer = (clippings: Clipping[], action: ClippingAction): Clipping[] => {
  switch (action.type) {
    case 'remove':
      return clippings.filter((clipping) => clipping.id !== action.id);
    case 'add':
      return [action.clipping, ...clippings];
    case 'update':
      return clippings.map((clipping) =>
        clipping.id === action.id ? { ...clipping, value: action.value } : clipping,
      );
  }
};
