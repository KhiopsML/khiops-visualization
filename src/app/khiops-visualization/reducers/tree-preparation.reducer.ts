import { createReducer, on } from '@ngrx/store';
import {
  selectNodes,
  selectNode,
  initSelectedNodes,
} from '../actions/tree-preparation.action';
import { initialState } from '../model/tree-preparation-datas.model';

export const treePreparationReducer = createReducer(
  initialState,

  on(initSelectedNodes, (state) => ({
    ...state,
    selectedNode: undefined,
    selectedNodes: [],
    previousSelectedNodes: [],
  })),

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
