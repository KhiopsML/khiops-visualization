export interface EvaluationReport {
  reportType: string;
  evaluationType: string;
  summary: EvaluationSummary;
  predictorsPerformance: PredictorPerformance[];
  predictorsDetailedPerformance: {
    [key: string]: PredictorDetailedPerformance;
  };
  liftCurves: LiftCurve[];
}

export interface EvaluationSummary {
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
  accuracy: number;
  compression: number;
  auc: number;
}

export interface PredictorDetailedPerformance {
  confusionMatrix: ConfusionMatrix;
}

export interface ConfusionMatrix {
  values: string[];
  matrix: number[][];
}

export interface LiftCurve {
  targetValue: string;
  curves: Curve[];
}

export interface Curve {
  classifier: string;
  values: number[];
}
