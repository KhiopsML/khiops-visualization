"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeLayer = void 0;
const d3updatePattern_1 = require("../layerstack/d3updatePattern");
class NodeLayer {
    constructor(view, args) {
        this.update = {
            parent: () => this.attach(),
            data: () => this.d3updatePattern.update.data(),
            transformation: () => this.d3updatePattern.update.transformation(),
            style: () => this.d3updatePattern.update.style(),
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
            name: this.args.name,
            className: this.args.className,
            elementType: 'circle',
            create: (s) => s
                .attr('r', (d) => this.args.r(d))
                .classed('root', (d) => !d.parent)
                .classed('lazy', (d) => d.hasOutChildren)
                .classed('leaf', (d) => d.parent)
                .classed('exit', (d) => (!d.children || !d.children.length) && d.data && d.data.numLeafs)
                // @ts-ignore
                .style('stroke', (d) => (d.pathes && d.pathes.labelcolor) || this.args.stroke(d))
                .style('stroke-width', (d) => (d.pathes && d.pathes.labelcolor) || this.args.strokeWidth(d)),
            updateColor: (s) => s
                .classed('hovered', (d) => d.pathes && d.pathes.isPartOfAnyHoverPath)
                .classed('selected', (d) => d.pathes && d.pathes.isPartOfAnySelectionPath)
                .style('fill', (d) => (d.pathes && d.pathes.labelcolor) || this.args.fill(d))
                .style('fill-opacity', (d) => this.args.opacity(d) || 1),
            //updateColor:       s=> s.classed("hovered",   d=> d.isPartOfAnyHoverPath && d.parent)
            //                        .classed("selected",  d=> d.isPartOfAnySelectionPath && d.parent),
            updateTransform: (s) => {
                s.attr('transform', (d) => this.args.transform(d))
                    .style('stroke', (d) => d.pathes && d.pathes.labelcolor)
                    .attr('r', (d) => {
                    if (this.args.r(d) > 0) {
                        return this.args.r(d);
                    }
                });
            },
        });
    }
}
exports.NodeLayer = NodeLayer;
