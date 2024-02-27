import { N } from '../n/n';
import { IUnitDisk } from '../../components/unitdisk/unitdisk';
import { TransformationCache } from '../transformation/hyperbolic-transformation';

export function doVoronoiStuff(ud: IUnitDisk, cache: TransformationCache) {
  cache.voronoiDiagram = ud.voronoiLayout(
    cache.unculledNodes.filter((n: N) => n.precalc.clickable),
  );
  cache.cells = cache.voronoiDiagram.polygons();
}

export function setHoverNodeCache(node: N, cache: TransformationCache) {
  cache.lastHovered = node;
}

export function doLabelStuff(ud: IUnitDisk, cache: TransformationCache) {
  var labels = cache.unculledNodes.filter(
    (e: N) => e.precalc.label || e.precalc.icon,
  );

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

export function doImageStuff(ud: IUnitDisk, cache: TransformationCache) {
  cache.images = cache.unculledNodes.filter((e: N) => e.precalc.imageHref);
}
