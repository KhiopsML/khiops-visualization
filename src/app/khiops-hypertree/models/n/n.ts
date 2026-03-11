/*
 * Based on d3-hypertree by Michael Glatzhofer
 * MIT License - Copyright (c) 2018 Michael Glatzhofer
 * https://github.com/glouwa/d3-hypertree
 *
 * Modifications: Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { C, Cp, Ck } from '../transformation/hyperbolic-math';
import { Path } from '../path/path';

export interface NodePrecalulations {
  layoutWeight: number;
  cullingWeight: number;
  visWeight: number;
  weight: number;
  weightScale: number;
  label: string;
  labellen: number;
  clickable: boolean;
  cell: boolean;
}

export interface NodeLayout {
  wedge: {
    α: number;
    Ω: number;
    L?: number;
  };
  z?: Ck;
  zStrCache?: string;
  zp?: Cp;
}

export interface NodeTransformation {
  cache?: C;
  cachep?: Cp;
  strCache?: string;
  transformStrCache?: string;
  transformStrCacheZ?: string;
  scaleStrText?: string;
  distScale?: number;
  dampedDistScale?: number;
  isOutλ;
  isOut99;
  isOutWeight;
  isOut;
  hasOutPeriChildren;
  hasOutWeightChildren;
  hasOutChildren: boolean;
}

export interface NodePath {
  headof: Path;
  partof: Path[];
  finalcolor: string;
  labelcolor: string;
  isPartOfAnySelectionPath?: boolean;
  isPartOfAnyHoverPath?: boolean;
}

export interface N extends NodeTransformation {
  color: string;
  mergeId: number;
  id: string;
  name?: string;
  data: any; // d3
  parent: N;
  children: Array<N>;
  depth: number;
  height: number;
  value?: number;
  ancestors;
  descendants;
  leaves;
  each;
  sum;
  precalc: NodePrecalulations;
  pathes: NodePath;
  minWeight: number;
  layout: NodeLayout;
  layoutReference: NodeLayout;
}
