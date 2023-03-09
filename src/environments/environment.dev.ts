import { covisualizationCommonEnvironment } from './covisualization-common'
import { visualizationCommonEnvironment } from './visualization-common'

export const AppConfig = {
  production: false,
  environment: 'DEV',
  visualizationCommon: visualizationCommonEnvironment,
  covisualizationCommon: covisualizationCommonEnvironment,
}
