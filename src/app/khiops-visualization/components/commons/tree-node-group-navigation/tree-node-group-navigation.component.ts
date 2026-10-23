/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { TreePreparationStore } from '@khiops-visualization/stores/tree-preparation.store';

@Component({
  selector: 'app-tree-node-group-navigation',
  templateUrl: './tree-node-group-navigation.component.html',
  styleUrls: ['./tree-node-group-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TreeNodeGroupNavigationComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  groups: string[][] = [];
  selectedGroupIndex = -1;

  constructor(
    private treePreparationDatasService: TreePreparationDatasService,
    private store: TreePreparationStore,
  ) {}

  ngOnInit(): void {
    this.store.selectedNodes$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((nodes) => {
        this.groups = this.treePreparationDatasService.getNodeGroups();
        const nodeIds = nodes
          .map((node) => node._id)
          .filter((id): id is string => !!id);
        const matchingGroupIndex = nodeIds.length
          ? this.groups.findIndex(
              (group) =>
                group.length === nodeIds.length &&
                group.every((id) => nodeIds.includes(id)),
            )
          : -1;
        this.selectedGroupIndex =
          matchingGroupIndex >= 0
            ? matchingGroupIndex
            : Math.min(
                Math.max(this.selectedGroupIndex, 0),
                this.groups.length - 1,
              );
      });
  }

  navigateGroup(direction: -1 | 0 | 1): void {
    const index =
      this.selectedGroupIndex < 0
        ? direction === 1
          ? 0
          : this.groups.length - 1
        : this.selectedGroupIndex + direction;
    if (index < 0 || index >= this.groups.length) {
      return;
    }
    this.store.selectNodesFromIndex({ index });
  }
}
