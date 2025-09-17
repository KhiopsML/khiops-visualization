"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionLayer2 = void 0;
const d3 = require("d3");
const hyperbolic_math_1 = require("../../models/transformation/hyperbolic-math");
const hyperbolic_math_2 = require("../../models/transformation/hyperbolic-math");
const hyperbolic_math_3 = require("../../models/transformation/hyperbolic-math");
const hyperbolic_math_4 = require("../../models/transformation/hyperbolic-math");
const hyperbolic_math_5 = require("../../models/transformation/hyperbolic-math");
const preset_process_1 = require("../../models/hypertree/preset-process");
class InteractionLayer2 {
    constructor(view, args) {
        this.name = 'interaction-2';
        this.update = {
            parent: () => this.updateParent(),
            data: () => { },
            transformation: () => { },
            style: () => { },
        };
        this.panStart = null;
        this.pinchInitDist = null;
        this.pinchInitλp = null;
        this.nopinch = null;
        this.pinchcenter = null;
        this.pinchPreservingNode = null;
        this.currMousePosAsArr = () => d3.mouse(this.view.parent.node());
        this.currMousePosAsC = () => (0, hyperbolic_math_2.ArrtoC)(this.currMousePosAsArr());
        this.findNodeByCell = () => {
            var m = this.currMousePosAsArr();
            var find = this.view.unitdisk.cache.voronoiDiagram.find(m[0], m[1]);
            return find ? find.data : undefined;
        };
        this.findUnculledNodeByCell = (m) => {
            const voronoiLayout = d3
                .voronoi()
                .x((d) => {
                return d.cache.re;
            })
                .y((d) => {
                return d.cache.im;
            })
                .extent([
                [-2, -2],
                [2, 2],
            ]);
            const voronoiDiagram = voronoiLayout(this.view.unitdisk.cache.unculledNodes);
            const find = voronoiDiagram.find(m.re, m.im);
            return find ? find.data : undefined;
        };
        this.view = view;
        this.args = args;
        this.htapi = this.view.hypertree.api;
        this.hoverpath = this.view.hypertree.args.objects.pathes[0];
        this.mousedown = false;
    }
    updateParent() {
        const mousehandlers = (de) => de
            .on('wheel', (e) => this.fireMouseWheelEvent())
            .on('mousedown', (e) => this.fireMouseDown())
            .on('mousemove', (e) => {
            this.fireNodeHover(this.findNodeByCell());
            this.fireMouseMove();
        })
            .on('mouseup', (e) => this.fireMouseUp())
            .on('mouseout', (e) => {
            this.fireNodeHover(undefined);
            this.htapi.setPathHead(this.hoverpath, undefined);
        })
            .on('touchstart', (e) => this.fireTouchEvent('onPointerStart'))
            .on('touchmove', (e) => this.fireTouchEvent('onPointerMove'))
            .on('touchend', (e) => this.fireTouchEvent('onPointerEnd'))
            .on('touchcancel', (e) => this.fireTouchEvent('onPointerEnd'));
        this.view.parent
            .append('circle')
            .attr('class', 'mouse-circle')
            .attr('r', 5)
            .call(mousehandlers);
        this.view.parent
            .append('circle')
            .attr('class', 'mouse-circle-cursor')
            .attr('r', this.args.mouseRadius)
            .call(mousehandlers);
    }
    // just to keep the list above clear
    fireMouseDown() {
        this.mousedown = true;
        this.fireMouseEvent('onPointerStart');
    }
    fireMouseMove() {
        if (this.mousedown)
            this.fireMouseEvent('onPointerMove');
        else {
            if (!this.view.hypertree.isInitializing &&
                !this.view.hypertree.isAnimationRunning())
                this.htapi.setPathHead(this.hoverpath, this.findNodeByCell());
        }
    }
    fireMouseUp() {
        this.mousedown = false;
        this.fireMouseEvent('onPointerEnd');
    }
    async fireNodeHover(n) {
        //fire onNodeHover if the node is close enough
        //or if the node is undefined, we will also tell the onNodeHover function
        if (this.mousedown) {
            //when we are dragging, hide the popup
            (0, preset_process_1.setHoverNodeCache)(undefined, this.view.unitdisk.cache);
            this.view.hypertree.args.interaction.onHoverNodeChange(undefined);
            return;
        }
        if ((!this.view.unitdisk.cache.lastHovered && !n) ||
            (this.view.unitdisk.cache.lastHovered &&
                n &&
                this.view.unitdisk.cache.lastHovered.data.id === n.data.id))
            return;
        if (n && n.distScale > 0.5) {
            (0, preset_process_1.setHoverNodeCache)(n, this.view.unitdisk.cache);
            if (this.view.hypertree.args.interaction.onHoverNodeChange) {
                this.view.hypertree.args.interaction.onHoverNodeChange(n);
            }
        }
        else {
            await this.delay(100);
            if (!this.view.unitdisk.cache.lastHovered)
                return;
            (0, preset_process_1.setHoverNodeCache)(undefined, this.view.unitdisk.cache);
            if (this.view.hypertree.args.interaction.onHoverNodeChange) {
                this.view.hypertree.args.interaction.onHoverNodeChange(undefined);
            }
        }
    }
    delay(ms) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(null), ms);
        });
    }
    //-----------------------------------------------------------------------------------------
    fireMouseEvent(eventName) {
        d3.event.stopPropagation();
        d3.event.preventDefault();
        const m = this.currMousePosAsC();
        requestAnimationFrame(() => {
            try {
                if (this[eventName]('mouse', m))
                    this.view.hypertree.update.transformation();
            }
            catch (error) { }
        });
    }
    fireMouseWheelEvent() {
        d3.event.stopPropagation();
        d3.event.preventDefault();
        const mΔ = d3.event.deltaY;
        const oldλp = this.view.unitdisk.args.transformation.state.λ;
        const Δsens = this.view.hypertree.args.interaction.wheelFactor;
        const newλp = mΔ >= 0 ? oldλp / Δsens : oldλp * Δsens; //- λΔ
        if (newλp > this.view.hypertree.args.interaction.λbounds[0] &&
            newλp < this.view.hypertree.args.interaction.λbounds[1]) {
            const m = this.currMousePosAsArr();
            requestAnimationFrame(() => {
                const t = this.view.unitdisk.args.transformation;
                const preservingNode = this.findUnculledNodeByCell((0, hyperbolic_math_2.ArrtoC)(m));
                t.onDragλ(newλp);
                this.view.hypertree.updateLayoutPath_(preservingNode); // only path to center
                t.state.P = (0, hyperbolic_math_5.compose)(t.state, (0, hyperbolic_math_5.shift)(t.state, {
                    re: 0,
                    im: 0,
                }, preservingNode.cache)).P;
                this.view.hypertree.update.transformation();
            });
        }
    }
    fireTouchEvent(eventName) {
        d3.event.stopPropagation();
        d3.event.preventDefault();
        const changedTouches = d3.event.changedTouches;
        let update = false;
        for (let i = 0; i < changedTouches.length; ++i) {
            const t = changedTouches[i];
            const pid = t.identifier;
            const m = (0, hyperbolic_math_2.ArrtoC)(d3.touches(this.view.parent.node(), changedTouches)[i]);
            update = this[eventName](pid, m) || update;
        }
        requestAnimationFrame(() => {
            if (update)
                this.view.hypertree.update.transformation();
        });
    }
    onPointerStart(pid, m) {
        if ((0, hyperbolic_math_2.CktoCp)(m).r >= 1)
            return false;
        this.view.hypertree.args.objects.traces.push({
            id: pid,
            points: [m],
        });
        if (this.view.hypertree.args.objects.traces.length === 1) {
            this.dST = (0, hyperbolic_math_4.clone)(this.view.unitdisk.args.transformation.state);
            this.view.unitdisk.isDraging = true;
            this.panStart = m;
            this.nopinch = true;
        }
        else if (this.view.hypertree.args.objects.traces.length === 2) {
            const t0 = this.view.hypertree.args.objects.traces[0];
            const t0e = t0.points[t0.points.length - 1];
            this.pinchcenter = (0, hyperbolic_math_3.CmulR)((0, hyperbolic_math_3.CaddC)(t0e, m), 0.5);
            this.view.unitdisk.pinchcenter = this.pinchcenter;
            this.pinchPreservingNode = this.findUnculledNodeByCell(this.pinchcenter);
            this.pinchInitDist = this.dist(t0e, m);
            this.pinchInitλp = this.view.unitdisk.args.transformation.state.λ;
            this.nopinch = false;
        }
        else {
        }
        return false;
    }
    onPointerMove(pid, m) {
        const trace = this.findTrace(pid);
        if (!trace) {
            return false;
        }
        trace.points.push(m);
        if (this.view.hypertree.args.objects.traces.length === 1) {
            const t = this.view.unitdisk.args.transformation;
            t.state.P = (0, hyperbolic_math_5.compose)(this.dST, (0, hyperbolic_math_5.shift)(this.dST, this.panStart, (0, hyperbolic_math_1.maxR)(m, 0.9))).P;
        }
        else if (this.view.hypertree.args.objects.traces.length === 2) {
            const t0 = this.view.hypertree.args.objects.traces[0];
            const t0e = t0.points[t0.points.length - 1];
            const t1 = this.view.hypertree.args.objects.traces[1];
            const t1e = t1.points[t1.points.length - 1];
            const dist = this.dist(t0e, t1e);
            const f = dist / this.pinchInitDist;
            const newλp = this.pinchInitλp * f;
            if (newλp > this.view.hypertree.args.interaction.λbounds[0] &&
                newλp < this.view.hypertree.args.interaction.λbounds[1]) {
                const pinchcenter2 = (0, hyperbolic_math_1.maxR)((0, hyperbolic_math_3.CmulR)((0, hyperbolic_math_3.CaddC)(t0e, t1e), 0.5), this.args.mouseRadius);
                const t = this.view.unitdisk.args.transformation;
                t.onDragλ(newλp);
                this.view.hypertree.updateLayoutPath_(this.pinchPreservingNode); // only path to center
                t.state.P = (0, hyperbolic_math_5.compose)(t.state, (0, hyperbolic_math_5.shift)(t.state, {
                    re: 0,
                    im: 0,
                }, this.pinchPreservingNode.cache)).P;
                t.state.P = (0, hyperbolic_math_5.compose)(t.state, (0, hyperbolic_math_5.shift)(t.state, this.pinchcenter, pinchcenter2)).P;
                this.pinchcenter = (0, hyperbolic_math_3.CmulR)((0, hyperbolic_math_3.CaddC)(this.pinchcenter, pinchcenter2), 0.5);
                this.view.unitdisk.pinchcenter = this.pinchcenter;
            }
        }
        else {
        }
        return true;
    }
    onPointerEnd(pid, m) {
        this.view.hypertree.args.objects.traces =
            this.view.hypertree.args.objects.traces.filter((e) => e.id !== pid);
        this.pinchcenter = undefined;
        this.view.unitdisk.pinchcenter = this.pinchcenter;
        this.pinchPreservingNode = undefined;
        if (this.view.hypertree.args.objects.traces.length === 0) {
            this.dST = undefined;
            this.view.unitdisk.isDraging = false;
            if (this.dist(this.panStart, m) < 0.006 && this.nopinch) {
                if ((0, hyperbolic_math_2.CktoCp)(m).r < 1) {
                    this.click(m);
                    return false;
                }
            }
        }
        else if (this.view.hypertree.args.objects.traces.length === 1) {
            const otherPoints = this.view.hypertree.args.objects.traces[0].points;
            this.panStart = otherPoints[otherPoints.length - 1]; //others.lastpoint
            this.dST = (0, hyperbolic_math_4.clone)(this.view.unitdisk.args.transformation.state);
            this.view.unitdisk.isDraging = true;
        }
        else {
        }
        return true;
    }
    //-----------------------------------------------------------------------------------------
    ripple(n, m, ok, useClip = true) {
        if (useClip &&
            !this.view.unitdisk.layerStack.layers['cells'].args.invisible) {
            const rippleClip = this.view.parent
                .append('clipPath')
                .attr('id', `cell-clip-${n.mergeId}`)
                .html(`<use xlink:href="#cell-${n.mergeId}"></use>`);
            const rippleCircle = this.view.parent
                .insert('g', ':first-child')
                .attr('class', 'ripple-world')
                .attr('clip-path', `url(#cell-clip-${n.mergeId})`)
                .append('circle')
                .attr('class', 'ripple-circle')
                .attr('r', 0.1)
                .attr('cx', m.re)
                .attr('cy', m.im)
                .attr('transform-origin', `${m.re}  ${m.im}`)
                .on('animationend', () => {
                rippleCircle.remove();
                rippleClip.remove();
                ok();
            });
        }
        else {
            const rippleCircle = this.view.parent
                .insert('g', ':first-child')
                .attr('class', 'ripple-world')
                .append('circle')
                .attr('class', 'ripple-circle')
                .attr('r', 0.1)
                .attr('cx', m.re)
                .attr('cy', m.im)
                .attr('transform-origin', `${m.re}  ${m.im}`)
                .on('animationend', () => {
                rippleCircle.remove();
                ok();
            });
        }
    }
    click(m) {
        const q = this.view.unitdisk.cache.voronoiDiagram.find(m.re, m.im);
        const n = q ? q.data : undefined;
        if (!this.view.hypertree.isAnimationRunning())
            this.view.hypertree.args.interaction.onNodeClick(n, m, this);
    }
    findTrace(pid) {
        return this.view.hypertree.args.objects.traces.find((e) => e.id === pid);
    }
    dist(a, b) {
        const diff = (0, hyperbolic_math_3.CsubC)(a, b);
        return Math.sqrt(diff.re * diff.re + diff.im * diff.im);
    }
}
exports.InteractionLayer2 = InteractionLayer2;
class NoInteractionState {
    constructor() { }
    onPointerStart(pid, m) { }
    onPointerMove(pid, m) { }
    onPointerEnd(pid, m) { }
}
class MouseDownState {
    constructor() { }
    onPointerStart(pid, m) { }
    onPointerMove(pid, m) { }
    onPointerEnd(pid, m) { }
}
