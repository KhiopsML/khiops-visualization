import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';
import { createAction, props } from '@ngrx/store';

export const selectNodes = createAction(
  'Select Nodes',
  props<{ selectedNodes: TreeNodeModel[] }>(),
);

export const selectNodesFromId = createAction(
  'Select Nodes From id',
  props<{ id: string }>(),
);

export const selectNodesFromIndex = createAction(
  'Select Nodes From index',
  props<{ index: number }>(),
);

export const initSelectedNodes = createAction('Init Selected Nodes');

export const selectNode = createAction(
  'Select Node',
  props<{ selectedNode: TreeNodeModel | undefined }>(),
);
