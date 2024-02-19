import { Injectable } from '@angular/core';
import { UtilsService } from '../../providers/utils.service';
import { CellVO } from '../../model/cell-vo';
import { MatrixModeI } from '@khiops-library/interfaces/matrix-mode';

@Injectable({
  providedIn: 'root',
})
export class MatrixCanvasService {
  static hot: string[] = [
    '#FFFFFF',
    '#FF8000',
    '#FF5200',
    '#FF2900',
    '#FF0000',
    '#D60000',
    '#AD0000',
    '#840000',
    '#520000',
    '#290000',
    '#000000',
  ];

  static computeMatrixValues(
    graphMode: MatrixModeI,
    inputDatas: any,
    contextSelection: any,
    selectedTargetIndex: number,
  ) {
    let matrixFreqsValues;
    let matrixValues;
    let matrixExtras;
    let matrixExpectedFreqsValues;

    if (contextSelection && contextSelection.length > 0) {
      // KC use case

      // Copy context to reverse it without keeping refs
      const currentContext = Object.assign([], contextSelection);

      // Generate combinations for current context selections (selection can be [] when folders are selected)
      const cellCombinations = UtilsService.generateMatrixCombinations(
        currentContext.reverse(),
      );

      // Compute all positions according to combinations
      const partPositions = [];
      const cellCombinationsLength = cellCombinations.length;
      for (let i = 0; i < cellCombinationsLength; i++) {
        const currentCellPartPosition = UtilsService.findArrayIntoHash(
          cellCombinations[i],
          inputDatas.matrixCellDatas[0].cellFreqHash,
        );
        partPositions.push(currentCellPartPosition);
      }

      const partPositionsLength = partPositions.length;
      // Always compute freqs for distribution graph datas
      matrixFreqsValues = inputDatas.matrixCellDatas.map((e) => {
        let res = 0;
        for (let i = 0; i < partPositionsLength; i++) {
          res = res + e.cellFreqs[partPositions[i]]; // values are added
        }
        return res;
      });

      if (graphMode.mode === 'FREQUENCY') {
        matrixValues = matrixFreqsValues;
      } else {
        // Map current matrix datas to freq values correpsonding to current part positions
        let res = 0;
        let matrixTotal = 0;
        let cellFreqs = 0;
        let freqColVals = 0;
        let freqLineVals = 0;
        switch (graphMode.mode) {
          case 'MUTUAL_INFO':
            matrixValues = inputDatas.matrixCellDatas.map((e) => {
              [matrixTotal, cellFreqs, freqColVals, freqLineVals] =
                this.computeValsByContext(
                  e,
                  partPositions,
                  partPositionsLength,
                );
              let [MIij, MIijExtra] = UtilsService.computeMutualInfo(
                cellFreqs,
                matrixTotal,
                freqColVals,
                freqLineVals,
              );
              return MIij || 0;
            });
            matrixExtras = inputDatas.matrixCellDatas.map((e: CellVO) => {
              let [matrixTotal, cellFreqs, freqColVals, freqLineVals] =
                this.computeValsByContext(
                  e,
                  partPositions,
                  partPositionsLength,
                );
              let [MIij, MIijExtra] = UtilsService.computeMutualInfo(
                cellFreqs,
                matrixTotal,
                freqColVals,
                freqLineVals,
              );
              return MIijExtra;
            });
            break;
          case 'HELLINGER':
            matrixValues = inputDatas.matrixCellDatas.map((e) => {
              [matrixTotal, cellFreqs, freqColVals, freqLineVals] =
                this.computeValsByContext(
                  e,
                  partPositions,
                  partPositionsLength,
                );
              const [hellingerValue, hellingerAbsoluteValue] =
                UtilsService.computeHellinger(
                  cellFreqs,
                  matrixTotal,
                  freqColVals,
                  freqLineVals,
                );
              res = hellingerValue;
              return res || 0;
            });
            matrixExtras = inputDatas.matrixCellDatas.map((e: CellVO) => {
              let [matrixTotal, cellFreqs, freqColVals, freqLineVals] =
                this.computeValsByContext(
                  e,
                  partPositions,
                  partPositionsLength,
                );
              const [hellingerValue, hellingerAbsoluteValue] =
                UtilsService.computeHellinger(
                  cellFreqs,
                  matrixTotal,
                  freqColVals,
                  freqLineVals,
                );
              return hellingerAbsoluteValue;
            });
            break;
          case 'PROB_CELL':
            matrixValues = inputDatas.matrixCellDatas.map((e) => {
              let [matrixTotal, cellFreqs, freqColVals, freqLineVals] =
                this.computeValsByContext(
                  e,
                  partPositions,
                  partPositionsLength,
                );
              return isNaN(cellFreqs / freqColVals)
                ? 0
                : cellFreqs / freqColVals;
            });
            break;
          case 'PROB_CELL_REVERSE':
            matrixValues = inputDatas.matrixCellDatas.map((e) => {
              let [matrixTotal, cellFreqs, freqColVals, freqLineVals] =
                this.computeValsByContext(
                  e,
                  partPositions,
                  partPositionsLength,
                );
              return isNaN(cellFreqs / freqLineVals)
                ? 0
                : cellFreqs / freqLineVals;
            });
            break;
          // Only on KV
          case 'CELL_INTEREST':
            matrixValues = inputDatas.matrixCellDatas.map((e) => {
              for (let i = 0; i < partPositionsLength; i++) {
                res = res + e.cellInterest[partPositions[i]];
              }
              return res || 0;
            });
            break;
        }
      }

      // Compute expected cell frequencies
      matrixExpectedFreqsValues = inputDatas.matrixCellDatas.map(
        (e: CellVO) => {
          let [matrixTotal, cellFreqs, freqColVals, freqLineVals] =
            this.computeValsByContext(e, partPositions, partPositionsLength);
          let ef = UtilsService.computeExpectedFrequency(
            matrixTotal,
            freqColVals,
            freqLineVals,
          );
          return ef;
        },
      );
    } else {
      // Always compute freqs for distribution graph datas
      matrixFreqsValues = inputDatas.matrixCellDatas.map((e) => e.cellFreqs);
      if (selectedTargetIndex !== -1) {
        matrixFreqsValues = inputDatas.matrixCellDatas.map(
          (e) => e.cellFreqs[selectedTargetIndex] || 0,
        );
      } else {
        matrixFreqsValues =
          UtilsService.sumArrayItemsOfArray(matrixFreqsValues);
      }

      if (
        graphMode.mode === 'FREQUENCY' ||
        graphMode.mode === 'FREQUENCY_CELL'
      ) {
        matrixValues = matrixFreqsValues;
      } else {
        // 2 dim without context or with target : iris2d
        switch (graphMode.mode) {
          case 'MUTUAL_INFO':
            matrixValues = inputDatas.matrixCellDatas.map((e) => {
              let [MIij, MIijExtra] = UtilsService.computeMutualInfo(
                e.cellFreqs[0],
                e.matrixTotal[0],
                e.freqColVals[0],
                e.freqLineVals[0],
              );
              return MIij || 0;
            });
            matrixExtras = inputDatas.matrixCellDatas.map((e) => {
              let [MIij, MIijExtra] = UtilsService.computeMutualInfo(
                e.cellFreqs[0],
                e.matrixTotal[0],
                e.freqColVals[0],
                e.freqLineVals[0],
              );
              return MIijExtra;
            });
            break;
          case 'HELLINGER':
            matrixValues = inputDatas.matrixCellDatas.map((e) => {
              const [hellingerValue, hellingerAbsoluteValue] =
                UtilsService.computeHellinger(
                  e.cellFreqs[0],
                  e.matrixTotal[0],
                  e.freqColVals[0],
                  e.freqLineVals[0],
                );
              return hellingerValue || 0;
            });
            matrixExtras = inputDatas.matrixCellDatas.map((e) => {
              const [hellingerValue, hellingerAbsoluteValue] =
                UtilsService.computeHellinger(
                  e.cellFreqs[0],
                  e.matrixTotal[0],
                  e.freqColVals[0],
                  e.freqLineVals[0],
                );
              return hellingerAbsoluteValue || 0;
            });
            break;
          case 'PROB_CELL':
            matrixValues = inputDatas.matrixCellDatas.map((e) => {
              return isNaN(e.cellFreqs[0] / e.freqColVals[0])
                ? 0
                : e.cellFreqs[0] / e.freqColVals[0];
            });
            break;
          case 'PROB_CELL_REVERSE':
            matrixValues = inputDatas.matrixCellDatas.map((e) => {
              return isNaN(e.cellFreqs[0] / e.freqLineVals[0])
                ? 0
                : e.cellFreqs[0] / e.freqLineVals[0];
            });
            break;
          case 'CELL_INTEREST':
            // Only on KV do not need to recompute because nodes can not be folded
            matrixValues = inputDatas.matrixCellDatas.map(
              (e) => e.cellInterest,
            );
            break;
          case 'MUTUAL_INFO_TARGET_WITH_CELL':
            for (
              let i = 0;
              i < inputDatas.matrixCellDatas[0].cellFreqs.length;
              i++
            ) {
              const currentMatrixValues = inputDatas.matrixCellDatas.map(
                (e) => {
                  const [MIij, MIijExtra] = UtilsService.computeMutualInfo(
                    e.cellFreqs[i],
                    UtilsService.arraySum(e.matrixTotal),
                    e.freqColVals[i],
                    e.freqLineVals[i],
                  );
                  return MIij || 0;
                },
              );
              if (i === selectedTargetIndex) {
                matrixValues = currentMatrixValues;
              }
            }
            matrixExtras = inputDatas.matrixCellDatas.map((e) => {
              const [MIij, MIijExtra] = UtilsService.computeMutualInfo(
                e.cellFreqs[selectedTargetIndex],
                UtilsService.arraySum(e.matrixTotal),
                e.freqColVals[selectedTargetIndex],
                e.freqLineVals[selectedTargetIndex],
              );
              return MIijExtra;
            });
            break;
          case 'PROB_TARGET_WITH_CELL':
            // Only on KV do not need to recompute because nodes can not be folded
            if (selectedTargetIndex !== -1) {
              matrixValues = inputDatas.matrixCellDatas.map(
                (e) => e.cellProbsRev[selectedTargetIndex] || 0,
              );
            }
            break;
          case 'PROB_CELL_WITH_TARGET':
            // Only on KV do not need to recompute because nodes can not be folded
            if (selectedTargetIndex !== -1) {
              matrixValues = inputDatas.matrixCellDatas.map(
                (e) => e.cellProbs[selectedTargetIndex] || 0,
              );
            }
            break;
        }
      }

      // Compute expected cell frequencies
      matrixExpectedFreqsValues = inputDatas.matrixCellDatas.map((e) => {
        let ef;
        if (Array.isArray(e.matrixTotal)) {
          ef = UtilsService.computeExpectedFrequency(
            e.matrixTotal[0],
            e.freqColVals[0],
            e.freqLineVals[0],
          );
        } else {
          ef = UtilsService.computeExpectedFrequency(
            e.matrixTotal,
            e.freqColVals,
            e.freqLineVals,
          );
        }

        return ef;
      });
    }

    return [
      matrixFreqsValues,
      matrixValues,
      matrixExtras,
      matrixExpectedFreqsValues,
    ];
  }

  static computeValsByContext(e, partPositions, partPositionsLength): number[] {
    let matrixTotal = 0;
    let cellFreqs = 0;
    let freqColVals = 0;
    let freqLineVals = 0;
    for (let i = 0; i < partPositionsLength; i++) {
      matrixTotal = matrixTotal + e.matrixTotal[partPositions[i]];
      cellFreqs = cellFreqs + e.cellFreqs[partPositions[i]];
      freqColVals = freqColVals + e.freqColVals[partPositions[i]];
      freqLineVals = freqLineVals + e.freqLineVals[partPositions[i]];
    }
    return [matrixTotal, cellFreqs, freqColVals, freqLineVals];
  }

  static getFrequencyColorsLegend(): string {
    let strHex = `linear-gradient(
			to top,`;
    for (let i = 0; i < this.hot.length; i++) {
      strHex += this.hot[i] + ' ' + (i * 100) / this.hot.length + '%';
      if (i !== this.hot.length - 1) {
        strHex += ',';
      }
    }
    strHex += ')';
    return strHex;
  }

  static getInterestColorsLegend(): string {
    return `linear-gradient(
			to bottom,
			#ff0000 0%,
			#ffffff 50%,
			#0000ff 100%
			)`;
  }

  /**
   * ChatGPT optimization
   */
  static hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }

  /**
   * ChatGPT optimization
   */
  static getFrequencyColors() {
    const hotLength = this.hot.length;
    const map = new Array(hotLength);
    for (let i = 0; i < hotLength; i++) {
      const rgb = this.hexToRgb(this.hot[i]);
      map[i] = {
        pct: i / 10,
        color: {
          r: rgb.r,
          g: rgb.g,
          b: rgb.b,
        },
      };
    }
    return map;
  }

  static getInterestColors(isPositiveValue) {
    if (isPositiveValue) {
      return [
        {
          pct: 0,
          color: {
            r: 255,
            g: 255,
            b: 255,
          },
        },
        {
          pct: 1.0,
          color: {
            r: 255,
            g: 0,
            b: 0,
          },
        },
      ];
    } else {
      return [
        {
          pct: 0.0,
          color: {
            r: 255,
            g: 255,
            b: 255,
          },
        },
        {
          pct: 1,
          color: {
            r: 0,
            g: 0,
            b: 255,
          },
        },
      ];
    }
  }

  static getNavigationCell(
    keyCode,
    matrixCellDatas,
    isAxisInverted,
    currentCellIndex,
  ): CellVO {
    let changeCell: CellVO;

    let selectedCellIndex;

    // Sort cells by x and y;
    matrixCellDatas.sort(function (a, b) {
      return a.xCanvas - b.xCanvas || a.yCanvas - b.yCanvas;
    });

    // Compute x cell length
    const xPartsLength = matrixCellDatas.filter((e) => e.xCanvas === 0).length;

    selectedCellIndex = matrixCellDatas.findIndex(
      (e) => e.index === currentCellIndex,
    );

    if (!isAxisInverted) {
      if (keyCode === 38) {
        // UP
        if (
          matrixCellDatas[selectedCellIndex + 1].xCanvas ===
          matrixCellDatas[selectedCellIndex].xCanvas
        ) {
          selectedCellIndex = selectedCellIndex + 1;
        }
      } else if (keyCode === 40) {
        // DOWN
        if (
          matrixCellDatas[selectedCellIndex - 1].xCanvas ===
          matrixCellDatas[selectedCellIndex].xCanvas
        ) {
          selectedCellIndex = selectedCellIndex - 1;
        }
      } else if (keyCode === 37) {
        // LEFT
        selectedCellIndex = selectedCellIndex - xPartsLength;
      } else if (keyCode === 39) {
        // RIGHT
        selectedCellIndex = selectedCellIndex + xPartsLength;
      } else {
        return undefined;
      }
    } else {
      if (keyCode === 40) {
        // DOWN
        selectedCellIndex = selectedCellIndex - xPartsLength;
      } else if (keyCode === 38) {
        // UP
        selectedCellIndex = selectedCellIndex + xPartsLength;
      } else if (keyCode === 37) {
        // LEFT
        if (
          matrixCellDatas[selectedCellIndex - 1].xCanvas ===
          matrixCellDatas[selectedCellIndex].xCanvas
        ) {
          selectedCellIndex = selectedCellIndex - 1;
        }
      } else if (keyCode === 39) {
        // RIGHT
        if (
          matrixCellDatas[selectedCellIndex + 1].xCanvas ===
          matrixCellDatas[selectedCellIndex].xCanvas
        ) {
          selectedCellIndex = selectedCellIndex + 1;
        }
      } else {
        return undefined;
      }
    }
    changeCell = matrixCellDatas[selectedCellIndex];
    return changeCell;
  }
}
