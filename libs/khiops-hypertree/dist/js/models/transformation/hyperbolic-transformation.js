"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformationCache = exports.NegTransformation = exports.PanTransformation = exports.HyperbolicTransformation = void 0;
const hyperbolic_math_1 = require("./hyperbolic-math");
const hyperbolic_math_2 = require("./hyperbolic-math");
const hyperbolic_math_3 = require("./hyperbolic-math");
const hyperbolic_math_4 = require("./hyperbolic-math");
class HyperbolicTransformation {
    constructor(tp) {
        this.cache = new TransformationCache();
        this.maxMouseR = 0.95;
        this.transformPoint = (p) => (0, hyperbolic_math_3.h2e)(this.state, p);
        this.transformDist = (p) => (0, hyperbolic_math_3.lengthDilledation)(p);
        this.onDragStart = (m) => (this.dST = (0, hyperbolic_math_4.clone)(this.state));
        this.onDragEnd = (m) => (this.dST = undefined);
        this.isMoving = () => this.dST !== undefined;
        this.onDragP = (s, e) => {
            const nt = (0, hyperbolic_math_3.compose)(this.dST, (0, hyperbolic_math_3.shift)(this.dST, s, (0, hyperbolic_math_4.maxR)(e, this.maxMouseR)));
            this.state.P = nt.P;
            this.state.θ = nt.θ;
        };
        this.onDragθ = (s, e) => { };
        this.onDragλ = (l) => (this.state.λ = l);
        this.state = tp;
    }
}
exports.HyperbolicTransformation = HyperbolicTransformation;
class PanTransformation {
    constructor(tp) {
        this.cache = new TransformationCache();
        this.maxMouseR = 1000;
        this.transformPoint = (p) => {
            var s = this.state.λ;
            var w = (0, hyperbolic_math_1.CktoCp)(this.state.θ).θ;
            var zp = (0, hyperbolic_math_1.CktoCp)(p);
            var rz = (0, hyperbolic_math_1.CptoCk)({ θ: zp.θ + w, r: zp.r });
            return (0, hyperbolic_math_2.CmulR)((0, hyperbolic_math_2.CaddC)(rz, (0, hyperbolic_math_2.CdivR)(this.state.P, s)), s);
        };
        this.transformDist = (p) => 1;
        this.onDragStart = (m) => (this.dST = (0, hyperbolic_math_4.clone)(this.state));
        this.onDragEnd = (m) => (this.dST = undefined);
        this.isMoving = () => this.dST !== undefined;
        this.onDragP = (s, e) => (0, hyperbolic_math_1.CassignC)(this.state.P, (0, hyperbolic_math_4.maxR)((0, hyperbolic_math_2.CaddC)(this.dST.P, (0, hyperbolic_math_2.CsubC)(e, s)), 0.95));
        this.onDragθ = (s, e) => (0, hyperbolic_math_1.CassignC)(this.state.θ, (0, hyperbolic_math_4.setR)(e, 1));
        this.onDragλ = (l) => (this.state.λ = l);
        this.state = tp;
    }
}
exports.PanTransformation = PanTransformation;
class NegTransformation {
    constructor(d) {
        this.cache = null;
        this.maxMouseR = 0;
        this.transformPoint = (p) => this.decorated.transformPoint((0, hyperbolic_math_2.CmulR)(p, -1));
        this.transformDist = (p) => this.decorated.transformDist((0, hyperbolic_math_2.CmulR)(p, -1));
        this.onDragStart = (m) => this.decorated.onDragStart((0, hyperbolic_math_2.CmulR)(m, -1));
        this.onDragEnd = (m) => this.decorated.onDragEnd((0, hyperbolic_math_2.CmulR)(m, -1));
        this.isMoving = () => this.decorated.isMoving();
        this.onDragP = (s, e) => this.decorated.onDragP((0, hyperbolic_math_2.CmulR)(s, -1), (0, hyperbolic_math_2.CmulR)(e, -1));
        this.onDragθ = (s, e) => this.decorated.onDragθ((0, hyperbolic_math_2.CmulR)(s, -1), (0, hyperbolic_math_2.CmulR)(e, -1));
        this.onDragλ = (l) => this.decorated.onDragλ(l);
        this.decorated = d;
        this.state = d.state;
        this.maxMouseR = d.maxMouseR;
        this.cache = d.cache;
    }
}
exports.NegTransformation = NegTransformation;
class TransformationCache {
    constructor() {
        this.cells = [];
    }
}
exports.TransformationCache = TransformationCache;
