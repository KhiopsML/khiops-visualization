import {
	Injectable
} from '@angular/core';
import {
	HttpClient
} from '@angular/common/http';
import {
	KhiopsLibraryService
} from '../../providers/khiops-library.service';

@Injectable({
	providedIn: 'root'
})
export class FileLoaderService {

	fileLoaderDatas: {
		isLoadingDatas: any,
		datas: any,
		isBigJsonFile: boolean,
		loadingInfo: string
	};
	tmp = {};

	constructor(
		private http: HttpClient,
		private khiopsLibraryService: KhiopsLibraryService) {
		this.initialize();
	}

	initialize() {
		this.fileLoaderDatas = {
			isLoadingDatas: false,
			datas: undefined,
			isBigJsonFile: false,
			loadingInfo: ''
		};
	}

	getDatas(): any {
		return this.fileLoaderDatas;
	}

	debugReadDatas(): any {

		// Visualization files
		// ===================
		//

		// const urlKV = './assets/mocks/kv/NGrams10_AnalysisResults.json';
		// const urlKV = './assets/mocks/kv/NGrams100_AnalysisResults.json';
		// const urlKV = './assets/mocks/kv/000_000_10000words_AllReports.json';
		// const urlKV = './assets/mocks/kv/Regression_AllReports_All.json';
		// const urlKV = './assets/mocks/kv/Regression_AllReports_PreparationOnly.json';
		// const urlKV = './assets/mocks/kv/missing-zero.json';
		// const urlKV = './assets/mocks/kv/C1000_AllReports.json';
		// const urlKV = './assets/mocks/kv/C100_AllReports.json';
		// const urlKV = './assets/mocks/kv/AdultRegressionAllReports.json';
		// const urlKV = './assets/mocks/kv/lot-of-predictors.json';
		// const urlKV = './assets/mocks/kv/onlyEvaluationReport.json';
		// const urlKV = './assets/mocks/kv/explanatory.json';
		// const urlKV = './assets/mocks/kv/adult-bivar.json';
		// const urlKV = './assets/mocks/kv/desc-bivar.json';
		// const urlKV = './assets/mocks/kv/irisR.json';
		// const urlKV = './assets/mocks/kv/bi2.json';
		// const urlKV = './assets/mocks/kv/bi3.json';
		const urlKV = './assets/mocks/kv/Std_Iris_AnalysisResults.khj';
		// const urlKV = './assets/mocks/kv/C1_AllReports.json';
		// const urlKV = './assets/mocks/kv/C0_AllReports.json';
		// const urlKV = './assets/mocks/kv/analyse_supervisee_multiclasse.json';
		// const urlKV = './assets/mocks/kv/reg.json';
		// const urlKV = './assets/mocks/kv/copydatas.json';
		// const urlKV = './assets/mocks/kv/iris2d.json';
		// const urlKV = './assets/mocks/kv/mainTargetValue.json';
		// const urlKV = './assets/mocks/kv/new-hyper-tree.json';
		// const urlKV = './assets/mocks/kv/leafrules.khj';
		// const urlKV = './assets/mocks/kv/Filtered_Iris_AnalysisResults.khj';
		// const urlKV = './assets/mocks/kv/defaultGroup.json';
		// const urlKV = './assets/mocks/kv/bigTreeLeafs.json';
		// const urlKV = './assets/mocks/kv/AdultAgeAllReports.json';
		// const urlKV = './assets/mocks/kv/missing-level-parts.json';
		// const urlKV = './assets/mocks/kv/lift-issue.khj';
		// const urlKV = './assets/mocks/kv/tree-education_AllReports.json';
		// const urlKV = './assets/mocks/kv/incomplete-detailed-stats.json';
		// const urlKV = './assets/mocks/kv/OI_AllReports.json';
		// const urlKV = './assets/mocks/kv/tree.json';
		// const urlKV = './assets/mocks/kv/Natives_AllReports.json';
		// const urlKV = './assets/mocks/kv/2d-cells-AllReports.json';
		// const urlKV = './assets/mocks/kv/level.json';
		// const urlKV = './assets/mocks/kv/xor.json';
		// const urlKV = './assets/mocks/kv/Natives-Arbres_Paires_AllReports.json';
		// const urlKV = './assets/mocks/kv/co-oc.json';
		// const urlKV = './assets/mocks/kv/MSE_AllReports.json';
		// const urlKV = './assets/mocks/kv/marc.json';
		// const urlKV = './assets/mocks/kv/marc2.json';
		// const urlKV = './assets/mocks/kv/tree-AllReports.json';
		// const urlKV = './assets/mocks/kv/test_long_XDSL_Delc_AllReports.json';
		// const urlKV = './assets/mocks/kv/Essai_1_AllReports.json';
		// const urlKV = './assets/mocks/kv/typeBotnet_AllReports.json';
		// const urlKV = './assets/mocks/kv/irisU.json';
		// const urlKV = './assets/mocks/kv/CoronaWords100000_AllReports.V11.json';
		// const urlKV = './assets/mocks/kv/CrirteoAllReports.json';
		// const urlKV = './assets/mocks/kv/Words100_AllReports.json';
		// const urlKV = './assets/mocks/kv/UnivariateAnalysisResults.json';
		// const urlKV = './assets/mocks/kv/ylogAdultAllReports.json';
		// const urlKV = './assets/mocks/kv/synchro_ko_final_AllReports.json';
		// const urlKV = './assets/mocks/kv/AdultAllReports.json';
		// const urlKV = './assets/mocks/kv/20NewsgroupAllReports.json';

		// Co visualization files
		// ======================
		//
		// const urlKC = './assets/mocks/kc/cc.json';
		// const urlKC = './assets/mocks/kc/Coclustering.json';
		// const urlKC = './assets/mocks/kc/Co-simple-2vars.json';
		// const urlKC = './assets/mocks/kc/Coclustering-6.json';
		// const urlKC = './assets/mocks/kc/Coclustering-4.json';
		// const urlKC = './assets/mocks/kc/co-IrisMissing.json';
		// const urlKC = './assets/mocks/kc/adult2var.json';
		const urlKC = './assets/mocks/kc/sample3.json';
		// const urlKC = './assets/mocks/kc/DataNoisyCorrelatedN1000000_C1000_V10_L5Coclustering.json';
		// const urlKC = './assets/mocks/kc/sample0.json';
		// const urlKC = './assets/mocks/kc/WebSpamCoclustering18mb.json';
		// const urlKC = './assets/mocks/kc/adultmissing.json';
		// const urlKC = './assets/mocks/kc/DigitCoclustering.json';
		// const urlKC = './assets/mocks/kc/mushroom.json';
		// const urlKC = './assets/mocks/kc/SimplifiedCoclusteringIrisOldFormat_BugUndefined.json';
		// const urlKC = './assets/mocks/kc/h-Coclustering.json';
		// const urlKC = './assets/mocks/kc/irismissing.json';
		// const urlKC = './assets/mocks/kc/zero-except.json';
		// const urlKC = './assets/mocks/kc/AdultSmall.json';
		// const urlKC = './assets/mocks/kc/VerbNounCoclustering27mo.json';
		// const urlKC = './assets/mocks/kc/NovaCoclustering4mb.json';
		// const urlKC = './assets/mocks/kc/Coclustering-100x100.json';
		// const urlKC = './assets/mocks/kc/donotworkk10.1.1_id_feat_nospace_Coclustering.json';
		// const urlKC = './assets/mocks/kc/co-3-num.json';
		// const urlKC = './assets/mocks/kc/h-Coclustering-2-2.json';
		// const urlKC = './assets/mocks/kc/ext-CC_Coclustering.json';
		// const urlKC = './assets/mocks/kc/ext-datas_Coclustering.json';
		// const urlKC = './assets/mocks/kc/ext-CC_Coclustering.json';
		// const urlKC = './assets/mocks/kc/CC_3_Coclustering.json';

		let url;
		if (this.khiopsLibraryService.isKhiopsVisu()) {
			url = urlKV;
		} else {
			url = urlKC;
		}
		return this.readWebFile(url);
	}

	readWebFile(url: string): any {

		this.fileLoaderDatas.datas = undefined;
		this.fileLoaderDatas.isLoadingDatas = true;

		return new Promise((resolve, reject) => {

			this.http.get(url).subscribe((datas: any) => {
				this.fileLoaderDatas.datas = datas;

				this.fileLoaderDatas.datas.filename = url;
				this.fileLoaderDatas.isLoadingDatas = false;

				if (datas) {
					resolve(this.fileLoaderDatas.datas);
				} else {
					reject({
						'status': 500
					});
				}
			}, (error) => {
				this.fileLoaderDatas.isLoadingDatas = false;

				reject({
					'status': 500
				});
			});

		});
	}

	readFile(filename): any {

		this.fileLoaderDatas.datas = undefined;
		this.fileLoaderDatas.isLoadingDatas = true;
		this.fileLoaderDatas.isBigJsonFile = false;

		return new Promise((resolve, reject) => {
			let reader = new FileReader()

			reader.addEventListener('loadend', async (e) => {
				this.fileLoaderDatas.isLoadingDatas = false;
				// @ts-ignore
				this.fileLoaderDatas.datas = await JSON.parse(e.target.result.toString());
				this.fileLoaderDatas.datas.filename = filename;
				resolve(this.fileLoaderDatas.datas);
			});
			reader.addEventListener('error', () => {
				reader.abort();
				reject(new Error('failed to process file'))
			});
			reader.readAsText(filename);
		})

	}

	setFileHistory(application, filename) {
		const currentLs = localStorage.getItem(this.getLSVariableName(application) + '_OPEN_FILE');
		let parsedLs = {
			files: []
		};
		if (currentLs) {
			parsedLs = JSON.parse(currentLs);
			const isExistingHistoryIndex = parsedLs.files.indexOf(filename);

			if (isExistingHistoryIndex !== -1) {
				// remove at index
				parsedLs.files.splice(isExistingHistoryIndex, 1);
			} else {
				// remove last item
				if (parsedLs.files.length >= 5) {
					parsedLs.files.splice(-1, 1);
				}
			}
		}
		// add to the top of the list
		parsedLs.files.unshift(filename);

		localStorage.setItem(this.getLSVariableName(application) + '_OPEN_FILE', JSON.stringify(parsedLs));
	}

	getFileHistory(application: string) {
		const currentLs = localStorage.getItem(this.getLSVariableName(application) + '_OPEN_FILE');
		if (currentLs) {
			return JSON.parse(currentLs);
		} else {
			return {
				files: []
			};
		}
	}

	getLSVariableName(application: string): string {
		return application === 'khiops-visualization' ? 'KHIOPS_VISUALIZATION' : 'KHIOPS_COVISUALIZATION';
	}

}
