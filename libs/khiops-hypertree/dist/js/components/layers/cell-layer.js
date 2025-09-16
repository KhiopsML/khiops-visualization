"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CellLayer = void 0;
const d3updatePattern_1 = require("../layerstack/d3updatePattern");
class CellLayer {
    constructor(view, args) {
        this.name = 'cells';
        this.update = {
            parent: () => this.attach(),
            data: () => this.d3updatePattern.update.data(),
            transformation: () => this.d3updatePattern.update.transformation(),
            style: () => this.d3updatePattern.update.style(),
        };
        this.view = view;
        this.args = args;
    }
    attach() {
        this.d3updatePattern = new d3updatePattern_1.D3UpdatePattern({
            parent: this.view.parent,
            layer: this,
            clip: this.args.clip,
            data: this.args.data,
            name: this.name,
            className: 'cell',
            elementType: 'polygon',
            create: (s) => s
                .attr('id', (d) => 'cell-' + d.data.mergeId)
                .classed('leaf', false)
                .classed('lazy', true)
                .style('stroke', (d) => (d.pathes && d.pathes.labelcolor) || this.args.stroke(d))
                .style('stroke-width', (d) => (d.pathes && d.pathes.labelcolor) || this.args.strokeWidth(d)),
            updateColor: (s) => s
                .classed('hovered', (d) => d.data.isPartOfAnyHoverPath && d.data.parent)
                .style('fill', (d) => (d.pathes && d.pathes.labelcolor) || this.args.fill(d)),
            updateTransform: (s) => s.attr('points', (d) => {
                return d && d.join(' ');
            }),
        });
    }
}
exports.CellLayer = CellLayer;
