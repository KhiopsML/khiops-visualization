import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  Input,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { MatrixCanvasComponent } from '@khiops-library/components/matrix-canvas/matrix-canvas.component';
import { ViewLayoutVO } from '@khiops-covisualization/model/view-layout.model';
import { EventsService } from '@khiops-covisualization/providers/events.service';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { Subscription } from 'rxjs';
import { DimensionsDatasModel } from '@khiops-covisualization/model/dimensions-data.model';
import { MatrixModesModel } from '@khiops-library/model/matrix-modes.model';
import { MatrixOptionsModel } from '@khiops-library/model/matrix-options.model';
import { MatrixModeI } from '@khiops-library/interfaces/matrix-mode';
import { CellModel } from '@khiops-library/model/cell.model';
import { TranslateService } from '@ngstack/translate';
import { DimensionModel } from '@khiops-library/model/dimension.model';

@Component({
  selector: 'app-matrix-container',
  templateUrl: './matrix-container.component.html',
  styleUrls: ['./matrix-container.component.scss'],
})
export class MatrixContainerComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('matrixCanvas', {
    static: false,
  })
  matrixCanvas: MatrixCanvasComponent;

  @Input() viewId: string;
  @Input() sizeId: string;
  @Input() selectedDimensions: DimensionModel[];
  @Input() viewsLayout: ViewLayoutVO;

  sizes: any;

  dimensionsDatas: DimensionsDatasModel;
  matrixModes: MatrixModesModel = new MatrixModesModel();
  matrixOptions: MatrixOptionsModel = new MatrixOptionsModel();

  isFullscreen = false;
  treeSelectedNodeChangedSub: Subscription;
  viewsLayoutChangedSub: Subscription;
  initNodesEvents = 0; // improve draw matrix perf
  isFirstLoad = true;

  constructor(
    private appService: AppService,
    private translate: TranslateService,
    private treenodesService: TreenodesService,
    private eventsService: EventsService,
    private dimensionsDatasService: DimensionsDatasService,
  ) {
    this.dimensionsDatas = this.dimensionsDatasService.getDatas();

    this.treeSelectedNodeChangedSub =
      this.eventsService.treeSelectedNodeChanged.subscribe((e) => {
        this.initNodesEvents++;
        if (this.isFirstLoad) {
          // At first launch collapse saved collapsed nodes
          this.isFirstLoad = false;
        } else {
          // check if it's a context selection to redraw matrix
          const isContextDimension =
            this.dimensionsDatasService.isContextDimension(e.hierarchyName);

          if (
            (!e.stopPropagation &&
              this.initNodesEvents ===
                this.dimensionsDatas.dimensions.length) ||
            isContextDimension
          ) {
            this.matrixCanvas.drawMatrix();
          } else if (
            !e.stopPropagation &&
            this.initNodesEvents > this.dimensionsDatas.dimensions.length
          ) {
            this.matrixCanvas.drawSelectedNodes();
          }
        }
      });

    this.viewsLayoutChangedSub = this.appService.viewsLayoutChanged.subscribe(
      (viewsLayout) => {
        this.viewsLayout = viewsLayout;

        // Redraw matrix event to resize cells
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        });
      },
    );
  }

  ngOnInit() {
    this.sizes = this.appService.getViewSplitSizes(this.viewId);
    this.constructModeSelectBox();

    // Check if saved into json
    if (this.dimensionsDatas.matrixOption !== undefined) {
      this.matrixOptions.selected = this.dimensionsDatas.matrixOption;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // #141 Update combobox on selection change
    if (changes.selectedDimensions) {
      this.constructModeSelectBox();
    }
  }

  ngOnDestroy() {
    this.viewsLayoutChangedSub?.unsubscribe();
    this.treeSelectedNodeChangedSub?.unsubscribe();
  }

  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
    setTimeout(() => {
      this.matrixCanvas.drawMatrix();
    });
  }

  constructModeSelectBox() {
    const varName1 = this.dimensionsDatas.selectedDimensions[0].name;
    const varName2 = this.dimensionsDatas.selectedDimensions[1].name;

    this.matrixModes.types = [
      {
        mode: 'MUTUAL_INFO',
        title: 'I (' + varName1 + ' , ' + varName2 + ')',
        tooltip: this.translate.get('TOOLTIPS.AXIS.MATRIX.I'),
      },
      {
        mode: 'FREQUENCY',
        title: 'Frequency',
        tooltip: this.translate.get('TOOLTIPS.AXIS.MATRIX.F'),
      },
      {
        mode: 'PROB_CELL',
        title: 'P (' + varName2 + ' | ' + varName1 + ')',
        tooltip: this.translate.get('TOOLTIPS.AXIS.MATRIX.P'),
      },
      {
        mode: 'PROB_CELL_REVERSE',
        title: 'P (' + varName1 + ' | ' + varName2 + ')',
        tooltip: this.translate.get('TOOLTIPS.AXIS.MATRIX.P'),
      },
      {
        mode: 'HELLINGER',
        title: 'H (' + varName1 + ' , ' + varName2 + ')',
        tooltip: this.translate.get('TOOLTIPS.AXIS.MATRIX.H'),
      },
    ];
    this.matrixModes = { ...this.matrixModes };

    // Check if saved into json
    if (
      this.dimensionsDatas.matrixMode !== undefined &&
      this.dimensionsDatas.matrixMode < this.matrixModes.types.length
    ) {
      this.matrixModes.selected =
        this.matrixModes.types[this.dimensionsDatas.matrixMode];
      this.matrixModes.selectedIndex = this.dimensionsDatas.matrixMode;
    }
  }

  onSplitDragEnd(event, item) {
    this.appService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      this.viewId,
    );
  }

  onCellSelected(event: { datas: CellModel }) {
    this.treenodesService.setSelectedNode(
      event.datas.xnamePart,
      event.datas.xaxisPart,
    );
    this.treenodesService.setSelectedNode(
      event.datas.ynamePart,
      event.datas.yaxisPart,
    );
  }

  onMatrixAxisInverted() {
    this.dimensionsDatasService.toggleIsAxisInverted();
  }

  changeMatrixType(type: string) {
    this.dimensionsDatas.matrixOption = type; // Save it into the global model to keep it into saved datas
  }

  changeMatrixMode(mode: MatrixModeI) {
    this.dimensionsDatas.matrixMode = this.matrixModes.selectedIndex; // Save it into the global model to keep it into saved datas
  }

  changeConditionalOnContext() {
    // this.trackerService.trackEvent('click', 'matrix_conditionnal_on_context');
    this.dimensionsDatas.conditionalOnContext =
      !this.dimensionsDatas.conditionalOnContext;
    this.treenodesService.initConditionalOnContextNodes();
    this.eventsService.emitConditionalOnContextChanged();
  }
}
