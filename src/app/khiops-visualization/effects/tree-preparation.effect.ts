import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap } from 'rxjs/operators';
import { TreePreparationDatasService } from '../providers/tree-preparation-datas.service';
import {
  selectNodes,
  initSelectedNodes,
  selectNodesFromId,
  selectNode,
  selectNodesFromIndex,
} from '../actions/app.action';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';

@Injectable()
export class TreePreparationEffects {
  selectNodesFromId$; // https://github.com/ngrx/platform/issues/3654
  initSelectedNodes$;
  selectNodesFromIndex$;

  constructor(
    private actions$: Actions,
    private treePreparationDatasService: TreePreparationDatasService,
  ) {
    this.initSelectedNodes$ = createEffect(() =>
      this.actions$.pipe(
        ofType(initSelectedNodes),
        switchMap(() => {
          const newNodes: TreeNodeModel[] =
            this.treePreparationDatasService.initSelectedNodes() || [];
          return [
            selectNodes({ selectedNodes: newNodes }),
            selectNode({ selectedNode: newNodes[0] }),
          ];
        }),
      ),
    );

    this.selectNodesFromId$ = createEffect(() =>
      this.actions$.pipe(
        ofType(selectNodesFromId),
        switchMap((action) => {
          let [_index, nodesIdsToSelect] =
            this.treePreparationDatasService.getNodesLinkedToOneNode(action.id);
          if (!nodesIdsToSelect) {
            // it's a folder selection
            nodesIdsToSelect = [action.id];
          }

          const newNodes: TreeNodeModel[] =
            this.treePreparationDatasService.setSelectedNodes(
              nodesIdsToSelect,
            ) || [];
          return [
            selectNodes({ selectedNodes: newNodes }),
            selectNode({
              selectedNode: newNodes.find((n) => n.id === action.id),
            }),
          ];
        }),
      ),
    );

    this.selectNodesFromIndex$ = createEffect(() =>
      this.actions$.pipe(
        ofType(selectNodesFromIndex),
        switchMap((action) => {
          // Get node linked to index
          const nodesToSelect =
            this.treePreparationDatasService.getNodesLinkedToOneIndex(
              action.index,
            );

          const newNodes: TreeNodeModel[] =
            this.treePreparationDatasService.setSelectedNodes(nodesToSelect) ||
            [];
          return [
            selectNodes({ selectedNodes: newNodes }),
            selectNode({ selectedNode: newNodes[0] }), // By default select the first node
          ];
        }),
      ),
    );
  }
}
