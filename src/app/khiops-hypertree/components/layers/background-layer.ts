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
      create: (s) =>
        s
          .attr('r', 1)
          .attr('fill', 'rgba(248, 250, 252, 1)')
          .attr('stroke', '#dfe6ef')
          .attr('stroke-width', 3)
          .attr('vector-effect', 'non-scaling-stroke')
          .each(function () {
            const parent = this.parentNode;
            if (!parent) {
              return;
            }

            const previousInnerCircle = parent.querySelector(
              '.background-circle-inner',
            );
            if (previousInnerCircle) {
              previousInnerCircle.remove();
            }

            const innerCircle = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'circle',
            );
            innerCircle.setAttribute('class', 'background-circle-inner');
            innerCircle.setAttribute('r', '0.985');
            innerCircle.setAttribute('fill', 'none');
            innerCircle.setAttribute('stroke', '#cfd8e3');
            innerCircle.setAttribute('stroke-width', '1');
            innerCircle.setAttribute('vector-effect', 'non-scaling-stroke');
            parent.appendChild(innerCircle);
          }),
      updateColor: (s) => {},
      updateTransform: (s) => {},
    });
  }
}
