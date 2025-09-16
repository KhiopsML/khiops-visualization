"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FocusLayer = void 0;
const d3updatePattern_1 = require("../layerstack/d3updatePattern");
class FocusLayer {
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
            data: [1],
            name: this.name,
            className: this.args.className || 'focus-circle',
            elementType: 'circle',
            create: (s) => s.attr('r', 1),
            updateColor: (s) => { },
            updateTransform: (s) => s.attr('transform', `translate(${this.args.center()}) scale(${this.args.r()})`),
        });
    }
}
exports.FocusLayer = FocusLayer;
