/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { ConfigService } from '@khiops-library/providers/config.service';
import {
  Component,
  HostListener,
  NgZone,
  OnDestroy,
  OnChanges,
  type SimpleChanges,
  AfterViewInit,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';

import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngstack/translate';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { firstValueFrom, Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { TreePreparationStore } from '@khiops-visualization/stores/tree-preparation.store';
import { TreeView } from '@khiops-treeview';
import { GraphSelectionSessionService } from '@khiops-visualization/providers/graph-selection-session.service';
import { cloneDeep } from 'lodash-es';

@Component({
  selector: 'app-tree-select',
  templateUrl: './tree-select.component.html',
  styleUrls: ['./tree-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TreeSelectComponent
  extends SelectableComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() public dimensionTree?: [TreeNodeModel];

  public componentType = COMPONENT_TYPES.KV_TREE; // needed to copy datas
  public override id: string | undefined = undefined;
  public isFullscreen: boolean = false;
  public focusSelection: boolean = false;
  private selectedNodes: TreeNodeModel[] = [];
  private tree: any;
  private initTreeTimer?: ReturnType<typeof setTimeout>;
  private subscriptions = new Subscription();

  selectedNodes$: Observable<TreeNodeModel[]>;
  selectedNode$: Observable<TreeNodeModel | undefined>;

  constructor(
    public override ngzone: NgZone,
    public override selectableService: SelectableService,
    public override configService: ConfigService,
    public translate: TranslateService,
    private snackBar: MatSnackBar,
    private store: TreePreparationStore,
    private graphSelectionSessionService: GraphSelectionSessionService,
  ) {
    super(selectableService, ngzone, configService);
    this.selectedNodes$ = this.store.selectedNodes$;
    this.selectedNode$ = this.store.selectedNode$;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.dimensionTree?.currentValue) {
      this.initTree();
    }
  }

  ngOnInit() {
    this.subscriptions.add(
      this.selectedNodes$.subscribe((selectedNodes) => {
        this.selectedNodes = selectedNodes;
        if (this.focusSelection) {
          this.initTree(false);
        } else {
          this.tree?.selectNodes(selectedNodes);
        }
      }),
    );
    this.subscriptions.add(
      this.selectedNode$.subscribe((selectedNode) => {
        if (selectedNode) {
          this.tree?.scrollToNode(selectedNode._id);
        }
      }),
    );
  }

  override ngAfterViewInit() {
    this.scheduleTreeInit();
  }

  override ngOnDestroy() {
    if (this.initTreeTimer) {
      clearTimeout(this.initTreeTimer);
    }
    this.subscriptions.unsubscribe();
    super.ngOnDestroy();
  }

  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
    this.scheduleTreeInit();
  }

  onToggleFocusSelection(focusSelection: boolean) {
    this.focusSelection = focusSelection;
    this.initTree(false);
  }

  private getDisplayedTree(): TreeNodeModel[] {
    if (!this.focusSelection) {
      return this.dimensionTree || [];
    }

    const selectedIds = new Set(this.selectedNodes.map((node) => node.nodeId));
    const filterNodes = (nodes: TreeNodeModel[]): TreeNodeModel[] =>
      nodes.flatMap((node) => {
        if (selectedIds.has(node.nodeId)) {
          return [node];
        }
        node.children = filterNodes(node.children || []);
        return node.children.length ? [node] : [];
      });

    return filterNodes(cloneDeep(this.dimensionTree || []));
  }

  private scheduleTreeInit() {
    if (this.initTreeTimer) {
      clearTimeout(this.initTreeTimer);
    }

    // Let split layout finish reflow before rendering tree.
    this.initTreeTimer = setTimeout(() => {
      this.initTree();
    }, 80);
  }

  private initTree(restoreSelection = true) {
    if (this.dimensionTree?.[0]) {
      const tree = new TreeView(
        this.getDisplayedTree(),
        this.configService.getRootElementDom(),
        'tree_0',
        {
          disableCollapse: true,
          disableUpdateName: true,
        },
      );
      this.tree = tree;

      this.tree.on('init', async () => {
        if (this.tree !== tree) {
          return;
        }
        if (!restoreSelection || this.selectedNodes.length > 0) {
          tree.selectNodes(this.selectedNodes);
          return;
        }
        // Restore from in-session node selection if available.
        const sessionNodeId =
          this.graphSelectionSessionService.getSelectedTreeNodeId(
            'treePreparation',
          );
        if (sessionNodeId) {
          this.store.selectNodesFromId({ id: sessionNodeId });
        } else {
          this.store.initSelectedNodes();
        }

        // Re-enable subscriptions after the store has settled, then apply initial selection
        queueMicrotask(() => {
          firstValueFrom(this.selectedNodes$).then((nodes) => {
            this.tree?.selectNodes(nodes);
          });
        });
      });

      this.tree.on('select', (e: any) => {
        // Do ngzone to emit event
        this.ngzone.run(() => {
          this.graphSelectionSessionService.setSelectedTreeNodeId(
            'treePreparation',
            e.data.id,
          );
          this.store.selectNodesFromId({
            id: e.data.id,
          });
        });
      });
      this.tree.on('error', (e: any) => {
        this.snackBar.open(this.translate.get(e.data), undefined, {
          duration: 4000,
          panelClass: 'error',
        });
      });
    }
  }

  public hideActiveEntries() {
    return this.tree?.unselectNodes();
  }

  public async showActiveEntries() {
    this.tree?.selectNodes(await firstValueFrom(this.selectedNodes$));
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: { keyCode: any }) {
    const currentSelectedArea = this.selectableService.getSelectedArea();
    if (currentSelectedArea && currentSelectedArea.id === this.id) {
      this.tree?.selectNextNode(this.id, event.keyCode);
    } else {
      return;
    }
  }
}
