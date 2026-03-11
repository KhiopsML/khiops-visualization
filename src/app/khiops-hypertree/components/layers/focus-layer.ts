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

export interface FocusLayerArgs extends ILayerArgs {
  name: string;
  className?: string;
  r: () => number;
  center: () => string;
}

export class FocusLayer implements ILayer {
  view: ILayerView;
  args: FocusLayerArgs;
  d3updatePattern: D3UpdatePattern;
  name: string;

  update = {
    parent: () => this.attach(),
    data: () => this.d3updatePattern.update.data(),
    transformation: () => this.d3updatePattern.update.transformation(),
    style: () => this.d3updatePattern.update.style(),
  };

  constructor(view: ILayerView, args: FocusLayerArgs) {
    this.view = view;
    this.args = args;
    this.name = args.name;
  }

  private attach() {
    this.d3updatePattern = new D3UpdatePattern({
      parent: this.view.parent,
      layer: this,
      data: [1],
      name: this.name,
      className: this.args.className || 'focus-circle',
      elementType: 'circle',
      create: (s) => s.attr('r', 1),
      updateColor: (s) => {},
      updateTransform: (s) =>
        s.attr(
          'transform',
          `translate(${this.args.center()}) scale(${this.args.r()})`,
        ),
    });
  }
}
