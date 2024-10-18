import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ElementRef,
  Input,
  NgZone,
  ViewChild,
} from '@angular/core';
import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { AppConfig } from 'src/environments/environment';
import { TranslateService } from '@ngstack/translate';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScrollableGraphComponent } from '@khiops-library/components/scrollable-graph/scrollable-graph.component';
import { ChartColorsSetI } from '@khiops-library/interfaces/chart-colors-set';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { ChartOptions } from 'chart.js';
import { ConfigService } from '@khiops-library/providers/config.service';
import { VariableModel } from '@khiops-visualization/model/variable.model';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';

@Component({
  selector: 'app-level-distribution-graph',
  templateUrl: './level-distribution-graph.component.html',
  styleUrls: ['./level-distribution-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LevelDistributionGraphComponent
  extends ScrollableGraphComponent
  implements OnInit
{
  @Input() datas: VariableModel[];
  @Input() levelDistributionTitle: string;

  override inputDatas: ChartDatasModel = undefined;
  colorSet: ChartColorsSetI;

  @ViewChild('levelGraph', {
    static: false,
  })
  levelGraph: ElementRef;

  // define an id to be copied into clipboard
  override id: any = 'level-distribution-graph-comp';

  override maxScale: number =
    AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.MAX_LENGTH;
  override minScale: number =
    AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.MIN_LENGTH;
  stepScale: number =
    AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.STEP;
  chartOptions: ChartOptions;

  componentType = COMPONENT_TYPES.BAR_CHART; // needed to copy datas
  override graphIdContainer = 'level-distribution-graph';

  constructor(
    private distributionDatasService: DistributionDatasService,
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private khiopsLibraryService: KhiopsLibraryService,
  ) {
    super(selectableService, ngzone, configService);

    this.colorSet = this.khiopsLibraryService.getGraphColorSet()[2];

    // Override tooltip infos
    this.chartOptions = {
      plugins: {
        tooltip: {
          callbacks: {
            label: (items) => {
              if (items && items.dataset) {
                return items.formattedValue;
              }
              return undefined;
            },
          },
        },
      },
    };
  }

  ngOnInit() {
    // load datas
    this.inputDatas =
      this.distributionDatasService.getLeveldistributionGraphDatas(this.datas);

    // simulate click on dialog to make copy available
    setTimeout(() => {
      this.levelGraph.nativeElement.click();

      // Resize graph after delay to set its width
      this.resizeGraph();
    }, 500); // do it after dialog creation complete

    if (
      this.inputDatas.labels.length ===
      AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.MAX_VARIABLES
    ) {
      this.snackBar.open(
        this.translate.get('SNACKS.TOO_MANY_VARIABLES'),
        undefined,
        {
          duration: 5000,
          panelClass: 'warning',
        },
      );
    }

    if (
      this.levelDistributionTitle === '' ||
      this.levelDistributionTitle === undefined
    ) {
      this.levelDistributionTitle = this.translate.get(
        'GLOBAL.LEVEL_DISTRIBUTION',
      );
    }
  }

  onScaleChanged(value: number) {
    // Save current scale value into ls
    localStorage.setItem(
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.LS_ID +
        'SCALE_VALUE',
      value.toString(),
    );
    this.scaleValue = value;
    this.resizeGraph();
  }
}
