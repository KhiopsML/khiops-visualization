import { DynamicI } from '@khiops-library/interfaces/globals';
import { ModelingReport } from './modeling-report';
import { TrainEvaluationReport } from './train-evaluation-report';
import { TestEvaluationReport } from './test-evaluation-report';
import { PreparationReport } from './preparation-report';
import { TreePreparationReport } from './tree-preparation-report';
import { BivariatePreparationReport } from './bivariate-preparation-report';
import { TextPreparationReport } from './text-preparation-report';
import { EvaluationReport } from './evaluation-report';

export interface AppDatasI {
  datas?: VisualizationDatas;
}

export interface VisualizationDatas {
  tool: string;
  version: string;
  shortDescription: string;
  modelingReport: ModelingReport;
  trainEvaluationReport: TrainEvaluationReport;
  testEvaluationReport: TestEvaluationReport;
  preparationReport: PreparationReport;
  treePreparationReport: TreePreparationReport;
  bivariatePreparationReport: BivariatePreparationReport;
  textPreparationReport: TextPreparationReport;
  evaluationReport: EvaluationReport;
  logs: Log[];
  savedDatas: DynamicI;
}

interface Log {
  taskName: string;
  messages: string[];
}

export interface VariableDetail {
  dataGrid: DataGrid;
  inputValues?: InputValues;
}

export interface DataGrid {
  isSupervised: boolean;
  dimensions: DimensionVisualization[];
  partTargetFrequencies: number[][];
  partInterests: number[];
  frequencies?: number[];
}

export interface InputValues {
  values: string[];
  frequencies: number[];
}

export interface DimensionVisualization {
  variable: string;
  type: string;
  partitionType: string;
  partition: number[][] | string[];
  defaultGroupIndex?: number;
}
export interface RecCurve {
  regressor: string;
  values: number[];
}

export interface LiftCurve {
  targetValue: string;
  curves: Curve[];
}

export interface Curve {
  classifier: string;
  values: number[];
}

export interface TargetValues {
  frequencies: number[];
  values: string[];
}
