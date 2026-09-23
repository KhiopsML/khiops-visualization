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
import { select } from 'd3';

export interface LabelLayerArgs extends ILayerArgs {
  name: string;
  className: string;
  invisible?: boolean;
  hideOnDrag?: boolean;
  data: () => any;
  isVisible?: (d) => any;
  background?;
  color?;
  delta;
  transform;
  text;
  clip?: string;
}

export class LabelLayer implements ILayer {
  view: ILayerView;
  args: LabelLayerArgs;
  d3updatePattern: D3UpdatePattern;
  d3updatePattern2: D3UpdatePattern;
  name: string;
  isVisible: (d) => any;
  simulation;
  update = {
    parent: () => this.attach(),
    data: () => {
      if (this.d3updatePattern) {
        this.d3updatePattern.update.data();
      }
    },
    transformation: () => {
      if (this.d3updatePattern) {
        this.d3updatePattern.update.transformation();
      }
    },
    style: () => {
      if (this.d3updatePattern) {
        this.d3updatePattern.update.style();
      }
    },
  };

  constructor(view: ILayerView, args: LabelLayerArgs) {
    this.view = view;
    this.args = args;
    this.name = args.name;
    this.isVisible = args.isVisible;
  }

  private readonly selectionPaddingX = 0.01;
  private readonly selectionPaddingY = 0.004;
  private readonly selectionRadius = 0.008;

  private getRgbFromColor(colorValue: string) {
    if (!colorValue) {
      return undefined;
    }

    const color = colorValue.trim().toLowerCase();

    const hexMatch = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hexMatch) {
      const hex = hexMatch[1];
      if (hex.length === 3) {
        return {
          r: parseInt(hex[0] + hex[0], 16),
          g: parseInt(hex[1] + hex[1], 16),
          b: parseInt(hex[2] + hex[2], 16),
        };
      }

      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }

    const rgbMatch = color.match(
      /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*[\d.]+\s*)?\)$/,
    );
    if (rgbMatch) {
      return {
        r: Math.max(0, Math.min(255, parseInt(rgbMatch[1], 10))),
        g: Math.max(0, Math.min(255, parseInt(rgbMatch[2], 10))),
        b: Math.max(0, Math.min(255, parseInt(rgbMatch[3], 10))),
      };
    }

    return undefined;
  }

  private resolveColorValue(colorValue: string, contextElement?: Element) {
    if (!colorValue || !contextElement) {
      return colorValue;
    }

    const documentRef = contextElement.ownerDocument;
    if (!documentRef || !documentRef.body || !documentRef.defaultView) {
      return colorValue;
    }

    const probe = documentRef.createElement('span');
    probe.style.color = colorValue;
    probe.style.display = 'none';
    documentRef.body.appendChild(probe);

    const resolved = documentRef.defaultView.getComputedStyle(probe).color;
    documentRef.body.removeChild(probe);

    return resolved || colorValue;
  }

  private isDarkColor(colorValue: string, contextElement?: Element) {
    const resolvedColor = this.resolveColorValue(colorValue, contextElement);
    const rgb = this.getRgbFromColor(resolvedColor);
    if (!rgb) {
      return false;
    }

    // Relative luminance approximation (0..255). Lower means darker.
    const luminance = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
    return luminance < 140;
  }

  private updateSelectionBackground(s) {
    s.each((d, index, elements) => {
      const group = elements[index];
      const text = group.querySelector('.caption-text');
      const rect = group.querySelector('.caption-selection-bg');

      if (!text || !rect) {
        return;
      }

      const selectionPath =
        d.pathes && d.pathes.partof
          ? d.pathes.partof.find((p) => p && p.type === 'SelectionPath')
          : undefined;
      const isSelectionHead =
        !!selectionPath &&
        !!selectionPath.head &&
        (selectionPath.head === d ||
          (selectionPath.head.id && d.id && selectionPath.head.id === d.id) ||
          (selectionPath.head.mergeId !== undefined &&
            d.mergeId !== undefined &&
            selectionPath.head.mergeId === d.mergeId));
      const isSelected = !!(
        (d.pathes &&
          d.pathes.headof &&
          d.pathes.headof.type === 'SelectionPath') ||
        isSelectionHead
      );
      if (!isSelected) {
        rect.style.display = 'none';
        text.style.fill = this.args.color(d);
        return;
      }

      const bbox = text.getBBox();
      rect.setAttribute('x', `${bbox.x - this.selectionPaddingX}`);
      rect.setAttribute('y', `${bbox.y - this.selectionPaddingY}`);
      rect.setAttribute('width', `${bbox.width + this.selectionPaddingX * 2}`);
      rect.setAttribute(
        'height',
        `${bbox.height + this.selectionPaddingY * 2}`,
      );
      rect.setAttribute('rx', `${this.selectionRadius}`);
      rect.setAttribute('ry', `${this.selectionRadius}`);
      rect.style.display = null;
      const selectionFill =
        selectionPath && selectionPath.color
          ? selectionPath.color
          : d.pathes && d.pathes.headof && d.pathes.headof.color
            ? d.pathes.headof.color
            : d.pathes && d.pathes.labelcolor
              ? d.pathes.labelcolor
              : '';
      rect.style.fill = selectionFill;
      text.style.fill = this.isDarkColor(selectionFill, text)
        ? '#ffffff'
        : this.args.color(d);
    });
  }

  private attach() {
    if (!this.args.invisible) {
      const $this = this;

      function offset(d, i, v) {
        return $this.args.transform(d, $this.args.delta(d, i, v));
      }

      this.d3updatePattern = new D3UpdatePattern({
        parent: this.view.parent,
        layer: this,
        clip: this.args.clip,
        data: this.args.data,
        name: this.name,
        className: this.args.className,
        elementType: 'g',
        create: (s) =>
          s.each((d, index, elements) => {
            const group = elements[index];
            const selection = select(group);

            selection
              .append('rect')
              .attr('class', 'caption-selection-bg')
              .style('display', 'none')
              .style('pointer-events', 'none')
              .attr('rx', this.selectionRadius)
              .attr('ry', this.selectionRadius);

            selection
              .append('text')
              .attr('class', `${this.args.className} caption-text`)
              .classed('P', (n) => n.name == 'P')
              .style('stroke', (n) =>
                n.pathes &&
                n.pathes.headof &&
                n.pathes.headof.type === 'SelectionPath'
                  ? undefined
                  : n.pathes && n.pathes.labelcolor,
              )
              .style('fill', (n) => this.args.color(n))
              .style('display', (n) => this.args.isVisible(n))
              .text(this.args.text);
          }),
        updateColor: (s) => {
          s.select('.caption-text')
            .style('stroke', (d) =>
              d.pathes &&
              d.pathes.headof &&
              d.pathes.headof.type === 'SelectionPath'
                ? undefined
                : d.pathes && d.pathes.labelcolor,
            )
            .style('fill', (d) => this.args.color(d))
            .style('display', (d) => this.args.isVisible(d));

          // Must run after updateColor because update cycle is transform -> color.
          this.updateSelectionBackground(s);
        },
        updateTransform: (s) => {
          s.attr('transform', offset);
          s.select('.caption-text')
            .style('display', (d) => this.args.isVisible(d))
            .text(this.args.text);
          this.updateSelectionBackground(s);
        },
      });
    }
  }
}

var paddingLeftRight = 0.08;
var paddingTopBottom = 0.02;

export var bboxCenter = (d, cacheId = 'labelslen') => {
  var w = d.precalc[cacheId];
  var h = 0.045;
  return {
    re: -w / 2,
    im: h / 3,
  };
};

export var bboxOval = (d, cacheId = 'labelslen', θn = undefined) => {
  var w = d.precalc[cacheId];
  var h = 0.045;
  const θ = θn ? θn.θ : d.cachep.θ;

  const result = {
    re: (paddingLeftRight / 2 + w / 2) * Math.cos(θ) - w / 2,
    im: (paddingTopBottom / 2 + h / 2) * Math.sin(θ) + h / 3,
  };
  return result;
};
