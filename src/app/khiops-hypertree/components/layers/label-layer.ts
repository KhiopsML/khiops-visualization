import { ILayer } from '../layerstack/layer';
import { ILayerView } from '../layerstack/layer';
import { ILayerArgs } from '../layerstack/layer';
import { D3UpdatePattern } from '../layerstack/d3updatePattern';

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
        elementType: 'text',
        create: (s) =>
          s
            .classed('P', (d) => d.name == 'P')
            .style('stroke', (d) => d.pathes && d.pathes.labelcolor)
            .style('fill', (d) => this.args.color(d))
            .style('display', (d) => this.args.isVisible(d))
            .text(this.args.text),
        updateColor: (s) =>
          s
            .style('stroke', (d) => d.pathes && d.pathes.labelcolor)
            .style('fill', (d) => this.args.color(d)),
        updateTransform: (s) => s.attr('transform', offset),
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
