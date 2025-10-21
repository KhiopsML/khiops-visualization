/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

export enum TYPES {
  // Warning: must match with i18n keys
  // TODO improve that
  FREQUENCY = 'GLOBAL.FREQUENCY',
  COVERAGE = 'GLOBAL.COVERAGE',
  STANDARD = 'GLOBAL.STANDARD',
  PROBABILITIES = 'GLOBAL.PROBABILITIES',
  LIFT = 'GLOBAL.LIFT',
  LEVEL_DISTRIBUTION = 'GLOBAL.LEVEL_DISTRIBUTION',
  IMPORTANCE_DISTRIBUTION = 'GLOBAL.IMPORTANCE_DISTRIBUTION',

  CLUSTER = 'GLOBAL.CLUSTER',
  INNER_VARIABLES = 'GLOBAL.INNER_VARIABLES',

  LINEAR = 'linear',
  LOGARITHMIC = 'logarithmic',
  NUMERICAL = 'Numerical',
  CATEGORICAL = 'Categorical',
}
