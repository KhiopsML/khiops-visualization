import {
	Component,
	Input,
	NgZone,
	SimpleChanges,
	OnChanges,
	OnInit
} from '@angular/core';
import {
	TreeNodeVO
} from '@khiops-covisualization/model/tree-node-vo';
import {
	SelectableService
} from '@khiops-library/components/selectable/selectable.service';
import {
	SelectableComponent
} from '@khiops-library/components/selectable/selectable.component';
import {
	TranslateService
} from '@ngstack/translate';
import {
	AnnotationService
} from '@khiops-covisualization/providers/annotation.service';
import { ConfigService } from '@khiops-library/providers/config.service';

@Component({
	selector: 'app-annotation',
	templateUrl: './annotation.component.html',
	styleUrls: ['./annotation.component.scss']
})
export class AnnotationComponent extends SelectableComponent implements OnInit, OnChanges {

	@Input() selectedNode: TreeNodeVO;
	@Input() position: number;
	value: string;
	id: any = undefined;
	componentType = 'descriptions'; // needed to copy datas
	title: string;

	constructor(
		private annotationService: AnnotationService,
		private translate: TranslateService,
		public selectableService: SelectableService,
		public ngzone: NgZone,
		public configService: ConfigService) {
			super(selectableService, ngzone, configService);
		}

	ngOnInit() {
		this.id = 'cluster-annotation-' + this.position;
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.selectedNode && changes.selectedNode.currentValue) {
			this.value = changes.selectedNode.currentValue.description;
			this.title = this.translate.get('GLOBAL.ANNOTATION_OF', {
				name: changes.selectedNode.currentValue.name
			});
		}
	}

	onAnnotationChanged(annotation: string) {
		this.value = annotation;
		this.selectedNode.updateAnnotation(annotation);
		this.annotationService.setNodeAnnotation(this.selectedNode, annotation);
	}
}
