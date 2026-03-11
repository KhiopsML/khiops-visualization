/*
 * Based on d3-hypertree by Michael Glatzhofer
 * MIT License - Copyright (c) 2018 Michael Glatzhofer
 * https://github.com/glouwa/d3-hypertree
 *
 * Modifications: Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { N } from '../../models/n/n';
import { C } from '../../models/transformation/hyperbolic-math';
import { lengthDilledation } from '../../models/transformation/hyperbolic-math';
import { NodeLayer } from '../layers/node-layer';
import { CellLayer } from '../layers/cell-layer';
import { LabelLayer } from '../layers/label-layer';
import { InteractionLayer } from '../layers/interaction-layer';
import { UnitDisk } from './unitdisk';

var rotate = (
  d: N, // label rotation (font correction)
) => (d.name === 'λ' ? ' rotate(-25)' : ' rotate(0)');

var deltaMap = {
  // label offsets (font correction)
  P: { re: 0.0025, im: 0.05 },
  θ: { re: 0.0025, im: 0.019 },
  λ: { re: 0.0025, im: 0.013 },
};

var Pscale = (ud: UnitDisk) => (d: any) =>
  lengthDilledation(d.cache) * (1 - ud.args.transformation.state.λ);

export const navParameterLayers = [
  (v, ud: UnitDisk) =>
    new CellLayer(v, {
      invisible: true,
      hideOnDrag: true,
      clip: '#circle-clip' + ud.args.clipRadius,
      data: () => ud.cache.cells,
    }),
  (v, ud: UnitDisk) =>
    new NodeLayer(v, {
      invisible: true,
      hideOnDrag: true,
      name: 'nodes',
      className: 'node',
      data: () => ud.cache.unculledNodes,
      r: (d: N) => (d.name === 'P' ? Pscale(ud)(d) : ud.args.nodeRadius(ud, d)),
      transform: (d: N) => d.transformStrCache,
    }),
  (v, ud: UnitDisk) =>
    new LabelLayer(v, {
      invisible: true,
      hideOnDrag: true,
      name: 'labels',
      className: 'caption',
      data: () => ud.cache.unculledNodes,
      text: (d: N) => ({ P: '+', θ: '🠆', λ: '⚲' })[d.name],
      delta: (d: N) => deltaMap[d.name],
      transform: (d: N, delta: C) =>
        ` translate(${d.cache.re + delta.re} ${d.cache.im + delta.im})` +
        rotate(d),
    }),
  (v, ud: UnitDisk) =>
    new InteractionLayer(v, {
      mouseRadius: 1.5,
      onClick: (n: N, m: C) => {},
    }),
];
