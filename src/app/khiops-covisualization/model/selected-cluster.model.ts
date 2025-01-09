/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

export class SelectedClusterModel {
  _id: string;
  hierarchy: string;
  shortDescription: string;
  nbClusters: number;

  constructor(hierarchy: string, shortDescription: string, nbClusters: number) {
    this._id = hierarchy;
    this.hierarchy = hierarchy;
    this.shortDescription = shortDescription;
    this.nbClusters = nbClusters;
  }
}
