export interface RangeXLogI {
  inf?: HistogramValuesI;
  max?: number;
  middlewidth?: number;
  min?: number;
  negStart?: number;
  negValuesCount?: number;
  posStart?: number;
  posValuesCount?: number;
}

export interface RangeYLogI {
  min?: number;
  max?: number;
}

export interface RangeXLinI {
  min?: number;
  max?: number;
}

export interface HistogramValuesI {
  frequency: number;
  logValue: number;
  partition: number[];
  value: number;
  coords?: {
    x: number;
    y: number;
    barW: number;
    barH: number;
  };
}
