import { covisualizationCommonEnvironment } from './covisualization-common';
import { visualizationCommonEnvironment } from './visualization-common';

export const AppConfig = {
  debugFile: false,
  production: true,
  environment: 'PROD',
  visualizationCommon: visualizationCommonEnvironment,
  covisualizationCommon: covisualizationCommonEnvironment,
  common: {},
};
