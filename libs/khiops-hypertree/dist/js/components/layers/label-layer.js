"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bboxOval = exports.bboxCenter = exports.LabelLayer = void 0;
const d3updatePattern_1 = require("../layerstack/d3updatePattern");
class LabelLayer {
    constructor(view, args) {
        this.update = {
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
        this.view = view;
        this.args = args;
        this.name = args.name;
        this.isVisible = args.isVisible;
    }
    attach() {
        if (!this.args.invisible) {
            const $this = this;
            function offset(d, i, v) {
                return $this.args.transform(d, $this.args.delta(d, i, v));
            }
            this.d3updatePattern = new d3updatePattern_1.D3UpdatePattern({
                parent: this.view.parent,
                layer: this,
                clip: this.args.clip,
                data: this.args.data,
                name: this.name,
                className: this.args.className,
                elementType: 'text',
                create: (s) => s
                    .classed('P', (d) => d.name == 'P')
                    .style('stroke', (d) => d.pathes && d.pathes.labelcolor)
                    .style('fill', (d) => this.args.color(d))
                    .style('display', (d) => this.args.isVisible(d))
                    .text(this.args.text),
                updateColor: (s) => s
                    .style('stroke', (d) => d.pathes && d.pathes.labelcolor)
                    .style('fill', (d) => this.args.color(d)),
                updateTransform: (s) => s.attr('transform', offset),
            });
        }
    }
}
exports.LabelLayer = LabelLayer;
var paddingLeftRight = 0.08;
var paddingTopBottom = 0.02;
var bboxCenter = (d, cacheId = 'labelslen') => {
    var w = d.precalc[cacheId];
    var h = 0.045;
    return {
        re: -w / 2,
        im: h / 3,
    };
};
exports.bboxCenter = bboxCenter;
var bboxOval = (d, cacheId = 'labelslen', θn = undefined) => {
    var w = d.precalc[cacheId];
    var h = 0.045;
    const θ = θn ? θn.θ : d.cachep.θ;
    const result = {
        re: (paddingLeftRight / 2 + w / 2) * Math.cos(θ) - w / 2,
        im: (paddingTopBottom / 2 + h / 2) * Math.sin(θ) + h / 3,
    };
    return result;
};
exports.bboxOval = bboxOval;
