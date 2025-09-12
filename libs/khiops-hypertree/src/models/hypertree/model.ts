import { N } from '../n/n';
import { Path } from '../path/path';
import { Trace } from '../trace/trace';
import { LayoutFunction } from '../n/n-layouts';
import { UnitDiskArgs } from '../unitdisk/unitdisk-model';
import { Hypertree } from '../../components/hypertree/hypertree';

export interface HypertreeArgs {
  langmap?: {} | null;
  dataloader?: (ok: (root: N, t0: number, dl: number) => void) => void;
  langloader?: (lang) => (ok) => void;
  langInitBFS: (ht: Hypertree, n: N) => void; // text, clickable, cell, :  auto--> textlen
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
      magic: number; // auto by init up
      weight: (n) => number;
      rangeCullingWeight: { min: number; max: number };
      rangeNodes: { min: number; max: number };
      alpha: number;
    };
    focusExtension: number;
    maxFocusRadius: number;
    wikiRadius: number;
    maxlabels: number;
  };
  geometry: UnitDiskArgs; // layer -+
  interaction: {
    mouseRadius: number;
    onNodeClick: (n, m, l) => void;
    onNodeSelect: (n: N) => void;
    onNodeHold: () => void; // x
    onNodeHover: (n) => void; // x
    onCenterNodeChange: (n: N, s: string) => void;
    onHoverNodeChange?: (n: N) => void;
    λbounds: [number, number];
    wheelFactor: number;
  };
}
