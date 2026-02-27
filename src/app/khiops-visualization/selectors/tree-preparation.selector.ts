import { createSelector, createFeatureSelector } from '@ngrx/store';
import { TreePreparationState } from '../model/tree-preparation-datas.model';

const selectTreePreparationState = createFeatureSelector<TreePreparationState>(
  'TreePreparationState',
);

export const selectedNodeSelector = createSelector(
  selectTreePreparationState,
  (state: TreePreparationState) => state.selectedNode,
);

export const selectedNodesSelector = createSelector(
  selectTreePreparationState,
  (state: TreePreparationState) => state.selectedNodes,
);

export const previousSelectedNodesSelector = createSelector(
  selectTreePreparationState,
  (state: TreePreparationState) => state.previousSelectedNodes,
);
