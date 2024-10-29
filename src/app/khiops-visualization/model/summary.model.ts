import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { BivariatePreparationSummary } from '@khiops-visualization/interfaces/bivariate-preparation-report';
import { EvaluationSummary } from '@khiops-visualization/interfaces/evaluation-report';
import { ModelingSummary } from '@khiops-visualization/interfaces/modeling-report';
import { PreparationSummary } from '@khiops-visualization/interfaces/preparation-report';
import { TestEvaluationSummary } from '@khiops-visualization/interfaces/test-evaluation-report';
import { TextPreparationSummary } from '@khiops-visualization/interfaces/text-preparation-report';
import { TrainEvaluationSummary } from '@khiops-visualization/interfaces/train-evaluation-report';
import { TreePreparationSummary } from '@khiops-visualization/interfaces/tree-preparation-report';

export class SummaryModel {
  dictionary!: string;
  database!: string;
  targetVariable!: string;
  instances!: string;
  learningTask!: string;
  samplePercentage!: number;
  samplingMode!: string;
  selectionVariable!: string;
  selectionValue!: string;
  evaluatedVariables!: string;

  displayDatas!: InfosDatasI[];

  constructor(
    summary:
      | TreePreparationSummary
      | TextPreparationSummary
      | TestEvaluationSummary
      | ModelingSummary
      | PreparationSummary
      | TrainEvaluationSummary
      | EvaluationSummary
      | BivariatePreparationSummary,
  ) {
    // Assign values from input
    Object.assign(this, summary);

    this.formatDatas();
  }

  formatDatas() {
    this.displayDatas = [];
    if (this.dictionary) {
      this.displayDatas.push({
        title: 'GLOBAL.DICTIONARY',
        value: this.dictionary,
      });
    }
    if (this.database) {
      this.displayDatas.push({
        title: 'GLOBAL.DATABASE',
        value: this.database,
      });
    }
    if (this.targetVariable) {
      this.displayDatas.push({
        title: 'GLOBAL.TARGET_VARIABLE',
        value: this.targetVariable,
      });
    }
    if (this.instances) {
      this.displayDatas.push({
        title: 'GLOBAL.INSTANCES',
        value: this.instances,
      });
    }
    if (this.learningTask) {
      this.displayDatas.push({
        title: 'GLOBAL.LEARNING_TASK',
        value: this.learningTask,
      });
    }
    if (this.samplePercentage) {
      this.displayDatas.push({
        title: 'GLOBAL.SAMPLE_PERCENTAGE',
        value: this.samplePercentage,
      });
    }
    if (this.samplingMode) {
      this.displayDatas.push({
        title: 'GLOBAL.SAMPLING_MODE',
        value: this.samplingMode,
      });
    }
    if (this.selectionVariable) {
      this.displayDatas.push({
        title: 'GLOBAL.SELECTION_VARIABLE',
        value: this.selectionVariable,
      });
    }
    if (this.selectionValue) {
      this.displayDatas.push({
        title: 'GLOBAL.SELECTION_VALUE',
        value: this.selectionValue,
      });
    }
    if (this.evaluatedVariables) {
      this.displayDatas.push({
        title: 'GLOBAL.EVALUATED_VARIABLES',
        value: this.evaluatedVariables,
      });
    }
  }
}
