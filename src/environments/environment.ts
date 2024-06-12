import { covisualizationCommonEnvironment } from './covisualization-common';
import { visualizationCommonEnvironment } from './visualization-common';

export const AppConfig = {
  debugFile: true,
  production: false,
  environment: 'LOCAL',
  cypress: (window as any).Cypress || false,
  visualizationCommon: visualizationCommonEnvironment,
  covisualizationCommon: covisualizationCommonEnvironment,
  common: {},
};
