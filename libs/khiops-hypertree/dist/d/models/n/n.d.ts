import { C, Cp, Ck } from '../transformation/hyperbolic-math';
import { Path } from '../path/path';
export interface NodePrecalulations {
    layoutWeight: number;
    cullingWeight: number;
    visWeight: number;
    weight: number;
    weightScale: number;
    label: string;
    labellen: number;
    clickable: boolean;
    cell: boolean;
}
export interface NodeLayout {
    wedge: {
        α: number;
        Ω: number;
        L?: number;
    };
    z?: Ck;
    zStrCache?: string;
    zp?: Cp;
}
export interface NodeTransformation {
    cache?: C;
    cachep?: Cp;
    strCache?: string;
    transformStrCache?: string;
    transformStrCacheZ?: string;
    scaleStrText?: string;
    distScale?: number;
    dampedDistScale?: number;
    isOutλ: any;
    isOut99: any;
    isOutWeight: any;
    isOut: any;
    hasOutPeriChildren: any;
    hasOutWeightChildren: any;
    hasOutChildren: boolean;
}
export interface NodePath {
    headof: Path;
    partof: Path[];
    finalcolor: string;
    labelcolor: string;
    isPartOfAnySelectionPath?: boolean;
    isPartOfAnyHoverPath?: boolean;
}
export interface N extends NodeTransformation {
    color: string;
    mergeId: number;
    id: string;
    name?: string;
    data: any;
    parent: N;
    children: Array<N>;
    depth: number;
    height: number;
    value?: number;
    ancestors: any;
    descendants: any;
    leaves: any;
    each: any;
    sum: any;
    precalc: NodePrecalulations;
    pathes: NodePath;
    minWeight: number;
    layout: NodeLayout;
    layoutReference: NodeLayout;
}
