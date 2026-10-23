/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas.interface';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { TreePreparationStore } from '@khiops-visualization/stores/tree-preparation.store';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-tree-leaf-rules',
  templateUrl: './tree-leaf-rules.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TreeLeafRulesComponent {
  readonly selectedNode$: Observable<TreeNodeModel | undefined>;
  readonly treeLeafRules$: Observable<GridDatasI | undefined>;

  constructor(
    private store: TreePreparationStore,
    private treePreparationDatasService: TreePreparationDatasService,
  ) {
    this.selectedNode$ = this.store.selectedNode$;
    this.treeLeafRules$ = this.selectedNode$.pipe(
      map((node) =>
        node?.isLeaf
          ? this.treePreparationDatasService.getTreeLeafRules(node)
          : undefined,
      ),
    );
  }
}
