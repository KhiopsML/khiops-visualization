"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtoStr = exports.ArrtoC = exports.CdivR = exports.Clog = exports.Cpow = exports.CmulR = exports.CsubC = exports.CaddC = exports.Cneg = exports.CassignC = exports.CptoCk = exports.CktoCp = exports.one = void 0;
exports.dfs = dfs;
exports.dfsFlat = dfsFlat;
exports.dfs2 = dfs2;
exports.dfsFlat2 = dfsFlat2;
exports.clone = clone;
exports.sigmoid = sigmoid;
exports.maxR = maxR;
exports.setR = setR;
exports.πify = πify;
exports.makeT = makeT;
exports.h2e = h2e;
exports.compose = compose;
exports.shift = shift;
exports.arcCenter = arcCenter;
exports.lengthDilledation = lengthDilledation;
exports.ArrAddR = ArrAddR;
function dfs(n, fpre, idx) {
    idx = idx || 0;
    if (!n)
        return [];
    if (fpre)
        fpre(n, idx);
    if (n.children)
        for (var i = 0; i < n.children.length; i++)
            dfs(n.children[i], fpre, i);
}
function dfsFlat(n, f) {
    if (!n)
        return [];
    var r = [];
    dfs(n, (n) => {
        if (!f || f(n))
            r.push(n);
    });
    return r;
}
function dfs2({ node, abortFilter, preAction, highway, idx = 0 }) {
    if (!node)
        return;
    if (!abortFilter(node, idx, highway))
        return;
    if (preAction)
        preAction(node, idx, highway);
    if (node.children)
        for (var i = 0; i < node.children.length; i++) {
            var h = highway;
            if (highway.length > 1)
                if (node.children[i] == highway[1])
                    h = highway.slice(1);
            dfs2({
                node: node.children[i],
                abortFilter: abortFilter,
                preAction: preAction,
                highway: h,
                idx: i,
            });
        }
}
function dfsFlat2(n, f) {
    var r = [];
    dfs2({
        node: n,
        abortFilter: f,
        preAction: (n) => r.push(n),
        highway: [],
    });
    return r;
}
function clone(o) {
    return JSON.parse(JSON.stringify(o));
}
function sigmoid(x) {
    return 0.5 + 0.5 * Math.tanh(x * 6 - 3);
}
function maxR(c, v) {
    var mp = (0, exports.CktoCp)(c);
    mp.r = mp.r > v ? v : mp.r;
    return (0, exports.CptoCk)(mp);
}
function setR(c, r) {
    var mp = (0, exports.CktoCp)(c);
    mp.r = r;
    return (0, exports.CptoCk)(mp);
}
function πify(α) {
    if (α < 0)
        return α + 2 * Math.PI;
    if (α > 2 * Math.PI)
        return α - 2 * Math.PI;
    return α;
}
function makeT(a, b) {
    return {
        P: a,
        θ: b,
        λ: null,
    };
}
exports.one = {
    re: 1,
    im: 0,
};
function h2e(t, z) {
    var oben = (0, exports.CaddC)(CmulC(t.θ, z), t.P);
    var unten = (0, exports.CaddC)(CmulC(CmulC(Ccon(t.P), t.θ), z), exports.one);
    return CdivC(oben, unten);
}
function compose(t1, t2) {
    var divisor = (0, exports.CaddC)(CmulC(t2.θ, CmulC(t1.P, Ccon(t2.P))), exports.one);
    var θ = CdivC((0, exports.CaddC)(CmulC(t1.θ, t2.θ), CmulC(t1.θ, CmulC(Ccon(t1.P), t2.P))), divisor);
    return {
        P: CdivC((0, exports.CaddC)(CmulC(t2.θ, t1.P), t2.P), divisor),
        θ: setR(θ, 1),
        λ: null,
    };
}
function shift(h, s, e) {
    var p = h2e(h, {
        re: 0,
        im: 0,
    });
    var a = h2e(makeT((0, exports.Cneg)(p), exports.one), s);
    var esuba = (0, exports.CsubC)(e, a);
    var aec = Ccon(CmulC(a, e));
    var divisor = 1 - Math.pow((0, exports.CktoCp)(CmulC(a, e)).r, 2);
    var b = {
        re: CmulC(esuba, (0, exports.CaddC)(exports.one, aec)).re / divisor,
        im: CmulC(esuba, (0, exports.CsubC)(exports.one, aec)).im / divisor,
    };
    return compose(makeT((0, exports.Cneg)(p), exports.one), makeT(b, exports.one));
}
function arcCenter(a, b) {
    var d = a.re * b.im - b.re * a.im;
    var br = (0, exports.CktoCp)(b).r;
    var ar = (0, exports.CktoCp)(a).r;
    var numerator = (0, exports.CsubC)((0, exports.CmulR)(a, 1 + br * br), (0, exports.CmulR)(b, 1 + ar * ar));
    return {
        c: CmulC({
            re: 0,
            im: 1,
        }, (0, exports.CdivR)(numerator, 2 * d)),
        d: d,
    };
}
function lengthDilledation(p) {
    var r = Math.sqrt(p.re * p.re + p.im * p.im);
    return Math.sin(Math.acos(r > 1 ? 1 : r));
}
var CktoCp = (k) => ({
    θ: Math.atan2(k.im, k.re),
    r: Math.sqrt(k.re * k.re + k.im * k.im),
});
exports.CktoCp = CktoCp;
var CptoCk = (p) => ({
    re: p.r * Math.cos(p.θ),
    im: p.r * Math.sin(p.θ),
});
exports.CptoCk = CptoCk;
var CkassignCk = (a, b) => {
    a.re = b.re;
    a.im = b.im;
    return a;
};
var Ckneg = (p) => ({
    re: -p.re,
    im: -p.im,
});
var Ckcon = (p) => ({
    re: p.re,
    im: -p.im,
});
var CkaddC = (a, b) => ({
    re: a.re + b.re,
    im: a.im + b.im,
});
var CksubCk = (a, b) => ({
    re: a.re - b.re,
    im: a.im - b.im,
});
var CkmulR = (p, s) => ({
    re: p.re * s,
    im: p.im * s,
});
var CkmulCk = (a, b) => ({
    re: a.re * b.re - a.im * b.im,
    im: a.im * b.re + a.re * b.im,
});
var Ckpow = (a) => ({
    re: Math.cos(a),
    im: Math.sin(a),
});
var CkdivR = (p, s) => ({
    re: p.re / s,
    im: p.im / s,
});
var CkdivCk = (a, b) => CkdivCkImpl2(a, b);
var Cklog = (a) => (0, exports.CptoCk)(Cplog((0, exports.CktoCp)(a)));
var Cplog = (a) => CplogImpl(a);
exports.CassignC = CkassignCk;
exports.Cneg = Ckneg;
var Ccon = Ckcon;
exports.CaddC = CkaddC;
exports.CsubC = CksubCk;
exports.CmulR = CkmulR;
var CmulC = CkmulCk;
exports.Cpow = Ckpow;
exports.Clog = Cklog;
var CdivC = CkdivCk;
exports.CdivR = CkdivR;
var ArrtoC = (p) => ({
    re: p[0],
    im: p[1],
});
exports.ArrtoC = ArrtoC;
function ArrAddR(p, s) {
    return [p[0] + s, p[1] + s];
}
function CkdivCkImpl2(a, b) {
    var ap = (0, exports.CktoCp)(a);
    var bp = (0, exports.CktoCp)(b);
    return {
        re: (ap.r / bp.r) * Math.cos(ap.θ - bp.θ),
        im: (ap.r / bp.r) * Math.sin(ap.θ - bp.θ),
    };
}
function CplogImpl(a) {
    if (isFinite(Math.log(a.r)))
        return {
            r: Math.log(a.r),
            θ: a.θ,
        };
    else
        return {
            r: 0,
            θ: 0,
        };
}
var CtoStr = (c) => `${c.re} ${c.im}`;
exports.CtoStr = CtoStr;
