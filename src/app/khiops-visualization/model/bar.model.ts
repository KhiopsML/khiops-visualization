/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

export class BarModel {
  name: string | undefined;
  value: number | undefined;
  defaultGroupIndex: boolean = false;

  extra: {
    value: number | undefined;
    percent: number | undefined;
    name: string | undefined;
    index: number | undefined;
    frequencyValue: number | undefined;
    coverageValue: number | undefined;
  };

  constructor() {
    this.name = undefined;
    this.value = undefined;
    this.extra = {
      value: undefined,
      percent: undefined,
      name: undefined,
      index: undefined,
      frequencyValue: undefined,
      coverageValue: undefined,
    };
  }
}
