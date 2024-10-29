import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { BivariatePreparationSummary } from '@khiops-visualization/interfaces/bivariate-preparation-report';
import { EvaluationSummary } from '@khiops-visualization/interfaces/evaluation-report';
import { ModelingSummary } from '@khiops-visualization/interfaces/modeling-report';
import { PreparationSummary } from '@khiops-visualization/interfaces/preparation-report';
import { TestEvaluationSummary } from '@khiops-visualization/interfaces/test-evaluation-report';
import { TextPreparationSummary } from '@khiops-visualization/interfaces/text-preparation-report';
import { TrainEvaluationSummary } from '@khiops-visualization/interfaces/train-evaluation-report';
import { TreePreparationSummary } from '@khiops-visualization/interfaces/tree-preparation-report';

export class InformationsModel {
  evaluatedVariables!: number;
  constructedVariables!: number;
  informativeVariables!: number;
  informativeVariablePairs!: number;
  selectedVariables!: number;
  selectedVariablePairs!: number;
  discretization!: string;
  valueGrouping!: string;
  evaluatedVariablePairs!: number;

  displayDatas: InfosDatasI[] | undefined;

  constructor(
    object:
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
    Object.assign(this, object);

    this.formatDatas();
  }

  formatDatas() {
    this.displayDatas = [];
    if (this.evaluatedVariables !== undefined) {
      this.displayDatas.push({
        title: 'GLOBAL.EVALUATED_VARIABLES',
        value: this.evaluatedVariables,
      });
    }
    if (this.evaluatedVariablePairs !== undefined) {
      this.displayDatas.push({
        title: 'GLOBAL.EVALUATED_VARIABLES_PAIRS',
        value: this.evaluatedVariablePairs,
      });
    }
    if (this.constructedVariables !== undefined) {
      this.displayDatas.push({
        title: 'GLOBAL.CONSTRUCTED_VARIABLES',
        value: this.constructedVariables,
      });
    }
    if (this.informativeVariables !== undefined) {
      this.displayDatas.push({
        title: 'GLOBAL.INFORMATIVE_VARIABLES',
        value: this.informativeVariables,
      });
    }
    if (this.informativeVariablePairs !== undefined) {
      this.displayDatas.push({
        title: 'GLOBAL.INFORMATIVE_VARIABLES_PAIRS',
        value: this.informativeVariablePairs,
      });
    }
    if (this.selectedVariables !== undefined) {
      this.displayDatas.push({
        title: 'GLOBAL.SELECTED_VARIABLES',
        value: this.selectedVariables,
      });
    }
    if (this.selectedVariablePairs !== undefined) {
      this.displayDatas.push({
        title: 'GLOBAL.SELECTED_VARIABLES_PAIRS',
        value: this.selectedVariablePairs,
      });
    }
    if (this.discretization !== undefined) {
      this.displayDatas.push({
        title: 'GLOBAL.DISCRETIZATION',
        value: this.discretization,
      });
    }
    if (this.valueGrouping !== undefined) {
      this.displayDatas.push({
        title: 'GLOBAL.VALUE_GROUPING',
        value: this.valueGrouping,
      });
    }
  }
}
