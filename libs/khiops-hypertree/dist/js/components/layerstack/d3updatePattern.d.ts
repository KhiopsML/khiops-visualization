import { ILayer } from './layer';
export interface D3UpdatePatternArgs {
    parent: any;
    layer: ILayer;
    name: string;
    className: string;
    elementType: string;
    data: any;
    clip?: string;
    create: (s: any) => any;
    updateTransform: (s: any) => any;
    updateColor: (s: any) => any;
}
export declare class D3UpdatePattern {
    args: D3UpdatePatternArgs;
    data: any;
    update: {
        parent: () => void;
        data: () => void;
        transformation: () => any;
        style: () => any;
    };
    private mainSvgGroup;
    private elements;
    constructor(args: D3UpdatePatternArgs);
    private updateParent;
    private mayEval;
    private updateData;
}
