import { TYPES } from '@khiops-library/enum/types';
import { UtilsService } from '@khiops-library/providers/utils.service';

export class VariableModel {
  _id: string;
  rank?: string;
  name?: string;
  level: number;
  parts?: number;
  values: number;
  type?: string;
  mode?: string;
  modeCoverage: number | undefined;
  min?: number;
  max?: number;
  mean?: number;
  stdDev?: number;
  missingNumber: number;
  derivationRule: string;
  targetParts?: number;

  constructor(object: any, detailedDatas: any) {
    // Assign values from input
    Object.assign(this, object);

    // Generate id for grid
    this._id = object.name;

    this.level = object.level || 0;

    this.values = object.values || 0;
    if (this.type === TYPES.CATEGORICAL && detailedDatas) {
      this.modeCoverage = this.computeModeCoverage(detailedDatas) || undefined;
    } else {
      this.modeCoverage = undefined;
    }
    if (this.type === TYPES.NUMERICAL) {
      this.missingNumber = object.missingNumber || 0;
    } else {
      // Missing number can be 0 or undefined for categorical variables #140
      this.missingNumber =
        object.missingNumber !== undefined ? object.missingNumber : undefined;
    }
    this.derivationRule = object.derivationRule || undefined;
  }

  /**
   * Computes the coverage of the mode value within the provided detailed data.
   *
   * @param detailedDatas - An object containing input values and their frequencies.
   * @returns The coverage of the mode value as a fraction of the total frequencies.
   */
  computeModeCoverage(detailedDatas: any) {
    const modeIndex = detailedDatas.inputValues.values.indexOf(this.mode);
    const modeCoverage =
      detailedDatas.inputValues.frequencies[modeIndex] /
      UtilsService.arraySum(detailedDatas.inputValues.frequencies);
    return modeCoverage;
  }
}
