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
import { ResizedEvent } from 'angular-resize-event';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { ConfigService } from '@khiops-library/providers/config.service';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { HistogramType } from './histogram.types';
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
import { THEME } from '@khiops-library/enum/theme';

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent extends SelectableComponent implements OnInit {
  @ViewChild('chart', { static: false })
  chart!: ElementRef;

  componentType = COMPONENT_TYPES.HISTOGRAM; // needed to copy datas
  svg: d3.Selection<SVGElement, unknown, HTMLElement, any>;
  private resizeSubject = new Subject<ResizedEvent>();

  // Outputs
  @Output() selectedItemChanged: EventEmitter<any> = new EventEmitter();

  // Dynamic values
  @Input() datas: HistogramValuesI[];
  @Input() selectedItem: number = 0;
  @Input() graphOptionsX: DistributionOptionsI | undefined = undefined;
  @Input() graphOptionsY: DistributionOptionsI | undefined = undefined;

  h: number = 0;
  w: number = 0;
  xPadding: number = 40;
  yPadding: number = 50;
  bars: HistogramBarModel[] = [];

  // Static config values
  xTickCount: number;
  yTicksCount = 10;
  tickSize = 0;
  minBarHeight = 4;
  defaultBarColor: string;

  // Local variables
  rangeXLog: RangeXLogI;
  rangeXLin: RangeXLinI;
  rangeYLin: number;
  rangeYLog: RangeYLogI;

  ratioY = 0;
  ratio: number = 0;
  isLoading: boolean = false;

  colorSet: string[];

  ctx: CanvasRenderingContext2D;
  ctxSelected: CanvasRenderingContext2D;
  ctxHover: CanvasRenderingContext2D;

  histogramCanvas: HTMLCanvasElement;
  histogramHoverCanvas: HTMLCanvasElement;
  histogramSelectedCanvas: HTMLCanvasElement;

  tooltipText: string = '';
  tooltipPosX: number = 0;
  tooltipPosY: number = 0;
  tooltipDisplay: boolean = false;

  constructor(
    private khiopsLibraryService: KhiopsLibraryService,
    private histogramService: HistogramService,
    public translate: TranslateService,
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
  ) {
    super(selectableService, ngzone, configService);

    this.defaultBarColor =
      AppService.Ls.get(LS.THEME_COLOR) === THEME.DARK ? 'white' : 'black';
    HistogramUIService.setTranslationService(translate);

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

    this.histogramSelectedCanvas.addEventListener(
      'click',
      this.handleCanvasClick.bind(this),
    );

    this.histogramSelectedCanvas.addEventListener(
      'mousemove',
      this.handleCanvasMove.bind(this),
    );

    this.histogramSelectedCanvas.addEventListener(
      'mouseout',
      this.handleCanvasOut.bind(this),
    );
  }

  ngOnInit(): void {
    this.datas && this.init();
  }

  hideActiveEntries() {
    console.log('hideActiveEntries');
  }

  showActiveEntries() {
    console.log('showActiveEntries');
  }

  override ngOnDestroy() {
    this.histogramSelectedCanvas.removeEventListener(
      'click',
      this.handleCanvasClick.bind(this),
    );
    this.histogramSelectedCanvas.removeEventListener(
      'mousemove',
      this.handleCanvasMove.bind(this),
    );
    this.histogramSelectedCanvas.removeEventListener(
      'mouseout',
      this.handleCanvasOut.bind(this),
    );
  }

  changeGraphTypeX(type: string) {
    AppService.Ls.set(LS.DISTRIBUTION_GRAPH_OPTION_X, type);
    this.graphOptionsX.selected = type;
    this.datas && this.init();
  }

  changeGraphTypeY(type: string) {
    AppService.Ls.set(LS.DISTRIBUTION_GRAPH_OPTION_Y, type);
    this.graphOptionsY.selected = type;
    this.datas && this.init();
  }

  onResized(event: ResizedEvent) {
    this.resizeSubject.next(event);
  }

  handleResized(event: ResizedEvent) {
    this.h = this.chart.nativeElement.offsetHeight + 10 - 60; // graph header = 60, +10 to take more height
    this.w = this.chart.nativeElement.offsetWidth;
    // if (!event.isFirst) {
    // Do it every timesto be sure that chart height has been computed
    this.datas && this.init();
    // }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.datas && !changes.datas.firstChange) {
      this.datas && this.init();
    }
    if (changes.selectedItem) {
      this.drawSelectedItem();
    }
  }

  handleCanvasClick(event) {
    const canvasPosition = this.histogramCanvas.getBoundingClientRect();
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

  drawSelectedItem() {
    HistogramUIService.cleanDomContext(
      this.ctxSelected,
      this.histogramSelectedCanvas,
    );
    // reDraw selected item in front of others
    this.drawRect(
      this.ctxSelected,
      this.datas[this.selectedItem],
      this.selectedItem,
      this.bars[this.selectedItem],
      this.ratio,
      this.selectedItem,
    );
  }

  handleCanvasOut() {
    this.hideTooltip();
    HistogramUIService.cleanDomContext(
      this.ctxHover,
      this.histogramHoverCanvas,
    );
  }

  handleCanvasMove(event) {
    const canvasPosition = this.histogramCanvas.getBoundingClientRect();
    const barPosition = HistogramUIService.getCurrentBarPosition(
      this.datas,
      this.yPadding,
      canvasPosition,
      event,
    );
    const bar = this.datas[barPosition];

    if (barPosition !== undefined) {
      const tooltipText = HistogramUIService.generateTooltip(
        bar,
        barPosition === 0,
      );
      this.showTooltip(event, tooltipText);

      HistogramUIService.cleanDomContext(
        this.ctxHover,
        this.histogramHoverCanvas,
      );
      // reDraw selected item in front of others
      this.drawRect(
        this.ctxHover,
        this.datas[barPosition],
        -1,
        this.bars[barPosition],
        this.ratio,
        barPosition,
      );
    } else {
      this.hideTooltip();
    }
  }

  showTooltip(event: MouseEvent, text: string) {
    this.tooltipPosX = event.offsetX + 20;
    this.tooltipPosY = event.offsetY - 40;
    this.tooltipText = text;
    this.tooltipDisplay = true;
  }

  hideTooltip() {
    this.tooltipDisplay = false;
  }

  init() {
    if (this.histogramCanvas) {
      HistogramUIService.cleanDomContext(this.ctx, this.histogramCanvas);
      HistogramUIService.cleanDomContext(
        this.ctxHover,
        this.histogramHoverCanvas,
      );
      HistogramUIService.cleanDomContext(
        this.ctxSelected,
        this.histogramSelectedCanvas,
      );
      this.ctx = HistogramUIService.initCanvasContext(
        this.histogramCanvas,
        this.w,
        this.h,
      );
      this.ctxHover = HistogramUIService.initCanvasContext(
        this.histogramHoverCanvas,
        this.w,
        this.h,
      );
      this.ctxSelected = HistogramUIService.initCanvasContext(
        this.histogramSelectedCanvas,
        this.w,
        this.h,
      );

      this.xTickCount = 5; // We must reinit each times

      if (this.chart) {
        this.chart.nativeElement.innerHTML = '';
        if (this.datas) {
          if (this.datas.length > 500) {
            // display loading
            this.isLoading = true;
          }

          setTimeout(
            () => {
              // const t0 = performance.now();
              if (this.graphOptionsY.selected === HistogramType.YLOG) {
                this.rangeYLog = this.histogramService.getLogRangeY(this.datas);
                this.ratioY = this.histogramService.getLogRatioY(
                  this.h,
                  this.yPadding,
                );
              } else {
                this.rangeYLin = this.histogramService.getLinRangeY(this.datas);
                this.ratioY = this.histogramService.getLinRatioY(
                  this.h,
                  this.yPadding,
                );
              }

              this.drawChart(this.w);

              [this.rangeXLin, this.rangeXLog] =
                this.histogramService.getRangeX(this.datas);

              if (
                this.rangeXLog.negValuesCount === 0 ||
                this.rangeXLog.posValuesCount === 0
              ) {
                this.xTickCount = this.xTickCount * 2;
              }

              this.drawYAxis();
              this.drawHistogram(this.datas);

              if (this.graphOptionsX.selected === HistogramType.XLIN) {
                let shift = 0;
                let width = this.w - 2 * this.xPadding;
                let domain = [this.rangeXLin.min, this.rangeXLin.max];
                let tickValues = this.datas.map(
                  (e: HistogramValuesI) => e.partition[0],
                );
                tickValues.push(this.datas[this.datas.length - 1].partition[1]);
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
                  domain = [this.rangeXLog.posStart, this.rangeXLog.max];

                  let shiftInf = 2;
                  if (this.rangeXLog.inf && !this.rangeXLog.negStart) {
                    shiftInf = 1;
                  }
                  if (
                    !this.rangeXLog.inf &&
                    this.rangeXLog.negValuesCount === 0
                  ) {
                    shiftInf = 0; // only positive values
                  }
                  shift +=
                    ((this.w - 2 * this.xPadding) / this.ratio) *
                    Math.log10(this.rangeXLog.middlewidth) *
                    shiftInf;

                  if (this.rangeXLog.negValuesCount !== 0) {
                    shift +=
                      ((this.w - 2 * this.xPadding) / this.ratio) *
                      Math.log10(Math.abs(this.rangeXLog.min));
                    shift -=
                      ((this.w - 2 * this.xPadding) / this.ratio) *
                      Math.log10(Math.abs(this.rangeXLog.negStart));
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
                        Math.log10(this.rangeXLog.middlewidth);
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
                  domain = [this.rangeXLog.min, this.rangeXLog.negStart];

                  if (this.rangeXLog.posValuesCount) {
                    // If there is pos and neg values
                    width =
                      width -
                      ((this.w - 2 * this.xPadding) / this.ratio) *
                        Math.log10(this.rangeXLog.middlewidth) *
                        2;
                  } else {
                    if (this.rangeXLog.inf) {
                      width =
                        width -
                        ((this.w - 2 * this.xPadding) / this.ratio) *
                          Math.log10(this.rangeXLog.middlewidth);
                    }
                  }
                  this.drawXAxis(domain, 0, width);
                }
              }
              this.drawSelectedItem();
              // const t1 = performance.now();
              // console.log('draw histogram ' + (t1 - t0) + ' milliseconds.');
              this.isLoading = false;
            },
            this.isLoading ? 100 : 0,
          );
        }
      }
    }
  }

  drawChart(chartW: number) {
    this.svg = d3
      .select(this.chart.nativeElement)
      .append('svg')
      .attr('width', chartW)
      .attr('height', this.h + this.yPadding);
  }

  drawRect(
    ctx: CanvasRenderingContext2D,
    d: HistogramValuesI,
    i: number,
    bar: HistogramBarModel,
    ratio: number = 0,
    selectedItem: number = -1,
  ) {
    if (ctx) {
      let barX: number, barH: number, barW: number;

      if (this.graphOptionsX.selected === HistogramType.XLIN) {
        barX = ((this.w - 2 * this.xPadding) / ratio) * bar.barXlin;
        barW = ((this.w - 2 * this.xPadding) / ratio) * bar.barWlin;
      } else {
        barX = ((this.w - 2 * this.xPadding) / ratio) * bar.barXlog;
        barW = ((this.w - 2 * this.xPadding) / ratio) * bar.barWlog;
      }

      if (this.graphOptionsY.selected === HistogramType.YLIN) {
        barH = d.value * this.ratioY;
      } else {
        if (d.logValue !== 0) {
          let shift = Math.abs(this.rangeYLog.max);
          barH = Math.abs(d.logValue) * this.ratioY - shift * this.ratioY;
          barH = this.h - this.yPadding / 2 - barH;
        } else {
          barH = 0;
        }
      }
      if (barH !== 0 && barH < this.minBarHeight) {
        barH = this.minBarHeight;
      }
      if (this.graphOptionsY.selected === HistogramType.YLOG && barH === 0) {
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

  drawHistogram(datasSet: HistogramValuesI[]) {
    this.bars = this.histogramService.computeXbarsDimensions(
      datasSet,
      this.graphOptionsX.selected,
    );
    this.ratio = 0;
    if (this.graphOptionsX.selected === HistogramType.XLIN) {
      this.ratio =
        this.bars[this.bars.length - 1].barXlin +
        this.bars[this.bars.length - 1].barWlin;
    } else {
      this.ratio =
        this.bars[this.bars.length - 1].barXlog +
        this.bars[this.bars.length - 1].barWlog;
    }

    datasSet.forEach((d: HistogramValuesI, i: number) => {
      this.drawRect(this.ctx, d, i, this.bars[i], this.ratio);
    });
  }

  drawXAxis(domain: number[], shift: number, width: number) {
    if (width !== 0) {
      let xAxis;
      shift = shift + this.xPadding;

      if (this.graphOptionsX.selected === HistogramType.XLIN) {
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

      if (this.graphOptionsX.selected === HistogramType.XLIN) {
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

  drawYAxis() {
    let y;

    // Create the scale
    if (this.graphOptionsY.selected === HistogramType.YLIN) {
      y = d3
        .scaleLinear()
        .domain([0, this.rangeYLin]) // This is what is written on the Axis: from 0 to 100
        .range([this.h - this.yPadding / 2, 0]); // Note it is reversed
    } else {
      y = d3
        .scaleLinear()
        .domain([this.rangeYLog.max, this.rangeYLog.min]) // This is what is written on the Axis: from 0 to 100
        .range([0, this.h - this.yPadding / 2]); // Note it is reversed
    }

    let shift = this.xPadding;
    this.tickSize = -(this.w - this.xPadding * 2);

    // Draw the axis
    const axis = d3
      .axisLeft(y)
      .tickSize(this.tickSize)
      .tickPadding(10)
      .tickFormat((d: number) => {
        let val: number = d;
        if (this.graphOptionsY.selected === HistogramType.YLIN) {
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
      .call(axis);
  }
}
