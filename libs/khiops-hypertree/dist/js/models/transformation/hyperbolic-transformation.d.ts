import { N } from '../n/n';
import { T } from './hyperbolic-math';
import { C } from './hyperbolic-math';
export interface Transformation<OT> {
    state: T;
    isMoving: () => boolean;
    cache: TransformationCache;
    transformPoint: (n: C) => C;
    transformDist: (p: C) => number;
    onDragStart: (m: C) => void;
    onDragEnd: (m: C) => void;
    onDragP: (s: C, e: C) => void;
    onDragθ: (s: C, e: C) => void;
    onDragλ: (l: number) => void;
    maxMouseR: number;
}
export declare class HyperbolicTransformation implements Transformation<N> {
    cache: TransformationCache;
    state: T;
    dST: T;
    maxMouseR: number;
    constructor(tp: T);
    transformPoint: (p: C) => import("./hyperbolic-math").Ck;
    transformDist: (p: C) => number;
    onDragStart: (m: C) => any;
    onDragEnd: (m: C) => any;
    isMoving: () => boolean;
    onDragP: (s: C, e: C) => void;
    onDragθ: (s: C, e: C) => void;
    onDragλ: (l: number) => number;
}
export declare class PanTransformation implements Transformation<N> {
    cache: TransformationCache;
    state: T;
    dST: T;
    maxMouseR: number;
    constructor(tp: T);
    transformPoint: (p: C) => {
        re: number;
        im: number;
    };
    transformDist: (p: C) => number;
    onDragStart: (m: C) => any;
    onDragEnd: (m: C) => any;
    isMoving: () => boolean;
    onDragP: (s: C, e: C) => import("./hyperbolic-math").Ck;
    onDragθ: (s: C, e: C) => import("./hyperbolic-math").Ck;
    onDragλ: (l: number) => number;
}
export declare class NegTransformation implements Transformation<N> {
    cache: TransformationCache;
    state: T;
    decorated: Transformation<N>;
    maxMouseR: number;
    constructor(d: Transformation<N>);
    transformPoint: (p: C) => import("./hyperbolic-math").Ck;
    transformDist: (p: C) => number;
    onDragStart: (m: C) => void;
    onDragEnd: (m: C) => void;
    isMoving: () => boolean;
    onDragP: (s: C, e: C) => void;
    onDragθ: (s: C, e: C) => void;
    onDragλ: (l: number) => void;
}
export declare class TransformationCache {
    N: number;
    focusR: number;
    centerNode: N;
    unculledNodes: N[];
    links: N[];
    leafOrLazy: N[];
    spezialNodes: N[];
    paths: N[];
    weights: N[];
    labels: N[];
    emojis: N[];
    images: N[];
    lastHovered?: N;
    voronoiDiagram: any;
    cells: any[];
}
