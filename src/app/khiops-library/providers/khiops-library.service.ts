import { Injectable } from '@angular/core';
import { ChartColorsSetI } from '../interfaces/chart-colors-set';
import { ConfigService } from '@khiops-library/providers/config.service';

@Injectable({
  providedIn: 'root',
})
export class KhiopsLibraryService {
  graphColorSet: ChartColorsSetI[];
  appConfig: any;

  graphColors: string[] = Array(10)
    .fill([
      '#10246e',
      '#6e93d5',
      '#b54d79',
      '#C9190B',
      '#7D1007',
      '#BDE2B9',
      '#7CC674',
      '#F9E0A2',
      '#F4C145',
      '#F0F0F0',
      '#B8BBBE',
      '#A2D9D9',
      '#009596',
      '#F4B678',
      '#EC7A08',
      '#10246e',
      '#6e93d5',
      '#b54d79',
      '#C9190B',
      '#7D1007',
      '#BDE2B9',
      '#7CC674',
      '#F9E0A2',
      '#F4C145',
      '#F0F0F0',
      '#B8BBBE',
      '#A2D9D9',
      '#009596',
      '#F4B678',
      '#EC7A08',
      '#10246e',
      '#6e93d5',
      '#b54d79',
      '#C9190B',
      '#7D1007',
      '#BDE2B9',
      '#7CC674',
      '#F9E0A2',
      '#F4C145',
      '#F0F0F0',
      '#B8BBBE',
      '#A2D9D9',
      '#009596',
      '#F4B678',
      '#EC7A08',
      '#10246e',
      '#6e93d5',
      '#b54d79',
      '#C9190B',
      '#7D1007',
      '#BDE2B9',
      '#7CC674',
      '#F9E0A2',
      '#F4C145',
      '#F0F0F0',
      '#B8BBBE',
      '#A2D9D9',
      '#009596',
      '#F4B678',
      '#EC7A08',
      '#10246e',
      '#6e93d5',
      '#b54d79',
      '#C9190B',
      '#7D1007',
      '#BDE2B9',
      '#7CC674',
      '#F9E0A2',
      '#F4C145',
      '#F0F0F0',
      '#B8BBBE',
      '#A2D9D9',
      '#009596',
      '#F4B678',
      '#EC7A08',
      '#10246e',
      '#6e93d5',
      '#b54d79',
      '#C9190B',
      '#7D1007',
      '#BDE2B9',
      '#7CC674',
      '#F9E0A2',
      '#F4C145',
      '#F0F0F0',
      '#B8BBBE',
      '#A2D9D9',
      '#009596',
      '#F4B678',
      '#EC7A08',
    ])
    // @ts-ignore
    .flat();

  constructor(private configService: ConfigService) {
    this.graphColorSet = [
      {
        domain: [
          '#864672',
          '#ffdda3',
          '#2196f3',
          '#00b862',
          '#a7b61a',
          '#ff9800',
          '#ff4514',
          '#FAC51D',
          '#3e796c',
          '#e9569f',
          '#a3d0e4',
          '#959ee1',
        ],
      },
      {
        domain: this.graphColors,
      },
      {
        domain: ['#ffbe46'],
      },
      {
        domain: ['#666666'],
      },
    ];
  }

  getGraphColorSet(): ChartColorsSetI[] {
    return this.graphColorSet;
  }

  setAppConfig(config) {
    this.appConfig = config;
  }

  getAppConfig(): any {
    return this.appConfig;
  }

  isKhiopsCovisu(): boolean {
    return this.getAppConfig().common.GLOBAL.DEBUG_SOFTWARE_LABEL === 'KC';
  }

  isKhiopsVisu(): boolean {
    return this.getAppConfig().common.GLOBAL.DEBUG_SOFTWARE_LABEL === 'KV';
  }
}
