import { N } from './n';
export type LoaderFunction = (ok: (root: N, t0: number, dl: number) => void) => void;
export declare var path_: (len: any) => (ok: any) => void;
export declare var star_: (degree: any) => (ok: any) => void;
export declare var fromData: (f: any) => (ok: any) => void;
export declare function nTreeAtFirst(ok: any, max?: number, deg?: number): void;
export declare function nTree(ok: any, depth?: number, childs?: number): void;
export declare function deepStar(ok: any, arms?: number, depth?: number): void;
/**
 * special tactics loader for navDisks
 * generates a path containing nodes for each member of 'o'
 *
 * no new object created, o is extended by tree stuff.
 */
export declare function obj2data(o: any): any;
export declare function navdata(): any;
export declare function code(ok: any): void;
export declare namespace generators {
    var star120: typeof deepStar;
    var star501: (ok: any) => void;
    var path500: (ok: any) => void;
    var nT1: typeof nTree;
    var nT2: typeof nTreeAtFirst;
}
