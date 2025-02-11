import { createReducer, on } from '@ngrx/store';
import { selectNodes, selectNode } from '../actions/tree-preparation.action';
import { initialState } from '../model/tree-preparation-datas.model';

export const appReducer = createReducer(
  initialState,

  on(selectNodes, (state, { selectedNodes }) => ({
    ...state,
    selectedNodes,
    previousSelectedNodes: state.selectedNodes,
  })),

  on(selectNode, (state, { selectedNode }) => ({
    ...state,
    selectedNode,
  })),
);
