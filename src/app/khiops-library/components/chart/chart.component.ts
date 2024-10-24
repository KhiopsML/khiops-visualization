import {
  Component,
  Input,
  EventEmitter,
  Output,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ElementRef,
} from '@angular/core';
import * as ChartJs from 'chart.js';

import { UtilsService } from '../../providers/utils.service';
import { KhiopsLibraryService } from '../../providers/khiops-library.service';
import { ChartColorsSetI } from '../../interfaces/chart-colors-set';
import { ChartOptions } from 'chart.js';
import { ConfigService } from '@khiops-library/providers/config.service';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { ChartDatasetModel } from '@khiops-library/model/chart-dataset.model';
import { LS } from '@khiops-library/enum/ls';
import { Ls } from '@khiops-library/providers/ls.service';
import { CHART_TYPES } from '@khiops-library/enum/chart-types';
import { THEME } from '@khiops-library/enum/theme';

@Component({
  selector: 'kl-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements AfterViewInit, OnChanges {
  @Input() public canvasIdContainer = 'kl-chart'; // May be updated if multiple graph
  @Input() private inputDatas: ChartDatasModel | undefined;
  @Input() private activeEntries: number | undefined;
  @Input() private type: ChartJs.ChartType = CHART_TYPES.BAR;
  @Input() private chartOptions: ChartOptions | undefined;
  @Input() private colorSet: ChartColorsSetI | undefined;
  @Input() private enableSelection = true;
  @Input() private selectedLineChartItem: string | undefined;

  @Output() private selectBarIndex: EventEmitter<number> = new EventEmitter();

  private ctx: ChartJs.ChartItem | undefined;
  private chart: ChartJs.Chart | undefined;
  private color: string = '';
  private barColor: string = '';
  private fontColor: string = '#999';

  constructor(
    private ls: Ls,
    private configService: ConfigService,
    private el: ElementRef,
    private khiopsLibraryService: KhiopsLibraryService,
  ) {
    this.color =
      this.ls.get(LS.THEME_COLOR) === THEME.DARK ? '#555' : '#e5e5e5';
    this.barColor =
      this.ls.get(LS.THEME_COLOR) === THEME.DARK
        ? 'rgba(255, 255, 255, 1)'
        : 'rgba(0, 0, 0, 1)';
    this.colorSet = this.khiopsLibraryService.getGraphColorSet()[0];
  }

  ngOnInit() {
    // Keep a ref of instance
    this.el.nativeElement.componentInstance = this;
  }

  ngAfterViewInit(): void {
    this.initChart();
  }

  private initChart() {
    this.ctx = <ChartJs.ChartItem>(
      this.configService
        .getRootElementDom()
        .querySelector<HTMLElement>('#' + this.canvasIdContainer)
    );

    if (this.ctx) {
      // Destroy old chart if exists
      // Do it even if canvas is undefined to remove other canvas ids
      try {
        this.chart?.destroy();
      } catch (e) {}

      const chartAreaBorder = {
        id: 'chartAreaBorder',
        beforeDraw(chart: any, args: any, options: ChartJs.LineOptions) {
          const {
            ctx,
            chartArea: { left, top, width, height },
          } = chart;
          ctx.save();
          ctx.strokeStyle = options.borderColor;
          ctx.lineWidth = options.borderWidth;
          ctx.setLineDash(options.borderDash || []);
          ctx.lineDashOffset = options.borderDashOffset;
          ctx.strokeRect(left, top, width, height);
          ctx.restore();
        },
      };

      let options: ChartOptions | any = {
        plugins: {
          chartAreaBorder: {
            borderColor: 'transparent',
            borderWidth: 0,
          },
          tooltip: {
            callbacks: {
              title: (items: any) => {
                if (items?.[0]) {
                  return items[0].label;
                }
              },
              label: (items: any) => {
                if (items?.[0]) {
                  return items[0].dataset.label;
                } else if (items?.dataset) {
                  return items.dataset.label;
                }
              },
            },
            backgroundColor: 'rgba(27, 36, 67, 0.9)',
          },
          legend: {
            display: false,
          },
        },
        interaction: {
          mode: 'point',
        },
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        onClick: this.graphClickEvent.bind(this),
        scales: {
          y: {
            border: {
              dash: [5, 5],
              display: false,
            },
            grid: {
              color: this.color,
              drawTick: false,
            },
            beginAtZero: true,
            min: 0,
            ticks: {
              color: this.fontColor,
              maxTicksLimit: 7,
              callback: function (value: any) {
                // Fix axis labels display on responsive small size
                // For example 50 is displayed 50,00000000000
                return value;
              },
            },
          },
          x: {
            border: {
              dash: [5, 5],
              display: false,
            },
            grid: {
              color: this.color,
              drawTick: false,
              display: false,
            },
            min: 0,
            ticks: {
              color: this.fontColor,
              autoSkip: true,
              autoSkipPadding: 5,
              maxRotation: 0,
              minRotation: 0,
            },
          },
        },
      };

      // Merge chart options
      options = UtilsService.mergeDeep(options, this.chartOptions);
      ChartJs.Chart.register.apply(
        null,
        // @ts-ignore
        Object.values(ChartJs).filter((chartClass) => chartClass.id),
      );

      const data: ChartJs.ChartData = { datasets: [], labels: [] };
      const config: ChartJs.ChartConfiguration = {
        type: this.type,
        data: data,
        options: options,
        plugins: [chartAreaBorder],
      };
      this.chart = new ChartJs.Chart(this.ctx, config);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      this.chart &&
      changes.selectedLineChartItem &&
      changes.selectedLineChartItem.currentValue !== undefined
    ) {
      // can be ''
      this.colorize();
      this.chart.update();
    }

    if (changes.inputDatas?.currentValue) {
      this.updateGraph();
    }

    if (changes.chartOptions?.currentValue) {
      // We must reconstruct the chart if the scale change
      this.initChart();
    }

    if (
      changes.activeEntries &&
      changes.activeEntries.currentValue !== undefined
    ) {
      // can be 0
      this.updateGraph();
    }

    if (changes.scaleValue?.currentValue && !changes.scaleValue.firstChange) {
      this.updateGraph();
    }
  }

  private updateGraph() {
    setTimeout(() => {
      if (this.inputDatas && this.chart) {
        // Update datas
        // @ts-ignore force khiops VO into Chart dataset
        this.chart.data.datasets = this.inputDatas.datasets;
        this.chart.data.labels = this.inputDatas.labels;

        this.colorize();
        if (this.activeEntries !== undefined) {
          // can be 0
          // Select previous value if set
          this.selectCurrentBarIndex(this.activeEntries);
        }
        this.chart.update();
      }
    });
  }

  public hideActiveEntries() {
    this.selectCurrentBarIndex(undefined);
    this.chart?.update();
  }

  public showActiveEntries() {
    this.selectCurrentBarIndex(this.activeEntries);
    this.chart?.update();
  }

  private graphClickEvent(e: any, items: string | any[]) {
    if (this.enableSelection) {
      const l = items.length;
      if (l > 0) {
        for (let i = 0; i < l; i++) {
          // undefined if click outside bar
          const selectedIndex = items[i].index;
          this.selectCurrentBarIndex(selectedIndex);
          this.selectBarIndex.emit(items[i].index);
          this.chart?.update();
        }
      }
    }
  }

  private selectCurrentBarIndex(index: number | undefined) {
    if (this.chart && this.enableSelection) {
      this.colorize();
      for (let i = 0; i < this.chart.data.datasets.length; i++) {
        const dataset = <ChartDatasetModel>this.chart.data.datasets[i];
        dataset.borderColor[index] = this.barColor;
        dataset.borderSkipped = false;
        dataset.borderWidth = 2;
      }
    }
  }

  private colorize() {
    if (this.chart && this.inputDatas) {
      for (let i = 0; i < this.chart.data.datasets.length; i++) {
        const dataset: ChartDatasetModel = <ChartDatasetModel>(
          this.chart.data.datasets[i]
        );
        if (!dataset.borderWidth) {
          dataset.borderSkipped = false;
          dataset.borderWidth = 2;
        }

        dataset.backgroundColor = new Array(this.inputDatas.labels.length).fill(
          UtilsService.hexToRGBa(this.colorSet?.domain[i], 0.8),
        );
        const defaultGroupIndex = dataset.extra?.findIndex(
          (e: any) => e.defaultGroupIndex,
        );
        if (defaultGroupIndex !== -1) {
          dataset.backgroundColor[defaultGroupIndex] = UtilsService.hexToRGBa(
            this.colorSet?.domain[i],
            0.15,
          );
        }

        let borderOpacity = 1;
        if (dataset.type === CHART_TYPES.LINE) {
          // hide non selected lines
          if (this.selectedLineChartItem === '') {
            dataset.borderWidth = 2;
          }
          if (this.selectedLineChartItem && this.selectedLineChartItem !== '') {
            if (this.selectedLineChartItem !== dataset.label) {
              borderOpacity = 0.35;
            } else {
              dataset.borderWidth = 4;
            }
          }
        }

        dataset.borderColor = new Array(this.inputDatas.labels.length).fill(
          UtilsService.hexToRGBa(this.colorSet?.domain[i], borderOpacity),
        );
      }
    }
  }

  onKeyUp(event: KeyboardEvent) {
    if (this.activeEntries !== undefined) {
      // can be 0
      if (event.key === 'ArrowLeft' && this.activeEntries > 0) {
        this.activeEntries = this.activeEntries - 1;
      }
      if (
        event.code === 'ArrowRight' &&
        this.activeEntries < this.inputDatas.labels.length - 1
      ) {
        this.activeEntries = this.activeEntries + 1;
      }
      this.selectCurrentBarIndex(this.activeEntries);
      this.chart?.update();
      this.selectBarIndex.emit(this.activeEntries);
    }
  }
}
