import { N } from '../n/n';
import { UnitDisk } from '../../components/unitdisk/unitdisk';
import { NodeLayer } from '../../components/layers/node-layer';
import { CellLayer } from '../../components/layers/cell-layer';
import { BackgroundLayer } from '../../components/layers/background-layer';
import { ArcLayer } from '../../components/layers/link-layer';
import { LabelLayer } from '../../components/layers/label-layer';
import { LabelForceLayer } from '../../components/layers/label-force-layer';
import { InteractionLayer } from '../../components/layers/interaction-layer';
import { InteractionLayer2 } from '../../components/layers/interaction-layer-2';
import { FocusLayer } from '../../components/layers/focus-layer';
export declare const labeloffsets: {
    centerOffset: (cache: string) => (d: N, i: any, v: any) => {
        re: number;
        im: number;
    };
    nodeRadiusOffset: (ls: UnitDisk) => (d: N) => {
        re: number;
        im: number;
    };
    labeloffset: (ud: any) => (d: any, i: any, v: any) => {
        re: number;
        im: number;
    };
    outwards: any;
    outwardsPlusNodeRadius: any;
};
export declare const layerSrc: (((v: any, ud: UnitDisk) => BackgroundLayer) | ((v: any, ud: UnitDisk) => CellLayer) | ((v: any, ud: UnitDisk) => FocusLayer) | ((v: any, ud: UnitDisk) => NodeLayer) | ((v: any, ud: UnitDisk) => ArcLayer) | ((v: any, ud: UnitDisk) => LabelLayer) | ((v: any, ud: UnitDisk) => LabelForceLayer) | ((v: any, ud: UnitDisk) => InteractionLayer) | ((v: any, ud: UnitDisk) => InteractionLayer2))[];
