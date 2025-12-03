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
import { TreePreparationStore } from '@khiops-visualization/stores/tree-preparation.store';

@Component({
  selector: 'app-tree-details',
  templateUrl: './tree-details.component.html',
  styleUrls: ['./tree-details.component.scss'],
  standalone: false
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
    private store: TreePreparationStore,
  ) {
    this.selectedNodes$ = this.store.selectedNodes$;
    this.selectedNode$ = this.store.selectedNode$;
  }

  ngOnInit() {
    this.selectedNodes$.subscribe((selectedNodes) => {
      this.treeDetails =
        this.treePreparationDatasService.getTreeDetails(selectedNodes);
    });
  }

  onSelectListItemChanged(item: TreeNodeModel) {
    if (item?._id) {
      this.store.selectNodesFromId({
        id: item._id,
      });
    }
  }
}
