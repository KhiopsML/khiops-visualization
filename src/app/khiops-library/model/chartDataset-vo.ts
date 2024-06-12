export class ChartDatasetVO {
  label: string | undefined;
  data: any = [];
  extra: any = [];
  minBarLength: number = 3;
  fill: boolean = false;
  borderSkipped: boolean = false;
  type: string; // By default
  borderWidth: number;
  maxBarThickness: number;
  barThickness: number;
  barPercentage: number;
  categoryPercentage: number;
  pointRadius?: number;
  pointHitRadius?: number;
  pointHoverRadius?: number;
  backgroundColor?: string[];
  borderColor?: string[];

  constructor(label?: string, type?: string) {
    this.label = label || '';
    this.type = type || 'bar'; // By default
  }
}
