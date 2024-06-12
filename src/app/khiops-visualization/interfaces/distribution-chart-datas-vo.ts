import { ChartDatasVO } from '@khiops-library/model/chart-datas-vo';

export type DistributionChartDatasVO = ChartDatasVO & {
  intervals?: string[];
};
