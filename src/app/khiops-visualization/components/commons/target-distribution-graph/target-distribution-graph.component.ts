import {
  Component,
  Input,
  OnInit,
  EventEmitter,
  NgZone,
  Output,
} from '@angular/core';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { ScrollableGraphComponent } from '@khiops-library/components/scrollable-graph/scrollable-graph.component';
import { TranslateService } from '@ngstack/translate';
import { ToPrecisionPipe } from '@khiops-library/pipes/to-precision.pipe';
import { ChartColorsSetI } from '@khiops-library/interfaces/chart-colors-set';
import { ChartOptions } from 'chart.js';
import { ConfigService } from '@khiops-library/providers/config.service';
import { ResizedEvent } from 'angular-resize-event';
import { TYPES } from '@khiops-library/enum/types';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { AppService } from '@khiops-visualization/providers/app.service';
import { LS } from '@khiops-library/enum/ls';

@Component({
  selector: 'app-target-distribution-graph',
  templateUrl: './target-distribution-graph.component.html',
  styleUrls: ['./target-distribution-graph.component.scss'],
  providers: [ToPrecisionPipe],
})
export class TargetDistributionGraphComponent
  extends ScrollableGraphComponent
  implements OnInit
{
  @Input() position = 0;
  @Input() override inputDatas: ChartDatasModel = undefined;
  @Input() titleTooltip: string;
  @Input() title: string;
  @Input() activeEntries: number;
  @Input() override scrollPosition = 0;
  @Input() displayedValues: ChartToggleValuesI[];
  @Input() isLoadingDatas = false;
  @Input() showFullscreenBtn = false;

  override view: any = undefined; // managed into ScrollableGraphComponent

  @Output() graphTypeChanged: EventEmitter<any> = new EventEmitter();
  @Output() targetDistributionGraphDisplayedValuesChanged: EventEmitter<any> =
    new EventEmitter();
  @Output() selectedItemChanged: EventEmitter<any> = new EventEmitter();
  override graphIdContainer: string | undefined = undefined;

  componentType = COMPONENT_TYPES.ND_BAR_CHART; // needed to copy datas

  colorSet: ChartColorsSetI;
  graphOptions = {
    types: [TYPES.PROBABILITIES, TYPES.LIFT],
    selected: undefined,
  };
  hideGraph: boolean;
  initialViewCheck = false;
  legend: any[];
  buttonTitle: string;
  chartOptions: ChartOptions;
  override maxScale: number = 0;
  override minScale: number = 0;
  selectedBarIndex: number;
  isFullscreen = false;
  isSmallDiv = false;

  constructor(
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
    private translate: TranslateService,
    private toPrecision: ToPrecisionPipe,
    private khiopsLibraryService: KhiopsLibraryService,
  ) {
    super(selectableService, ngzone, configService);
    // Needed for scroll component
    this.maxScale =
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_GRAPH_SCALE;
    this.minScale =
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.MIN_GRAPH_SCALE;

    this.graphOptions.selected = AppService.Ls.get(
      LS.TARGET_DISTRIBUTION_GRAPH_OPTION,
      this.graphOptions.types[0],
    );

    this.colorSet = this.khiopsLibraryService.getGraphColorSet()[1];
    this.hideGraph = true;
    this.buttonTitle = this.translate.get('GLOBAL.VALUES');

    // Keep this into ref to access it into tick callback
    // We can not use arrow function to access native getLabelForValue function
    let self = this;

    // Override tooltip infos
    this.chartOptions = {
      plugins: {
        tooltip: {
          callbacks: {
            beforeLabel: (items: any) => {
              if (items?.dataset) {
                return this.toPrecision.transform(
                  items.dataset.extra[items.dataIndex].extra.value,
                );
              }
              return undefined;
            },
            afterLabel: (items: any) => {
              if (items?.dataset) {
                let value = this.toPrecision.transform(
                  items.dataset.data[items.dataIndex],
                );
                if (this.graphOptions.selected === TYPES.PROBABILITIES) {
                  value = value + '%';
                }
                return value;
              }
              return undefined;
            },
          },
        },
      },
      scales: {
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
    this.graphIdContainer = 'target-distribution-graph-comp-' + this.position;
    this.title = this.title || this.translate.get('GLOBAL.TARGET_DISTRIBUTION');
  }

  onResized(event: ResizedEvent) {
    this.isSmallDiv = event?.newRect?.width < 600;
  }

  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
    setTimeout(() => {
      this.resizeGraph();
    });
  }

  onSelectBarChanged(e: number) {
    // Debounce each events
    // Each bar of grouped chart launch same event
    if (this.selectedBarIndex !== e) {
      // pass event from chart to parent
      this.selectedItemChanged.emit(e);
    }
    this.selectedBarIndex = e;
  }

  changeGraphType(type: string) {
    // this.trackerService.trackEvent('click', 'target_distribution_graph_type', type);
    AppService.Ls.set(LS.TARGET_DISTRIBUTION_GRAPH_OPTION, type);

    this.graphTypeChanged.emit(type);
  }

  onSelectToggleButtonChanged(displayedValues: ChartToggleValuesI) {
    this.targetDistributionGraphDisplayedValuesChanged.emit(displayedValues);
  }
}