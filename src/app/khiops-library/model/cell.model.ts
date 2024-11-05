import { MatrixCoordI } from '../interfaces/matrix-coord';
import { UtilsService } from '../providers/utils.service';
import { MatrixValuesModel } from './matrix-value.model';

export class CellModel {
  /*
		WARNING
		Do not make nested objects here
		to allow Object.assign()
		and optimize performances
	*/

  _id!: string | number;
  cellFreq?: number;
  cellFreqHash: {} | undefined;
  displayedFreqValue!: number;
  displayedValue!: {
    type: string;
    value: number;
    extra: 0;
    ef: number;
  };
  targetCellFreq!: number;
  index!: number;
  id!: number; // KV for row identification (regression table case)
  cellInterest?: number;
  cellTargetProb!: number;
  xCanvas!: number;
  yCanvas!: number;
  wCanvas!: number;
  hCanvas!: number;
  x!: MatrixCoordI;
  y!: MatrixCoordI;
  w!: MatrixCoordI;
  h!: MatrixCoordI;
  concatName!: string[];
  xaxisPart?: string;
  yaxisPart?: string;
  xaxisPartValues?: number[] | string; // KV use only
  yaxisPartValues?: number[] | string; // KV use only
  xDisplayaxisPart?: string;
  yDisplayaxisPart?: string;
  xnamePart!: string;
  ynamePart!: string;
  coverage!: number;

  // Important to init those variables needed at construction
  cellProbs: number[] = [];
  cellProbsRev: number[] = [];
  freqColVals: number[] = [];
  freqLineVals: number[] = [];
  cellFreqs: number[] = [];
  infosMutValue: number[] = [];
  infosMutExtra: any[] = []; // can be complex
  cellHellingerValue: number[] = [];
  cellHellingerAbsoluteValue: number[] = [];
  matrixTotal: number[] | undefined = [];

  /**
   * Sets the index for the cell and updates related properties.
   * @param currentIndex - The current index to set.
   */
  setIndex(currentIndex: number) {
    this.index = currentIndex;
    this.id = currentIndex + 1; // cells begin from 0 and rows from 1 ...
    this._id = currentIndex;
  }

  /**
   * Formats the cell values by initializing them if they are NaN.
   */
  formatValues() {
    this.cellTargetProb = UtilsService.initNumberIfNan(this.cellTargetProb);
    this.cellFreq = UtilsService.initNumberIfNan(this.cellFreq!);
    this.targetCellFreq = UtilsService.initNumberIfNan(this.targetCellFreq);
  }

  /**
   * Sets the coordinate values for the cell.
   * @param i - The index for the x-axis values.
   * @param j - The index for the y-axis values.
   * @param xValues - The x-axis values.
   * @param yValues - The y-axis values.
   */
  setCoordValues(
    i: number,
    j: number,
    xValues: MatrixValuesModel,
    yValues: MatrixValuesModel,
  ) {
    this.x = {
      standard: xValues.standard[i]!,
      frequency: xValues.frequency[i]!,
    };
    this.y = {
      standard: yValues.standard[j]!,
      frequency: yValues.frequency[j]!,
    };
    this.w = {
      standard: xValues.standard[i + 1]! - this.x.standard,
      frequency: xValues.frequency[i + 1]! - this.x.frequency,
    };
    this.h = {
      standard: yValues.standard[j + 1]! - this.y.standard,
      frequency: yValues.frequency[j + 1]! - this.y.frequency,
    };
  }
}
