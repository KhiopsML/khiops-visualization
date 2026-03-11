import { Delaunay } from 'd3';
import { N } from '../n/n';
import { IUnitDisk } from '../../components/unitdisk/unitdisk';
import { TransformationCache } from '../transformation/hyperbolic-transformation';

export function doVoronoiStuff(ud: IUnitDisk, cache: TransformationCache) {
  const clickableNodes = cache.unculledNodes.filter(
    (n: N) => n.precalc.clickable,
  );
  const points: [number, number][] = clickableNodes.map((d) => [
    d.cache.re,
    d.cache.im,
  ]);

  if (points.length > 0) {
    const delaunay = Delaunay.from(points);
    cache.voronoiDiagram = delaunay.voronoi([-2, -2, 2, 2]);
    cache.cells = Array.from(cache.voronoiDiagram.cellPolygons());
  } else {
    cache.voronoiDiagram = null;
    cache.cells = [];
  }
}

export function setHoverNodeCache(node: N, cache: TransformationCache) {
  cache.lastHovered = node;
}

export function doLabelStuff(ud: IUnitDisk, cache: TransformationCache) {
  var labels = cache.unculledNodes.filter((e: N) => e.precalc.label);

  var stdlabels = labels.filter((e) => !e.parent || !e.isOutλ);

  let damping = 1;
  while (stdlabels.length > ud.view.hypertree.args.filter.maxlabels) {
    stdlabels = stdlabels.filter(
      (n) =>
        n.precalc.cullingWeight * (n.parent === cache.centerNode ? 4 : 1) >
          n.minWeight * damping ||
        !n.parent ||
        n.pathes?.isPartOfAnyHoverPath,
    );
    damping /= 0.8;
  }
  cache.labels = stdlabels;
}
