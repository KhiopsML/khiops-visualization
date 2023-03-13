import {
	Injectable
} from '@angular/core';
import {
	ChartColorsSetI
} from '../interfaces/chart-colors-set';
// TODO does not work on web browser | remove electron
// import {
// 	machineIdSync
// } from 'node-machine-id';

declare const window: any;

@Injectable({
	providedIn: 'root'
})
export class KhiopsLibraryService {

	graphColorSet: ChartColorsSetI[];
	appConfig: any;

	graphColors: any = Array(10).fill([
			'#10246e', '#6e93d5', '#d45087', '#3cb44b', '#ffe119', '#ff6600',
			'#f032e6', '#a9a9a9', '#9A6324', '#fffac8', '#800000', '#aaffc3',
			'#000075', '#a9a9a9', '#469990', '#10246e', '#6e93d5', '#d45087',
			'#ff5722', '#d9d5c3', '#66BD6D', '#FAC51D', '#de1cea', '#29BB9C',
			'#a5d7c6', '#FAA026', '#ffa600', '#E96B56', '#55ACD2', '#B7332F',
			'#2C83C9', '#9166B8', '#92E7E8', '#1D68FB', '#33C0FC', '#4AFFFE',
			'#AFFFFF', '#FFFC63', '#FDBD2D', '#FC8A25', '#FA4F1E', '#FA141B',
			'#BA38D1', '#A10A28', '#D3342D', '#EF6D49', '#FAAD67', '#FDDE90',
			'#DBED91', '#A9D770', '#afafaf', '#707160', '#6CBA67', '#2C9653',
			'#ff9800', '#146738', '#4363d8', '#ffe119', '#4363d8', '#f58231',
			'#dcbeff', '#800000', '#000075', '#a9a9a9', '#e6194B', '#f58231',
			'#42d4f4', '#fabed4', '#f95d6a', '#ff7c43'
		])
		// @ts-ignore
		.flat();

	constructor() {

		this.graphColorSet = [{
				domain: [
					'#864672',
					'#ffdda3',
					'#2196f3',
					'#00b862',
					'#a7b61a',
					'#ff9800',
					'#ff4514',
					'#FAC51D',
					'#3e796c',
					'#e9569f',
					'#a3d0e4',
					'#959ee1'
				]
			},
			{
				domain: this.graphColors
			},
			{
				domain: [
					'#ffbe46'
				]
			},
			{
				domain: [
					'#666666'
				]
			}
		];

	}

	getGraphColorSet(): ChartColorsSetI[] {
		return this.graphColorSet;
	}

	setAppConfig(config) {
		this.appConfig = config;
	}

	getAppConfig(): any {
		return this.appConfig;
	}

	isKhiopsCovisu(): boolean {
		return this.getAppConfig().common.GLOBAL.DEBUG_SOFTWARE_LABEL === 'KC';
	}

	isKhiopsVisu(): boolean {
		return this.getAppConfig().common.GLOBAL.DEBUG_SOFTWARE_LABEL === 'KV';
	}

	disableMatomo() {
		try {
			window._paq && window._paq.push(['optUserOut']);
		} catch (e) {
			console.error('disableMatomo', e);
		}
	}

	enableMatomo() {
		try {
			window._paq && window._paq.push(['forgetUserOptOut']);
		} catch (e) {
			console.error('enableMatomo', e);
		}
	}

	initMatomo() {
		try {
			if (this.appConfig.production) {
				var _paq = window._paq = window._paq || [];
				_paq.push(['trackPageView']);

				(() => {
					// TODO remove electron
					// let id;
					// try {
					// 	id = machineIdSync();
					// } catch (e) {
					// 	console.error('failed to get matomo id');
					// }

					_paq.push(['setTrackerUrl', this.appConfig.common.TRACKER.TRACKER_URL + 'matomo.php']);
					_paq.push(['setSiteId', this.appConfig.common.TRACKER.SITE_ID]);
					// TODO remove electron
					// id && _paq.push(['setUserId', id]);
					var d = document,
						g = d.createElement('script'),
						s = d.getElementsByTagName('script')[0];
					g.type = 'text/javascript';
					g.async = true;
					g.src = this.appConfig.common.TRACKER.TRACKER_URL + 'matomo.js';
					s.parentNode.insertBefore(g, s);
				})();
			} else {
				console.info('Matomo not initialized in dev mode');
			}
		} catch (e) {
			console.error('initMatomo', e);
		}
	}

	trackEvent(category: string, action: string, name ? : string, value ? : any) {
		if (this.appConfig.production) {
			try {
				window._paq && window._paq.push(['trackEvent', category, action, name || undefined, value || undefined]);
			} catch (e) {
				console.error('trackEvent', e);
			}
		} else {
			console.info('Not tracked in dev mode', category, action, name, value);
		}
	}

}
