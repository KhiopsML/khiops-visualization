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
