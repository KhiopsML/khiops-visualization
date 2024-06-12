import { covisualizationCommonEnvironment } from './covisualization-common';
import { visualizationCommonEnvironment } from './visualization-common';

export const AppConfig = {
  debugFile: false,
  production: true,
  environment: 'PROD',
  cypress: (window as any).Cypress || false,
  visualizationCommon: visualizationCommonEnvironment,
  covisualizationCommon: covisualizationCommonEnvironment,
  common: {},
};
