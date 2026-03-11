/*
 * Based on d3-hypertree by Michael Glatzhofer
 * MIT License - Copyright (c) 2018 Michael Glatzhofer
 * https://github.com/glouwa/d3-hypertree
 *
 * Modifications: Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { ILayer } from '../../components/layerstack/layer';
import { IUnitDisk } from '../../components/unitdisk/unitdisk';
import { Hypertree } from '../../components/hypertree/hypertree';

import { N } from '../n/n';
import { C } from '../transformation/hyperbolic-math';
import { Transformation } from '../transformation/hyperbolic-transformation';
import { TransformationCache } from '../transformation/hyperbolic-transformation';
import { ArcCurvature } from '../../components/layers/link-layer';
import { UnitDisk } from '../../components/unitdisk/unitdisk';

export interface UnitDiskView {
  parent: any;
  position: string;
  className: string;
  hypertree: Hypertree;
}

export interface UnitDiskArgs {
  data?: N;
  transform?: (n: N) => C;

  decorator: { new(view: UnitDiskView, args: UnitDiskArgs): IUnitDisk };
  transformation: Transformation<N>;
  cacheUpdate: (ud: IUnitDisk, cache: TransformationCache) => void;

  layers: ((v, ls: IUnitDisk) => ILayer)[];
  layerOptions: {};

  clipRadius: number;

  nodeRadius: (ud: IUnitDisk, n: N) => number;
  nodeScale: (n: N) => number;
  nodeFilter: (n: N) => boolean;
  offsetLabels: (ls: UnitDisk) => (d, i, v) => C;

  linkWidth: (n: N) => number;
  linkCurvature: ArcCurvature;
}
