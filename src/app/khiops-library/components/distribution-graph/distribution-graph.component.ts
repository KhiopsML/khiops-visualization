import {
  Component,
  Input,
  Output,
  NgZone,
  OnInit,
  EventEmitter,
} from '@angular/core';
import { SelectableService } from '../selectable/selectable.service';
import { ScrollableGraphComponent } from '../scrollable-graph/scrollable-graph.component';
import { KhiopsLibraryService } from '../../providers/khiops-library.service';
import { ToPrecisionPipe } from '../../pipes/to-precision.pipe';
import * as _ from 'lodash'; // Important to import lodash in karma
import { ChartColorsSetI } from '../../interfaces/chart-colors-set';
import { ChartOptions } from 'chart.js';
import { ConfigService } from '@khiops-library/providers/config.service';
import { TYPES } from '@khiops-library/enum/types';
import { HistogramType } from '@khiops-visualization/components/commons/histogram/histogram.types';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { DistributionOptionsI } from '@khiops-library/interfaces/distribution-options';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { LS } from '@khiops-library/enum/ls';
import { Ls } from '@khiops-library/providers/ls.service';
import { TranslateService } from '@ngstack/translate';

@Component({
  selector: 'kl-distribution-graph',
  templateUrl: './distribution-graph.component.html',
  styleUrls: ['./distribution-graph.component.scss'],
  providers: [ToPrecisionPipe],
})
export class DistributionGraphComponent
  extends ScrollableGraphComponent
  implements OnInit
{
  @Input() public position = 0;
  @Input() public override inputDatas: ChartDatasModel = undefined;
  @Input() public graphOptions: DistributionOptionsI;
  @Input() public activeEntries: number;
  @Input() public hideGraphOptions = false;

  @Output() private graphTypeChanged: EventEmitter<any> = new EventEmitter();
  @Output() private selectedItemChanged: EventEmitter<any> = new EventEmitter();

  public override graphIdContainer: string | undefined = undefined;
  public override maxScale: number = 0;
  public override minScale: number = 0;
  public componentType = COMPONENT_TYPES.BAR_CHART; // needed to copy datas
  public colorSet: ChartColorsSetI;
  public chartOptions: ChartOptions;

  constructor(
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
    private toPrecision: ToPrecisionPipe,
    private translate: TranslateService,
    private khiopsLibraryService: KhiopsLibraryService,
    private ls: Ls,
  ) {
    super(selectableService, ngzone, configService);

    this.colorSet = this.khiopsLibraryService.getGraphColorSet()[2];

    // Needed for scroll component
    this.maxScale =
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_GRAPH_SCALE;
    this.minScale =
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.MIN_GRAPH_SCALE;

    // Keep this into ref to access it into tick callback
    // We can not use arrow function to access native getLabelForValue function
    let self = this;

    // Override tooltip infos
    this.chartOptions = {
      plugins: {
        tooltip: {
          callbacks: {
            label: (items: any) => {
              if (items?.dataset) {
                if (
                  !this.hideGraphOptions &&
                  this.graphOptions?.selected === HistogramType.YLIN
                ) {
                  return this.toPrecision.transform(
                    items.dataset.extra[items.dataIndex].extra.coverageValue,
                  );
                } else if (
                  !this.hideGraphOptions &&
                  this.graphOptions?.selected === HistogramType.YLOG
                ) {
                  return this.toPrecision.transform(
                    items.dataset.extra[items.dataIndex].extra.value,
                  );
                } else {
                  return this.toPrecision.transform(
                    items.dataset.data[items.dataIndex],
                  );
                }
              }
              return undefined;
            },
            afterLabel: (items: any) => {
              if (items?.dataset) {
                if (
                  !this.hideGraphOptions &&
                  this.graphOptions?.selected === HistogramType.YLIN
                ) {
                  if (items.dataset.extra[items.dataIndex].extra.percent) {
                    return (
                      this.toPrecision.transform(
                        items.dataset.extra[items.dataIndex].extra.percent,
                      ) + '%'
                    );
                  } else {
                    return this.toPrecision.transform(
                      items.dataset.extra[items.dataIndex].extra.value,
                    );
                  }
                }
              }
              return undefined;
            },
          },
        },
      },
      scales: {
        y: {
          ticks: {
            callback: (value) => {
              if (
                !this.hideGraphOptions &&
                this.graphOptions?.selected === HistogramType.YLOG
              ) {
                // Frequency log mode
                if (
                  value.toString().startsWith('0') ||
                  value.toString().startsWith('1')
                ) {
                  return value.toLocaleString();
                } else {
                  return '';
                }
              } else {
                if (typeof value === 'number') {
                  return Math.round(value * 100) / 100;
                } else {
                  return value;
                }
              }
            },
          },
        },
        x: {
          ticks: {
            // @ts-ignore
            callback: function (value: number, index: number, e) {
              let label = this.getLabelForValue(value);
              label = UtilsService.ellipsis(
                label,
                self.khiopsLibraryService.getAppConfig().common.GLOBAL
                  .MAX_LABEL_LENGTH,
              );
              // Default chartjs
              return label;
            },
          },
        },
      },
    };
  }

  ngOnInit() {
    this.graphIdContainer = 'distribution-graph-comp-' + this.position;
    this.updateChartOptions();
  }

  onSelectBarChanged(e) {
    // pass event from chart to parent
    this.selectedItemChanged.emit(e);
  }

  changeGraphType(type) {
    // this.trackerService.trackEvent('click', 'distribution_graph_type', this.graphOptions.selected);
    this.ls.set(LS.DISTRIBUTION_GRAPH_OPTION_Y, type);
    this.updateChartOptions();
    this.graphTypeChanged.emit(type);
  }

  private updateChartOptions() {
    this.chartOptions.scales.y.max = undefined;
    this.chartOptions.scales.y.min = undefined;

    // Histogram: Missing logarithmic scale for "frequency" mode #185
    this.chartOptions.scales.y.type =
      this.graphOptions.selected === TYPES.FREQUENCY
        ? TYPES.LOGARITHMIC
        : TYPES.LINEAR;

    let minValues = this.inputDatas?.datasets?.[0]?.data;
    let minValue = 0;
    if (minValues) {
      minValue = Math.min(...minValues);
    }

    if (minValue > 0) {
      this.chartOptions.scales.y.min = 0;
    } else {
      this.chartOptions.scales.y.min = minValue;
    }
    this.chartOptions = _.cloneDeep(this.chartOptions);
  }
}
