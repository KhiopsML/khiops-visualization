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
import { ILayer } from './layer';
import { type Selection } from 'd3';

export interface D3UpdatePatternArgs {
  parent: any;
  layer: ILayer;

  name: string;
  className: string;
  elementType: string;
  data: any;
  clip?: string;

  create: (s) => any;
  updateTransform: (s) => any;
  updateColor: (s) => any;
}

export class D3UpdatePattern {
  args: D3UpdatePatternArgs;
  data: any;
  update = {
    parent: () => this.updateParent(),
    data: () => this.updateData(),
    transformation: () => this.elements.call(this.args.updateTransform),
    style: () => this.elements.call(this.args.updateColor),
  };

  private mainSvgGroup: Selection<SVGElement, N, SVGElement, undefined>;
  private elements: any;

  constructor(args: D3UpdatePatternArgs) {
    this.args = args;
    this.updateParent();
  }

  private updateParent() {
    this.mainSvgGroup = this.args.parent
      .append('g')
      .attr('id', this.args.name)
      .attr('clip-path', this.args.clip ? `url(${this.args.clip})` : undefined)
      .style('transform', 'translateZ(0)');

    this.elements = this.mainSvgGroup.selectAll(this.args.elementType);
  }

  private mayEval = (d) => (typeof d === 'function' ? d() : d);
  private updateData() {
    this.data = [];
    var isAnimating = this.args.layer.view.hypertree.isAnimationRunning();
    if (
      (!isAnimating && !this.args.layer.args.invisible) ||
      (isAnimating && !this.args.layer.args.hideOnDrag)
    ) {
      this.data = this.mayEval(this.args.data);
    }

    this.elements = this.elements.data(this.data, (d) => d && d.mergeId);
    this.elements.exit().remove();

    const newElements = this.elements
      .enter()
      .append(this.args.elementType)
      .attr('class', this.args.className)
      .call(this.args.create);

    this.elements = this.elements
      .merge(newElements)
      .call(this.args.updateTransform)
      .call(this.args.updateColor);
  }
}
