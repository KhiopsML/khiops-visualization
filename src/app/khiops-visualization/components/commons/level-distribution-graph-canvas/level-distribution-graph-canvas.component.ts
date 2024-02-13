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
import { ScrollableGraphCanvasComponent } from '@khiops-library/components/scrollable-graph-canvas/scrollable-graph-canvas.component';
import { ChartColorsSetI } from '@khiops-library/interfaces/chart-colors-set';
import { ChartDatasVO } from '@khiops-library/model/chart-datas-vo';
import { ChartOptions } from 'chart.js';
import { ConfigService } from '@khiops-library/providers/config.service';

@Component({
  selector: 'app-level-distribution-graph',
  templateUrl: './level-distribution-graph-canvas.component.html',
  styleUrls: ['./level-distribution-graph-canvas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LevelDistributionGraphCanvasComponent
  extends ScrollableGraphCanvasComponent
  implements OnInit
{
  @Input() datas: string;
  @Input() levelDistributionTitle: string;

  inputDatas: ChartDatasVO = undefined;
  colorSet: ChartColorsSetI;

  @ViewChild('levelGraph', {
    static: false,
  })
  levelGraph: ElementRef;

  // define an id to be copied into clipboard
  id: any = 'level-distribution-graph-canvas-comp';

  maxScale: number =
    AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.MAX_LENGTH;
  minScale: number =
    AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.MIN_LENGTH;
  stepScale: number =
    AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.STEP;
  chartOptions: ChartOptions;

  componentType = '1dBarChart'; // needed to copy datas
  graphIdContainer = 'level-distribution-graph-canvas';

  constructor(
    private distributionDatasService: DistributionDatasService,
    public selectableService: SelectableService,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private khiopsLibraryService: KhiopsLibraryService,
    public ngzone: NgZone,
    public configService: ConfigService,
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
        null,
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

  onScaleChanged(event) {
    // Save current scale value into ls
    localStorage.setItem(
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.LS_ID +
        'SCALE_VALUE',
      event.value,
    );
    this.resizeGraph();
  }
}
