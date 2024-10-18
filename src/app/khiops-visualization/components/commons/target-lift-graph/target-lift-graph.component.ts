import {
  Component,
  OnChanges,
  Input,
  NgZone,
  SimpleChanges,
} from '@angular/core';
import { EvaluationDatasService } from '@khiops-visualization/providers/evaluation-datas.service';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { TranslateService } from '@ngstack/translate';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { AppConfig } from 'src/environments/environment';
import _ from 'lodash';
import { ChartColorsSetI } from '@khiops-library/interfaces/chart-colors-set';
import { ConfigService } from '@khiops-library/providers/config.service';
import { ChartOptions } from 'chart.js';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { EvaluationDatasModel } from '@khiops-visualization/model/evaluation-datas.model';
import { TargetLiftValuesI } from '@khiops-visualization/interfaces/target-lift-values';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';

@Component({
  selector: 'app-target-lift-graph',
  templateUrl: './target-lift-graph.component.html',
  styleUrls: ['./target-lift-graph.component.scss'],
})
export class TargetLiftGraphComponent
  extends SelectableComponent
  implements OnChanges
{
  @Input() selectedVariable;

  targetLift: TargetLiftValuesI;
  targetLiftGraph: ChartDatasModel;
  colorSet: ChartColorsSetI;
  legendColorSet: ChartColorsSetI;
  view: '';
  xAxisLabel: string;
  yAxisLabel: string;
  evaluationDatas: EvaluationDatasModel;
  buttonTitle: string;
  isFullscreen = false;

  componentType = COMPONENT_TYPES.ND_LINE_CHART; // needed to copy datas
  title: string;
  targetLiftAllGraph: ChartDatasModel;
  titleWithoutDetails: string;

  chartOptions: ChartOptions;

  constructor(
    public override selectableService: SelectableService,
    private evaluationDatasService: EvaluationDatasService,
    private translate: TranslateService,
    private khiopsLibraryService: KhiopsLibraryService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
  ) {
    super(selectableService, ngzone, configService);
    this.evaluationDatas = this.evaluationDatasService.getDatas();

    this.legendColorSet = _.cloneDeep(
      this.khiopsLibraryService.getGraphColorSet()[1],
    );
    this.colorSet = _.cloneDeep(
      this.khiopsLibraryService.getGraphColorSet()[1],
    );

    // Override tooltip infos
    this.chartOptions = {
      interaction: {
        intersect: true,
        mode: 'nearest',
      },
      datasets: {
        line: {
          pointRadius: 0, // disable for all `'line'` datasets
        },
      },
      elements: {
        point: {
          radius: 0, // default to disabled in all datasets
        },
      },
      normalized: true,
      animation: false,
    };

    if (this.evaluationDatasService.isRegressionAnalysis()) {
      this.xAxisLabel = this.translate.get('GLOBAL.RANK_ERROR') + ' %';
      this.yAxisLabel = this.translate.get('GLOBAL.POPULATION') + ' %';
    } else {
      this.xAxisLabel = this.translate.get('GLOBAL.POPULATION') + ' %';
      this.yAxisLabel = this.translate.get('GLOBAL.TARGET_MODALITY') + ' %';
    }

    this.buttonTitle = this.translate.get('GLOBAL.FILTER_CURVES');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.selectedVariable?.currentValue) {
      this.getDatas();
    }
  }

  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
    setTimeout(() => {
      this.getDatas();
    });
  }

  getDatas() {
    const currentTarget = this.targetLift?.selected || undefined;
    this.targetLift = this.evaluationDatasService.getLiftTargets(currentTarget);

    if (this.targetLift) {
      // Get previous selected target if compatible
      const previousSelectedTarget = localStorage.getItem(
        AppConfig.visualizationCommon.GLOBAL.LS_ID + 'TARGET_LIFT',
      );
      if (
        previousSelectedTarget &&
        this.targetLift.targets.includes(previousSelectedTarget)
      ) {
        this.targetLift.selected = previousSelectedTarget;
      }

      this.titleWithoutDetails = this.translate.get(
        'GLOBAL.CUMULATIVE_GAIN_CHART_OF',
      );
      this.title =
        this.translate.get('GLOBAL.CUMULATIVE_GAIN_CHART_OF') +
        ' ' +
        this.targetLift.selected; // for copy graph datas
      this.targetLiftGraph = this.evaluationDatasService.getLiftGraphDatas(
        this.targetLift.selected,
      );
      // get all datas to copy
      this.targetLiftAllGraph = this.evaluationDatasService.getLiftGraphDatas(
        this.targetLift.selected,
      );
    } else {
      // it is a regression
      this.titleWithoutDetails = this.translate.get('GLOBAL.REC_CURVES');
      this.title = this.translate.get('GLOBAL.REC_CURVES'); // for copy graph datas
      this.targetLiftGraph = this.evaluationDatasService.getLiftGraphDatas();
      // get all datas to copy
      this.targetLiftAllGraph =
        this.evaluationDatasService.getLiftGraphDatas(null);
    }
  }

  onSelectToggleButtonChanged(displayedValues) {
    this.getDatas();

    this.colorSet = _.cloneDeep(
      this.khiopsLibraryService.getGraphColorSet()[1],
    );

    // Remove hidden curves colors
    let i = displayedValues.length;
    while (i--) {
      if (displayedValues[i].show === false) {
        this.colorSet.domain.splice(i, 1);
      }
    }
  }

  changeTargetLift(target) {
    // this.trackerService.trackEvent('click', 'change_target_lift');
    this.title =
      this.translate.get('GLOBAL.CUMULATIVE_GAIN_CHART_OF') +
      ' ' +
      this.targetLift.selected;
    localStorage.setItem(
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.LS_ID +
        'TARGET_LIFT',
      target,
    );
    this.targetLift.selected = target;
    this.getDatas();
  }
}
