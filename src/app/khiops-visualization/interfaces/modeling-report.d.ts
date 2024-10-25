import { DynamicI } from '@khiops-library/interfaces/globals';

export interface ModelingReport {
  reportType: string;
  summary: Summary;
  trainedPredictors: TrainedPredictor[];
  trainedPredictorsDetails: TrainedPredictorsDetails;
}

export interface Summary {
  dictionary: string;
  database: string;
  samplePercentage: number;
  samplingMode: string;
  selectionVariable: string;
  selectionValue: string;
  learningTask: string;
  targetVariable: string;
}

export interface TrainedPredictor {
  rank: string;
  type: string;
  family: string;
  name: string;
  variables: number;
}

export interface TrainedPredictorsDetails {
  [key: string]: {
    selectedVariables: {
      preparedName: string;
      name: string;
      level: number;
      weight: number;
      importance: number;
    }[];
  };
}

interface TargetValues {
  frequencies: number[];
  values: string[];
}
