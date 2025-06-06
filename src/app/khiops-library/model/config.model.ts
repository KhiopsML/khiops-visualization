/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

export class ConfigModel {
  showProjectTab?: boolean;
  showLogo?: boolean;
  appSource!: string;
  storage: string = 'DEFAULT';
  trackerId?: string;
  onFileOpen!: Function;
  onCopyData!: Function;
  onCopyImage!: Function;
  onSendEvent!: Function;
  readLocalFile?: Function;
}
