import { ChartDatasModel } from '@khiops-library/model/chartDatas.model';

export type DistributionChartDatasModel = ChartDatasModel & {
  intervals?: string[];
};
