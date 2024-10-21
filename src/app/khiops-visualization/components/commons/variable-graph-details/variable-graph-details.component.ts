import {
  Component,
  SimpleChanges,
  Input,
  ViewChild,
  EventEmitter,
  Output,
  OnChanges,
  OnInit,
} from '@angular/core';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { DistributionGraphComponent } from '@khiops-library/components/distribution-graph/distribution-graph.component';
import { TargetDistributionGraphComponent } from '@khiops-visualization/components/commons/target-distribution-graph/target-distribution-graph.component';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { PreparationVariableModel } from '@khiops-visualization/model/preparation-variable.model';
import { TreePreparationVariableModel } from '@khiops-visualization/model/tree-preparation-variable.model';
import { DistributionDatasModel } from '@khiops-visualization/model/distribution-datas.model';
import { REPORTS } from '@khiops-library/enum/reports';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values';
import { ConfigService } from '@khiops-library/providers/config.service';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { LS } from '@khiops-library/enum/ls';
import { AppService } from '@khiops-visualization/providers/app.service';

@Component({
  selector: 'app-variable-graph-details',
  templateUrl: './variable-graph-details.component.html',
  styleUrls: ['./variable-graph-details.component.scss'],
})
export class VariableGraphDetailsComponent implements OnInit, OnChanges {
  @ViewChild('distributionGraph', {
    static: false,
  })
  distributionGraph: DistributionGraphComponent;

  @ViewChild('targetDistributionGraph', {
    static: false,
  })
  targetDistributionGraph: TargetDistributionGraphComponent;

  @Input() showTargetDistributionGraph = true;
  @Input() showDistributionGraph = true;
  @Input() selectedVariable:
    | PreparationVariableModel
    | TreePreparationVariableModel;
  @Input() selectedGraphItemIndex = 0;
  @Input() preparationSource: string;
  @Input() displayedValues?: ChartToggleValuesI[]; // optional input to update chart on value changes (for instance when another component of tree preparation view changed)
  @Input() position = 0; // in case of multiple component in the same page

  @Output() selectedItemChanged: EventEmitter<any> = new EventEmitter();

  distributionDatas: DistributionDatasModel;
  scrollPosition = 0;
  scaleValue: number;
  distributionGraphType: string;
  targetDistributionGraphType: string | null;

  isLoadingGraphDatas: boolean;
  activeEntries = 0;
  isFullscreen: boolean = false;

  constructor(
    private preparationDatasService: PreparationDatasService,
    private configService: ConfigService,
    private selectableService: SelectableService,
    private treePreparationDatasService: TreePreparationDatasService,
    private distributionDatasService: DistributionDatasService,
  ) {
    this.targetDistributionGraphType = AppService.Ls.get(
      LS.TARGET_DISTRIBUTION_GRAPH_OPTION,
    );
  }

  ngOnInit() {
    this.distributionDatas = this.distributionDatasService.getDatas();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.selectedVariable?.currentValue ||
      changes.displayedValues?.currentValue
    ) {
      this.isLoadingGraphDatas = true;

      this.selectedGraphItemIndex = 0;
      this.initActiveEntries(this.selectedGraphItemIndex);

      setTimeout(() => {
        this.distributionDatasService.setPreparationSource(
          this.preparationSource,
        );
        if (this.showTargetDistributionGraph) {
          this.distributionDatasService.getTargetDistributionGraphDatas(
            this.selectedVariable,
          );
        }
        if (this.showDistributionGraph) {
          // Reinit datas
          this.distributionDatas.histogramDatas = undefined;
          this.distributionDatas.distributionGraphDatas = undefined;

          if (
            this.selectedVariable.isNumerical &&
            !this.preparationDatasService.isSupervised()
          ) {
            this.distributionDatasService.getHistogramGraphDatas(
              this.selectedVariable,
            );
          } else {
            this.distributionDatasService.getdistributionGraphDatas(
              this.selectedVariable,
            );
          }
        }

        if (this.preparationSource === REPORTS.TREE_PREPARATION_REPORT) {
          this.treePreparationDatasService.getCurrentIntervalDatas();
        } else {
          this.preparationDatasService.getCurrentIntervalDatas(
            this.preparationSource,
          );
        }

        this.isLoadingGraphDatas = false;
      }); // do it async to dont freeze during graph rendering
    }
    if (
      changes.selectedGraphItemIndex &&
      changes.selectedGraphItemIndex.currentValue !== undefined
    ) {
      this.initActiveEntries(this.selectedGraphItemIndex);
    }
  }

  resize() {
    if (this.distributionGraph) {
      this.distributionGraph.resizeGraph();
    }
    if (this.targetDistributionGraph) {
      this.targetDistributionGraph.resizeGraph();
    }
  }

  onScrollPositionChanged(position: number) {
    this.scrollPosition = position;
  }

  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
    setTimeout(() => {
      this.resize();
    });

    // #187 Simulate trusted click on component to enable selection
    const trustedClickEvent = new CustomEvent('trustedClick', {
      bubbles: true, // Propagate
      cancelable: true,
    });

    const currentSelection = this.selectableService.getSelectedArea()?.id;
    // select distribution-graph by default unless target-distribution-graph is already selected
    const compToSelect =
      currentSelection === 'target-distribution-graph' + this.position
        ? '#target-distribution-graph' + this.position
        : '#distribution-graph' + this.position;

    this.configService
      .getRootElementDom()
      .querySelector(compToSelect)
      ?.dispatchEvent(trustedClickEvent);
    this.configService
      .getRootElementDom()
      .querySelector('#app-histogram')
      ?.dispatchEvent(trustedClickEvent);
  }

  onScaleValueChanged(value: number) {
    this.scaleValue = value;
  }

  onTargetDistributionGraphDisplayedValuesChanged(displayedValues) {
    this.distributionDatasService.setTargetDistributionDisplayedValues(
      displayedValues,
    );
    this.distributionDatasService.getTargetDistributionGraphDatas(
      this.getCurrentVariable(),
      this.targetDistributionGraphType,
    );
    this.initActiveEntries();
  }

  onTargetDistributionGraphTypeChanged(type: string) {
    this.targetDistributionGraphType = type;
    this.distributionDatasService.getTargetDistributionGraphDatas(
      this.getCurrentVariable(),
      this.targetDistributionGraphType,
      false,
    );
    this.initActiveEntries(this.selectedGraphItemIndex);
  }

  onDistributionGraphTypeChanged(type: string) {
    this.distributionGraphType = type;
    this.distributionDatasService.getdistributionGraphDatas(
      this.getCurrentVariable(),
      this.distributionGraphType,
      false,
    );
    this.initActiveEntries(this.selectedGraphItemIndex);
  }

  getCurrentVariable() {
    let selectedVariable;
    if (this.preparationSource === REPORTS.TREE_PREPARATION_REPORT) {
      selectedVariable = this.treePreparationDatasService.getSelectedVariable();
    } else {
      selectedVariable = this.preparationDatasService.getSelectedVariable(
        this.preparationSource,
      );
    }
    return selectedVariable;
  }

  initActiveEntries(index = 0) {
    this.activeEntries = index;
  }

  onSelectedDistributionGraphItemChanged(index: number) {
    this.activeEntries = index;

    // launch event to parent to manage interval table datas or matrix selection
    this.selectedItemChanged.emit(index);
  }

  onSelectedTargetDistributionGraphItemChanged(index: number) {
    this.activeEntries = index;

    // launch event to parent to manage interval table datas or matrix selection
    this.selectedItemChanged.emit(index);
  }
}
