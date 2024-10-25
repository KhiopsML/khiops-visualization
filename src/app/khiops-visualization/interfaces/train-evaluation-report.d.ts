import { LiftCurve, RecCurve } from './app-datas';

export interface TrainEvaluationReport {
  reportType: string;
  evaluationType: string;
  summary: Summary;
  predictorsPerformance: PredictorPerformance[];
  predictorsDetailedPerformance: Record<string, PredictorDetailedPerformance>;
  recCurves: RecCurve[];
  liftCurves: LiftCurve[];
}

export interface Summary {
  dictionary: string;
  database: string;
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
  rmse: number;
  mae: number;
  nlpd: number;
  rankRmse: number;
  rankMae: number;
  rankNlpd: number;
}

export interface PredictorDetailedPerformance {
  dataGrid: DataGrid;
  confusionMatrix: ConfusionMatrix;
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
  partition: (string[] | number[])[];
  defaultGroupIndex?: number;
}
