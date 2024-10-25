import { DynamicI } from '@khiops-library/interfaces/globals';
import { ModelingReport } from './modeling-report';
import { TrainEvaluationReport } from './train-evaluation-report';
import { TestEvaluationReport } from './test-evaluation-report';
import { PreparationReport } from './preparation-report';
import { TreePreparationReport } from './tree-preparation-report';
import { BivariatePreparationReport } from './bivariate-preparation-report';
import { TextPreparationReport } from './text-preparation-report';

export interface AppDatasI {
  datas: VisualizationDatas;
  //   savedDatas?: any;
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
  evaluationReport: EvaluationReport | any;
  logs: Log[];
  savedDatas: DynamicI;
}

interface EvaluationReport {}

interface Log {
  taskName: string;
  messages: string[];
}

export interface VariablesDetailedStatistics {
  [key: string]: VariableDetail;
}

export interface VariableDetail {
  dataGrid: DataGrid;
  inputValues: InputValues;
}

export interface DataGrid {
  isSupervised: boolean;
  dimensions: Dimension[];
  partTargetFrequencies: number[][];
  partInterests: number[];
  frequencies: number[];
}

export interface InputValues {
  values: string[];
  frequencies: number[];
}

interface Dimension {
  variable: string;
  type: string;
  partitionType: string;
  partition: Array<string | string[]>; // Nested arrays for cases like ["L3"], ["L4"], etc.
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
