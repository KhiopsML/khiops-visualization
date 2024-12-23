import {
  DataGrid,
  DimensionVisualization,
  LiftCurve,
  RecCurve,
} from './app-datas';

export interface TestEvaluationReport {
  reportType: string;
  evaluationType: string;
  summary: TestEvaluationSummary;
  predictorsPerformance: TestPredictorPerformance[];
  predictorsDetailedPerformance: PredictorsDetailedPerformance;
  recCurves: RecCurve[];
  liftCurves: LiftCurve[];
}

export interface TestEvaluationSummary {
  dictionary: string;
  database: string;
  samplePercentage: number;
  samplingMode: string;
  selectionVariable: string;
  selectionValue: string;
  instances: number;
  learningTask: string;
  targetVariable: string;
  mainTargetValue: string;
}

export interface TestPredictorPerformance {
  rank: string;
  type: string;
  family: string;
  name: string;
  accuracy: number;
  compression: number;
  auc: number;
}

export interface PredictorsDetailedPerformance {
  [key: string]: PredictorDetail;
}

export interface PredictorDetail {
  confusionMatrix: ConfusionMatrix;
  dataGrid?: DataGrid;
}

export interface ConfusionMatrix {
  values: string[];
  matrix: number[][];
}
