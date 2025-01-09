/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

export const covisualizationCommonEnvironment = {
  GLOBAL: {
    TO_FIXED: 8,
    LS_ID: 'KHIOPS_COVISUALIZATION_',
    DEBUG_SOFTWARE_LABEL: 'KC',
    MATRIX_CONTRAST: 10,
    PAGINATION_SIZE: 100,
    LIMIT_GRAPH_DATAS: 40,
    MAX_GRAPH_SCALE: 400,
    DEFAULT_GRAPH_SCALE: 100,
    MIN_GRAPH_SCALE: 100,
    STEP_GRAPH_SCALE: 10,
    MAX_TABLE_SIZE: 10000,
  },
  HOME: {
    ACTIVE_TAB_INDEX: 0,
  },
  UNFOLD_HIERARCHY: {
    ERGONOMIC_LIMIT: 15, // multiplied by nb dimensions
    TECHNICAL_LIMIT: 100000,
    WIDTH: '85vw',
    HEIGHT: '85vh',
  },
  MANAGE_VIEWS: {
    MAX_WIDTH: '1000px',
    WIDTH: '85vw',
    HEIGHT: '55vh',
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
