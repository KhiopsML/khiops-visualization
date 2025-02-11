import { createSelector, createFeatureSelector } from '@ngrx/store';
import { TreePreparationState } from '../model/tree-preparation-datas.model';

const TreePreparationState = createFeatureSelector<TreePreparationState>(
  'TreePreparationState',
);

export const selectedNodeSelector = createSelector(
  TreePreparationState,
  (state: TreePreparationState) => state.selectedNode,
);

export const selectedNodesSelector = createSelector(
  TreePreparationState,
  (state: TreePreparationState) => state.selectedNodes,
);

export const previousSelectedNodesSelector = createSelector(
  TreePreparationState,
  (state: TreePreparationState) => state.previousSelectedNodes,
);
