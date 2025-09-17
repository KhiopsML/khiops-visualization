"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArcLayer = void 0;
const hyperbolic_math_1 = require("../../models/transformation/hyperbolic-math");
const hyperbolic_math_2 = require("../../models/transformation/hyperbolic-math");
const d3updatePattern_1 = require("../layerstack/d3updatePattern");
class ArcLayer {
    constructor(view, args) {
        this.update = {
            parent: () => this.attach(),
            data: () => this.d3updatePattern.update.data(),
            transformation: () => this.d3updatePattern.update.transformation(),
            style: () => this.d3updatePattern.update.style(),
        };
        this.arcOptions = {
            '+': this.svgArc('1', '0'),
            '-': this.svgArc('0', '1'),
            '0': this.svgArcLine,
        };
        this.view = view;
        this.args = args;
        this.name = args.name;
    }
    attach() {
        this.d3updatePattern = new d3updatePattern_1.D3UpdatePattern({
            parent: this.view.parent,
            layer: this,
            clip: this.args.clip,
            data: this.args.data,
            name: this.name,
            className: this.args.className,
            elementType: this.args.curvature === 'l' ? 'line' : 'path',
            create: (s) => { },
            //updateColor:       s=> this.args.classed(s, this.args.width),
            updateColor: (s) => this.args.classed(s, this.args.width, this.args.stroke),
            updateTransform: (s) => {
                // console.log("🚀 ~ file: link-layer.ts ~ line 74 ~ ArcLayer ~ attach ~ s", s)
                //const c = d=> d.height===0 ? '+' : '-'
                const c = (d) => this.args.curvature;
                if (this.args.curvature == 'l')
                    s.attr('x1', (d) => this.args.nodePos(d).re)
                        .attr('y1', (d) => this.args.nodePos(d).im)
                        .attr('x2', (d) => this.args.nodePos(d.parent).re)
                        .attr('y2', (d) => this.args.nodePos(d.parent).im)
                        .attr('stroke-width', (d) => this.args.strokeWidth(d))
                        .attr('stroke-linecap', (d) => 'round');
                else
                    s.attr('d', (d) => this.arcOptions[c(d)](d))
                        .attr('stroke-width', (d) => this.args.strokeWidth(d))
                        .attr('stroke-linecap', (d) => 'round');
            },
        });
    }
    svgArc(a, b) {
        var $this = this;
        return function (d) {
            var arcP1 = $this.args.nodePos(d);
            var arcP2 = d.parent
                ? $this.args.nodePos(d.parent)
                : {
                    re: arcP1.re,
                    im: 1,
                };
            var arcC = (0, hyperbolic_math_2.arcCenter)(arcP1, arcP2);
            var r = (0, hyperbolic_math_1.CktoCp)((0, hyperbolic_math_1.CsubC)(arcP2, arcC.c)).r;
            if (isNaN(r) || r > 1000)
                r = 0;
            var f = arcC.d > 0 ? a : b;
            var s = $this.args.nodePosStr(d);
            var e = d.parent ? $this.args.nodePosStr(d.parent) : `${arcP1.re} 1`;
            return `M ${s} A ${r} ${r}, 0, 0, ${f}, ${e}`;
        };
    }
    svgArcLine(d) {
        var s = this.args.nodePosStr(d);
        var e = this.args.nodePosStr(d.parent);
        return `M ${s} L ${e}`;
    }
}
exports.ArcLayer = ArcLayer;
