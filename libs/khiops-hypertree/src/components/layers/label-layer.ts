import {
    ILayer
} from '../layerstack/layer'
import {
    ILayerView
} from '../layerstack/layer'
import {
    ILayerArgs
} from '../layerstack/layer'
import {
    D3UpdatePattern
} from '../layerstack/d3updatePattern'

export interface LabelLayerArgs extends ILayerArgs {
    name: string,
    className: string,
    invisible ? : boolean,
    hideOnDrag ? : boolean,
    data: () => any,
    isVisible: (d) => any,
    background,
    color,
    delta,
    transform,
    text,
    clip ? : string,
}

export class LabelLayer implements ILayer {
    view: ILayerView
    args: LabelLayerArgs
    d3updatePattern: D3UpdatePattern
    d3updatePattern2: D3UpdatePattern
    name: string
    isVisible: (d) => any
    simulation
    update = {
        parent: () => this.attach(),
        data: () => {
            if (this.d3updatePattern) {
                this.d3updatePattern.update.data()

                // console.log("🚀 ~ file: label-layer.ts ~ line 42 ~ LabelLayer ~ this.args.background", this.args.background)
                // if (this.args.background)
                //     this.d3updatePattern.addTextBackgroundRects(
                //         paddingLeftRight,
                //         paddingTopBottom,
                //         .05,
                // 		this.args.name)

                //this.d3updatePattern2.update.data()
            }

        },
        transformation: () => {
            if (this.d3updatePattern) {
                // console.log("🚀 ~ file: label-layer.ts ~ line 56 ~ LabelLayer ~ this.d3updatePattern", this.d3updatePattern)
                this.d3updatePattern.update.transformation()
                //this.d3updatePattern2.update.transformation()
            }

        },
        style: () => {
            // console.log("🚀 ~ file: label-layer.ts ~ line 64 ~ LabelLayer ~ this", this.isVisible)
            if (this.d3updatePattern) {
                this.d3updatePattern.update.style()
                //this.d3updatePattern2.update.style()
            }

        }
    }

    constructor(view: ILayerView, args: LabelLayerArgs) {
        this.view = view
        this.args = args
        this.name = args.name
        this.isVisible = args.isVisible
    }

    private attach() {
        // console.log("🚀 ~ file: label-layer.ts ~ line 81 ~ LabelLayer ~ attach ~ attach")
        if (!this.args.invisible) {

            const $this = this

            function offset(d, i, v) {
                return $this.args.transform(d, $this.args.delta(d, i, v))
            }

            // console.warn(this.args.isVisible(d))

            this.d3updatePattern = new D3UpdatePattern({
                parent: this.view.parent,
                layer: this,
                clip: this.args.clip,
                data: this.args.data,
                name: this.name,
                className: this.args.className,
                elementType: 'text',
                create: s => s.classed("P", d => d.name == 'P')
                    // .classed("caption-icon", d => d.precalc.icon && navigator.platform.includes('inux'))
                    //.style("fill",           d=> d.pathes.finalcolor)
                    .style("stroke", d => d.pathes && d.pathes.labelcolor)
                    .style("fill", d => this.args.color(d))
                    .style("display", d => this.args.isVisible(d))
                    .text(this.args.text),
                updateColor: s => s.style("stroke", d => d.pathes && d.pathes.labelcolor)
                    .style("fill", d => this.args.color(d)),
                updateTransform: s => s.attr("transform", offset)
                //                         .text(                   this.args.text) 
            })
        }

    }
}

var paddingLeftRight = .08
var paddingTopBottom = .02

export var bboxCenter = (d, cacheId = 'labelslen') => {
    var w = d.precalc[cacheId]
    var h = .045
    // console.assert(w)
    return {
        re: -w / 2,
        im: h / 3
    }
}

export var bboxOval = (d, cacheId = 'labelslen', θn = undefined) => {
    var w = d.precalc[cacheId]
    var h = .045
    // console.assert(w)
    const θ = θn ? θn.θ : d.cachep.θ
    /*
        return CsubC(        
            { 
                re:(w/2+paddingLeftRight/2)*Math.cos(θ), 
                im:(h/2+paddingTopBottom/2)*Math.sin(θ) 
            },
            { re:w/2, im:h/2}
        )
    */
    const result = {
        re: (paddingLeftRight / 2 + w / 2) * Math.cos(θ) - w / 2,
        im: (paddingTopBottom / 2 + h / 2) * Math.sin(θ) + h / 3
    }
    // console.assert(result.re)
    return result
}