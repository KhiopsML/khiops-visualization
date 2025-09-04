/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

export interface MatrixRangeValuesI {
  CELL_INTEREST?: number[];
  FREQUENCY?: number[];
  CONDITIONAL_FREQUENCY?: number[] | number[][];
  MUTUAL_INFO?: number[];
  MUTUAL_INFO_TARGET_WITH_CELL?: number[];
  PROB_TARGET_WITH_CELL?: number[];
  PROB_CELL_REVERSE?: number[];
  PROB_CELL_WITH_TARGET?: number[];
  PROB_CELL?: number[];
}
