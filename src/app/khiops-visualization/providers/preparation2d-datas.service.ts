/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import * as _ from 'lodash'; // Important to import lodash in karma
import { AppService } from './app.service';
import { TranslateService } from '@ngstack/translate';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { EvaluationDatasService } from './evaluation-datas.service';
import { Preparation2dVariableModel } from '../model/preparation2d-variable.model';
import { CellModel } from '@khiops-library/model/cell.model';
import { MatrixUtilsService } from '@khiops-library/components/matrix/matrix.utils.service';
import { PreparationDatasService } from './preparation-datas.service';
import { VariableDetailsModel } from '../model/variable-details.model';
import { Variable2dModel } from '../model/variable-2d.model';
import { CoocurenceCellModel } from '../model/coocurence-cell.model';
import { Preparation2dDatasModel } from '../model/preparation2d-datas.model';
import { CoocurenceCellsModel } from '../model/coocurence-cells.model';
import { InformationsModel } from '@khiops-visualization/model/informations.model';
import { TYPES } from '@khiops-library/enum/types';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { MatrixRangeValuesI } from '@khiops-visualization/interfaces/matrix-range-values';
import { VariableModel } from '@khiops-visualization/model/variable.model';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { MatrixModeI } from '@khiops-library/interfaces/matrix-mode';
import { MatrixValuesModel } from '@khiops-library/model/matrix-value.model';
import { VariablePairStatistics } from '@khiops-visualization/interfaces/bivariate-preparation-report';
import { DimensionVisualizationModel } from '@khiops-library/model/dimension.visualization.model';
import {
  DimensionVisualization,
  InputValues,
  VariableDetail,
} from '@khiops-visualization/interfaces/app-datas';
import { MatrixDatasModel } from '@khiops-library/model/matrix-datas.model';
import { MATRIX_MODES } from '@khiops-library/enum/matrix-modes';
import { VARIABLE_TYPES } from '@khiops-library/enum/variable-types';

@Injectable({
  providedIn: 'root',
})
export class Preparation2dDatasService {
  private preparation2dDatas?: Preparation2dDatasModel;

  constructor(
    private translate: TranslateService,
    private preparationDatasService: PreparationDatasService,
    private appService: AppService,
    private evaluationDatasService: EvaluationDatasService,
  ) {}
  /**
   * Initializes the preparation2dDatas with data from the app service.
   * Selects the first variable by default or a saved variable if available.
   */
  initialize() {
    this.preparation2dDatas = new Preparation2dDatasModel(
      this.appService.appDatas!,
    );

    // select the first item of the list by default
    if (this.preparation2dDatas.isValid()) {
      let defaultVariable: VariablePairStatistics | undefined =
        this.appService.appDatas?.bivariatePreparationReport
          .variablesPairsStatistics[0];

      // Check if there is a saved selected variable into json
      const savedSelected2dRank =
        this.appService.getSavedDatas('selected2dRank');
      if (savedSelected2dRank) {
        defaultVariable = this.getVariableFromRank(savedSelected2dRank);
      }
      if (defaultVariable) {
        this.setSelectedVariable(defaultVariable.name1, defaultVariable.name2);
      }
    }
  }

  /**
   * Returns the current preparation2dDatas.
   * @returns The current Preparation2dDatasModel.
   */
  getDatas(): Preparation2dDatasModel | undefined {
    return this.preparation2dDatas;
  }

  /**
   * Retrieves and formats information data for display.
   * @returns An array of InfosDatasI or undefined.
   */
  getInformationsDatas(): InfosDatasI[] | undefined {
    const informationsDatas = new InformationsModel(
      this.appService.appDatas!.bivariatePreparationReport.summary,
    );
    return informationsDatas.displayDatas;
  }

  /**
   * Toggles the isAxisInverted property of preparation2dDatas.
   */
  toggleIsAxisInverted() {
    this.preparation2dDatas!.isAxisInverted =
      !this.preparation2dDatas?.isAxisInverted;
  }

  /**
   * Checks if the axis is inverted.
   * @returns True if the axis is inverted, otherwise false.
   */
  isAxisInverted() {
    return this.preparation2dDatas?.isAxisInverted;
  }

  /**
   * Sets the selected cell index and updates the selected cell.
   * @param index - The index of the cell to select.
   */
  setSelectedCellIndex(index: number) {
    if (typeof index === 'string') {
      // Index may have been converted to string by component
      index = Number(index);
    }
    this.preparation2dDatas!.selectedCellIndex = index;
    if (this.preparation2dDatas?.matrixDatas?.matrixCellDatas) {
      const currentCell =
        this.preparation2dDatas.matrixDatas.matrixCellDatas.find(
          (e) => e.index === index,
        );
      if (currentCell) {
        this.setSelectedCell(currentCell);
      }
    }
  }

  /**
   * Sets the selected cell.
   * @param cell - The cell to select.
   */
  setSelectedCell(cell: CellModel) {
    if (cell) {
      this.preparation2dDatas!.selectedCellIndex = cell.index;
      this.preparation2dDatas!.selectedCell = cell;
    }
  }

  /**
   * Gets the index of the selected cell.
   * @returns The index of the selected cell.
   */
  getSelectedCellIndex(): number | undefined {
    return this.preparation2dDatas?.selectedCellIndex;
  }

  /**
   * Gets the selected cell.
   * @returns The selected CellModel.
   */
  getSelectedCell(): CellModel | undefined {
    return this.preparation2dDatas?.selectedCell;
  }

  /**
   * Computes the distribution index from the matrix cell index.
   * @param index - The index of the matrix cell.
   * @returns The distribution index.
   */
  computeDistributionIndexFromMatrixCellIndex(index: number): number {
    // get distribution bar chart index from selected matrix cell index
    if (this.preparation2dDatas?.matrixDatas) {
      let moduloOfCellIndex = 0;
      moduloOfCellIndex =
        ((index / this.preparation2dDatas?.selectedVariable?.parts!) % 1) *
        this.preparation2dDatas?.selectedVariable?.parts!;
      moduloOfCellIndex = Math.round(moduloOfCellIndex);
      return moduloOfCellIndex;
    }
    return 0;
  }

  /**
   * Sets the selected variable.
   * @returns The selected Preparation2dVariableModel or undefined.
   */
  setSelectedVariable(
    name1: string,
    name2: string,
  ): Preparation2dVariableModel | undefined {
    if (name1 && name2) {
      const variable: Preparation2dVariableModel | undefined =
        this.getVariableFromNames(name1, name2);
      if (variable) {
        this.preparation2dDatas!.selectedVariable = variable;
        this.setSelectedCellIndex(0);
        return this.preparation2dDatas?.selectedVariable;
      }
    }
    return undefined;
  }

  /**
   * Sets the selected regression variable.
   * @param currentVar - The current regression variable to select.
   */
  setSelectedRegressionVariable(currentVar: Preparation2dVariableModel) {
    this.preparation2dDatas!.selectedVariable = currentVar;
  }

  /**
   * Gets the selected variable.
   * @returns The selected Preparation2dVariableModel or undefined.
   */
  getSelectedVariable(): Preparation2dVariableModel | undefined {
    return this.preparation2dDatas!.selectedVariable;
  }

  /**
   * Gets the rank of the selected variable.
   * @returns The rank of the selected variable.
   */
  getSelectedVariableRank(): string | undefined {
    return this.preparation2dDatas?.selectedVariable?.rank;
  }

  /**
   * Checks if the variable is supervised.
   * @returns True if the variable is supervised, otherwise false.
   */
  isSupervised(): boolean {
    return this.preparation2dDatas?.isSupervisedVariable() || false;
  }

  /**
   * Gets the 2D variable data.
   * @returns An array of Variable2dModel.
   */
  getVariablesd2Datas(): Variable2dModel[] {
    const variableDatas: Variable2dModel[] = [];
    if (
      this.appService.appDatas?.bivariatePreparationReport
        ?.variablesPairsStatistics
    ) {
      const currentDatas =
        this.appService.appDatas.bivariatePreparationReport
          .variablesPairsStatistics;
      if (currentDatas) {
        for (let i = 0; i < currentDatas.length; i++) {
          if (currentDatas[i]) {
            const varItem: Variable2dModel | undefined = new Variable2dModel(
              currentDatas[i]!,
            );
            variableDatas.push(varItem);
          }
        }
      }
    }

    return variableDatas;
  }

  /**
   * Gets a variable from its names.
   * @param name1 - The first name of the variable.
   * @param name2 - The second name of the variable.
   * @returns The Preparation2dVariableModel or undefined.
   */
  getVariableFromNames(
    name1: string,
    name2: string,
  ): Preparation2dVariableModel | undefined {
    let preparation2dVariable: Preparation2dVariableModel | undefined;
    if (
      this.appService.appDatas?.bivariatePreparationReport
        ?.variablesPairsStatistics
    ) {
      const currentPreparation2dVariable: VariablePairStatistics | undefined =
        this.appService.appDatas.bivariatePreparationReport.variablesPairsStatistics.find(
          (e) => e.name1 === name1 && e.name2 === name2,
        );
      if (currentPreparation2dVariable) {
        preparation2dVariable = new Preparation2dVariableModel(
          currentPreparation2dVariable,
        );
      }
    }
    return preparation2dVariable;
  }

  /**
   * Gets a variable from its rank.
   * @param rank - The rank of the variable.
   * @returns The variable object.
   */
  getVariableFromRank(rank: string): any {
    let variable: any;
    variable =
      this.appService.appDatas?.bivariatePreparationReport.variablesPairsStatistics.find(
        (e) => e.rank === rank,
      );
    return variable;
  }

  /**
   * Retrieves and formats co-occurrence cell data for display.
   * @returns A CoocurenceCellsModel containing the formatted co-occurrence cell data, or undefined if no matrix data is available.
   */
  getMatrixCoocurenceCellsDatas(): CoocurenceCellsModel | undefined {
    let matrixCells: CoocurenceCellsModel | undefined;

    if (this.preparation2dDatas?.matrixDatas?.matrixCellDatas) {
      const selectedVariable = this.getSelectedVariable();
      matrixCells = new CoocurenceCellsModel(
        selectedVariable?.nameX!,
        selectedVariable?.nameY!,
      );

      const values: CoocurenceCellModel[] = [];

      for (
        let i = 0;
        i < this.preparation2dDatas.matrixDatas.matrixCellDatas.length;
        i++
      ) {
        const cell: CellModel | undefined =
          this.preparation2dDatas.matrixDatas.matrixCellDatas[i];
        const coocurenceCell = new CoocurenceCellModel(cell!.index);

        // coocurenceCell has dynamic fields
        coocurenceCell[matrixCells.displayedColumns[1]!.field] =
          UtilsService.ellipsis(cell!.xDisplayaxisPart!, 60);
        coocurenceCell[matrixCells.displayedColumns[2]!.field] =
          UtilsService.ellipsis(cell!.yDisplayaxisPart!, 60);
        coocurenceCell.frequency = cell?.cellFreq;
        coocurenceCell.coverage = cell?.coverage;
        values.push(coocurenceCell);
      }
      matrixCells.values = values;
    }

    return matrixCells;
  }

  /**
   * Retrieves the current cell data for the selected variable.
   * Formats the data for display in a table, including column headers and values.
   * @returns An object containing the values and displayed columns for the current cell data.
   */
  getCurrentCellDatas():
    | {
        values: any[][]; // Dynamic values according to the input datas
        displayedColumns: GridColumnsI[][];
      }
    | undefined {
    const selectedVariable = this.getSelectedVariable();

    this.preparation2dDatas!.currentCellDatas = {
      values: [],
      displayedColumns: [],
    };

    if (selectedVariable) {
      const variableDetails = this.getVariableDetails(selectedVariable);
      const selectedCell = this.getSelectedCell();

      if (selectedCell && variableDetails?.dataGrid) {
        const xName = selectedVariable.nameX;
        const yName = selectedVariable.nameY;
        const xType = variableDetails.dataGrid.dimensions[0]?.type;
        const yType = variableDetails.dataGrid.dimensions[1]?.type;
        const displayedColumnsX: GridColumnsI[] = [];
        const displayedColumnsY: GridColumnsI[] = [];

        // Define column titles
        if (xType === TYPES.NUMERICAL) {
          displayedColumnsX.push({
            headerName: this.translate.get('GLOBAL.INTERVAL_OF') + xName,
            field: 'interval',
          });
        } else {
          displayedColumnsX.push({
            headerName: this.translate.get('GLOBAL.VALUES_OF') + xName,
            field: 'values',
          });
          displayedColumnsX.push({
            headerName: this.translate.get('GLOBAL.FREQUENCY'),
            field: 'frequency',
          });
        }
        if (yType === TYPES.NUMERICAL) {
          displayedColumnsY.push({
            headerName: this.translate.get('GLOBAL.INTERVAL_OF') + yName,
            field: 'interval',
          });
        } else {
          displayedColumnsY.push({
            headerName: this.translate.get('GLOBAL.VALUES_OF') + yName,
            field: 'values',
          });
          displayedColumnsY.push({
            headerName: this.translate.get('GLOBAL.FREQUENCY'),
            field: 'frequency',
          });
        }

        const defaultGroupIndex =
          variableDetails.dataGrid.dimensions[0]?.defaultGroupIndex;
        let isCurrentDefaultGroup = false;
        if (defaultGroupIndex !== undefined) {
          const defaultGroupPartition =
            variableDetails.dataGrid.dimensions[0]?.partition[
              defaultGroupIndex
            ];
          isCurrentDefaultGroup = _.isEqual(
            defaultGroupPartition,
            selectedCell.xaxisPartValues,
          );
        }
        const datasX = this.computeCellDatasByAxis(
          selectedCell.xaxisPartValues!,
          displayedColumnsX,
          xName,
          isCurrentDefaultGroup,
        );
        const datasY = this.computeCellDatasByAxis(
          selectedCell.yaxisPartValues!,
          displayedColumnsY,
          yName,
          isCurrentDefaultGroup,
        );
        this.preparation2dDatas!.currentCellDatas.values = [datasX, datasY];
        this.preparation2dDatas!.currentCellDatas.displayedColumns = [
          displayedColumnsX,
          displayedColumnsY,
        ];
      }
    }

    return this.preparation2dDatas?.currentCellDatas;
  }

  /**
   * Compute cell data for a given axis and formats it for display.
   * @param type - The type of the axis (e.g., numerical or categorical).
   * @param axisPartValues - The values of the axis parts.
   * @param displayaxisPart - The display value of the axis part.
   * @param variableName - The name of the variable.
   * @param isCurrentDefaultGroup - True if the current group is the default group, otherwise false.
   */
  computeCellDatasByAxis(
    axisPartValues: number[] | string,
    displayedColumns: GridColumnsI[],
    variableName: string,
    isCurrentDefaultGroup: boolean,
  ) {
    const datasAxis: any = [];
    if (axisPartValues) {
      for (let k = 0; k < axisPartValues.length; k++) {
        // get value into global json
        datasAxis[k] = {};
        datasAxis[k][displayedColumns[0]?.field!] = axisPartValues[k];
        if (displayedColumns[1]) {
          const modalityFreq = this.getModalityFrequency(
            variableName,
            axisPartValues[k]?.toString()!,
          );
          datasAxis[k][displayedColumns[1].field] = modalityFreq;
        }
      }
      if (isCurrentDefaultGroup) {
        datasAxis.push({
          values: '*',
        });
      }
    }
    return datasAxis;
  }

  /**
   * Retrieves the frequency of a given modality for a variable.
   * @param source - The source data containing variable statistics.
   * @param variable - The name of the variable.
   * @param partition - The partition value of the variable.
   * @returns The frequency of the modality or undefined if not found.
   */
  getModalityFrequency(variable: string, partition: string) {
    let currentVar: InputValues | undefined;
    const source: { [key: string]: VariableDetail } | undefined =
      this.appService.appDatas?.preparationReport.variablesDetailedStatistics;
    if (source) {
      Object.keys(source).forEach((key) => {
        if (source[key]?.dataGrid.dimensions[0]?.variable === variable) {
          currentVar = source[key].inputValues;
        }
      });
    }
    if (currentVar) {
      const partitionIndex = currentVar.values.indexOf(partition);
      return currentVar.frequencies[partitionIndex];
    } else {
      return undefined;
    }
  }

  /**
   * Checks if target data is available and retrieves it if present.
   * @returns The target data if available, otherwise undefined.
   */
  getTargetsIfAvailable(): string[] | undefined {
    // Initialize
    this.preparation2dDatas!.isTargetAvailable = false;
    let targets: string[] | undefined;

    const variablesDetails: VariableDetailsModel | undefined =
      this.getVariableDetails(this.preparation2dDatas?.selectedVariable);

    if (variablesDetails?.dataGrid?.cellIds) {
      const TargetDimension: DimensionVisualization | undefined =
        variablesDetails.dataGrid.dimensions.find(
          (e) => e.variable === 'Target',
        );

      if (TargetDimension) {
        targets =
          Array.isArray(TargetDimension.partition) &&
          typeof TargetDimension.partition[0] === 'string'
            ? (TargetDimension.partition as string[])
            : undefined;
      }
      this.preparation2dDatas!.isTargetAvailable = TargetDimension
        ? true
        : false;
      return targets;
    }
    return undefined;
  }

  /**
   * Retrieves detailed information about a variable based on its rank.
   * @param rank - The rank of the variable.
   * @returns The VariableDetailsModel containing detailed information about the variable, or undefined if not found.
   */
  getVariableDetails(selectedVariable: any): VariableDetailsModel | undefined {
    let variableDetails: VariableDetailsModel | undefined;

    let currentVar;
    if (selectedVariable) {
      switch (selectedVariable.variableType) {
        case VARIABLE_TYPES.TEXT_PREPARATION:
          currentVar =
            this.appService.appDatas?.textPreparationReport
              ?.variablesDetailedStatistics?.[selectedVariable.rank];
          break;
        case VARIABLE_TYPES.PREPARATION:
          currentVar =
            this.appService.appDatas?.preparationReport
              ?.variablesDetailedStatistics?.[selectedVariable.rank];
          break;
        case VARIABLE_TYPES.PREPARATION_2D:
          currentVar =
            this.appService.appDatas?.bivariatePreparationReport
              .variablesPairsDetailedStatistics?.[selectedVariable.rank];

          break;
        default:
          break;
      }

      variableDetails = new VariableDetailsModel(currentVar!);
    }

    return variableDetails;
  }

  /**
   * Retrieves matrix data for a given selected variable.
   * This method processes the variable details and constructs the matrix data required for visualization.
   * It handles different types of analyses such as explanatory and regression analysis.
   * It also computes cell frequencies and other necessary data for the matrix.
   *
   * @param selectedVariable - The selected variable for which matrix data is to be retrieved.
   * @returns The matrix data for the selected variable.
   */
  getMatrixDatas(
    selectedVariable:
      | Variable2dModel
      | Preparation2dVariableModel
      | VariableModel,
  ): MatrixDatasModel | undefined {
    this.preparation2dDatas!.matrixDatas = undefined;
    const variablesDetails: VariableDetailsModel | undefined =
      this.getVariableDetails(selectedVariable!);

    if (variablesDetails) {
      const variableDatas: VariableDetailsModel = _.cloneDeep(variablesDetails);

      if (variableDatas?.dataGrid) {
        const xDimension = new DimensionVisualizationModel(
          variableDatas.dataGrid.dimensions[0]!,
        );
        const yDimension = new DimensionVisualizationModel(
          variableDatas.dataGrid.dimensions[1]!,
        );

        if (
          this.preparationDatasService.isExplanatoryAnalysis() ||
          this.evaluationDatasService.isRegressionAnalysis()
        ) {
          // construct array if not present (regression)
          this.computeRegressionCellIds(
            xDimension.parts,
            yDimension.parts,
            variableDatas.dataGrid,
          ); // Useless ?
          this.computeRegressionCellsPartIndexes(
            xDimension.parts,
            yDimension.parts,
            variableDatas.dataGrid,
          );
          this.computeRegressionCellFrequencies(
            xDimension.parts,
            yDimension.parts,
            variableDatas.dataGrid,
          );
        } else if (variableDatas.dataGrid.cellFrequencies) {
          // Get the full frequency list
          const computedCellFreqs: number[] =
            MatrixUtilsService.getCellFrequencies(
              [xDimension.parts, yDimension.parts],
              variableDatas.dataGrid.cellPartIndexes,
              variableDatas.dataGrid.cellFrequencies,
            );
          variableDatas.setCellFrequencies(computedCellFreqs);
        } else if (variableDatas.dataGrid.cellTargetFrequencies) {
          // Get the full frequency list
          const computedCellTargetFreqs = MatrixUtilsService.getCellFrequencies(
            [xDimension.parts, yDimension.parts],
            variableDatas.dataGrid.cellPartIndexes,
            variableDatas.dataGrid.cellTargetFrequencies,
          );
          variableDatas.setTargetCellFrequencies(computedCellTargetFreqs);
          const sum: number[] = UtilsService.sumArrayItemsOfArray(
            computedCellTargetFreqs,
          );
          variableDatas.setCellFrequencies(sum);
        } else {
          // matrix not available for this datas
          // example bivariate case R03
        }

        if (
          variableDatas.dataGrid.cellFrequencies ||
          variableDatas.dataGrid.cellTargetFrequencies
        ) {
          const xValues = new MatrixValuesModel();
          const yValues = new MatrixValuesModel();

          [xValues.frequency, yValues.frequency] =
            MatrixUtilsService.getFrequencyAxisValues(
              xDimension,
              yDimension,
              // @ts-ignore
              variableDatas.dataGrid.cellFrequencies ||
                variableDatas.dataGrid.cellTargetFrequencies,
            );

          xValues.standard =
            MatrixUtilsService.getStandardVisualizationAxisValues(
              xDimension,
              selectedVariable?.values || 0,
            );
          yValues.standard =
            MatrixUtilsService.getStandardVisualizationAxisValues(
              yDimension,
              selectedVariable?.values || 0,
            );

          const cellDatas = MatrixUtilsService.getCellDatas(
            xDimension,
            yDimension,
            [],
            xDimension.partition,
            yDimension.partition,
            xDimension.partitionInputs,
            yDimension.partitionInputs,
            variableDatas.dataGrid.cellFrequencies,
            variableDatas.dataGrid.cellInterests,
            variableDatas.dataGrid.cellTargetFrequencies,
            xValues,
            yValues,
          );

          // TO display axis names
          // Maybe can be improved and be taken into cell datas ?
          this.preparation2dDatas!.matrixDatas = {
            variable: {
              // @ts-ignore
              nameX: selectedVariable.name1, // can be undefined in case of regression
              // @ts-ignore
              nameY: selectedVariable.name2, // can be undefined in case of regression
              xParts: xDimension.parts,
              yParts: yDimension.parts,
            },
            matrixCellDatas: cellDatas,
          };
        }
      }
    }

    return this.preparation2dDatas?.matrixDatas;
  }

  /**
   * Constructs cell IDs for regression data if not already present.
   * @param xLength - Number of parts in the x-dimension.
   * @param yLength - Number of parts in the y-dimension.
   * @param datas - Data object containing cell information.
   */
  computeRegressionCellIds(xLength: number, yLength: number, datas: any) {
    if (!datas.cellIds) {
      datas.cellIds = [];
      let k = 0;
      // construct array if not present (regression)
      for (let i = 0; i < xLength; i++) {
        for (let j = 0; j < yLength; j++) {
          datas.cellIds.push('C' + k);
          k++;
        }
      }
    }
  }

  /**
   * Transforms part target frequencies into cell frequencies for regression data.
   * @param xLength - Number of parts in the x-dimension.
   * @param yLength - Number of parts in the y-dimension.
   * @param datas - Data object containing cell information.
   */
  computeRegressionCellFrequencies(
    xLength: number,
    yLength: number,
    datas: any,
  ) {
    if (!datas.cellFrequencies) {
      datas.cellFrequencies = [];
      // transform array if regression
      // To be compatible with KC files
      // [A, B]
      // [C, D]
      // become [[A],[C],[B],[D]]
      for (let j = 0; j < yLength; j++) {
        for (let i = 0; i < xLength; i++) {
          if (datas.partTargetFrequencies) {
            // Regression case
            datas.cellFrequencies.push([datas.partTargetFrequencies[i][j]]);
          }
        }
      }
    }
  }

  /**
   * Constructs cell part indexes for regression data if not already present.
   * @param xLength - Number of parts in the x-dimension.
   * @param yLength - Number of parts in the y-dimension.
   * @param datas - Data object containing cell information.
   */
  computeRegressionCellsPartIndexes(
    xLength: number,
    yLength: number,
    datas: any,
  ) {
    if (!datas.cellPartIndexes) {
      datas.cellPartIndexes = [];
      // construct array if not present (regression)
      for (let i = 0; i < xLength; i++) {
        for (let j = 0; j < yLength; j++) {
          if (!datas.cellPartIndexes[i]) {
            datas.cellPartIndexes[i] = [];
          }
          datas.cellPartIndexes[i].push(j);
        }
      }
    }
  }

  /**
   * Compute min and max values for each available mode
   * @param variablesDatas - Array of variable data models
   * @returns Object containing min and max values for each mode
   */
  getGlobalMinAndMax2dValues(
    variablesDatas:
      | Variable2dModel[]
      | Preparation2dVariableModel[]
      | VariableModel[], // for regression,
  ): MatrixRangeValuesI {
    const currentRes: MatrixRangeValuesI = {
      CELL_INTEREST: [],
      FREQUENCY: [],
      FREQUENCY_CELL: [],
      MUTUAL_INFO: [],
      MUTUAL_INFO_TARGET_WITH_CELL: [],
    };
    for (let i = 0; i < variablesDatas.length; i++) {
      const inputDatas = this.getMatrixDatas(variablesDatas[i]!);
      if (inputDatas) {
        let graphMode: MatrixModeI = {
          mode: MATRIX_MODES.MUTUAL_INFO_TARGET_WITH_CELL,
        };
        let [_matrixFreqsValues, matrixValues, _matrixExtras] =
          MatrixUtilsService.computeMatrixValues(
            graphMode,
            inputDatas.matrixCellDatas!,
            undefined,
            0,
          );
        currentRes[MATRIX_MODES.MUTUAL_INFO_TARGET_WITH_CELL] = matrixValues!;

        graphMode = {
          mode: MATRIX_MODES.CELL_INTEREST,
        };
        [_matrixFreqsValues, matrixValues, _matrixExtras] =
          MatrixUtilsService.computeMatrixValues(
            graphMode,
            inputDatas.matrixCellDatas!,
            undefined,
            0,
          );
        currentRes[MATRIX_MODES.CELL_INTEREST] = matrixValues!;

        for (let j = 0; j < inputDatas.matrixCellDatas!.length; j++) {
          const cellFreqs = inputDatas.matrixCellDatas?.[j]?.cellFreqs;
          currentRes[MATRIX_MODES.FREQUENCY]!.push(
            UtilsService.arraySum(cellFreqs),
          );
          // @ts-ignore
          currentRes[MATRIX_MODES.FREQUENCY_CELL].push(cellFreqs);
        }
      }
    }

    // Reinit values after computing
    this.preparation2dDatas!.matrixDatas = undefined;
    const res: any = {};

    res[MATRIX_MODES.MUTUAL_INFO_TARGET_WITH_CELL] =
      UtilsService.getMinAndMaxFromArray(
        currentRes[MATRIX_MODES.MUTUAL_INFO_TARGET_WITH_CELL]!.flat(),
      );
    res[MATRIX_MODES.MUTUAL_INFO_TARGET_WITH_CELL] =
      UtilsService.averageMinAndMaxValues(
        res[MATRIX_MODES.MUTUAL_INFO_TARGET_WITH_CELL][0],
        res[MATRIX_MODES.MUTUAL_INFO_TARGET_WITH_CELL][1],
      );
    res[MATRIX_MODES.MUTUAL_INFO] =
      res[MATRIX_MODES.MUTUAL_INFO_TARGET_WITH_CELL];

    res[MATRIX_MODES.CELL_INTEREST] = UtilsService.getMinAndMaxFromArray(
      currentRes[MATRIX_MODES.CELL_INTEREST]!.flat(),
    );
    res[MATRIX_MODES.FREQUENCY] = UtilsService.getMinAndMaxFromArray(
      currentRes[MATRIX_MODES.FREQUENCY]!.flat(),
    );
    res[MATRIX_MODES.FREQUENCY_CELL] = UtilsService.getMinAndMaxFromArray(
      currentRes[MATRIX_MODES.FREQUENCY_CELL]!.flat(),
    );

    res[MATRIX_MODES.PROB_CELL] = [0, 1];
    res[MATRIX_MODES.PROB_TARGET_WITH_CELL] = [0, 1];
    res[MATRIX_MODES.PROB_CELL_REVERSE] = [0, 1];
    res[MATRIX_MODES.PROB_CELL_WITH_TARGET] = [0, 1];

    return res;
  }
}
