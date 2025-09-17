"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.D3UpdatePattern = void 0;
class D3UpdatePattern {
    constructor(args) {
        this.update = {
            parent: () => this.updateParent(),
            data: () => this.updateData(),
            transformation: () => this.elements.call(this.args.updateTransform),
            style: () => this.elements.call(this.args.updateColor),
        };
        this.mayEval = (d) => (typeof d === 'function' ? d() : d);
        this.args = args;
        this.updateParent();
    }
    updateParent() {
        this.mainSvgGroup = this.args.parent
            .append('g')
            .attr('id', this.args.name)
            .attr('clip-path', this.args.clip ? `url(${this.args.clip})` : undefined)
            .style('transform', 'translateZ(0)');
        this.elements = this.mainSvgGroup.selectAll(this.args.elementType);
    }
    updateData() {
        this.data = [];
        var isAnimating = this.args.layer.view.hypertree.isAnimationRunning();
        if ((!isAnimating && !this.args.layer.args.invisible) ||
            (isAnimating && !this.args.layer.args.hideOnDrag)) {
            this.data = this.mayEval(this.args.data);
        }
        this.elements = this.elements.data(this.data, (d) => d && d.mergeId);
        const removedElements = this.elements.exit().remove();
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
exports.D3UpdatePattern = D3UpdatePattern;
