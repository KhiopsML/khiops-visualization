import { DynamicI } from '@khiops-library/interfaces/globals.interface';

export interface LegendItem {
  name: string;
  color?: string;
  borderColor?: string;
  shortname?: string;
}

export interface LegendSeries {
  name?: string;
}

export interface LegendDataset {
  label?: string;
  extra?: DynamicI[];
}

export interface LegendDataWithSeries {
  series: LegendSeries[];
}

export interface LegendDynamicItem {
  show?: boolean;
  name?: string;
}

export interface LegendDatasetsInput {
  datasets: LegendDataset[];
}

export type LegendInputData =
  | LegendDatasetsInput
  | LegendDataWithSeries[]
  | LegendDynamicItem[]
  | undefined;
