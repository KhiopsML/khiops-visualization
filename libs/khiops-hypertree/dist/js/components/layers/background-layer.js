"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundLayer = void 0;
const d3updatePattern_1 = require("../layerstack/d3updatePattern");
class BackgroundLayer {
    constructor(view, args) {
        this.name = 'background';
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
            data: [1],
            name: this.name,
            className: 'background-circle',
            elementType: 'circle',
            create: (s) => s.attr('r', 1).attr('fill', 'rgba(180, 180, 180, 0.7)'),
            updateColor: (s) => { },
            updateTransform: (s) => { },
        });
    }
}
exports.BackgroundLayer = BackgroundLayer;
