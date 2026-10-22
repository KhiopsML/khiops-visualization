/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  OnInit,
  NgZone,
  Input,
  OnChanges,
  type SimpleChanges,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { TranslateService } from '@ngstack/translate';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { TreePreparationDatasModel } from '@khiops-visualization/model/tree-preparation-datas.model';
import { DistributionDatasModel } from '@khiops-visualization/model/distribution-datas.model';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values.interface';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';
import { Observable } from 'rxjs';
import { TreePreparationStore } from '@khiops-visualization/stores/tree-preparation.store';

@Component({
  selector: 'app-tree-leaf-details',
  templateUrl: './tree-leaf-details.component.html',
  styleUrls: ['./tree-leaf-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TreeLeafDetailsComponent implements OnInit, OnChanges {
  private readonly destroyRef = inject(DestroyRef);
  @Input() public displayedValues?: ChartToggleValuesI[];

  selectedNode$: Observable<TreeNodeModel | undefined>;
  public selectedNode?: TreeNodeModel;

  public treePreparationDatas: TreePreparationDatasModel | undefined;
  public distributionDatas?: DistributionDatasModel;
  public position = 1; // to change graph id

  constructor(
    public ngzone: NgZone,
    public selectableService: SelectableService,
    public translate: TranslateService,
    private treePreparationDatasService: TreePreparationDatasService,
    private distributionDatasService: DistributionDatasService,
    private store: TreePreparationStore,
  ) {
    this.selectedNode$ = this.store.selectedNode$;
  }

  ngOnInit() {
    this.treePreparationDatas = this.treePreparationDatasService.getDatas();
    this.distributionDatas = this.distributionDatasService.getDatas();
    this.selectedNode$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((selectedNode) => {
        this.selectedNode = selectedNode;
        this.updateComponentDatas(selectedNode);
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.displayedValues?.currentValue && this.selectedNode) {
      // When displayedValues change, update the target distribution graph
      setTimeout(() => {
        this.distributionDatasService.getTreeNodeTargetDistributionGraphDatas(
          this.selectedNode!,
        );
      }, 0); // do it async to dont freeze during graph rendering
    }
  }

  onTreeNodeTargetDistributionGraphTypeChanged(type: string) {
    if (this.selectedNode) {
      this.distributionDatasService.getTreeNodeTargetDistributionGraphDatas(
        this.selectedNode,
        type,
      );
    }
  }

  onLineageNodeSelected(nodeId: string): void {
    if (nodeId) {
      this.store.selectNodesFromId({ id: nodeId });
    }
  }

  onTreeNodeTargetDistributionGraphDisplayedValuesChanged(
    displayedValues: ChartToggleValuesI[],
  ) {
    this.distributionDatasService.setTargetDistributionDisplayedValues(
      displayedValues,
    );
    // Update the graph when displayed values change
    if (this.selectedNode) {
      this.distributionDatasService.getTreeNodeTargetDistributionGraphDatas(
        this.selectedNode,
      );
    }
  }

  private updateComponentDatas(selectedNode: TreeNodeModel | undefined) {
    if (selectedNode?.isLeaf) {
      this.distributionDatasService.getTreeNodeTargetDistributionGraphDatas(
        selectedNode,
      );
    }
  }
}
