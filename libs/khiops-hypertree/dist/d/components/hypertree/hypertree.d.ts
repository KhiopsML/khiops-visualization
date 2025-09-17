import { HypertreeArgs } from '../../models/hypertree/model';
import { N } from '../../models/n/n';
import { Path } from '../../models/path/path';
import { C } from '../../models/transformation/hyperbolic-math';
import { IUnitDisk } from '../unitdisk/unitdisk';
export declare class Hypertree {
    args: HypertreeArgs;
    data: N;
    langMap: {};
    view_: {
        parent: HTMLElement;
        html?: HTMLElement;
    };
    unitdisk: IUnitDisk;
    transition: Transition;
    log: any[];
    modelMeta: any;
    langMeta: any;
    layoutMeta: any;
    initPromise: Promise<void>;
    initPromisHandler: {
        resolve: any;
        reject: any;
    };
    isInitializing: boolean;
    lastCenterNode: any;
    constructor(view: {
        parent: HTMLElement;
    }, args: HypertreeArgs);
    api: {
        setModel: (model: HypertreeArgs) => Promise<void>;
        updateNodesVisualization: () => Promise<void>;
        setLangloader: (ok: any, err: any, ll: any) => void;
        setDataloader: (ok: any, err: any, dl: any) => void;
        updateDataloader: (ok: any, err: any, dl: any) => void;
        toggleSelection: (n: N) => void;
        addPath: (pathid: any, node: N, color: any) => void;
        removePath: (pathid: any, node: N) => void;
        setPathHead: (pathType: Path, n: N) => void;
        selectQuery: (query: string, prop: string) => void;
        gotoHome: (duration: number) => Promise<unknown>;
        gotoNode: (n: N, duration: number) => Promise<unknown>;
        goto: (p: any, l: any) => Promise<unknown>;
        gotoλ: (l: any) => Promise<unknown>;
    };
    update: {
        view: {
            parent: () => void;
            unitdisk: () => void;
        };
        data: () => void;
        transformation: () => void;
        pathes: () => void;
        centernode: (centerNode: any) => void;
    };
    protected updateParent(): void;
    protected updateUnitdiskView(): void;
    protected resetData(): void;
    protected initData(d3h: any, t0: any, t1: any, dl: any): void;
    protected updateWeights_(): void;
    private sum;
    protected updateLang_(): void;
    protected findInitλ_(): void;
    private virtualCanvas;
    private virtualCanvasContext;
    protected updateLabelLen_(): void;
    updateLayoutPath_(preservingnode: N): void;
    protected btnPathId: (pathType: string, n: N) => string;
    protected addIfNotInSafe<ArrET>(arr: ArrET[], newE: ArrET, side?: string): ArrET[];
    protected toggleSelection(n: N): void;
    protected setPathHead(path: Path, n: N): void;
    protected addPath(pathType: string, n: N, color?: any): Path;
    protected removePath(pathType: string, n: N): void;
    drawDetailFrame(): void;
    animateUp(ok: any, err: any): void;
    animateToλ(ok: any, err: any, newλ: any, duration?: number): void;
    animateTo(resolve: any, reject: any, newP: C, newλ: number, duration?: number): void;
    isAnimationRunning(): boolean;
}
export declare class Transition {
    hypertree: Hypertree;
    type: 'animation' | 'interaction' | 'script';
    frames: Frame[];
    lowdetail: boolean;
    currentframe: Frame;
    beginTime: any;
    endTime: any;
    constructor(hypertree: any);
    protected begin(): void;
    protected end(): void;
}
export declare class Frame {
    nr: number;
    created: number;
    begin: number;
    end: number;
    calculations: number;
    uiupdate: number;
    cachestats: {
        n: any;
    };
    constructor(nr: number);
}
