import {
  Component,
  OnInit,
  NgZone,
  OnChanges,
  SimpleChanges,
  Input,
} from '@angular/core';
import _ from 'lodash';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { TranslateService } from '@ngx-translate/core';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { TreePreparationDatasVO } from '@khiops-visualization/model/tree-preparation-datas-vo';
import { DistributionDatasVO } from '@khiops-visualization/model/distribution-datas-vo';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values';
import { TreeNodeVO } from '@khiops-visualization/model/tree-node-vo';

@Component({
  selector: 'app-tree-leaf-details',
  templateUrl: './tree-leaf-details.component.html',
  styleUrls: ['./tree-leaf-details.component.scss'],
})
export class TreeLeafDetailsComponent implements OnInit, OnChanges {
  @Input() selectedNode: TreeNodeVO;
  @Input() displayedValues: ChartToggleValuesI[];

  populationCount: number = 10;

  treePreparationDatas: TreePreparationDatasVO | undefined;
  distributionDatas: DistributionDatasVO;
  position = 1; // to change graph id

  treeLeafRules: GridDatasI;
  distributionGraphType: string;
  treeNodeTargetDistributionGraphType: string;

  constructor(
    public ngzone: NgZone,
    public selectableService: SelectableService,
    private treePreparationDatasService: TreePreparationDatasService,
    private distributionDatasService: DistributionDatasService,
    public translate: TranslateService,
  ) {}

  ngOnInit() {
    this.treePreparationDatas = this.treePreparationDatasService.getDatas();
    this.distributionDatas = this.distributionDatasService.getDatas();
  }

  updateComponentDatas() {
    if (this.selectedNode) {
      this.distributionDatasService.getTreeNodeTargetDistributionGraphDatas(
        this.selectedNode,
      );
      this.treeLeafRules = this.treePreparationDatasService.getTreeLeafRules();
      this.populationCount = UtilsService.arraySum(
        this.selectedNode.targetValues.frequencies,
      );
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedNode && changes.selectedNode.currentValue) {
      this.updateComponentDatas();
    }
    if (changes.displayedValues && changes.displayedValues.currentValue) {
      this.updateComponentDatas();
    }
  }

  onSelectedTreeLeafDetailsTabChanged(e) {}

  onTreeNodeTargetDistributionGraphTypeChanged(type: string) {
    this.treeNodeTargetDistributionGraphType = type;
    this.distributionDatasService.getTreeNodeTargetDistributionGraphDatas(
      this.selectedNode,
      this.treeNodeTargetDistributionGraphType,
    );
  }

  onTreeNodeTargetDistributionGraphDisplayedValuesChanged(
    displayedValues: ChartToggleValuesI[],
  ) {
    this.distributionDatasService.setTargetDistributionDisplayedValues(
      displayedValues,
    );
  }
}
