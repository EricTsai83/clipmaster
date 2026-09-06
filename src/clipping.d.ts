export type Clipping = {
  id: string;
  type?: string;
  value: string;
};

type RemoveClippingAction = {
  type: 'remove';
  id: string;
};

type AddClippingAction = {
  type: 'add';
  clipping: Clipping;
};

type UpdateClippingAction = {
  type: 'update';
  id: string;
  value: string;
};

export type ClippingAction =
  | RemoveClippingAction
  | AddClippingAction
  | UpdateClippingAction;
