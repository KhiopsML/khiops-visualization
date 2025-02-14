/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { KhiopsLibraryService } from './khiops-library.service';
import { Ls } from '@khiops-library/providers/ls.service';
import { LS } from '@khiops-library/enum/ls';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileLoaderService {
  public fileLoaded: BehaviorSubject<any> = new BehaviorSubject(undefined);
  public fileLoaded$: Observable<any> = this.fileLoaded.asObservable();

  fileLoaderDatas!: {
    isLoadingDatas: boolean;
    datas: any;
    isBigJsonFile: boolean;
    loadingInfo: string;
  };

  constructor(
    private ls: Ls,
    private http: HttpClient,
    private khiopsLibraryService: KhiopsLibraryService,
  ) {
    this.initialize();
  }

  initialize() {
    this.fileLoaderDatas = {
      isLoadingDatas: false,
      datas: undefined,
      isBigJsonFile: false,
      loadingInfo: '',
    };
  }

  getDatas(): any {
    return this.fileLoaderDatas;
  }

  setDatas(datas: any): any {
    this.fileLoaderDatas.datas = datas;
    this.fileLoaded.next(datas);
  }

  debugReadDatas(fileName?: string): any {
    // Visualization files
    // ===================
    //

    // let urlKV = './assets/mocks/kv/new-hyper-tree.json';
    // let urlKV = './assets/mocks/kv/NGrams10_AnalysisResults.json';
    // let urlKV = './assets/mocks/kv/NGrams100_AnalysisResults.json';
    // let urlKV = './assets/mocks/kv/000_000_10000words_AllReports.json';
    // let urlKV = './assets/mocks/kv/Regression_AllReports_All.json';
    // let urlKV = './assets/mocks/kv/Regression_AllReports_PreparationOnly.json';
    // let urlKV = './assets/mocks/kv/missing-zero.json';
    // let urlKV = './assets/mocks/kv/C1000_AllReports.json';
    // let urlKV = './assets/mocks/kv/C100_AllReports.json';
    // let urlKV = './assets/mocks/kv/AdultRegressionAllReports.json';
    // let urlKV = './assets/mocks/kv/onlyEvaluationReport.json';
    // let urlKV = './assets/mocks/kv/explanatory.json';
    // let urlKV = './assets/mocks/kv/adult-bivar.json';
    // let urlKV = './assets/mocks/kv/desc-bivar.json';
    // let urlKV = './assets/mocks/kv/irisR.json';
    // let urlKV = './assets/mocks/kv/bi2.json';
    // let urlKV = './assets/mocks/kv/bi3.json';
    // let urlKV = './assets/mocks/kv/Std_Iris_AnalysisResults.khj';
    // let urlKV = './assets/mocks/kv/C1_AllReports.json';
    // let urlKV = './assets/mocks/kv/C0_AllReports.json';
    // let urlKV = './assets/mocks/kv/analyse_supervisee_multiclasse.json';
    // let urlKV = './assets/mocks/kv/reg.json';
    // let urlKV = './assets/mocks/kv/copydatas.json';
    // let urlKV = './assets/mocks/kv/iris2d.json';
    let urlKV = './assets/mocks/kv/AnalysisRegressionQ99.json';
    // let urlKV = './assets/mocks/kv/mainTargetValue.json';
    // let urlKV = './assets/mocks/kv/leafrules.khj';
    // let urlKV = './assets/mocks/kv/Filtered_Iris_AnalysisResults.khj';
    // let urlKV = './assets/mocks/kv/defaultGroup.json';
    // let urlKV = './assets/mocks/kv/AdultAgeAllReports.json';
    // let urlKV = './assets/mocks/kv/missing-level-parts.json';
    // let urlKV = './assets/mocks/kv/lift-issue.khj';
    // let urlKV = './assets/mocks/kv/tree-education_AllReports.json';
    // let urlKV = './assets/mocks/kv/incomplete-detailed-stats.json';
    // let urlKV = './assets/mocks/kv/OI_AllReports.json';
    // let urlKV = './assets/mocks/kv/tree.json';
    // let urlKV = './assets/mocks/kv/Natives_AllReports.json';
    // let urlKV = './assets/mocks/kv/2d-cells-AllReports.json';
    // let urlKV = './assets/mocks/kv/bigTreeLeafs.json';
    // let urlKV = './assets/mocks/kv/AnalysisResults_regtree_iris.json';
    // let urlKV = './assets/mocks/kv/level.json';
    // let urlKV = './assets/mocks/kv/xor.json';
    // let urlKV = './assets/mocks/kv/Natives-Arbres_Paires_AllReports.json';
    // let urlKV = './assets/mocks/kv/co-oc.json';
    // let urlKV = './assets/mocks/kv/MSE_AllReports.json';
    // let urlKV = './assets/mocks/kv/marc.json';
    // let urlKV = './assets/mocks/kv/marc2.json';
    // let urlKV = './assets/mocks/kv/tree-AllReports.json';
    // let urlKV = './assets/mocks/kv/test_long_XDSL_Delc_AllReports.json';
    // let urlKV = './assets/mocks/kv/Essai_1_AllReports.json';
    // let urlKV = './assets/mocks/kv/typeBotnet_AllReports.json';
    // let urlKV = './assets/mocks/kv/irisU.json';
    // let urlKV = './assets/mocks/kv/CoronaWords100000_AllReports.V11.json';
    // let urlKV = './assets/mocks/kv/CrirteoAllReports.json';
    // let urlKV = './assets/mocks/kv/CriteoAnalysisResults.khj';
    // let urlKV = './assets/mocks/kv/Words100_AllReports.json';
    // let urlKV = './assets/mocks/kv/UnivariateAnalysisResults.json';
    // let urlKV = './assets/mocks/kv/ylogAdultAllReports.json';
    // let urlKV = './assets/mocks/kv/ko-AnalysisResults.khj';
    // let urlKV = './assets/mocks/kv/AdultAllReports.json';
    // let urlKV = './assets/mocks/kv/20NewsgroupAllReports.json';

    // Co visualization files
    // ======================
    //
    // let urlKC = './assets/mocks/kc/Coclustering-100x100.json';
    // let urlKC = './assets/mocks/kc/cc.json';
    // let urlKC = './assets/mocks/kc/Coclustering.json';
    // let urlKC = './assets/mocks/kc/Co-simple-2vars.json';
    // let urlKC = './assets/mocks/kc/Coclustering-6.json';
    // let urlKC = './assets/mocks/kc/Coclustering-4.json';
    // let urlKC = './assets/mocks/kc/1-Adult2varsEducationOccupation.khcj';
    // let urlKC = './assets/mocks/kc/2-Iris3vars-Coclustering.khcj';
    // let urlKC = './assets/mocks/kc/co-IrisMissing.json';
    // let urlKC = './assets/mocks/kc/adult2var.json';
    // let urlKC = './assets/mocks/kc/sample3.json';
    // let urlKC = './assets/mocks/kc/DataNoisyCorrelatedN1000000_C1000_V10_L5Coclustering.json';
    // let urlKC = './assets/mocks/kc/sample0.json';
    // let urlKC = './assets/mocks/kc/WebSpamCoclustering18mb.json';
    // let urlKC = './assets/mocks/kc/adultmissing.json';
    // let urlKC = './assets/mocks/kc/DigitCoclustering.json';
    let urlKC = './assets/mocks/kc/8-TS4624User_Coclustering.json';
    // let urlKC = './assets/mocks/kc/check-ext-datas.json';
    // let urlKC = './assets/mocks/kc/mushroom.json';
    // let urlKC = './assets/mocks/kc/SimplifiedCoclusteringIrisOldFormat_BugUndefined.json';
    // let urlKC = './assets/mocks/kc/h-Coclustering.json';
    // let urlKC = './assets/mocks/kc/irismissing.json';
    // let urlKC = './assets/mocks/kc/zero-except.json';
    // let urlKC = './assets/mocks/kc/AdultSmall.json';
    // let urlKC = './assets/mocks/kc/VerbNounCoclustering27mo.json';
    // let urlKC = './assets/mocks/kc/v4.json';
    // let urlKC = './assets/mocks/kc/NovaCoclustering4mb.json';
    // let urlKC =
    //   './assets/mocks/kc/10.1.1_id_feat_nospace_Coclustering.json';
    // let urlKC = './assets/mocks/kc/co-3-num.json';
    // let urlKC = './assets/mocks/kc/ext-CC_Coclustering.json';
    // let urlKC = './assets/mocks/kc/ext-datas_Coclustering.json';
    // let urlKC = './assets/mocks/kc/ext-CC_Coclustering.json';
    // let urlKC = './assets/mocks/kc/CC_3_Coclustering.json';

    if (fileName) {
      urlKV = './assets/mocks/kv/' + fileName;
      urlKC = './assets/mocks/kc/' + fileName;
    }

    let url;
    if (this.khiopsLibraryService.isKhiopsVisu()) {
      url = urlKV;
    } else {
      url = urlKC;
    }
    return this.readWebFile(url);
  }

  readWebFile(url: string): any {
    this.fileLoaderDatas.isLoadingDatas = true;
    this.setDatas(undefined);

    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(
        (datas: any) => {
          datas.filename = url;
          this.fileLoaderDatas.isLoadingDatas = false;
          this.setDatas(datas);
          if (datas) {
            resolve(this.fileLoaderDatas.datas);
          } else {
            reject({
              status: 500,
            });
          }
        },
        (_error) => {
          this.fileLoaderDatas.isLoadingDatas = false;
          this.setDatas(undefined);

          reject({
            status: 500,
          });
        },
      );
    });
  }

  readFile(filename: any) {
    this.fileLoaderDatas.isLoadingDatas = true;
    this.fileLoaderDatas.isBigJsonFile = false;
    this.setDatas(undefined);

    return new Promise((resolve, reject) => {
      let reader = new FileReader();

      reader.addEventListener('loadend', async (e) => {
        this.fileLoaderDatas.isLoadingDatas = false;
        const datas = await JSON.parse(e.target!.result!.toString());
        datas.filename = filename;
        this.setDatas(datas);
        resolve(this.fileLoaderDatas.datas);
      });
      reader.addEventListener('error', () => {
        reader.abort();
        this.setDatas(undefined);
        reject(new Error('failed to process file'));
      });
      reader.readAsText(filename);
    });
  }

  closeFile() {
    this.setDatas(undefined);
  }

  setFileHistory(filename: any) {
    const currentLs = this.ls.get(LS.OPEN_FILE);
    let parsedLs: any = {
      files: [],
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

    this.ls.set(LS.OPEN_FILE, parsedLs);
  }

  getFileHistory() {
    const currentLs = this.ls.get(LS.OPEN_FILE);
    if (currentLs) {
      return JSON.parse(currentLs);
    } else {
      return {
        files: [],
      };
    }
  }
}
