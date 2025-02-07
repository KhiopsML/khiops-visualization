import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AppState } from '../store/app.state';

const appState = createFeatureSelector<AppState>('appState');

export const selectedNodesSelector = createSelector(
  appState,
  (state: AppState) => state.selectedNodes,
);
