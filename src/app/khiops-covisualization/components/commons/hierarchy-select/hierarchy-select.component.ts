import {
  Component,
  SimpleChanges,
  OnChanges,
  Input,
  AfterViewInit,
  EventEmitter,
  Output,
} from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';
import { DimensionVO } from '@khiops-library/model/dimension-vo';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { TreeNodeVO } from '@khiops-covisualization/model/tree-node-vo';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngstack/translate';
import { AppConfig } from 'src/environments/environment';
import { SelectedTreeClusterVO } from '@khiops-covisualization/model/selected-tree-cluster';

@Component({
  selector: 'app-hierarchy-select',
  templateUrl: './hierarchy-select.component.html',
  styleUrls: ['./hierarchy-select.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({
          opacity: 0,
        }),
        animate('150ms ease-in'),
      ]),
      transition(':leave', [
        animate(
          '150ms ease-in',
          style({
            opacity: 0,
          }),
        ),
      ]),
    ]),
  ],
})
export class HierarchySelectComponent implements OnChanges, AfterViewInit {
  @Input() selectedDimension: DimensionVO;
  @Input() selectedNode: TreeNodeVO;
  @Input() position: number;
  @Input() dimensions: DimensionVO[];
  @Input() dimensionsTree: TreeNodeVO[];
  @Input() selectedTreeCluster: SelectedTreeClusterVO;
  @Output() selectedTreeClusterChange = new EventEmitter<any>();

  showStats = false;

  constructor(
    private treenodesService: TreenodesService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private appService: AppService,
    private dimensionsDatasService: DimensionsDatasService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedDimension?.currentValue) {
      this.selectedTreeCluster = new SelectedTreeClusterVO(
        this.selectedDimension,
      );
      this.selectedTreeCluster.intervals =
        this.dimensionsDatasService.getDimensionIntervals(
          this.selectedDimension.name,
        );
    }
    if (changes.selectedNode?.currentValue) {
      const currentNode = this.treenodesService.getNodeFromDimensionTree(
        this.selectedDimension.name,
        this.selectedNode.name,
      );
      this.selectedTreeCluster.setCurrentNodeInformations(currentNode);
      this.selectedTreeClusterChange.emit(this.selectedTreeCluster);
    }
  }

  ngAfterViewInit() {
    this.showStats =
      localStorage.getItem(
        AppConfig.covisualizationCommon.GLOBAL.LS_ID +
          'SHOW_DIMNSION_STATS_' +
          this.position,
      ) === 'true';
  }

  onClickOnShowStats() {
    this.showStats = !this.showStats;
    localStorage.setItem(
      AppConfig.covisualizationCommon.GLOBAL.LS_ID +
        'SHOW_DIMNSION_STATS_' +
        this.position,
      this.showStats.toString(),
    );
  }

  changeSelectedDimension(dimension: DimensionVO, newPosition: number) {
    const isBigJsonFile = this.appService.isBigJsonFile();
    if (isBigJsonFile) {
      this.snackBar.open(
        this.translate.get('GLOBAL.BIG_FILES_LOADING_WARNING'),
        undefined,
        {
          duration: 2000,
          panelClass: 'success',
        },
      );
    }

    this.appService.switchSplitSizes(this.position, newPosition);
    // Reverse selected nodes on selection changed
    this.treenodesService.updateSelectedNodes(dimension, this.position);
    // Reverse dimensions datas on selection changed
    this.dimensionsDatasService.updateSelectedDimension(
      dimension,
      this.position,
    );
    // Recompute datas
    this.dimensionsDatasService.saveInitialDimension();
    this.dimensionsDatasService.constructDimensionsTrees();
    this.dimensionsDatasService.getMatrixDatas();
    this.dimensionsDatasService.computeMatrixDataFreqMap();
  }
}
