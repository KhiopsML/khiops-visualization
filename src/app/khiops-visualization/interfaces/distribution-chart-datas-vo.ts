import { ChartDatasVO } from '@khiops-library/model/chartDatas.model';

export type DistributionChartDatasVO = ChartDatasVO & {
  intervals?: string[];
};
