/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { HistogramService } from './histogram.service';
import { HistogramRendererService } from './histogram-renderer.service';
import { HistogramUIService } from './histogram.ui.service';
import { HistogramBarModel } from './histogram.bar.model';
import { ResizedEvent } from 'angular-resize-event-package';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { ConfigService } from '@khiops-library/providers/config.service';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { HistogramType } from './histogram.type';
import { TranslateService } from '@ngstack/translate';
import {
  HistogramValuesI,
  RangeXLinI,
  RangeXLogI,
  RangeYLogI,
  TooltipData,
} from './histogram.interfaces';
import { DistributionOptionsI } from '@khiops-library/interfaces/distribution-options';
import { debounceTime, Subject } from 'rxjs';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { BIG_CHART_SIZE } from '@khiops-library/config/global';
import { ZoomToolsEventsService } from '@khiops-library/components/zoom-tools/zoom-tools.service';
import { VariableScaleSettingsService } from '@khiops-visualization/providers/variable-scale-settings.service';

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss'],
  standalone: false,
})
export class HistogramComponent extends SelectableComponent implements OnInit {
  @ViewChild('histogramContainer', { static: false })
  private histogramContainer!: ElementRef;
  @ViewChild('chart', { static: false })
  private chart!: ElementRef;

  public componentType = COMPONENT_TYPES.HISTOGRAM; // needed to copy datas
  private svg?: d3.Selection<SVGElement, unknown, HTMLElement, any> | any;
  private resizeSubject = new Subject<ResizedEvent>();

  // Outputs
  @Output() private selectedItemChanged: EventEmitter<number> =
    new EventEmitter();
  @Output() private interpretableHistogramChanged: EventEmitter<number> =
    new EventEmitter();

  // Dynamic values
  @Input() public datas?: HistogramValuesI[];
  @Input() private selectedItem: number = 0;
  @Input() public histogramNumber: number = 0;
  @Input() public interpretableHistogramNumber: number = 0;
  @Input() public defaultInterpretableHistogramNumber: number = 0;
  @Input() public graphOptionsX: DistributionOptionsI | undefined = undefined;
  @Input() public graphOptionsY: DistributionOptionsI | undefined = undefined;
  @Input() public variableRank?: number; // For scale settings per variable

  private h: number = 0;
  public w: number = 0;
  private xPadding: number = 40;
  private yPadding: number = 50;
  private bars: HistogramBarModel[] = [];

  // Static config values
  private xTickCount?: number;
  private yTicksCount = 10;
  private minBarHeight = 4;
  private defaultBarColor: string;

  // Local variables
  public isLoading: boolean = false;
  public colorSet: string[];
  public tooltipTitle: string = '';
  public tooltipBody: string = '';
  public tooltipPosX: number = 0;
  public tooltipPosY: number = 0;
  public tooltipDisplay: boolean = false;
  private rangeXLog?: RangeXLogI;
  private rangeXLin?: RangeXLinI;
  private rangeYLin?: number;
  private rangeYLog?: RangeYLogI;
  private ratioY = 0;
  private ratio: number = 0;
  private ctx?: CanvasRenderingContext2D;
  private ctxSelected?: CanvasRenderingContext2D;
  private ctxHover?: CanvasRenderingContext2D;
  private histogramCanvas?: HTMLCanvasElement | null;
  private histogramHoverCanvas?: HTMLCanvasElement | null;
  private histogramSelectedCanvas?: HTMLCanvasElement | null;

  /**
   * zoom and drag variables
   */
  private scaleFactor = 1;
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private scrollLeft = 0;
  private scrollTop = 0;

  constructor(
    private histogramService: HistogramService,
    private histogramRendererService: HistogramRendererService,
    public translate: TranslateService,
    private zoomToolsEventsService: ZoomToolsEventsService,
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
    private variableScaleSettingsService: VariableScaleSettingsService,
  ) {
    super(selectableService, ngzone, configService);

    this.defaultBarColor = 'black';

    this.colorSet = HistogramUIService.getColors();

    this.resizeSubject.pipe(debounceTime(100)).subscribe((event) => {
      this.handleResized(event);
    });
  }

  override ngAfterViewInit(): void {
    // Keep a ref of instance
    this.chart.nativeElement.componentInstance = this;

    this.histogramCanvas = this.configService
      .getRootElementDom()
      .querySelector('#histogram-canvas');

    this.histogramSelectedCanvas = this.configService
      .getRootElementDom()
      .querySelector('#histogram-canvas-selected');

    this.histogramHoverCanvas = this.configService
      .getRootElementDom()
      .querySelector('#histogram-canvas-hover');

    this.histogramSelectedCanvas?.addEventListener(
      'click',
      this.handleCanvasClick.bind(this),
    );

    this.histogramSelectedCanvas?.addEventListener(
      'mousemove',
      this.handleCanvasMove.bind(this),
    );

    this.histogramSelectedCanvas?.addEventListener(
      'mouseout',
      this.handleCanvasOut.bind(this),
    );
  }

  ngOnInit(): void {
    this.zoomToolsEventsService.zoomIn$.subscribe(() => {
      this.zoom(-1);
    });
    this.zoomToolsEventsService.zoomOut$.subscribe(() => {
      this.zoom(1);
    });
    this.zoomToolsEventsService.zoomReset$.subscribe(() => {
      this.zoom(0);
    });

    // Restore variable-specific scale settings
    this.restoreVariableScaleSettings();

    this.datas && this.update();
  }

  /**
   * Restore scale settings for the current variable if they exist
   */
  private restoreVariableScaleSettings(): void {
    if (this.variableRank !== undefined) {
      const savedXScale = this.variableScaleSettingsService.getVariableXScale(
        this.variableRank,
      );
      const savedYScale = this.variableScaleSettingsService.getVariableYScale(
        this.variableRank,
      );

      // Apply saved X scale - create new object reference for OnPush change detection
      if (savedXScale && this.graphOptionsX) {
        this.graphOptionsX = { ...this.graphOptionsX, selected: savedXScale };
      }

      // Apply saved Y scale - create new object reference for OnPush change detection
      if (savedYScale && this.graphOptionsY) {
        this.graphOptionsY = { ...this.graphOptionsY, selected: savedYScale };
      }
    }
  }

  public hideActiveEntries() {
    if (this.histogramSelectedCanvas) {
      this.histogramSelectedCanvas.style.display = 'none';
    }
  }

  public showActiveEntries() {
    if (this.histogramSelectedCanvas) {
      this.histogramSelectedCanvas.style.display = 'block';
    }
  }

  public onInterpretableHistogramChanged(interpretableHistogram: number) {
    this.interpretableHistogram = interpretableHistogram;
    this.interpretableHistogramChanged.emit(interpretableHistogram);
  }

  override ngOnDestroy() {
    this.histogramSelectedCanvas?.removeEventListener(
      'click',
      this.handleCanvasClick.bind(this),
    );
    this.histogramSelectedCanvas?.removeEventListener(
      'mousemove',
      this.handleCanvasMove.bind(this),
    );
    this.histogramSelectedCanvas?.removeEventListener(
      'mouseout',
      this.handleCanvasOut.bind(this),
    );
  }

  public changeGraphTypeX(type: string) {
    // Save scale setting for this specific variable
    if (this.variableRank !== undefined) {
      this.variableScaleSettingsService.setVariableXScale(
        this.variableRank,
        type,
      );
    }

    if (this.graphOptionsX) {
      this.graphOptionsX.selected = type;
    }
    this.datas && this.update();
  }

  public changeGraphTypeY(type: string) {
    // Save scale setting for this specific variable
    if (this.variableRank !== undefined) {
      this.variableScaleSettingsService.setVariableYScale(
        this.variableRank,
        type,
      );
    }

    if (this.graphOptionsY) {
      this.graphOptionsY.selected = type;
    }
    this.datas && this.update();
  }

  public onResized(event: ResizedEvent) {
    this.resizeSubject.next(event);
  }

  public onWheel(event: WheelEvent) {
    event.preventDefault();
    const { deltaY } = event;
    this.zoom(deltaY);
  }

  private zoom(delta: number) {
    const zoomIn = delta < 0;
    let scale = zoomIn ? this.scaleFactor + 0.25 : this.scaleFactor - 0.25;

    if (scale <= 1) {
      scale = 1;
    }
    if (scale > 5) {
      scale = 5;
    }
    if (delta === 0) {
      scale = 1;
    }
    if (scale !== this.scaleFactor) {
      this.scaleFactor = Number(scale.toFixed(2));
      this.computeChartDimensions();
      this.datas && this.update();
    }
    this.isZooming = true;
  }

  public onMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.isDragging = true;
    this.startX =
      event.pageX - (this.histogramContainer?.nativeElement.offsetLeft || 0);
    this.startY =
      event.pageY - (this.histogramContainer?.nativeElement.offsetTop || 0);
    this.scrollLeft = this.histogramContainer?.nativeElement.scrollLeft || 0;
    this.scrollTop = this.histogramContainer?.nativeElement.scrollTop || 0;
  }

  public onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    const x =
      event.pageX - (this.histogramContainer?.nativeElement.offsetLeft || 0);
    const y =
      event.pageY - (this.histogramContainer?.nativeElement.offsetTop || 0);
    const walkX = (x - this.startX) * 1; // Facteur de vitesse
    const walkY = (y - this.startY) * 1;

    if (this.histogramContainer?.nativeElement) {
      this.histogramContainer.nativeElement.scrollLeft =
        this.scrollLeft - walkX;
      this.histogramContainer.nativeElement.scrollTop = this.scrollTop - walkY;
    }
  }

  public onMouseUp(_event: MouseEvent) {
    this.isDragging = false;
  }

  public computeChartDimensions() {
    this.h =
      (this.chart.nativeElement.offsetHeight + 10 - 60) * this.scaleFactor;
    this.w = this.chart.nativeElement.offsetWidth * this.scaleFactor;
  }

  private handleResized(_event: ResizedEvent) {
    this.computeChartDimensions();

    // Do it every timesto be sure that chart height has been computed
    this.datas && this.update();
    this.isZooming = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.datas && !changes.datas.firstChange) {
      this.restoreVariableScaleSettings();
      this.datas && this.update();
    }
    if (changes.selectedItem) {
      this.drawSelectedItem();
    }
    // Force update when graph options change (scale changes)
    if (changes.graphOptionsX && !changes.graphOptionsX.firstChange) {
      this.datas && this.update();
    }
    if (changes.graphOptionsY && !changes.graphOptionsY.firstChange) {
      this.datas && this.update();
    }
  }

  private handleCanvasClick(event: any) {
    const canvasPosition = this.histogramCanvas?.getBoundingClientRect();
    if (this.datas && canvasPosition) {
      const barPosition = HistogramUIService.getCurrentBarPosition(
        this.datas,
        this.yPadding,
        canvasPosition,
        event,
      );
      if (barPosition !== undefined) {
        this.selectedItem = barPosition;

        this.selectedItemChanged.emit(this.selectedItem);
      } else {
        // no bar selected
      }
    }
  }

  private drawSelectedItem() {
    if (this.ctxSelected && this.histogramSelectedCanvas) {
      HistogramUIService.cleanDomContext(
        this.ctxSelected,
        this.histogramSelectedCanvas,
      );
      // reDraw selected item in front of others
      const selectedData = this.datas?.[this.selectedItem];
      const selectedBar = this.bars[this.selectedItem];
      if (selectedData && selectedBar) {
        this.histogramRendererService.drawRect(
          this.ctxSelected,
          selectedData,
          this.selectedItem,
          selectedBar,
          this.w,
          this.h,
          this.xPadding,
          this.yPadding,
          this.graphOptionsX,
          this.graphOptionsY,
          this.rangeYLog,
          this.ratioY,
          this.ratio,
          this.minBarHeight,
          this.defaultBarColor,
          this.selectedItem,
        );
      }
    }
  }

  private handleCanvasOut() {
    this.hideTooltip();
    if (this.ctxHover && this.histogramHoverCanvas) {
      HistogramUIService.cleanDomContext(
        this.ctxHover,
        this.histogramHoverCanvas,
      );
    }
  }

  private handleCanvasMove(event: any) {
    const canvasPosition = this.histogramCanvas?.getBoundingClientRect();
    if (this.datas && canvasPosition) {
      const barPosition = HistogramUIService.getCurrentBarPosition(
        this.datas,
        this.yPadding,
        canvasPosition,
        event,
      );
      const bar = this.datas?.[barPosition || 0];

      if (barPosition !== undefined) {
        const tooltipData = HistogramUIService.generateTooltip(
          bar || this.datas[0] || ({} as HistogramValuesI),
          barPosition === 0,
        );
        this.showTooltipData(event, tooltipData);

        if (this.ctxHover && this.histogramHoverCanvas) {
          HistogramUIService.cleanDomContext(
            this.ctxHover,
            this.histogramHoverCanvas,
          );
          // reDraw selected item in front of others
          const hoverData = this.datas?.[barPosition];
          const hoverBar = this.bars?.[barPosition];
          if (hoverData && hoverBar) {
            this.histogramRendererService.drawRect(
              this.ctxHover,
              hoverData,
              -1,
              hoverBar,
              this.w,
              this.h,
              this.xPadding,
              this.yPadding,
              this.graphOptionsX,
              this.graphOptionsY,
              this.rangeYLog,
              this.ratioY,
              this.ratio,
              this.minBarHeight,
              this.defaultBarColor,
              barPosition,
            );
          }
        }
      } else {
        this.hideTooltip();
      }
    }
  }

  private showTooltipData(event: MouseEvent, tooltipData: TooltipData) {
    this.tooltipPosX = event.offsetX + 20;
    this.tooltipPosY = event.offsetY - 40;
    this.tooltipTitle = tooltipData.title;
    this.tooltipBody = tooltipData.body;
    this.tooltipDisplay = true;
  }

  private hideTooltip() {
    this.tooltipDisplay = false;
  }

  private update() {
    if (this.histogramCanvas) {
      // Clean contexts using renderer service
      this.histogramRendererService.cleanCanvasContexts(
        this.ctx,
        this.ctxHover,
        this.ctxSelected,
        this.histogramCanvas,
        this.histogramHoverCanvas,
        this.histogramSelectedCanvas,
      );

      // Initialize contexts using renderer service
      const contexts = this.histogramRendererService.initCanvasContexts(
        this.histogramCanvas,
        this.histogramHoverCanvas || null,
        this.histogramSelectedCanvas || null,
        this.w,
        this.h,
      );

      this.ctx = contexts.ctx;
      this.ctxHover = contexts.ctxHover;
      this.ctxSelected = contexts.ctxSelected;

      this.xTickCount = 5; // We must reinit each times

      if (this.chart) {
        this.chart.nativeElement.innerHTML = '';
        if (this.datas) {
          if (this.datas.length > BIG_CHART_SIZE) {
            // display loading
            this.isLoading = true;
            setTimeout(() => {
              this.draw();
            }, 100);
          } else {
            // Do it synchronously when few datas for smooth transition
            this.draw();
          }
        }
      }
    }
  }

  private draw() {
    if (this.graphOptionsY?.selected === HistogramType.YLOG) {
      if (this.datas) {
        this.rangeYLog = this.histogramService.getLogRangeY(this.datas);
        this.ratioY = this.histogramService.getLogRatioY(this.h, this.yPadding);
      }
    } else {
      if (this.datas) {
        this.rangeYLin = this.histogramService.getLinRangeY(this.datas);
        this.ratioY = this.histogramService.getLinRatioY(this.h, this.yPadding);
      }
    }

    // Create chart using renderer service
    this.svg = this.histogramRendererService.createChart(
      this.chart.nativeElement,
      this.w,
      this.h,
      this.yPadding,
    );

    if (this.datas) {
      [this.rangeXLin, this.rangeXLog] = this.histogramService.getRangeX(
        this.datas,
      );
    }

    if (
      this.rangeXLog &&
      (this.rangeXLog.negValuesCount === 0 ||
        this.rangeXLog.posValuesCount === 0)
    ) {
      this.xTickCount = (this.xTickCount || 0) * 2;
    }

    // Draw Y axis using renderer service
    this.histogramRendererService.drawYAxis(
      this.svg,
      this.h,
      this.w,
      this.xPadding,
      this.yPadding,
      this.yTicksCount,
      this.graphOptionsY,
      this.rangeYLin,
      this.rangeYLog,
    );

    if (this.datas) {
      // Draw histogram using renderer service
      const result = this.histogramRendererService.drawHistogram(
        this.datas,
        this.ctx,
        this.w,
        this.h,
        this.xPadding,
        this.yPadding,
        this.graphOptionsX,
        this.graphOptionsY,
        this.rangeYLog,
        this.ratioY,
        this.minBarHeight,
        this.defaultBarColor,
      );

      this.bars = result.bars;
      this.ratio = result.ratio;
    }

    if (this.graphOptionsX?.selected === HistogramType.XLIN) {
      if (this.rangeXLin) {
        let shift = 0;
        let width = this.w - 2 * this.xPadding;
        let domain: any = [this.rangeXLin.min, this.rangeXLin.max];
        let tickValues = this.datas?.map(
          (e: HistogramValuesI) => e.partition[0],
        );
        if (tickValues && this.datas) {
          tickValues.push(this.datas[this.datas.length - 1]?.partition[1]);
        }
        this.histogramRendererService.drawXAxis(
          this.svg,
          domain,
          shift,
          width,
          this.h,
          this.xPadding,
          this.yPadding,
          this.xTickCount,
          this.graphOptionsX,
        );
      }
    } else {
      if (this.rangeXLog) {
        // Draw positive axis
        let shift = 0;
        let width = 0;
        let domain: number[] = [];

        if (
          this.rangeXLog.posStart !== this.rangeXLog.max &&
          this.rangeXLog.posValuesCount
        ) {
          width = this.w - 2 * this.xPadding;
          domain = [this.rangeXLog.posStart || 0, this.rangeXLog.max || 0];

          let shiftInf = 2;
          if (this.rangeXLog.inf && !this.rangeXLog.negStart) {
            shiftInf = 1;
          }
          if (!this.rangeXLog.inf && this.rangeXLog.negValuesCount === 0) {
            shiftInf = 0; // only positive values
          }
          shift +=
            ((this.w - 2 * this.xPadding) / this.ratio) *
            Math.log10(this.rangeXLog.middlewidth || 1) *
            shiftInf;

          if (this.rangeXLog.negValuesCount !== 0) {
            shift +=
              ((this.w - 2 * this.xPadding) / this.ratio) *
              Math.log10(Math.abs(this.rangeXLog.min || 1));
            shift -=
              ((this.w - 2 * this.xPadding) / this.ratio) *
              Math.log10(Math.abs(this.rangeXLog.negStart || 1));
          }
          width = this.w - 2 * this.xPadding - shift;
          this.histogramRendererService.drawXAxis(
            this.svg,
            domain,
            shift,
            width,
            this.h,
            this.xPadding,
            this.yPadding,
            this.xTickCount,
            this.graphOptionsX,
          );
        }

        // Draw -Inf axis
        if (this.rangeXLog.inf) {
          if (this.rangeXLog.posValuesCount) {
            let middleShift =
              shift -
              ((this.w - 2 * this.xPadding) / this.ratio) *
                Math.log10(this.rangeXLog.middlewidth || 1);
            domain = [1];
            this.histogramRendererService.drawXAxis(
              this.svg,
              domain,
              middleShift - 1,
              1,
              this.h,
              this.xPadding,
              this.yPadding,
              this.xTickCount,
              this.graphOptionsX,
            );
          } else {
            let middleShift = this.w - 2 * this.xPadding;
            domain = [1];
            this.histogramRendererService.drawXAxis(
              this.svg,
              domain,
              middleShift - 1,
              1,
              this.h,
              this.xPadding,
              this.yPadding,
              this.xTickCount,
              this.graphOptionsX,
            ); // 1 to make bigger line
          }
        }

        // Draw negative axis
        if (
          this.rangeXLog.negStart !== this.rangeXLog.min &&
          this.rangeXLog.negValuesCount
        ) {
          width = this.w - 2 * this.xPadding - width;
          domain = [this.rangeXLog.min || 0, this.rangeXLog.negStart || 0];

          if (this.rangeXLog.posValuesCount) {
            // If there is pos and neg values
            width =
              width -
              ((this.w - 2 * this.xPadding) / this.ratio) *
                Math.log10(this.rangeXLog.middlewidth || 1) *
                2;
          } else {
            if (this.rangeXLog.inf) {
              width =
                width -
                ((this.w - 2 * this.xPadding) / this.ratio) *
                  Math.log10(this.rangeXLog.middlewidth || 1);
            }
          }
          this.histogramRendererService.drawXAxis(
            this.svg,
            domain,
            0,
            width,
            this.h,
            this.xPadding,
            this.yPadding,
            this.xTickCount,
            this.graphOptionsX,
          );
        }
      }
    }
    this.drawSelectedItem();
    this.isLoading = false;
  }
}
