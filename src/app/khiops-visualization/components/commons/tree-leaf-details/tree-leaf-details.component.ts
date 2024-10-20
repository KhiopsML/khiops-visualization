import {
  Component,
  OnInit,
  NgZone,
  OnChanges,
  SimpleChanges,
  Input,
} from '@angular/core';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { TranslateService } from '@ngstack/translate';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { TreePreparationDatasModel } from '@khiops-visualization/model/tree-preparation-datas.model';
import { DistributionDatasModel } from '@khiops-visualization/model/distribution-datas.model';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';

@Component({
  selector: 'app-tree-leaf-details',
  templateUrl: './tree-leaf-details.component.html',
  styleUrls: ['./tree-leaf-details.component.scss'],
})
export class TreeLeafDetailsComponent implements OnInit, OnChanges {
  @Input() selectedNode: TreeNodeModel;
  @Input() displayedValues: ChartToggleValuesI[];

  populationCount: number = 10;

  treePreparationDatas: TreePreparationDatasModel | undefined;
  distributionDatas: DistributionDatasModel;
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
    if (changes.selectedNode?.currentValue) {
      this.updateComponentDatas();
    }
    if (changes.displayedValues?.currentValue) {
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
