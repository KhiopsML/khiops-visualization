import { N }                        from '../n/n'
import { IUnitDisk }                 from "../../components/unitdisk/unitdisk"
import { TransformationCache }      from "../transformation/hyperbolic-transformation"

export function doVoronoiStuff(ud:IUnitDisk, cache:TransformationCache) {    
    //voro muss mindestens clickable enthalten für mousetonode bei click
    cache.voronoiDiagram = ud.voronoiLayout(
        cache.unculledNodes.filter((n:N)=> n.precalc.clickable)      
    )    
    cache.cells = cache.voronoiDiagram.polygons()
    /*
    if (cache.cells.length)
        console.log('UPDATEING VORO')
    else
        console.log('RESEETING VORO')
        */
}

export function setHoverNodeCache(node: N, cache: TransformationCache) {
    cache.lastHovered = node;
}

/*
cache.emojis = hasicon
cache.labels = haslabel + inpath - hasicon
cache.wikis  = haslabel + inpath - labels - wikis
*/
// export function doLabelStuff(ud:IUnitDisk, cache:TransformationCache) {    
//     var labels = cache.unculledNodes
//         .filter((e:N)=> e.precalc.label || e.precalc.icon)

//     //var pathLabels = labels
//     //    .filter((e:N)=> e.pathes.partof && e.pathes.partof.length)
        
//     var stdlabels = labels
//     //    .filter(e=> pathLabels.indexOf(e) === -1)        
//         .filter(e=> {                         
//             return (e.cachep.r <= ud.view.hypertree.args.filter.wikiRadius  && e.precalc.label.startsWith('𝐖'))
//                 || !e.parent                
//                 || !e.isOutλ
//         })
//         //.sort((a, b)=> a.label.length - b.label.length)
//         //.slice(0, 15)
        
//     let damping = 1
//     while (stdlabels.length > ud.view.hypertree.args.filter.maxlabels) {
//         stdlabels = stdlabels.filter(n=> 
//                (n.precalc.cullingWeight > (n.minWeight * damping) )
//             || !n.parent
//             /*|| !n.isOutλ*/)
//         damping /= .8
//     }

//     cache.labels = stdlabels//.concat(pathLabels)
// }

export function doLabelStuff(ud: IUnitDisk, cache: TransformationCache) {
    var labels = cache.unculledNodes
        .filter((e: N) => e.precalc.label || e.precalc.icon)

    var stdlabels = labels.filter(e => !e.parent || !e.isOutλ)

    let damping = 1
    while (stdlabels.length > ud.view.hypertree.args.filter.maxlabels) {
        stdlabels = stdlabels.filter(n =>
            (n.precalc.cullingWeight * (n.parent === cache.centerNode ? 4 : 1) > (n.minWeight * damping)) || !n.parent || n.pathes?.isPartOfAnyHoverPath)
        damping /= .8
    }

    //require labels to be shown for children of centernode;
    //Also, if the node is on a hover path, show the label;
    //var requiredLabels = labels.filter(n => n.pathes.isPartOfAnyHoverPath);

    //if (cache.centerNode.children.length < ud.view.hypertree.args.filter.maxlabels) {
    //    requiredLabels = requiredLabels.concat(labels.filter(x => x.parent === cache.centerNode));
    //}

    //cache.labels = stdlabels.concat(requiredLabels);
    cache.labels = stdlabels;
}

export function doImageStuff(ud:IUnitDisk, cache:TransformationCache) {
    cache.images = cache.unculledNodes
        .filter((e:N)=> e.precalc.imageHref)
}
