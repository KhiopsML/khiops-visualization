/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { InfosDatasI } from './infos-datas';
import { DISPLAY_TYPE } from '../enum/info-data-types';

/**
 * Interface for processed information data with display metadata
 */
export interface ProcessedInfoDataI extends InfosDatasI {
  /** The display type for this data item */
  displayType: DISPLAY_TYPE;
  /** Whether this data should be highlighted as important */
  isImportant?: boolean;
}
