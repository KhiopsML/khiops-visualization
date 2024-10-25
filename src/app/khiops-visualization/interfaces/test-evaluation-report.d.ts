import { LiftCurve, RecCurve } from './curves';

export interface TestEvaluationReport {
  reportType: string;
  evaluationType: string;
  summary: Summary;
  predictorsPerformance: PredictorPerformance[];
  predictorsDetailedPerformance: PredictorsDetailedPerformance;
  recCurves: RecCurve[];
  liftCurves: LiftCurve[];
}

export interface Summary {
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

export interface PredictorPerformance {
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

export interface DataGrid {
  isSupervised: boolean;
  dimensions: Dimension[];
  partTargetFrequencies: number[][];
  partInterests: number[];
}

export interface Dimension {
  variable: string;
  type: string;
  partitionType: string;
  partition: number[] | string[];
}
