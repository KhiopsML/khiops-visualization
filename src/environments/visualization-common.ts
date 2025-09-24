/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

export const visualizationCommonEnvironment = {
  GLOBAL: {
    TO_FIXED: 4,
    LS_ID: 'KHIOPS_VISUALIZATION_',
    DEBUG_SOFTWARE_LABEL: 'KV',
    MATRIX_CONTRAST: 10,
    PAGINATION_SIZE: 500,
    DEFAULT_GRAPH_SCALE: 100,
    MAX_GRAPH_SCALE: 400,
    MIN_GRAPH_SCALE: 100,
    STEP_GRAPH_SCALE: 10,
    MAX_TABLE_SIZE: 10000,
    MAX_CHART_SIZE: 1000,
    MAX_GRAPH_TOOLTIP_LABEL_LENGTH: 70,
    MAT_MENU_PAGINATION: 20,
    MAX_LABEL_LENGTH: 30,
    LIFT_CHART_COUNT: 6,
    BIG_DISTRIBUTION_SIZE: 10000,
  },
  HOME: {
    ACTIVE_TAB_INDEX: 0,
  },
  LEVEL_DISTRIBUTION_GRAPH: {
    MAX_VARIABLES: 1000,
    MAX_LENGTH: 500,
    MIN_LENGTH: 1,
    STEP: 10,
    WIDTH: '85vw',
    HEIGHT: '65vh',
  },
  HYPERTREE: {
    VISU_POPULATION: false,
    VISU_PURITY: false,
  },
  FILE_SAVE: {
    FORMAT: 'json',
    ENCODING: 'utf-8',
    EXT_NAME: '',
  },
  TRACKER: {
    TRACKER_URL: 'https://matomo.apps.tech.orange/',
  },
};
