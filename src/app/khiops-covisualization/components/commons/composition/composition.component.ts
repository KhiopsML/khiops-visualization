import {
  Component,
  Input,
  OnDestroy,
  EventEmitter,
  Output,
  OnInit,
  SimpleChanges,
  AfterViewInit,
} from '@angular/core';
import { TranslateService } from '@ngstack/translate';
import { CompositionVO } from '@khiops-covisualization/model/composition-vo';
import { DimensionVO } from '@khiops-library/model/dimension-vo';
import { EventsService } from '@khiops-covisualization/providers/events.service';
import { ClustersService } from '@khiops-covisualization/providers/clusters.service';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { Subscription } from 'rxjs';
import _ from 'lodash';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { TreeNodeVO } from '@khiops-covisualization/model/tree-node-vo';
import { ExtDatasVO } from '@khiops-covisualization/model/ext-datas-vo';
import { ImportExtDatasService } from '@khiops-covisualization/providers/import-ext-datas.service';

@Component({
  selector: 'app-composition',
  templateUrl: './composition.component.html',
  styleUrls: ['./composition.component.scss'],
})
export class CompositionComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() selectedNode: TreeNodeVO;
  @Input() dimensionsClusters: TreeNodeVO[][];
  @Input() position: number;
  @Input() selectedDimension: DimensionVO;

  @Output() selectedCompositionChanged: EventEmitter<any> = new EventEmitter();

  title: string;
  selectedComposition: CompositionVO;
  compositionValues: CompositionVO[];
  id: any;
  treeSelectedNodeChangedSub: Subscription;
  importedDatasChangedSub: Subscription;

  compositionDisplayedColumns: GridColumnsI[] = [];

  constructor(
    private translate: TranslateService,
    private importExtDatasService: ImportExtDatasService,
    private treenodesService: TreenodesService,
    private clustersService: ClustersService,
    private eventsService: EventsService,
  ) {
    this.compositionDisplayedColumns = [
      {
        headerName: this.translate.get('GLOBAL.CLUSTER'),
        field: 'cluster',
        tooltip: this.translate.get('TOOLTIPS.AXIS.COMPOSITION.CLUSTER'),
      },
      {
        headerName: this.translate.get('GLOBAL.TERMINAL_CLUSTER'),
        show: false,
        field: 'terminalCluster',
        tooltip: this.translate.get(
          'TOOLTIPS.AXIS.COMPOSITION.TERMINAL_CLUSTER',
        ),
      },
      {
        headerName: this.translate.get('GLOBAL.RANK'),
        show: false,
        field: 'rank',
        tooltip: this.translate.get('TOOLTIPS.AXIS.COMPOSITION.RANK'),
      },
      {
        headerName: this.translate.get('GLOBAL.TYPICALITY'),
        field: 'typicality',
        tooltip: this.translate.get('TOOLTIPS.AXIS.COMPOSITION.TYPICALITY'),
      },
      {
        headerName: this.translate.get('GLOBAL.VALUE'),
        field: 'value',
        tooltip: this.translate.get('TOOLTIPS.AXIS.COMPOSITION.VALUE'),
      },
      {
        headerName: this.translate.get('GLOBAL.FREQUENCY'),
        field: 'frequency',
        tooltip: this.translate.get('TOOLTIPS.AXIS.COMPOSITION.FREQUENCY'),
      },
    ];
    this.treeSelectedNodeChangedSub =
      this.eventsService.treeSelectedNodeChanged.subscribe((e) => {
        if (e.realNodeVO && e.hierarchyName === this.selectedDimension.name) {
          this.updateTable(e.realNodeVO);
        }
      });

    this.importedDatasChangedSub =
      this.eventsService.importedDatasChanged.subscribe((e) => {
        if (this.selectedNode && this.selectedDimension) {
          const externalDatas: ExtDatasVO =
            this.importExtDatasService.getImportedDatasFromDimension(
              this.selectedDimension,
            );

          this.compositionValues.forEach((composition: CompositionVO) => {
            if (externalDatas?.[composition?.value]) {
              composition.externalData = externalDatas[composition.value];
            }
          });

          // Force selection change to update external dats component #113
          this.selectedComposition = { ...this.selectedComposition };
          this.selectedCompositionChanged.emit(this.selectedComposition);
        }
      });
  }

  ngOnInit() {
    this.id = 'cluster-composition-' + this.position;
    this.title = this.translate.get('GLOBAL.COMPOSITION');
  }

  ngAfterViewInit() {
    // #40 loss of display after resizing the coclustering
    // We need to update table at init if component was hidden
    // Also linked to #111
    this.updateTable(this.selectedNode);
  }

  updateTable(selectedNode: TreeNodeVO) {
    if (selectedNode) {
      this.compositionValues = Object.assign(
        [],
        this.clustersService.getCompositionClusters(
          selectedNode.hierarchy,
          _.cloneDeep(selectedNode),
        ),
      );
      // if composition values : categorical
      if (this.compositionValues.length > 0) {
        // Select first by default
        this.selectedComposition = this.compositionValues[0];
        this.selectedCompositionChanged.emit(this.selectedComposition);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // update when dimension change (with combo)
    if (
      changes.selectedDimension?.currentValue?.name !==
        changes.selectedDimension?.previousValue?.name &&
      changes.selectedNode
    ) {
      this.updateTable(this.selectedNode);
    }
  }

  ngOnDestroy() {
    this.treeSelectedNodeChangedSub.unsubscribe();
    this.importedDatasChangedSub.unsubscribe();
    this.selectedComposition = undefined;
    this.selectedCompositionChanged.emit(this.selectedComposition);
  }

  onDoubleClickListItem(item: TreeNodeVO) {
    this.treenodesService.setSelectedNode(
      this.selectedDimension.name,
      item.cluster,
      false,
    );
  }

  onSelectRowChanged(item: CompositionVO) {
    // find composition in local to get external datas
    this.selectedComposition = this.compositionValues.find(
      (e) => e.value === item.value,
    );
    this.selectedCompositionChanged.emit(this.selectedComposition);
  }
}
