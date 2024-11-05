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
  @Input() public selectedNode?: TreeNodeModel;
  @Input() public displayedValues?: ChartToggleValuesI[];

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
  ) {}

  ngOnInit() {
    this.treePreparationDatas = this.treePreparationDatasService.getDatas();
    this.distributionDatas = this.distributionDatasService.getDatas();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.selectedNode?.currentValue ||
      changes.displayedValues?.currentValue
    ) {
      this.updateComponentDatas();
    }
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

  private updateComponentDatas() {
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
}
