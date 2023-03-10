import {
	Injectable
} from '@angular/core';
import {
	HttpClient
} from '@angular/common/http';
import {
	KhiopsLibraryService
} from '../../providers/khiops-library.service';
// import _ from 'lodash';
import {
	ElectronService
} from '../../providers/electron.service';

// import * as es from 'event-stream';
// import * as JSONStream from 'JSONStream';

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
		// private electronService: ElectronService,
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
		// const urlKV = './mocks/C100_AllReports.json';
		// const urlKV = './mocks/AdultRegressionAllReports.json';
		// const urlKV = './mocks/C1000_AllReports.json';
		// const urlKV = './mocks/lot-of-predictors.json';
		// const urlKV = './mocks/onlyEvaluationReport.json';
		// const urlKV = './mocks/explanatory.json';
		// const urlKV = './mocks/adult-bivar.json';
		// const urlKV = './mocks/desc-bivar.json';
		// const urlKV = './mocks/irisR.json';
		// const urlKV = './mocks/bi2.json';
		// const urlKV = './mocks/C1_AllReports.json';
		// const urlKV = './mocks/C0_AllReports.json';
		// const urlKV = './mocks/analyse_supervisee_multiclasse.json';
		// const urlKV = './mocks/reg.json';
		// const urlKV = './mocks/copydatas.json';
		// const urlKV = './mocks/iris2d.json';
		// const urlKV = './mocks/mainTargetValue.json';
		// const urlKV = './mocks/new-hyper-tree.json';
		// const urlKV = './mocks/leafrules.khj';
		// const urlKV = './mocks/defaultGroup.json';
		// const urlKV = './mocks/bigTreeLeafs.json';
		// const urlKV = './mocks/AdultAgeAllReports.json';
		// const urlKV = './mocks/missing-level-parts.json';
		// const urlKV = './mocks/lift-issue.khj';
		// const urlKV = './mocks/tree-education_AllReports.json';
		// const urlKV = './mocks/incomplete-detailed-stats.json';
		// const urlKV = './mocks/OI_AllReports.json';
		// const urlKV = './mocks/tree.json';
		// const urlKV = './mocks/Natives_AllReports.json';
		// const urlKV = './mocks/2d-cells-AllReports.json';
		// const urlKV = './mocks/level.json';
		// const urlKV = './mocks/xor.json';
		// const urlKV = './mocks/Natives-Arbres_Paires_AllReports.json';
		// const urlKV = './mocks/co-oc.json';
		// const urlKV = './mocks/MSE_AllReports.json';
		// const urlKV = './mocks/marc.json';
		// const urlKV = './mocks/marc2.json';
		// const urlKV = './mocks/tree-AllReports.json';
		// const urlKV = './mocks/test_long_XDSL_Delc_AllReports.json';
		// const urlKV = './mocks/Essai_1_AllReports.json';
		// const urlKV = './mocks/typeBotnet_AllReports.json';
		// const urlKV = './mocks/irisU.json';
		// const urlKV = './mocks/CoronaWords100000_AllReports.V11.json';
		// const urlKV = './mocks/CrirteoAllReports.json';
		// const urlKV = './mocks/Words100_AllReports.json';
		const urlKV = './mocks/ylogAdultAllReports.json';
		// const urlKV = './mocks/synchro_ko_final_AllReports.json';
		// const urlKV = './mocks/AdultAllReports.json';
		// const urlKV = './mocks/20NewsgroupAllReports.json';

		// Co visualization files
		// ======================
		//
		// const urlKC = './mocks/Coclustering.json';
		// const urlKC = './mocks/Co-simple-2vars.json';
		// const urlKC = './mocks/Coclustering-5.json';
		// const urlKC = './mocks/Coclustering-4.json';
		// const urlKC = './mocks/co-IrisMissing.json';
		const urlKC = './mocks/cc.json';
		// const urlKC = './mocks/adult2var.json';
		// const urlKC = './mocks/sample3.json';
		// const urlKC = './mocks/sample0.json';
		// const urlKC = './mocks/WebSpamCoclustering18mb.json';
		// const urlKC = './mocks/adultmissing.json';
		// const urlKC = './mocks/mushroom.json';
		// const urlKC = './mocks/h-Coclustering.json';
		// const urlKC = './mocks/irismissing.json';
		// const urlKC = './mocks/zero-except.json';
		// const urlKC = './mocks/AdultSmall.json';
		// const urlKC = './mocks/VerbNounCoclustering27mo.json';
		// const urlKC = './mocks/NovaCoclustering4mb.json';
		// const urlKC = './mocks/Coclustering-100x100.json';
		// const urlKC = './mocks/ext-datas_Coclustering.json';
		// const urlKC = './mocks/ext-CC_Coclustering.json';
		// const urlKC = './mocks/CC_3_Coclustering.json';

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

		// TODO remove electron
		// return new Promise((resolve, reject) => {

		// 	this.electronService.fs.stat(filename, (err, stats) => {
		// 		if (err) {
		// 			reject();
		// 		} else {

		// 			this.electronService.fs.readFile(filename, 'utf-8', (errReadFile, datas) => {

		// 				if (errReadFile) {
		// 					if (errReadFile.toString().startsWith('Error: Cannot create a string longer')) {
		// 						this.fileLoaderDatas.isBigJsonFile = true;
		// 						this.fileLoaderDatas.loadingInfo = '';
		// 						const currentDatas = {};
		// 						const stream = this.electronService.fs.createReadStream(filename, {
		// 							encoding: 'utf8'
		// 						});
		// 						const getStream = stream.pipe(JSONStream.parse([{
		// 							emitKey: true
		// 						}]));
		// 						getStream
		// 							.pipe(es.map((datas) => {
		// 								this.fileLoaderDatas.loadingInfo = datas.key;
		// 								currentDatas[datas.key] = datas.value;
		// 							}));

		// 						getStream.on('end', () => {
		// 							this.fileLoaderDatas.datas = currentDatas;
		// 							this.fileLoaderDatas.datas.filename = filename;
		// 							resolve(this.fileLoaderDatas.datas);
		// 						}).on('error', () => {
		// 							reject();
		// 						});
		// 					} else {
		// 						this.fileLoaderDatas.isLoadingDatas = false;
		// 						reject(errReadFile);
		// 					}
		// 				} else {
		// 					this.fileLoaderDatas.isLoadingDatas = false;
		// 					this.fileLoaderDatas.datas = JSON.parse(datas);
		// 					this.fileLoaderDatas.datas.filename = filename;
		// 					resolve(this.fileLoaderDatas.datas);
		// 				}
		// 			});

		// 		}
		// 	});

		// });

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
