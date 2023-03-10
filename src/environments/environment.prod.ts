import { covisualizationCommonEnvironment } from './covisualization-common'
import { visualizationCommonEnvironment } from './visualization-common'

export const AppConfig = {
	production: true,
	environment: 'PROD',
	visualizationCommon: visualizationCommonEnvironment,
	covisualizationCommon: covisualizationCommonEnvironment,
	common: {}
}
