import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AppState } from '../store/app.state';

const appState = createFeatureSelector<AppState>('appState');

export const selectedNodeSelector = createSelector(
  appState,
  (state: AppState) => state.selectedNode,
);

export const selectedNodesSelector = createSelector(
  appState,
  (state: AppState) => state.selectedNodes,
);

export const previousSelectedNodesSelector = createSelector(
  appState,
  (state: AppState) => state.previousSelectedNodes,
);
