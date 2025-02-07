import { createReducer, on } from '@ngrx/store';
import { selectNodes, selectNode } from '../actions/app.action';
import { initialState } from '../store/app.state';

export const appReducer = createReducer(
  initialState,

  on(selectNodes, (state, { selectedNodes }) => ({
    ...state,
    selectedNodes,
  })),

  on(selectNode, (state, { selectedNode }) => ({
    ...state,
    selectedNode,
  })),
);
