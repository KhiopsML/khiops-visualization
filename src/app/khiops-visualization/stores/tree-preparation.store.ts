/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { TreeNodeModel } from '../model/tree-node.model';
import { TreePreparationState, initialState } from '../model/tree-preparation-datas.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * ComponentStore for Tree Preparation state management.
 * This store is provided at component level to support multi-instance scenarios
 * with Shadow DOM, where each component instance needs its own isolated state.
 */
@Injectable()
export class TreePreparationStore extends ComponentStore<TreePreparationState> {
    // We'll inject the service lazily to avoid circular dependency
    private treePreparationDatasService: any;

    constructor() {
        super(initialState);
    }

    // Method to set the service reference (called from TreePreparationDatasService)
    setService(service: any) {
        this.treePreparationDatasService = service;
    }

    // Selectors
    readonly selectedNode$ = this.select((state) => state.selectedNode);
    readonly selectedNodes$ = this.select((state) => state.selectedNodes);
    readonly previousSelectedNodes$ = this.select((state) => state.previousSelectedNodes);

    // Updaters (equivalent to reducers)
    readonly setSelectedNodes = this.updater((state, selectedNodes: TreeNodeModel[]) => ({
        ...state,
        selectedNodes,
        previousSelectedNodes: state.selectedNodes,
    }));

    readonly setSelectedNode = this.updater((state, selectedNode: TreeNodeModel | undefined) => ({
        ...state,
        selectedNode,
    }));

    // Effects (methods that trigger state updates based on logic)
    readonly initSelectedNodes = this.effect((trigger$: Observable<void>) =>
        trigger$.pipe(
            tap(() => {
                if (this.treePreparationDatasService) {
                    const newNodes: TreeNodeModel[] = this.treePreparationDatasService.initSelectedNodes() || [];
                    this.setSelectedNodes(newNodes);
                    this.setSelectedNode(newNodes[0]);
                }
            })
        )
    );

    readonly selectNodesFromId = this.effect((params$: Observable<{ id: string }>) =>
        params$.pipe(
            tap(({ id }) => {
                if (this.treePreparationDatasService) {
                    let [_index, nodesIdsToSelect] = this.treePreparationDatasService.getNodesLinkedToOneNode(id);
                    if (!nodesIdsToSelect) {
                        // it's a folder selection
                        nodesIdsToSelect = [id];
                    }

                    const newNodes: TreeNodeModel[] = this.treePreparationDatasService.setSelectedNodes(nodesIdsToSelect) || [];
                    this.setSelectedNodes(newNodes);
                    this.setSelectedNode(newNodes.find((n: TreeNodeModel) => n.id === id));
                }
            })
        )
    );

    readonly selectNodesFromIndex = this.effect((params$: Observable<{ index: number }>) =>
        params$.pipe(
            tap(({ index }) => {
                if (this.treePreparationDatasService) {
                    // Get node linked to index
                    const nodesToSelect = this.treePreparationDatasService.getNodesLinkedToOneIndex(index);

                    const newNodes: TreeNodeModel[] = this.treePreparationDatasService.setSelectedNodes(nodesToSelect) || [];
                    this.setSelectedNodes(newNodes);
                    this.setSelectedNode(newNodes[0]); // By default select the first node
                }
            })
        )
    );
}
