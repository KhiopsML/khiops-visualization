/*
 * Based on d3-hypertree by Michael Glatzhofer
 * MIT License - Copyright (c) 2018 Michael Glatzhofer
 * https://github.com/glouwa/d3-hypertree
 *
 * Modifications: Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { ILayer } from '../layerstack/layer';
import { ILayerView } from '../layerstack/layer';
import { ILayerArgs } from '../layerstack/layer';
import { D3UpdatePattern } from '../layerstack/d3updatePattern';

export interface NodeLayerArgs extends ILayerArgs {
  name: string;
  className: string;
  data: () => any;
  r: (d) => any;
  transform;
  strokeWidth?;
  fill?;
  opacity?;
  stroke?;
  clip?: string;
}

export class NodeLayer implements ILayer {
  view: ILayerView;
  args: NodeLayerArgs;
  d3updatePattern: D3UpdatePattern;
  name: string;

  update = {
    parent: () => this.attach(),
    data: () => this.d3updatePattern.update.data(),
    transformation: () => this.d3updatePattern.update.transformation(),
    style: () => this.d3updatePattern.update.style(),
  };

  constructor(view: ILayerView, args: NodeLayerArgs) {
    this.view = view;
    this.args = args;
    this.name = args.name;
  }

  private updateSelectionRing(s) {
    s.each((d, index, elements) => {
      const group = elements[index];
      const node = group.querySelector('.node-shape');
      const ring = group.querySelector('.node-selection-ring');
      const matrix = group.getScreenCTM();
      const scale = matrix ? Math.hypot(matrix.a, matrix.b) : 1;
      const nodeStrokeWidth = parseFloat(getComputedStyle(node).strokeWidth) || 0;
      const ringStrokeWidth = parseFloat(getComputedStyle(ring).strokeWidth) || 0;

      ring.setAttribute(
        'r',
        this.args.r(d) +
          nodeStrokeWidth / 2 +
          (3 + ringStrokeWidth / 2) / scale,
      );
    });
  }

  private attach() {
    this.d3updatePattern = new D3UpdatePattern({
      parent: this.view.parent,
      layer: this,
      clip: this.args.clip,
      data: this.args.data,
      name: this.args.name,
      className: `${this.args.className}-wrapper`,
      elementType: 'g',
      create: (s) => {
        s.append('circle').attr('class', 'node-selection-ring');

        s.append('circle')
          .attr('class', `node-shape ${this.args.className}`)
          .attr('r', (d) => this.args.r(d))
          .classed('root', (d) => !d.parent)
          .classed('lazy', (d) => d.hasOutChildren)
          .classed('leaf', (d) => d.parent)
          .classed(
            'exit',
            (d) =>
              (!d.children || !d.children.length) && d.data && d.data.numLeafs,
          )
          // @ts-ignore
          .style(
            'stroke',
            (d) => (d.pathes && d.pathes.labelcolor) || this.args.stroke(d),
          )
          .style(
            'stroke-width',
            (d) =>
              (d.pathes && d.pathes.labelcolor) || this.args.strokeWidth(d),
          );
      },
      updateColor: (s) => {
        s.select('.node-selection-ring').classed(
          'selected',
          (d) => d.pathes && d.pathes.isPartOfAnySelectionPath,
        );

        s.select('.node-shape')
          .classed('hovered', (d) => d.pathes && d.pathes.isPartOfAnyHoverPath)
          .classed(
            'selected',
            (d) => d.pathes && d.pathes.isPartOfAnySelectionPath,
          )
          .style(
            'fill',
            (d) => (d.pathes && d.pathes.labelcolor) || this.args.fill(d),
          )
          .style('fill-opacity', (d) => this.args.opacity(d) || 1);

        this.updateSelectionRing(s);
      },
      //updateColor:       s=> s.classed("hovered",   d=> d.isPartOfAnyHoverPath && d.parent)
      //                        .classed("selected",  d=> d.isPartOfAnySelectionPath && d.parent),
      updateTransform: (s) => {
        s.attr('transform', (d) => this.args.transform(d));

        s.select('.node-shape')
          .style('stroke', (d) => d.pathes && d.pathes.labelcolor)
          .attr('r', (d) => {
            if (this.args.r(d) > 0) {
              return this.args.r(d);
            }
          });

        this.updateSelectionRing(s);
      },
    });
  }
}
