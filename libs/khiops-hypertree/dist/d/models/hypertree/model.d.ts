import { N } from '../n/n';
import { Path } from '../path/path';
import { Trace } from '../trace/trace';
import { LayoutFunction } from '../n/n-layouts';
import { UnitDiskArgs } from '../unitdisk/unitdisk-model';
import { Hypertree } from '../../components/hypertree/hypertree';
export interface HypertreeArgs {
    langmap?: {} | null;
    dataloader?: (ok: (root: N, t0: number, dl: number) => void) => void;
    langloader?: (lang: any) => (ok: any) => void;
    langInitBFS: (ht: Hypertree, n: N) => void;
    objects: {
        pathes: Path[];
        selections: N[];
        traces: Trace[];
    };
    layout: {
        type: LayoutFunction;
        weight: (n: N) => number;
        initSize: number;
        rootWedge: {
            orientation: number;
            angle: number;
        };
    };
    filter: {
        type: string;
        cullingRadius: number;
        weightFilter: {
            magic: number;
            weight: (n: any) => number;
            rangeCullingWeight: {
                min: number;
                max: number;
            };
            rangeNodes: {
                min: number;
                max: number;
            };
            alpha: number;
        };
        focusExtension: number;
        maxFocusRadius: number;
        maxlabels: number;
    };
    geometry: UnitDiskArgs;
    interaction: {
        mouseRadius: number;
        onNodeClick: (n: any, m: any, l: any) => void;
        onNodeSelect: (n: N) => void;
        onNodeHold: () => void;
        onNodeHover: (n: any) => void;
        onCenterNodeChange: (n: N, s: string) => void;
        onHoverNodeChange?: (n: N) => void;
        λbounds: [number, number];
        wheelFactor: number;
    };
}
