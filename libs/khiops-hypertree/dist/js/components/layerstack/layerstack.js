"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayerStack = void 0;
const ducd_1 = require("../../ducd/");
class LayerStack {
    constructor(args) {
        this.update = {
            parent: () => this.updateLayers(),
            data: () => this.updateData(),
            pathes: () => this.updatePath(),
        };
        this.args = args;
        this.mainSvgGroup = this.args.parent.append('g');
        this.updateLayers();
    }
    updateLayers() {
        this.layers = {};
        for (var layerfactoryfunc of this.args.unitdisk.args.layers) {
            const view = {
                parent: this.mainSvgGroup,
                layerstack: this,
                unitdisk: this.args.unitdisk,
                hypertree: this.args.unitdisk.view.hypertree,
            };
            const layer = layerfactoryfunc(view, this.args.unitdisk);
            if (this.args.unitdisk.args.layerOptions)
                (0, ducd_1.mergeDeep)(layer.args, this.args.unitdisk.args.layerOptions[layer.name] || {});
            this.layers[layer.name] = layer;
        }
        this.mainSvgGroup.selectAll('*').remove();
        for (var l in this.layers)
            this.layers[l].update.parent();
    }
    updateData() {
        const timings = [];
        const names = [];
        for (var l in this.layers) {
            var layer = this.layers[l];
            var beginTime = performance.now();
            layer.update.data();
            timings.push(performance.now() - beginTime);
            names.push(layer.name);
        }
        this.d3meta = { Δ: timings, names: names };
    }
    updatePath() {
        var t0 = performance.now();
        if (this.layers['link-arcs'])
            this.layers['link-arcs'].update.style();
        if (this.layers['stem-arc'])
            this.layers['stem-arc'].update.style();
        if (this.layers['path-arcs'])
            this.layers['path-arcs'].update.data();
        var t1 = performance.now();
        // navigation background disk
        if (this.layers['link-arcs-focus'])
            this.layers['link-arcs-focus'].update.data();
        var t2 = performance.now();
        if (this.layers['labels'])
            this.layers['labels'].update.data();
        var t3 = performance.now();
        this.d3meta = {
            Δ: [t1 - t0, t2 - t1, t3 - t2],
            names: ['path-arcs', 'link-arcs-focus', 'labels'],
        };
    }
}
exports.LayerStack = LayerStack;
