/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { ConfigService } from '@khiops-library/providers/config.service';
import {
  Component,
  HostListener,
  NgZone,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  Input,
} from '@angular/core';
import TreeView from '@khiops-treeview/treeview';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';

import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngstack/translate';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { firstValueFrom, Observable } from 'rxjs';
import { AppState } from '@khiops-visualization/store/app.state';
import { Store } from '@ngrx/store';
import {
  initSelectedNodes,
  selectNodesFromId,
} from '@khiops-visualization/actions/app.action';

@Component({
  selector: 'app-tree-select',
  templateUrl: './tree-select.component.html',
  styleUrls: ['./tree-select.component.scss'],
})
export class TreeSelectComponent
  extends SelectableComponent
  implements AfterViewInit, OnChanges
{
  @Input() public dimensionTree?: [TreeNodeModel];

  public componentType = COMPONENT_TYPES.KV_TREE; // needed to copy datas
  public override id: string | undefined = undefined;
  public isFullscreen: boolean = false;
  private tree: any;

  selectedNodes$: Observable<TreeNodeModel[]>;
  selectedNode$: Observable<TreeNodeModel | undefined>;

  constructor(
    public override ngzone: NgZone,
    public override selectableService: SelectableService,
    public override configService: ConfigService,
    public translate: TranslateService,
    private snackBar: MatSnackBar,
    private store: Store<{ appState: AppState }>,
  ) {
    super(selectableService, ngzone, configService);
    this.selectedNodes$ = this.store.select(
      (state) => state.appState.selectedNodes,
    );
    this.selectedNode$ = this.store.select(
      (state) => state.appState.selectedNode,
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.dimensionTree?.currentValue) {
      this.initTree();
    }
  }

  ngOnInit() {
    this.selectedNodes$.subscribe((selectedNodes) => {
      this.tree?.selectNodes(selectedNodes);
    });
    this.selectedNode$.subscribe((selectedNode) => {
      if (selectedNode) {
        this.tree?.scrollToNode(selectedNode._id);
      }
    });
  }

  override ngAfterViewInit() {
    // Init at first time
    this.initTree();
  }

  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
  }

  private initTree() {
    if (this.dimensionTree?.[0]) {
      // @ts-ignore
      this.tree = new TreeView(
        this.dimensionTree,
        this.configService.getRootElementDom(),
        'tree_0',
        {
          disableCollapse: true,
          disableUpdateName: true,
        },
      );

      this.tree.on('init', async () => {
        this.store.dispatch(initSelectedNodes());
      });

      this.tree.on('select', (e: any) => {
        // Do ngzone to emit event
        this.ngzone.run(() => {
          this.store.dispatch(
            selectNodesFromId({
              id: e.data.id,
            }),
          );
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
    this.tree.unselectNodes();
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
