/*
 * Based on d3-hypertree by Michael Glatzhofer
 * MIT License - Copyright (c) 2018 Michael Glatzhofer
 * https://github.com/glouwa/d3-hypertree
 *
 * Modifications: Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { ILayer } from '../layerstack/layer';
import { ILayerView } from '../layerstack/layer';
import { ILayerArgs } from '../layerstack/layer';
import { D3UpdatePattern } from '../layerstack/d3updatePattern';

export interface BackgroundLayerArgs extends ILayerArgs {}

export class BackgroundLayer implements ILayer {
  view: ILayerView;
  args: BackgroundLayerArgs;
  d3updatePattern: D3UpdatePattern;
  name = 'background';
  update = {
    parent: () => this.attach(),
    data: () => this.d3updatePattern.update.data(),
    transformation: () => this.d3updatePattern.update.transformation(),
    style: () => this.d3updatePattern.update.style(),
  };

  constructor(view: ILayerView, args: BackgroundLayerArgs) {
    this.view = view;
    this.args = args;
  }

  private attach() {
    this.d3updatePattern = new D3UpdatePattern({
      parent: this.view.parent,
      layer: this,
      data: [1],
      name: this.name,
      className: 'background-circle',
      elementType: 'circle',
      create: (s) => s.attr('r', 1).attr('fill', 'rgba(180, 180, 180, 0.7)'),
      updateColor: (s) => {},
      updateTransform: (s) => {},
    });
  }
}
