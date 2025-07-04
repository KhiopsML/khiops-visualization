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
import * as d3 from 'd3';
import { HistogramService } from './histogram.service';
import { format } from 'mathjs';
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
} from './histogram.interfaces';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { DistributionOptionsI } from '@khiops-library/interfaces/distribution-options';
import { debounceTime, Subject } from 'rxjs';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { LS } from '@khiops-library/enum/ls';
import { AppService } from '@khiops-visualization/providers/app.service';
import { BIG_CHART_SIZE } from '@khiops-library/config/global';
import { ZoomToolsEventsService } from '@khiops-library/components/zoom-tools/zoom-tools.service';

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

  private h: number = 0;
  public w: number = 0;
  private xPadding: number = 40;
  private yPadding: number = 50;
  private bars: HistogramBarModel[] = [];

  // Static config values
  private xTickCount?: number;
  private yTicksCount = 10;
  private tickSize = 0;
  private minBarHeight = 4;
  private defaultBarColor: string;

  // Local variables
  public isLoading: boolean = false;
  public colorSet: string[];
  public tooltipText: string = '';
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
    public translate: TranslateService,
    private zoomToolsEventsService: ZoomToolsEventsService,
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
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

    this.datas && this.update();
  }

  public hideActiveEntries() {
    this.histogramSelectedCanvas!.style.display = 'none';
  }

  public showActiveEntries() {
    this.histogramSelectedCanvas!.style.display = 'block';
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
    AppService.Ls.set(LS.DISTRIBUTION_GRAPH_OPTION_X, type);
    this.graphOptionsX!.selected = type;
    this.datas && this.update();
  }

  public changeGraphTypeY(type: string) {
    AppService.Ls.set(LS.DISTRIBUTION_GRAPH_OPTION_Y, type);
    this.graphOptionsY!.selected = type;
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
      event.pageX - this.histogramContainer?.nativeElement.offsetLeft;
    this.startY =
      event.pageY - this.histogramContainer?.nativeElement.offsetTop;
    this.scrollLeft = this.histogramContainer?.nativeElement.scrollLeft;
    this.scrollTop = this.histogramContainer?.nativeElement.scrollTop;
  }

  public onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    const x = event.pageX - this.histogramContainer?.nativeElement.offsetLeft;
    const y = event.pageY - this.histogramContainer?.nativeElement.offsetTop;
    const walkX = (x - this.startX) * 1; // Facteur de vitesse
    const walkY = (y - this.startY) * 1;

    this.histogramContainer!.nativeElement.scrollLeft = this.scrollLeft - walkX;
    this.histogramContainer!.nativeElement.scrollTop = this.scrollTop - walkY;
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
      this.datas && this.update();
    }
    if (changes.selectedItem) {
      this.drawSelectedItem();
    }
  }

  private handleCanvasClick(event: any) {
    const canvasPosition = this.histogramCanvas?.getBoundingClientRect();
    const barPosition = HistogramUIService.getCurrentBarPosition(
      this.datas!,
      this.yPadding,
      canvasPosition!,
      event,
    );
    if (barPosition !== undefined) {
      this.selectedItem = barPosition;

      this.selectedItemChanged.emit(this.selectedItem);
    } else {
      // no bar selected
    }
  }

  private drawSelectedItem() {
    HistogramUIService.cleanDomContext(
      this.ctxSelected!,
      this.histogramSelectedCanvas!,
    );
    // reDraw selected item in front of others
    this.drawRect(
      this.ctxSelected!,
      this.datas?.[this.selectedItem]!,
      this.selectedItem,
      this.bars[this.selectedItem]!,
      this.ratio,
      this.selectedItem,
    );
  }

  private handleCanvasOut() {
    this.hideTooltip();
    HistogramUIService.cleanDomContext(
      this.ctxHover!,
      this.histogramHoverCanvas!,
    );
  }

  private handleCanvasMove(event: any) {
    const canvasPosition = this.histogramCanvas?.getBoundingClientRect();
    const barPosition = HistogramUIService.getCurrentBarPosition(
      this.datas!,
      this.yPadding,
      canvasPosition!,
      event,
    );
    const bar = this.datas?.[barPosition!];

    if (barPosition !== undefined) {
      const tooltipText = HistogramUIService.generateTooltip(
        bar!,
        barPosition === 0,
      );
      this.showTooltip(event, tooltipText);

      HistogramUIService.cleanDomContext(
        this.ctxHover!,
        this.histogramHoverCanvas!,
      );
      // reDraw selected item in front of others
      this.drawRect(
        this.ctxHover!,
        this.datas?.[barPosition]!,
        -1,
        this.bars?.[barPosition]!,
        this.ratio,
        barPosition,
      );
    } else {
      this.hideTooltip();
    }
  }

  private showTooltip(event: MouseEvent, text: string) {
    this.tooltipPosX = event.offsetX + 20;
    this.tooltipPosY = event.offsetY - 40;
    this.tooltipText = text;
    this.tooltipDisplay = true;
  }

  private hideTooltip() {
    this.tooltipDisplay = false;
  }

  private update() {
    if (this.histogramCanvas) {
      HistogramUIService.cleanDomContext(this.ctx!, this.histogramCanvas);
      HistogramUIService.cleanDomContext(
        this.ctxHover!,
        this.histogramHoverCanvas!,
      );
      HistogramUIService.cleanDomContext(
        this.ctxSelected!,
        this.histogramSelectedCanvas!,
      );
      this.ctx =
        HistogramUIService.initCanvasContext(
          this.histogramCanvas,
          this.w,
          this.h,
        ) || undefined;
      this.ctxHover =
        HistogramUIService.initCanvasContext(
          this.histogramHoverCanvas!,
          this.w,
          this.h,
        ) || undefined;
      this.ctxSelected =
        HistogramUIService.initCanvasContext(
          this.histogramSelectedCanvas!,
          this.w,
          this.h,
        ) || undefined;

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
      this.rangeYLog = this.histogramService.getLogRangeY(this.datas!);
      this.ratioY = this.histogramService.getLogRatioY(this.h, this.yPadding);
    } else {
      this.rangeYLin = this.histogramService.getLinRangeY(this.datas!);
      this.ratioY = this.histogramService.getLinRatioY(this.h, this.yPadding);
    }

    this.drawChart(this.w);

    [this.rangeXLin, this.rangeXLog] = this.histogramService.getRangeX(
      this.datas!,
    );

    if (
      this.rangeXLog.negValuesCount === 0 ||
      this.rangeXLog.posValuesCount === 0
    ) {
      this.xTickCount = this.xTickCount! * 2;
    }

    this.drawYAxis();
    this.drawHistogram(this.datas!);

    if (this.graphOptionsX?.selected === HistogramType.XLIN) {
      let shift = 0;
      let width = this.w - 2 * this.xPadding;
      let domain: any = [this.rangeXLin.min, this.rangeXLin.max];
      let tickValues = this.datas?.map((e: HistogramValuesI) => e.partition[0]);
      tickValues!.push(this.datas?.[this.datas?.length - 1]!.partition[1]);
      this.drawXAxis(domain, shift, width);
    } else {
      // Draw positive axis
      let shift = 0;
      let width = 0;
      let domain: number[] = [];

      if (
        this.rangeXLog.posStart !== this.rangeXLog.max &&
        this.rangeXLog.posValuesCount
      ) {
        width = this.w - 2 * this.xPadding;
        domain = [this.rangeXLog.posStart!, this.rangeXLog.max!];

        let shiftInf = 2;
        if (this.rangeXLog.inf && !this.rangeXLog.negStart) {
          shiftInf = 1;
        }
        if (!this.rangeXLog.inf && this.rangeXLog.negValuesCount === 0) {
          shiftInf = 0; // only positive values
        }
        shift +=
          ((this.w - 2 * this.xPadding) / this.ratio) *
          Math.log10(this.rangeXLog.middlewidth!) *
          shiftInf;

        if (this.rangeXLog.negValuesCount !== 0) {
          shift +=
            ((this.w - 2 * this.xPadding) / this.ratio) *
            Math.log10(Math.abs(this.rangeXLog.min!));
          shift -=
            ((this.w - 2 * this.xPadding) / this.ratio) *
            Math.log10(Math.abs(this.rangeXLog.negStart!));
        }
        width = this.w - 2 * this.xPadding - shift;
        this.drawXAxis(domain, shift, width);
      }

      // Draw -Inf axis
      if (this.rangeXLog.inf) {
        if (this.rangeXLog.posValuesCount) {
          let middleShift =
            shift -
            ((this.w - 2 * this.xPadding) / this.ratio) *
              Math.log10(this.rangeXLog.middlewidth!);
          domain = [1];
          this.drawXAxis(domain, middleShift - 1, 1);
        } else {
          let middleShift = this.w - 2 * this.xPadding;
          domain = [1];
          this.drawXAxis(domain, middleShift - 1, 1); // 1 to make bigger line
        }
      }

      // Draw negative axis
      if (
        // this.rangeXLog.inf ||
        this.rangeXLog.negStart !== this.rangeXLog.min &&
        this.rangeXLog.negValuesCount
      ) {
        width = this.w - 2 * this.xPadding - width;
        domain = [this.rangeXLog.min!, this.rangeXLog.negStart!];

        if (this.rangeXLog.posValuesCount) {
          // If there is pos and neg values
          width =
            width -
            ((this.w - 2 * this.xPadding) / this.ratio) *
              Math.log10(this.rangeXLog.middlewidth!) *
              2;
        } else {
          if (this.rangeXLog.inf) {
            width =
              width -
              ((this.w - 2 * this.xPadding) / this.ratio) *
                Math.log10(this.rangeXLog.middlewidth!);
          }
        }
        this.drawXAxis(domain, 0, width);
      }
    }
    this.drawSelectedItem();
    this.isLoading = false;
  }

  private drawChart(chartW: number) {
    // First remove svg if already added to the dom
    d3.select(this.chart.nativeElement).select('svg').remove();

    this.svg = d3
      .select(this.chart.nativeElement)
      .append('svg')
      .attr('width', chartW)
      .attr('height', this.h + this.yPadding);
  }

  private drawRect(
    ctx: CanvasRenderingContext2D,
    d: HistogramValuesI,
    i: number,
    bar: HistogramBarModel,
    ratio: number = 0,
    selectedItem: number = -1,
  ) {
    if (ctx && bar) {
      let barX: number, barH: number, barW: number;

      if (this.graphOptionsX?.selected === HistogramType.XLIN) {
        barX = ((this.w - 2 * this.xPadding) / ratio) * bar.barXlin;
        barW = ((this.w - 2 * this.xPadding) / ratio) * bar.barWlin;
      } else {
        barX = ((this.w - 2 * this.xPadding) / ratio) * bar.barXlog;
        barW = ((this.w - 2 * this.xPadding) / ratio) * bar.barWlog;
      }

      if (this.graphOptionsY?.selected === HistogramType.YLIN) {
        barH = d.density * this.ratioY;
      } else {
        if (d.logValue !== 0) {
          let shift = Math.abs(this.rangeYLog?.max!);
          barH = Math.abs(d.logValue) * this.ratioY - shift * this.ratioY;
          barH = this.h - this.yPadding / 2 - barH;
        } else {
          barH = 0;
        }
      }
      if (barH !== 0 && barH < this.minBarHeight) {
        barH = this.minBarHeight;
      }
      if (this.graphOptionsY?.selected === HistogramType.YLOG && barH === 0) {
        barH = this.minBarHeight;
      }

      const x = barX + this.xPadding + this.xPadding / 2;
      const y = this.h - barH;

      // Tooltip issue on histogram #189
      if (barW < 1) {
        barW = 1.5;
      }

      // keep current coords to bind clicks and tooltip
      d.coords = {
        x: x,
        y: y,
        barW: barW,
        barH: barH,
      };

      ctx.fillStyle = UtilsService.hexToRgba(bar.color, 0.8);
      ctx.lineWidth = 0;
      ctx.fillRect(x, y, barW, barH);
      ctx.strokeStyle = selectedItem === i ? this.defaultBarColor : bar.color;
      ctx.lineWidth = selectedItem === i ? 2 : 1;
      ctx.strokeRect(x, y, barW, barH);
    }
  }

  private drawHistogram(datasSet: HistogramValuesI[]) {
    this.bars = this.histogramService.computeXbarsDimensions(
      datasSet,
      this.graphOptionsX?.selected!,
    );
    this.ratio = 0;
    if (this.graphOptionsX?.selected === HistogramType.XLIN) {
      this.ratio =
        this.bars[this.bars.length - 1]!.barXlin +
        this.bars[this.bars.length - 1]!.barWlin;
    } else {
      this.ratio =
        this.bars[this.bars.length - 1]!.barXlog +
        this.bars[this.bars.length - 1]!.barWlog;
    }

    datasSet.forEach((d: HistogramValuesI, i: number) => {
      this.drawRect(this.ctx!, d, i, this.bars[i]!, this.ratio);
    });
  }

  private drawXAxis(domain: number[], shift: number, width: number) {
    if (width !== 0) {
      let xAxis;
      shift = shift + this.xPadding;

      if (this.graphOptionsX?.selected === HistogramType.XLIN) {
        xAxis = d3.scaleLinear().domain(domain).range([0, width]); // This is where the axis is placed: from 100px to 800px
      } else {
        xAxis = d3.scaleLog().base(10).domain(domain).range([0, width]);
      }

      //@ts-ignore
      const axis: d3.Axis<d3.NumberValue> = d3
        .axisBottom(xAxis)
        .ticks([this.xTickCount])
        .tickArguments([this.xTickCount, '.0e'])
        .tickSize(-this.h + this.yPadding / 2);

      if (this.graphOptionsX?.selected === HistogramType.XLIN) {
        // @ts-ignore
        axis.tickFormat((d: number) => {
          let val: any = d;
          return '' + format(val);
        });
      }

      this.svg
        .insert('g', ':first-child')
        .attr('class', 'barXlog axis-grid')
        .attr(
          'transform',
          'translate(' + (shift + this.xPadding / 2) + ',' + this.h + ') ',
        ) // This controls the vertical position of the Axis
        .call(axis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-0.4em')
        .attr('dy', '1em')
        .attr('transform', 'rotate(-35)');
    }
  }

  private drawYAxis() {
    let y;

    // Create the scale
    if (this.graphOptionsY?.selected === HistogramType.YLIN) {
      y = d3
        .scaleLinear()
        .domain([0, this.rangeYLin!]) // This is what is written on the Axis: from 0 to 100
        .range([this.h - this.yPadding / 2, 0]); // Note it is reversed
    } else {
      y = d3
        .scaleLinear()
        .domain([this.rangeYLog?.max!, this.rangeYLog?.min!]) // This is what is written on the Axis: from 0 to 100
        .range([0, this.h - this.yPadding / 2]); // Note it is reversed
    }

    let shift = this.xPadding;
    this.tickSize = -(this.w - this.xPadding * 2);

    // Draw the axis
    const axis = d3
      .axisLeft(y)
      .tickSize(this.tickSize)
      .tickPadding(10)
      // @ts-ignore
      .tickFormat((d: number) => {
        let val: number = d;
        if (this.graphOptionsY?.selected === HistogramType.YLIN) {
          return '' + format(val);
        } else {
          const antiLog = Math.pow(10, val);
          return d3.format('.0e')(antiLog);
        }
      })

      .ticks(this.yTicksCount);
    this.svg
      .append('g')
      .attr('class', 'y axis-grid')
      .attr(
        'transform',
        'translate(' +
          (shift + this.xPadding / 2) +
          ',' +
          this.yPadding / 2 +
          ')',
      ) // This controls the vertical position of the Axis
      .call(axis, 0);
  }
}
