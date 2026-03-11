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

export interface CellLayerArgs extends ILayerArgs {
  clip?: string;
  data: () => any;
  stroke?: any;
  fill?: any;
  color?: any;
  strokeWidth?: any;
}

export class CellLayer implements ILayer {
  view: ILayerView;
  args: CellLayerArgs;
  d3updatePattern: D3UpdatePattern;
  name = 'cells';
  update = {
    parent: () => this.attach(),
    data: () => this.d3updatePattern.update.data(),
    transformation: () => this.d3updatePattern.update.transformation(),
    style: () => this.d3updatePattern.update.style(),
  };

  constructor(view: ILayerView, args: CellLayerArgs) {
    this.view = view;
    this.args = args;
  }

  private attach() {
    this.d3updatePattern = new D3UpdatePattern({
      parent: this.view.parent,
      layer: this,
      clip: this.args.clip,
      data: this.args.data,
      name: this.name,
      className: 'cell',
      elementType: 'polygon',
      create: (s) =>
        s
          .attr('id', (d) => 'cell-' + d.data.mergeId)
          .classed('leaf', false)
          .classed('lazy', true)
          .style(
            'stroke',
            (d) => (d.pathes && d.pathes.labelcolor) || this.args.stroke(d),
          )
          .style(
            'stroke-width',
            (d) =>
              (d.pathes && d.pathes.labelcolor) || this.args.strokeWidth(d),
          ),

      updateColor: (s) =>
        s
          .classed(
            'hovered',
            (d) => d.data.isPartOfAnyHoverPath && d.data.parent,
          )
          .style(
            'fill',
            (d) => (d.pathes && d.pathes.labelcolor) || this.args.fill(d),
          ),
      updateTransform: (s) =>
        s.attr('points', (d) => {
          return d && d.join(' ');
        }),
    });
  }
}
