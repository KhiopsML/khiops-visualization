import { Component, OnInit } from '@angular/core';
import { AppService } from '../../providers/app.service';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { EvaluationDatasService } from '@khiops-visualization/providers/evaluation-datas.service';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { EvaluationDatasVO } from '@khiops-visualization/model/evaluation-datas-vo';
import { EvaluationPredictorVO } from '@khiops-visualization/model/evaluation-predictor-vo';
import { EvaluationTypeVO } from '@khiops-visualization/model/evaluation-type-vo';
import { TrackerService } from '../../../khiops-library/providers/tracker.service';

@Component({
  selector: 'app-evaluation-view',
  templateUrl: './evaluation-view.component.html',
  styleUrls: ['./evaluation-view.component.scss'],
})
export class EvaluationViewComponent
  extends SelectableTabComponent
  implements OnInit
{
  sizes: any;

  // managed by selectable-tab component
  override tabIndex = 4;
  summaryDatas: InfosDatasI[];
  evaluationDatas: EvaluationDatasVO;

  constructor(
    private trackerService: TrackerService,
    private appService: AppService,
    private evaluationDatasService: EvaluationDatasService,
  ) {
    super();

    this.sizes = this.appService.getViewSplitSizes('evaluationView');
    this.evaluationDatas = this.evaluationDatasService.getDatas();
    this.evaluationDatasService.getEvaluationTypes();
    this.evaluationDatasService.getEvaluationTypesSummary();
    this.evaluationDatasService.getPredictorEvaluations();
    this.evaluationDatasService.getConfusionMatrix();
  }

  onSplitDragEnd(event: any, item: string) {
    this.appService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      'evaluationView',
    );
  }

  ngOnInit() {
    this.trackerService.trackEvent('page_view', 'evaluation');
  }

  onSelectEvaluationTypeChanged(item: EvaluationTypeVO) {
    this.evaluationDatasService.setSelectedEvaluationTypeVariable(item);
    const predictorEvaluationVariable =
      this.evaluationDatasService.getPredictorEvaluationVariableFromEvaluationType(
        item.type,
      );
    this.evaluationDatasService.setSelectedPredictorEvaluationVariable(
      predictorEvaluationVariable,
    );
    this.evaluationDatasService.getConfusionMatrix();
  }

  onSelectPredictorEvaluationChanged(item: EvaluationPredictorVO) {
    this.evaluationDatasService.setSelectedPredictorEvaluationVariable(item);
    const evaluationVariable =
      this.evaluationDatasService.getEvaluationVariableFromPredictorEvaluationType(
        item.type,
      );
    this.evaluationDatasService.setSelectedEvaluationTypeVariable(
      evaluationVariable,
    );
    this.evaluationDatasService.getConfusionMatrix();
  }

  onDataTypeChanged(type: string) {
    this.evaluationDatasService.getConfusionMatrix(type);
  }
}
