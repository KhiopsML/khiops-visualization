/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, OnInit, NgZone, Input } from '@angular/core';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { TranslateService } from '@ngstack/translate';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import {
  TreePreparationDatasModel,
  TreePreparationState,
} from '@khiops-visualization/model/tree-preparation-datas.model';
import { DistributionDatasModel } from '@khiops-visualization/model/distribution-datas.model';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectedNodeSelector } from '@khiops-visualization/selectors/tree-preparation.selector';

@Component({
    selector: 'app-tree-leaf-details',
    templateUrl: './tree-leaf-details.component.html',
    styleUrls: ['./tree-leaf-details.component.scss'],
    standalone: false
})
export class TreeLeafDetailsComponent implements OnInit {
  @Input() public displayedValues?: ChartToggleValuesI[];

  selectedNode$: Observable<TreeNodeModel | undefined>;
  public selectedNode?: TreeNodeModel;

  public populationCount: number = 10;
  public treePreparationDatas: TreePreparationDatasModel | undefined;
  public distributionDatas?: DistributionDatasModel;
  public position = 1; // to change graph id
  public treeLeafRules?: GridDatasI;

  constructor(
    public ngzone: NgZone,
    public selectableService: SelectableService,
    public translate: TranslateService,
    private treePreparationDatasService: TreePreparationDatasService,
    private distributionDatasService: DistributionDatasService,
    private store: Store<{ TreePreparationState: TreePreparationState }>,
  ) {
    this.selectedNode$ = this.store.select(selectedNodeSelector);
  }

  ngOnInit() {
    this.treePreparationDatas = this.treePreparationDatasService.getDatas();
    this.distributionDatas = this.distributionDatasService.getDatas();
    this.selectedNode$.subscribe((selectedNode) => {
      this.selectedNode = selectedNode;
      this.updateComponentDatas(selectedNode);
    });
  }

  onTreeNodeTargetDistributionGraphTypeChanged(type: string) {
    this.distributionDatasService.getTreeNodeTargetDistributionGraphDatas(
      this.selectedNode!,
      type,
    );
  }

  onTreeNodeTargetDistributionGraphDisplayedValuesChanged(
    displayedValues: ChartToggleValuesI[],
  ) {
    this.distributionDatasService.setTargetDistributionDisplayedValues(
      displayedValues,
    );
  }

  private updateComponentDatas(selectedNode: TreeNodeModel | undefined) {
    if (selectedNode) {
      this.distributionDatasService.getTreeNodeTargetDistributionGraphDatas(
        selectedNode,
      );
      this.treeLeafRules =
        this.treePreparationDatasService.getTreeLeafRules(selectedNode);
      this.populationCount = UtilsService.arraySum(
        selectedNode.targetValues.frequencies,
      );
    }
  }
}
