/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  NgZone,
  OnDestroy,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  Input,
} from '@angular/core';
import TreeView from '@khiops-treeview/treeview';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { EventsService } from '@khiops-covisualization/providers/events.service';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngstack/translate';
import { ConfigService } from '@khiops-library/providers/config.service';
import { Subscription } from 'rxjs';
import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import {
  TreeViewErrorEventI,
  TreeViewNodeEventI,
  TreeViewUpdateNodeNameEventI,
} from '@khiops-covisualization/interfaces/events';
import { SaveService } from '@khiops-covisualization/providers/save.service';

@Component({
  selector: 'app-tree-select',
  templateUrl: './tree-select.component.html',
  styleUrls: ['./tree-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TreeSelectComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() public position: number = 0;
  @Input() private selectedDimension: DimensionCovisualizationModel | undefined;
  @Input() private selectedNode: TreeNodeModel | undefined;
  @Input() private dimensionsTree: TreeNodeModel[] | undefined;

  public id: string | undefined = undefined;
  private treeSelectedNodeChangedSub: Subscription;
  private tree: any | undefined;
  private nodeInSelection: string | undefined;

  constructor(
    private dimensionsDatasService: DimensionsDatasService,
    private ngzone: NgZone,
    private configService: ConfigService,
    private eventsService: EventsService,
    private saveService: SaveService,
    private treenodesService: TreenodesService,
    private snackBar: MatSnackBar,
    public translate: TranslateService,
  ) {
    this.treeSelectedNodeChangedSub =
      this.eventsService.treeSelectedNodeChanged.subscribe((e) => {
        if (
          this.tree &&
          e.selectedNode &&
          e.hierarchyName === this.selectedDimension?.name
        ) {
          let propagateEvent = true;
          if (e.stopPropagation) {
            propagateEvent = false;
          }
          // Check if current id is in selection to avoid infinite loop and remove propagation if not in selection
          propagateEvent = this.nodeInSelection === e.selectedNode.id;

          // get corresponding node into tree
          const treeNode = this.treenodesService.getNodeFromName(
            e.hierarchyName,
            e.selectedNode.name,
          );
          this.tree.selectNode(treeNode?.id, propagateEvent);
        }
      });
  }

  public selectNextNode(keyCode: number) {
    // Keep id into node selection
    this.nodeInSelection = this.id;

    // propagate event
    this.tree?.selectNextNode('tree-comp-' + this.position, keyCode);
  }

  public hideActiveEntries() {
    this.tree.unselectNodes();
  }

  public showActiveEntries() {
    this.tree.selectNode(this.selectedNode);
  }

  ngOnDestroy() {
    this.treeSelectedNodeChangedSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes?.selectedDimension?.currentValue &&
      !changes.selectedDimension.firstChange
    ) {
      this.initTree(this.selectedNode);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      // Avoid ExpressionChangedAfterItHasBeenCheckedError

      // define an id to be copied into clipboard
      // define the parent div to copy
      this.id = 'tree-comp-' + this.position;

      this.initTree(this.selectedNode);
    });
  }

  private initTree(selectedNode?: TreeNodeModel) {
    // @ts-ignore
    this.tree = new TreeView(
      this.dimensionsTree || [],
      this.configService.getRootElementDom(),
      'tree_' + this.position,
    );

    this.tree.on('init', () => {
      if (this.dimensionsTree) {
        if (!selectedNode) {
          //  init selected node 0 and propagate event
          // Here get the first available visible node (if tree is collapsed)
          const lastVisibleNode: TreeNodeModel =
            this.treenodesService.getLastVisibleNode(this.dimensionsTree);
          this.tree.selectNode(lastVisibleNode.id || 0, true);
        } else {
          // Select previous nodes if unfold hierarchy changed or if hierarchy has been saved
          // Find the node tree id into current tree
          const nodeTree = this.treenodesService.getNodeFromName(
            this.selectedDimension?.name ?? '',
            selectedNode._id.toString(),
          );
          const nodeTreeId = nodeTree?.id;
          if (nodeTreeId !== undefined && nodeTreeId >= 0) {
            this.tree.selectNode(nodeTreeId, true);
          }
        }
      }
    });

    this.tree.on('select', (e: TreeViewNodeEventI) => {
      // Do ngzone to emit event
      this.ngzone.run(() => {
        setTimeout(() => {
          this.treenodesService.setSelectedNode(
            this.selectedDimension?.name ?? '',
            e.data.name,
          );
        });
      });
    });
    this.tree.on('expand', (e: TreeViewNodeEventI) => {
      this.dimensionsDatasService.setIsLoading(true);
      // Important to do in ngzone to do prevent event miss
      this.ngzone.run(() => {
        setTimeout(() => {
          if (this.selectedDimension) {
            this.treenodesService.expandNode(
              this.selectedDimension.name,
              e.data.name,
            );
            this.saveService.updateJSon(
              this.selectedDimension.name,
              this.treenodesService.getSavedCollapsedNodes(),
            );
          }
        });
      });
    });
    this.tree.on('collapse', (e: TreeViewNodeEventI) => {
      this.dimensionsDatasService.setIsLoading(true);
      // Important to do in ngzone to do prevent event miss
      this.ngzone.run(() => {
        setTimeout(() => {
          if (this.selectedDimension) {
            this.treenodesService.collapseNode(
              this.selectedDimension.name,
              e.data.name,
            );
            this.saveService.updateJSon(
              this.selectedDimension.name,
              this.treenodesService.getSavedCollapsedNodes(),
            );
          }
        });
      });
    });
    this.tree.on('updateNodeName', (e: TreeViewUpdateNodeNameEventI) => {
      // Important when node name change
      this.ngzone.run(() => {
        if (this.selectedDimension) {
          this.treenodesService.updateSelectedNodeName(
            this.selectedDimension.name,
            e.data.name,
            e.data.newName,
          );
          this.saveService.updateJSon(
            this.selectedDimension.name,
            this.treenodesService.getSavedCollapsedNodes(),
          );
        }
      });
    });
    this.tree.on('error', (e: TreeViewErrorEventI) => {
      this.snackBar.open(this.translate.get(e.data.message), undefined, {
        duration: 4000,
        panelClass: 'error',
      });
    });
  }
}
