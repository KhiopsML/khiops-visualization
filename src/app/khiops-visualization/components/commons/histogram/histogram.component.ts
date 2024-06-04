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
import { HistogramBarVO } from './histogram.bar-vo';
import { ResizedEvent } from 'angular-resize-event';
import { DistributionDatasVO } from '@khiops-visualization/model/distribution-datas-vo';
import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { ConfigService } from '@khiops-library/providers/config.service';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { HistogramType } from './histogram.types';
import { AppConfig } from 'src/environments/environment';
import { TranslateService } from '@ngstack/translate';
import {
  HistogramValuesI,
  RangeXLinI,
  RangeXLogI,
  RangeYLogI,
} from './histogram.interfaces';
import { UtilsService } from '@khiops-library/providers/utils.service';

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent extends SelectableComponent implements OnInit {
  @ViewChild('chart', { static: false })
  chart!: ElementRef;
  @ViewChild('chartTooltip', { static: false })
  chartTooltip!: ElementRef;

  componentType = 'histogram'; // needed to copy datas
  svg: d3.Selection<SVGElement, unknown, HTMLElement, any>;
  tooltip!: any;

  // Outputs
  @Output() selectedItemChanged: EventEmitter<any> = new EventEmitter();

  // Dynamic values
  @Input() datas: HistogramValuesI[];
  @Input() selectedItem: number = 0;

  h: number = 0;
  w: number = 0;
  xPadding: number = 40;
  yPadding: number = 50;

  // Static config values
  xTickCount: number;
  yTicksCount = 10;
  tickSize = 0;
  minBarHeight = 4;
  barColor: string =
    localStorage.getItem(
      AppConfig.visualizationCommon.GLOBAL.LS_ID + 'THEME_COLOR',
    ) === 'dark'
      ? 'white'
      : 'black';

  // Local variables
  rangeXLog: RangeXLogI;
  rangeXLin: RangeXLinI;
  rangeYLin: number;
  rangeYLog: RangeYLogI;

  ratioY = 0;

  formatOpts = { lowerExp: -2, upperExp: 2 };
  ratio: number = 0;
  distributionDatas: DistributionDatasVO;
  isLoading: boolean = false;

  colorSet: string[];

  ctx: CanvasRenderingContext2D;
  histogramCanvas: HTMLCanvasElement;

  constructor(
    private distributionDatasService: DistributionDatasService,
    private khiopsLibraryService: KhiopsLibraryService,
    private histogramService: HistogramService,
    public override selectableService: SelectableService,
    public translate: TranslateService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
  ) {
    super(selectableService, ngzone, configService);
    HistogramUIService.setTranslationService(translate);

    this.colorSet = HistogramUIService.getColors();
    d3.selection.prototype.moveToFront = function () {
      return this.each(function () {
        this.parentNode.appendChild(this);
      });
    };
  }

  override ngAfterViewInit(): void {
    this.histogramCanvas = this.configService
      .getRootElementDom()
      .querySelector('#histogram-canvas');

    this.histogramCanvas.addEventListener(
      'click',
      this.handleCanvasClick.bind(this),
    );
  }

  ngOnInit(): void {
    this.distributionDatas = this.distributionDatasService.getDatas();
  }

  override ngOnDestroy() {
    this.histogramCanvas.removeEventListener(
      'click',
      this.handleCanvasClick.bind(this),
    );
  }

  changeGraphTypeX(type: string) {
    localStorage.setItem(
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.LS_ID +
        'DISTRIBUTION_GRAPH_OPTION_X',
      type,
    );
    this.distributionDatas.distributionGraphOptionsX.selected = type;
    this.datas && this.init();
  }

  changeGraphTypeY(type: string) {
    localStorage.setItem(
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.LS_ID +
        'DISTRIBUTION_GRAPH_OPTION_Y',
      type,
    );
    this.distributionDatas.distributionGraphOptionsY.selected = type;
    this.datas && this.init();
  }

  onResized(event: ResizedEvent) {
    this.h = this.chart.nativeElement.offsetHeight + 10 - 60; // graph header = 60, +10 to take more height
    this.w = this.chart.nativeElement.offsetWidth;
    // if (!event.isFirst) {
    // Do it every timesto be sure that chart height has been computed
    this.datas && this.init();
    // }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.datas && this.init();
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
      this.datas && this.init();
    } else {
      // no bar selected
    }
  }

  init() {
    if (this.histogramCanvas) {
      this.cleanDomContext();
      // Get the 'context'
      this.ctx = this.histogramCanvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = true;

      this.histogramCanvas.width = this.w;
      this.histogramCanvas.height = this.h;

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
              if (
                this.distributionDatas.distributionGraphOptionsY.selected ===
                HistogramType.YLOG
              ) {
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
              this.addTooltip();

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

              if (
                this.distributionDatas.distributionGraphOptionsX.selected ===
                HistogramType.XLIN
              ) {
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

              this.isLoading = false;
            },
            this.isLoading ? 100 : 0,
          );
        }
      }
    }
  }

  /**
   * Before draw canvas, clean dom
   */
  cleanDomContext() {
    this.ctx = this.histogramCanvas.getContext('2d');
    this.ctx.clearRect(
      0,
      0,
      this.histogramCanvas.width,
      this.histogramCanvas.height,
    );
  }

  drawChart(chartW: number) {
    // Remove previous svg if exists
    // d3.select(this.chart.nativeElement).selectAll('*').remove();

    this.svg = d3
      .select(this.chart.nativeElement)
      .append('svg')
      .attr('width', chartW)
      .attr('height', this.h + this.yPadding);
  }

  addTooltip() {
    this.chartTooltip!.nativeElement.innerHTML = '';
    this.tooltip = d3
      .select(this.chartTooltip?.nativeElement)
      .append('div')
      .attr('class', 'tooltip');
  }

  drawRect(
    d: HistogramValuesI,
    i: number,
    bars: HistogramBarVO[],
    ratio: number = 0,
    selectedItem: number = 0,
  ) {
    let self = this;
    const bar = bars[i];

    const isFirstInterval = i === 0;

    let barX: number, barH: number, barW: number;

    if (
      this.distributionDatas.distributionGraphOptionsX.selected ===
      HistogramType.XLIN
    ) {
      barX = ((this.w - 2 * this.xPadding) / ratio) * bar.barXlin;
      barW = ((this.w - 2 * this.xPadding) / ratio) * bar.barWlin;
    } else {
      barX = ((this.w - 2 * this.xPadding) / ratio) * bar.barXlog;
      barW = ((this.w - 2 * this.xPadding) / ratio) * bar.barWlog;
    }

    const generateColor = function () {
      const elStrokeColor = this.getAttribute('fill');
      d3.select(this).style('stroke', elStrokeColor);
      if (i === 0) {
        d3.select(this).style('stroke', self.barColor);
      }
      return self.barColor;
    };

    const onclickRect = function () {
      d3.select(this.parentNode)
        .selectAll('rect')
        .style('stroke', function () {
          //@ts-ignore
          const elStrokeColor = this.getAttribute('fill');
          return elStrokeColor;
        });

      d3.select(this).style('stroke', self.barColor);
      //@ts-ignore
      d3.select(this).moveToFront();
      self.selectedItemChanged.emit(i);
    };
    const mouseover = function () {
      self.tooltip.style('display', 'block').style('width', '140px');
      d3.select(this.parentNode).selectAll('rect').style('fill-opacity', '0.8');
      d3.select(this).style('fill-opacity', '0.9');
    };
    const mousemove = (e: MouseEvent) => {
      const tooltipText = HistogramUIService.generateTooltip(
        d,
        isFirstInterval,
      );
      self.tooltip.html(tooltipText);

      let left = e.offsetX + 20;
      let top = e.offsetY - 40;

      if (left < 10) {
        left = 10;
      }
      if (left > this.w - 170) {
        left = e.offsetX - 170;
      }
      if (top < 10) {
        top = 10;
      }
      self.tooltip.style('margin-left', left + 'px');
      self.tooltip.style('margin-top', top + 'px');
    };
    const mouseleave = function () {
      self.tooltip
        .style('display', 'none')
        .style('margin-left', '0px')
        .style('margin-top', '0px');

      d3.select(this.parentNode).selectAll('rect').style('fill-opacity', '0.8');
    };

    if (barW > 3) {
      barW = barW - 2; // -2 to remove stroke width (outer and cannot be inner)
    }

    if (
      this.distributionDatas.distributionGraphOptionsY.selected ===
      HistogramType.YLIN
    ) {
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
    if (
      this.distributionDatas.distributionGraphOptionsY.selected ===
        HistogramType.YLOG &&
      barH === 0
    ) {
      barH = this.minBarHeight;
    }

    const x = barX + this.xPadding + this.xPadding / 2;
    const y = this.h - barH;

    // keep current coords to bind clicks and tooltip
    d.coords = {
      x: x,
      y: y,
      barW: barW,
      barH: barH,
    };

    this.ctx.fillStyle = UtilsService.hexToRgba(bar.color, 0.8);
    this.ctx.lineWidth = 0;
    this.ctx.fillRect(x, y, barW, barH);
    this.ctx.strokeStyle = selectedItem === i ? 'black' : bar.color;
    this.ctx.lineWidth = selectedItem === i ? 2 : 1;

    // Draw edges
    this.ctx.strokeRect(x - 0.5, y - 0.5, barW + 1, barH);

    // this.svg
    //   .append('rect')
    //   .attr('id', 'rect-' + i)
    //   .attr('x', x)
    //   .attr('y', y)
    //   .on('click', onclickRect)
    //   .on('mouseover', mouseover)
    //   .on('mousemove', mousemove)
    //   .on('mouseleave', mouseleave)
    //   .attr('width', barW)
    //   .attr('height', barH)
    //   .attr('fill-opacity', '0.8')
    //   .attr('fill', bar.color)
    //   .attr('stroke', generateColor)
    //   .attr('stroke-width', '2px');
  }

  drawHistogram(datasSet: HistogramValuesI[]) {
    let bars: HistogramBarVO[] = this.histogramService.computeXbarDimensions(
      datasSet,
      this.distributionDatas.distributionGraphOptionsX.selected,
    );
    this.ratio = 0;
    if (
      this.distributionDatas.distributionGraphOptionsX.selected ===
      HistogramType.XLIN
    ) {
      this.ratio =
        bars[bars.length - 1].barXlin + bars[bars.length - 1].barWlin;
    } else {
      this.ratio =
        bars[bars.length - 1].barXlog + bars[bars.length - 1].barWlog;
    }

    datasSet.forEach((d: HistogramValuesI, i: number) => {
      this.drawRect(d, i, bars, this.ratio, this.selectedItem);
    });
    // reDraw selected item in front of others
    this.drawRect(
      datasSet[this.selectedItem],
      this.selectedItem,
      bars,
      this.ratio,
      this.selectedItem,
    );
  }

  drawXAxis(domain: number[], shift: number, width: number) {
    if (width !== 0) {
      let xAxis;
      shift = shift + this.xPadding;

      if (
        this.distributionDatas.distributionGraphOptionsX.selected ===
        HistogramType.XLIN
      ) {
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

      if (
        this.distributionDatas.distributionGraphOptionsX.selected ===
        HistogramType.XLIN
      ) {
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

  formatTick(val: number) {
    return format(val, this.formatOpts);
  }

  drawYAxis() {
    let y;

    // Create the scale
    if (
      this.distributionDatas.distributionGraphOptionsY.selected ===
      HistogramType.YLIN
    ) {
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
        if (
          this.distributionDatas.distributionGraphOptionsY.selected ===
          HistogramType.YLIN
        ) {
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
