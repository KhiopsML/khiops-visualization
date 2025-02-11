/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, NgZone } from '@angular/core';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { TranslateService } from '@ngstack/translate';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectNodesFromId } from '../../../actions/tree-preparation.action';
import {
  selectedNodeSelector,
  selectedNodesSelector,
} from '@khiops-visualization/selectors/tree-preparation.selector';
import { TreePreparationState } from '@khiops-visualization/model/tree-preparation-datas.model';

@Component({
  selector: 'app-tree-details',
  templateUrl: './tree-details.component.html',
  styleUrls: ['./tree-details.component.scss'],
})
export class TreeDetailsComponent {
  public treeDetails?: GridDatasI;

  selectedNodes$: Observable<TreeNodeModel[]>;
  selectedNode$: Observable<TreeNodeModel | undefined>;

  constructor(
    public ngzone: NgZone,
    public selectableService: SelectableService,
    private treePreparationDatasService: TreePreparationDatasService,
    public translate: TranslateService,
    private store: Store<{ TreePreparationState: TreePreparationState }>,
  ) {
    this.selectedNodes$ = this.store.select(selectedNodesSelector);
    this.selectedNode$ = this.store.select(selectedNodeSelector);
  }

  ngOnInit() {
    this.selectedNodes$.subscribe((selectedNodes) => {
      this.treeDetails =
        this.treePreparationDatasService.getTreeDetails(selectedNodes);
    });
  }

  onSelectListItemChanged(item: TreeNodeModel) {
    if (item?._id) {
      this.store.dispatch(
        selectNodesFromId({
          id: item._id,
        }),
      );
    }
  }
}
