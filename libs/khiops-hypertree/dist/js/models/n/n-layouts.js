"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setZ = setZ;
exports.layoutBergé = layoutBergé;
const hyperbolic_math_1 = require("../transformation/hyperbolic-math");
const hyperbolic_math_2 = require("../transformation/hyperbolic-math");
const hyperbolic_math_3 = require("../transformation/hyperbolic-math");
const hyperbolic_math_4 = require("../transformation/hyperbolic-math");
const hyperbolic_math_5 = require("../transformation/hyperbolic-math");
const hyperbolic_math_6 = require("../transformation/hyperbolic-math");
function setZ(container, z) {
    if (!z)
        return;
    z = (0, hyperbolic_math_6.maxR)(z, 0.99999999);
    container.layout = container.layout || {};
    container.layout.z = z;
    container.layout.zStrCache = `${z.re} ${z.im}`;
    container.layout.zp = (0, hyperbolic_math_2.CktoCp)(z);
}
function wedgeTranslate(w, P) {
    const t = (0, hyperbolic_math_1.makeT)(P, hyperbolic_math_1.one);
    const pα = {
        re: Math.cos(w.α),
        im: Math.sin(w.α),
    };
    const pΩ = {
        re: Math.cos(w.Ω),
        im: Math.sin(w.Ω),
    };
    w.α = (0, hyperbolic_math_2.CktoCp)((0, hyperbolic_math_4.h2e)(t, pα)).θ;
    w.Ω = (0, hyperbolic_math_2.CktoCp)((0, hyperbolic_math_4.h2e)(t, pΩ)).θ;
}
function layoutBergé(n, λ, noRecursion = false) {
    let count = 0;
    function layoutNode(n) {
        const wedge = {
            Ω: n.layout.wedge.Ω,
            α: n.layout.wedge.α,
        };
        const L = n.layout.wedge.L;
        if (n.parent) {
            const angleWidth = (0, hyperbolic_math_5.πify)(wedge.Ω - wedge.α);
            const bisectionAngle = wedge.α + angleWidth / 2.0;
            let deflen = 1;
            if (!n.parent.parent)
                deflen = 0.5;
            const nz1 = (0, hyperbolic_math_2.CptoCk)({
                θ: bisectionAngle,
                r: λ * (deflen + L || 1),
            });
            setZ(n, (0, hyperbolic_math_4.h2e)((0, hyperbolic_math_1.makeT)(n.parent.layout.z, hyperbolic_math_1.one), nz1));
            wedgeTranslate(wedge, n.parent.layout.z);
            wedgeTranslate(wedge, (0, hyperbolic_math_3.Cneg)(n.layout.z));
        }
        let angleWidth = (0, hyperbolic_math_5.πify)(wedge.Ω - wedge.α);
        let currentAngle = wedge.α;
        const cl = n.children || [];
        const cllen = cl.length;
        let linecount = 0;
        let liner = 0;
        let resetCount = 0;
        let anglesum = 0;
        const parentWeight = (n.children || []).reduce((a, ccn) => a + ccn.precalc.layoutWeight, 0);
        cl.forEach((cn, i) => {
            const angleWeight = cn.precalc.layoutWeight / parentWeight;
            anglesum += angleWeight;
            const angleOffset = angleWidth * angleWeight;
            // current angle iterated through wegde borders (as hyperbolic angle)
            const α = currentAngle;
            currentAngle += angleOffset;
            const Ω = (0, hyperbolic_math_5.πify)(currentAngle);
            const cL = liner;
            const w = {
                α,
                Ω,
                L: cL,
            };
            cn.layout = cn.layout || {
                wedge: w,
            };
            cn.layout.wedge = w;
            linecount++;
            if (cn.height === 0)
                liner += 0.1;
            const rowcount = cllen / Math.log(cllen) / 2;
            if (linecount >= rowcount) {
                linecount = 0;
                liner = 0;
                resetCount++;
            }
        });
        if (!noRecursion)
            for (let cn of n.children || [])
                layoutNode(cn);
        count++;
    }
    layoutNode(n);
}
