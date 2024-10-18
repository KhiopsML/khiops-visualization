import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';

export type DistributionChartDatasModel = ChartDatasModel & {
  intervals?: string[];
};
