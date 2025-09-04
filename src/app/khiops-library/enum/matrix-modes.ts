/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

export enum MATRIX_MODES {
  MUTUAL_INFO = 'MUTUAL_INFO',
  HELLINGER = 'HELLINGER',
  MUTUAL_INFO_TARGET_WITH_CELL = 'MUTUAL_INFO_TARGET_WITH_CELL',
  CELL_INTEREST = 'CELL_INTEREST',
  PROB_CELL = 'PROB_CELL',
  PROB_CELL_REVERSE = 'PROB_CELL_REVERSE',
  PROB_CELL_WITH_TARGET = 'PROB_CELL_WITH_TARGET',
  FREQUENCY = 'FREQUENCY',
  CONDITIONAL_FREQUENCY = 'CONDITIONAL_FREQUENCY',
  PROB_TARGET_WITH_CELL = 'PROB_TARGET_WITH_CELL',
}
