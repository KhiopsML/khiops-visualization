export const covisualizationCommonEnvironment = {
  GLOBAL: {
    TO_FIXED: 4,
    LS_ID: 'KHIOPS_COVISUALIZATION_',
    DEBUG_SOFTWARE_LABEL: 'KC',
    MATRIX_CONTRAST: 0,
    PAGINATION_SIZE: 100,
    LIMIT_GRAPH_DATAS: 40,
    FONT_SIZE: 14,
    MAX_GRAPH_SCALE: 400,
    DEFAULT_GRAPH_SCALE: 100,
    MIN_GRAPH_SCALE: 100,
    STEP_GRAPH_SCALE: 10,
    MAX_GRAPH_X_LABEL_LENGTH: 18,
    MAX_TABLE_SIZE: 10000,
    MAX_GRAPH_BAR_THICKNESS: 50,
  },
  HOME: {
    ACTIVE_TAB_INDEX: 0,
    TAB_ANIMATION_DURATION: 150, // set > value than .mat-ink-bar transition animation to avoid freeze
  },
	UNFOLD_HIERARCHY: {
	LIMIT_TIME: 1000,
    DEFAULT_UNFOLD: 20,
    WIDTH: '85vw',
    HEIGHT: '85vh',
  },
  MANAGE_VIEWS: {
    MAX_WIDTH: '1000px',
    WIDTH: '85vw',
    HEIGHT: '55vh',
  },
  TREE: {
    EXPAND_FROM_NUMBER: 10,
  },
  FILE_SAVE: {
    FORMAT: 'json',
    ENCODING: 'utf-8',
    EXT_NAME: '',
  },
  TRACKER: {
    ENABLE: true,
    SITE_ID: '2212',
    TRACKER_URL: 'https://matomo.apps.tech.orange/',
  },
}
