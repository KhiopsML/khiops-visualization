export declare function dfs(n: any, fpre: any, idx?: any): any[];
export declare function dfsFlat(n: any, f?: any): any[];
export declare function dfs2({ node, abortFilter, preAction, highway, idx }: {
    node: any;
    abortFilter: any;
    preAction: any;
    highway: any;
    idx?: number;
}): void;
export declare function dfsFlat2(n: any, f?: any): any[];
export declare function clone(o: any): any;
export declare function sigmoid(x: any): number;
export declare function maxR(c: C, v: number): {
    re: number;
    im: number;
};
export declare function setR(c: C, r: any): {
    re: number;
    im: number;
};
export declare function πify(α: number): number;
export interface T {
    P: C;
    θ: C;
    λ: number;
}
export declare function makeT(a: any, b: any): {
    P: any;
    θ: any;
    λ: any;
};
export declare var one: {
    re: number;
    im: number;
};
export declare function h2e(t: T, z: C): C;
export declare function compose(t1: T, t2: T): T;
export declare function shift(h: T, s: C, e: C): T;
export declare function arcCenter(a: C, b: C): {
    c: {
        re: number;
        im: number;
    };
    d: number;
};
export declare function lengthDilledation(p: C): number;
export type R2 = {
    x: number;
    y: number;
};
export type Ck = {
    re: number;
    im: number;
};
export type Cp = {
    θ: number;
    r: number;
};
export type C = Ck;
export declare var CktoCp: (k: Ck) => {
    θ: number;
    r: number;
};
export declare var CptoCk: (p: Cp) => {
    re: number;
    im: number;
};
export declare var CassignC: (a: Ck, b: Ck) => Ck;
export declare var Cneg: (p: Ck) => {
    re: number;
    im: number;
};
export declare var CaddC: (a: Ck, b: Ck) => {
    re: number;
    im: number;
};
export declare var CsubC: (a: Ck, b: Ck) => {
    re: number;
    im: number;
};
export declare var CmulR: (p: Ck, s: number) => {
    re: number;
    im: number;
};
export declare var Cpow: (a: number) => {
    re: number;
    im: number;
};
export declare var Clog: (a: Ck) => {
    re: number;
    im: number;
};
export declare var CdivR: (p: Ck, s: number) => {
    re: number;
    im: number;
};
export declare var ArrtoC: (p: number[]) => {
    re: number;
    im: number;
};
export declare function ArrAddR(p: [number, number], s: number): [number, number];
export declare var CtoStr: (c: C) => string;
