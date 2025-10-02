/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  SimpleChanges,
  HostListener,
  OnChanges,
  Output,
  EventEmitter,
  Input,
  NgZone,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { SelectableService } from '../selectable/selectable.service';
import { SelectableComponent } from '../selectable/selectable.component';
import { KhiopsLibraryService } from '../../providers/khiops-library.service';
// @ts-ignore
import * as panzoom from 'pan-zoom';
import { MatrixUiService } from './matrix.ui.service';
import { CellModel } from '../../model/cell.model';
import { ConfigService } from '@khiops-library/providers/config.service';
import { TreeNodeModel } from '../../../khiops-covisualization/model/tree-node.model';
import { MatrixModeI } from '@khiops-library/interfaces/matrix-mode';
import { Subscription } from 'rxjs';
import { EventsService } from '../../../khiops-covisualization/providers/events.service';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { LS } from '@khiops-library/enum/ls';
import { Ls } from '@khiops-library/providers/ls.service';
import { MatrixUtilsService } from './matrix.utils.service';
import { MatrixRendererService } from './matrix.renderer.service';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { ZoomToolsEventsService } from '../zoom-tools/zoom-tools.service';

@Component({
  selector: 'kl-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss'],
  standalone: false,
})
export class MatrixComponent extends SelectableComponent implements OnChanges {
  @Input() public isAxisInverted: boolean = false;
  @Input() public graphMode: MatrixModeI | undefined;
  @Input() public contrast: number = 0;
  @Input() private inputDatas: any;
  @Input() private minMaxValues: DynamicI | undefined; // dynamic and complex value object. Regression and Coocurence matrix purposes
  @Input() private graphType: string = '';
  @Input() private graphTargets: string[] = [];
  @Input() private graphTarget: string = '';
  @Input() private selectedNodes: TreeNodeModel[] | undefined; // KC use case
  @Input() private selectedCell: CellModel | undefined; // KV use case
  @Input() private contextSelection: number[][] = [];

  @Output() private matrixAxisInverted: EventEmitter<any> = new EventEmitter();
  @Output() private cellSelected: EventEmitter<any> = new EventEmitter();

  @ViewChild('matrixDiv', {
    static: false,
  })
  private matrixDiv: ElementRef<HTMLCanvasElement> | undefined;
  private matrixCtx: any;
  @ViewChild('matrixSelectedDiv', {
    static: false,
  })
  private matrixSelectedDiv: ElementRef<HTMLCanvasElement> | undefined;
  private matrixSelectedCtx: any;
  @ViewChild('matrixArea', {
    static: false,
  })
  private matrixArea: ElementRef<HTMLElement> | undefined;
  @ViewChild('matrixContainerDiv', {
    static: false,
  })
  private matrixContainerDiv: ElementRef<HTMLElement> | undefined;
  @ViewChild('legendBar', {
    static: false,
  })
  private legendBar: ElementRef<HTMLElement> | undefined;

  public isKhiopsCovisu: boolean;
  public componentType = COMPONENT_TYPES.MATRIX; // needed to copy datas
  public selectedCells: CellModel[] | undefined;
  public xAxisLabel: string = '';
  public yAxisLabel: string = '';
  public legend: {
    min: number | undefined;
    max: number | undefined;
  };
  public loadingMatrixSvg = true;
  public isZerosToggled = false;
  public tooltipCell: CellModel | undefined;
  public tooltipPosition:
    | {
        x: number;
        y: number;
      }
    | undefined;

  private conditionalOnContextChangedSub: Subscription;
  private selectedTargetIndex = -1;
  private matrixValues?: number[] = [];
  private matrixFreqsValues: number[] = [];
  private matrixExpectedFreqsValues: number[] = [];
  private matrixExtras?: number[] | boolean[] = [];
  private isFirstResize = true;
  private zoom = 1;
  private unpanzoom: any;
  private isPaning = false;
  private currentEvent: MouseEvent | undefined;
  private zoomFactor = 0.5;
  private lastScrollPosition: {
    scrollLeft: number;
    scrollTop: number;
  };
  private currentMouseX: number = 0;
  private currentMouseY: number = 0;
  private isDrawing = false;

  constructor(
    private ls: Ls,
    public override selectableService: SelectableService,
    private eventsService: EventsService,
    private zoomToolsEventsService: ZoomToolsEventsService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
    private khiopsLibraryService: KhiopsLibraryService,
    private matrixRendererService: MatrixRendererService,
  ) {
    super(selectableService, ngzone, configService);

    this.isKhiopsCovisu = this.khiopsLibraryService.isKhiopsCovisu();

    this.lastScrollPosition = {
      scrollLeft: 0,
      scrollTop: 0,
    };

    this.legend = {
      min: 0,
      max: 0,
    };

    this.conditionalOnContextChangedSub =
      this.eventsService.conditionalOnContextChanged.subscribe(() => {
        this.drawMatrix();
      });

    this.clickOnCellHandler = (event: MouseEvent) => this.clickOnCell(event);

    this.mouseoutHandler = (_event: Event) => this.hideTooltip();
    this.mousemoveHandler = (event: MouseEvent) => {
      this.currentEvent = event;
      this.showTooltip(event);
    };
    this.wheelHandler = (event: WheelEvent) => {
      this.currentEvent = event;
    };
    this.scrollHandler = (event: any) => {
      this.lastScrollPosition = {
        scrollLeft: event.target.scrollLeft,
        scrollTop: event.target.scrollTop,
      };
    };
  }

  @HostListener('window:resize', ['$event'])
  sizeChange() {
    if (!this.isFirstResize) {
      this.drawMatrix();
    }
  }

  ngOnInit() {
    this.zoomToolsEventsService.zoomIn$.subscribe(() => {
      this.onClickOnZoomIn();
    });
    this.zoomToolsEventsService.zoomOut$.subscribe(() => {
      this.onClickOnZoomOut();
    });
    this.zoomToolsEventsService.zoomReset$.subscribe(() => {
      this.onClickOnResetZoom();
    });
  }

  override ngOnDestroy() {
    this.conditionalOnContextChangedSub.unsubscribe();
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: { keyCode: any }) {
    const currentSelectedArea = this.selectableService.getSelectedArea();
    if (
      currentSelectedArea &&
      currentSelectedArea.id === this.id &&
      this.selectedCells?.length === 1
    ) {
      const changeCell = MatrixUiService.getNavigationCell(
        event.keyCode,
        this.inputDatas.matrixCellDatas,
        this.isAxisInverted,
        this.selectedCells[0]?.index!,
      );
      if (changeCell) {
        this.cellSelected.emit({
          datas: changeCell,
          stopPropagation: true,
        });
        this.drawSelectedNodes();
      }
    } else {
      return;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      this.contrast = this.ls.get(
        LS.SETTING_MATRIX_CONTRAST,
        this.khiopsLibraryService.getAppConfig().common.GLOBAL.MATRIX_CONTRAST,
      );

      // if graph mode change, reset isZerosToggled
      if (changes.graphMode) {
        this.isZerosToggled = false;
      }

      // Draw matrix on change
      if (this.inputDatas && this.matrixDiv?.nativeElement) {
        if (
          this.inputDatas.matrixCellDatas &&
          this.inputDatas.propagateChanges === false
        ) {
          this.inputDatas.propagateChanges = true; // hack to limit re-rendering and optimize perf
        } else {
          this.drawMatrix();
        }
      }
      if (changes.contrast?.currentValue !== undefined) {
        // improve setting save (reload) #130
        this.drawMatrix();
      }
    });
  }

  public hideActiveEntries() {
    this.cleanSelectedDomContext();
  }

  public showActiveEntries() {
    this.drawSelectedNodes();
  }

  /**
   * Main method to draw the matrix. Orchestrates the drawing process.
   */
  drawMatrix() {
    if (!this.isDrawing) {
      requestAnimationFrame(() => {
        if (this.graphMode && this.inputDatas?.variable) {
          this.isDrawing = true;

          this.updateSelectedTargetIndex();
          this.computeMatrixDataValues();

          if (this.matrixFreqsValues && !isNaN(this.matrixFreqsValues[0]!)) {
            // Clean dom canvas
            this.cleanDomContext();
            this.cleanSelectedDomContext();

            if (this.matrixDiv && this.matrixArea) {
              let [width, height] = this.prepareCanvasDimensions();

              if (this.inputDatas.matrixCellDatas) {
                this.setupMatrixLabelsAndLegend(width, height);
                this.drawMatrixCells(width, height);
                this.drawSelectedNodes();
              }

              this.setupPanzoom();
              this.finalizeDraw();
            }
          }

          // Add all events listeners after drawing
          this.addEventsListeners();
          this.isDrawing = false;
        }
      });
    }
  }

  /**
   * Updates the selected target index based on the graph targets and target
   */
  private updateSelectedTargetIndex(): void {
    if (this.graphTargets && this.graphTarget) {
      this.selectedTargetIndex = this.graphTargets.indexOf(this.graphTarget);
    } else {
      this.selectedTargetIndex = -1;
    }
  }

  /**
   * Computes the matrix data values using the matrix utils service
   */
  private computeMatrixDataValues(): void {
    [
      this.matrixFreqsValues,
      this.matrixValues,
      this.matrixExtras,
      this.matrixExpectedFreqsValues,
    ] = MatrixUtilsService.computeMatrixValues(
      this.graphMode!,
      this.inputDatas.matrixCellDatas,
      this.contextSelection,
      this.selectedTargetIndex,
    );
  }

  /**
   * Prepares canvas dimensions based on zoom level
   * @returns [width, height] tuple
   */
  private prepareCanvasDimensions(): [number, number] {
    let [width, height] = this.getZoomDimensions();

    this.matrixCtx.canvas.width = width;
    this.matrixCtx.canvas.height = height;
    this.matrixSelectedCtx.canvas.width = width;
    this.matrixSelectedCtx.canvas.height = height;

    if (this.isAxisInverted) {
      [width, height] = [height, width];
    }

    return [width, height];
  }

  /**
   * Sets up matrix labels and legend based on the data
   * @param width canvas width
   * @param height canvas height
   */
  private setupMatrixLabelsAndLegend(width: number, height: number): void {
    this.legend = this.matrixRendererService.computeLegendValues(
      this.matrixValues,
      this.minMaxValues,
      this.graphMode!.mode,
    );

    this.updateLegendBar();

    this.xAxisLabel = this.inputDatas.variable.nameX;
    this.yAxisLabel = this.inputDatas.variable.nameY;

    this.setMatrixEltsOrientation(width, height);

    this.selectedCells = [];
    if (this.selectedCell) {
      // null for KC
      this.selectedCells.push(this.selectedCell);
    }
  }

  /**
   * Draws all matrix cells with appropriate colors and patterns
   * @param width canvas width
   * @param height canvas height
   */
  private drawMatrixCells(width: number, height: number): void {
    this.matrixRendererService.drawMatrixCells(
      this.matrixCtx,
      this.inputDatas,
      this.matrixValues,
      this.matrixExtras,
      this.matrixFreqsValues,
      this.matrixExpectedFreqsValues,
      this.graphMode,
      this.graphType,
      this.isKhiopsCovisu,
      width,
      height,
      this.contrast,
      this.isZerosToggled,
      this.legend.max,
    );
  }

  /**
   * Sets up the panzoom functionality for the matrix
   */
  private setupPanzoom(): void {
    if (!this.unpanzoom) {
      this.unpanzoom = panzoom(
        this.matrixContainerDiv?.nativeElement,
        (e: { dz: number; dx: number; dy: number }) => {
          if (e.dz) {
            if (e.dz > 0) {
              this.onClickOnZoomOut();
            } else {
              this.onClickOnZoomIn();
            }
          } else {
            if (e.dx !== 0 || e.dy !== 0) {
              this.handlePan(e.dx, e.dy);
            }
          }
          if (this.zoom !== 1) {
            this.isPaning = true;
          }
        },
      );
    }
  }

  /**
   * Handles pan movement
   * @param dx delta x
   * @param dy delta y
   */
  private handlePan(dx: number, dy: number): void {
    if (this.matrixArea?.nativeElement) {
      this.matrixArea.nativeElement.scrollLeft =
        this.matrixArea.nativeElement.scrollLeft - dx;
      this.matrixArea.nativeElement.scrollTop =
        this.matrixArea.nativeElement.scrollTop - dy;

      this.lastScrollPosition = {
        scrollLeft: this.matrixArea.nativeElement.scrollLeft,
        scrollTop: this.matrixArea.nativeElement.scrollTop,
      };
    }
  }

  /**
   * Finalizes the drawing process by updating loading state
   */
  private finalizeDraw(): void {
    setTimeout(() => {
      this.loadingMatrixSvg = false;
      if (this.isFirstResize) {
        this.isFirstResize = false;
      }
    }, 100);
  }

  private addEventsListeners() {
    if (this.matrixSelectedDiv?.nativeElement) {
      // Remove existing listeners
      this.matrixSelectedDiv.nativeElement.removeEventListener(
        'click',
        this.clickOnCellHandler,
      );
      this.matrixSelectedDiv.nativeElement.removeEventListener(
        'mouseout',
        this.mouseoutHandler,
      );
      this.matrixSelectedDiv.nativeElement.removeEventListener(
        'mousemove',
        this.mousemoveHandler,
      );
      this.matrixSelectedDiv.nativeElement.removeEventListener(
        'wheel',
        this.wheelHandler,
      );

      // Add event listeners with passive options
      this.matrixSelectedDiv?.nativeElement.addEventListener(
        'click',
        this.clickOnCellHandler,
        {
          passive: true,
        },
      );
      this.matrixSelectedDiv.nativeElement.addEventListener(
        'mouseout',
        this.mouseoutHandler,
        { passive: true },
      );
      this.matrixSelectedDiv.nativeElement.addEventListener(
        'mousemove',
        this.mousemoveHandler,
        { passive: true },
      );
      this.matrixSelectedDiv.nativeElement.addEventListener(
        'wheel',
        this.wheelHandler,
        { passive: true },
      );
    }

    if (this.matrixArea?.nativeElement) {
      // Remove the existing listener for the scroll event
      this.matrixArea.nativeElement.removeEventListener(
        'scroll',
        this.scrollHandler,
      );

      // Add the scroll event listener
      this.matrixArea.nativeElement.addEventListener(
        'scroll',
        this.scrollHandler,
        { passive: true },
      );
    }
  }

  private clickOnCell(event: MouseEvent) {
    // Hack to prevent event emit if user pan matrix
    if (!this.isPaning || this.isPaning === undefined) {
      this.isPaning = false;
      this.cleanSelectedDomContext();

      const clicked = this.getCurrentCell(event);
      this.selectedCells = [clicked];
      this.drawSelectedCell(clicked);

      setTimeout(() => {
        this.cellSelected.emit({
          datas: clicked,
        });
      });
    } else {
      this.isPaning = false;
    }
  }

  drawSelectedNodes() {
    this.cleanSelectedDomContext();

    if (this.inputDatas.matrixCellDatas) {
      if (this.selectedCell) {
        // KV
        this.drawSelectedCell(this.selectedCell);
      } else {
        // KC
        this.selectedCells = [];
        const cellsLength = this.inputDatas.matrixCellDatas.length;
        for (let index = 0; index < cellsLength; index++) {
          const cellDatas = this.inputDatas.matrixCellDatas[index];

          // Manage selected cell (different for KV and KC)
          if (
            this.selectedNodes?.[0]?.childrenList.includes(
              cellDatas.xaxisPart,
            ) &&
            this.selectedNodes?.[1]?.childrenList.includes(cellDatas.yaxisPart)
          ) {
            this.selectedCells.push(cellDatas);
          }
        }

        // Do not draw top level selection matrix il nodes are not collapsed
        if (
          this.matrixFreqsValues.length !== this.selectedCells.length &&
          (this.selectedNodes?.[0]?.parentCluster ||
            this.selectedNodes?.[1]?.parentCluster)
        ) {
          for (const cell of this.selectedCells) {
            // Draw selected cells after other to be above
            this.drawSelectedCell(cell);
          }
        } else {
          const cell: CellModel = new CellModel();
          cell.xCanvas = 0;
          cell.yCanvas = 0;
          cell.wCanvas = this.matrixCtx.canvas.width;
          cell.hCanvas = this.matrixCtx.canvas.height;
          this.drawSelectedCell(cell);
        }
      }
    }
  }

  drawSelectedCell(cell: CellModel) {
    if (cell) {
      this.matrixRendererService.drawSelectedCell(this.matrixSelectedCtx, cell);
    }
  }

  /**
   * Before draw canvas, clean dom and clone divs to remove listeners
   */
  private cleanDomContext() {
    // Clone to remove listeners
    if (this.matrixDiv) {
      this.matrixCtx = this.matrixDiv.nativeElement.getContext('2d');
      // clear the canvas for redrawing
      this.matrixRendererService.cleanDomContext(
        this.matrixCtx,
        this.matrixDiv.nativeElement.width,
        this.matrixDiv.nativeElement.height,
      );
    }
  }

  private cleanSelectedDomContext() {
    if (this.matrixSelectedDiv) {
      let width = this.matrixSelectedDiv.nativeElement.width;
      let height = this.matrixSelectedDiv.nativeElement.height;
      if (this.isAxisInverted) {
        [width, height] = [height, width];
      }
      this.matrixSelectedCtx =
        this.matrixSelectedDiv.nativeElement.getContext('2d');
      // clear the canvas for redrawing
      this.matrixRendererService.cleanSelectedDomContext(
        this.matrixSelectedCtx,
        width,
        height,
      );
    }
  }

  private zoomCanvas(delta: number, preventTranslate = false) {
    const previousZoom = this.zoom;
    if (delta < 0) {
      this.zoom = this.zoom + this.zoomFactor;
    } else if (delta > 0) {
      this.zoom = this.zoom - this.zoomFactor;
    } else if (delta === 0) {
      this.zoom = 0;
    }
    if (this.zoom < 1) {
      this.zoom = 1;
    }
    if (this.zoom > 15) {
      this.zoom = 15;
    }
    if (previousZoom !== this.zoom) {
      this.zoom = Number(this.zoom.toFixed(1));

      const containerPosition =
        this.matrixArea?.nativeElement.getBoundingClientRect();
      if (this.currentEvent && containerPosition) {
        this.currentMouseY = Math.round(
          this.currentEvent.y - containerPosition.top,
        );
        this.currentMouseX = Math.round(
          this.currentEvent.x - containerPosition.left,
        );
      }

      this.drawMatrix();

      let deltaX = 0;
      let deltaY = 0;
      if (previousZoom !== 1) {
        deltaX =
          (this.currentMouseX - this.lastScrollPosition.scrollLeft) /
          previousZoom;
        deltaY =
          (this.currentMouseY - this.lastScrollPosition.scrollTop) /
          previousZoom;
      }

      deltaX = deltaX + 10; // 10 for scrollbars
      deltaY = deltaY + 10;

      if (!preventTranslate) {
        this.matrixArea!.nativeElement.scrollLeft =
          this.currentMouseX * this.zoom - this.currentMouseX - deltaX;
        this.matrixArea!.nativeElement.scrollTop =
          this.currentMouseY * this.zoom - this.currentMouseY - deltaY;
      }

      this.lastScrollPosition = {
        scrollLeft: this.currentMouseX,
        scrollTop: this.currentMouseY,
      };

      this.currentMouseY = 0;
      this.currentMouseX = 0;
    }
  }

  private updateLegendBar() {
    if (!this.legendBar?.nativeElement) return;
    this.matrixRendererService.updateLegendBar(
      this.legendBar.nativeElement,
      this.graphMode,
    );
  }

  private getZoomDimensions(): [number, number] {
    return this.matrixRendererService.getZoomDimensions(
      this.matrixArea!.nativeElement,
      this.matrixContainerDiv!.nativeElement,
      this.zoom,
    );
  }

  private getCurrentCell(event: MouseEvent) {
    if (this.inputDatas) {
      const canvasPosition =
        this.matrixDiv!.nativeElement.getBoundingClientRect();
      let x = event.pageX - canvasPosition.left;
      let y = event.pageY - canvasPosition.top;

      if (this.isAxisInverted) {
        [x, y] = [y, x];
        x = canvasPosition.height - x;
      } else {
        y = canvasPosition.height - y;
      }

      const cellsLength = this.inputDatas.matrixCellDatas.length;
      for (let i = 0; i < cellsLength; i++) {
        if (
          y > this.inputDatas.matrixCellDatas[i].yCanvas &&
          y <
            this.inputDatas.matrixCellDatas[i].yCanvas +
              this.inputDatas.matrixCellDatas[i].hCanvas &&
          x > this.inputDatas.matrixCellDatas[i].xCanvas &&
          x <
            this.inputDatas.matrixCellDatas[i].xCanvas +
              this.inputDatas.matrixCellDatas[i].wCanvas
        ) {
          return this.inputDatas.matrixCellDatas[i];
        }
      }
    }
  }

  onContrastChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    this.contrast = parseInt(target.value, 10);
    this.contrast && this.ls.set(LS.SETTING_MATRIX_CONTRAST, this.contrast);
    this.drawMatrix();
  }

  onClickOnInvertAxis() {
    // this.trackerService.trackEvent('click', 'matrix_inverted');
    this.isAxisInverted = !this.isAxisInverted;
    this.drawMatrix();
    this.matrixAxisInverted.emit();
  }

  onClickOnToggleZeros() {
    // this.trackerService.trackEvent('click', 'matrix_toggle_zeros');
    this.isZerosToggled = !this.isZerosToggled;
    this.drawMatrix();
  }

  private showTooltip(event: MouseEvent) {
    this.tooltipCell = this.getCurrentCell(event);
    const x = event.pageX;
    const y = event.pageY;
    this.tooltipPosition = {
      x: x,
      y: y,
    };
  }

  private hideTooltip() {
    this.tooltipCell = undefined;
  }

  onClickOnZoomIn() {
    // this.trackerService.trackEvent('click', 'matrix_zoom', 'in');
    this.currentMouseY = 0;
    this.currentMouseX = 0;
    this.zoomCanvas(-1, true);
  }

  onClickOnZoomOut() {
    // this.trackerService.trackEvent('click', 'matrix_zoom', 'out');
    this.currentMouseY = 0;
    this.currentMouseX = 0;
    this.zoomCanvas(1, true);
  }

  onClickOnResetZoom() {
    this.currentMouseY = 0;
    // this.trackerService.trackEvent('click', 'matrix_zoom', 'reset');
    this.currentMouseX = 0;
    this.zoomCanvas(0);
  }

  private setMatrixEltsOrientation(width: number, height: number) {
    [this.xAxisLabel, this.yAxisLabel] =
      this.matrixRendererService.setMatrixEltsOrientation(
        this.matrixCtx,
        this.matrixSelectedCtx,
        this.isAxisInverted,
        width,
        height,
        this.xAxisLabel,
        this.yAxisLabel,
      );
  }
}
