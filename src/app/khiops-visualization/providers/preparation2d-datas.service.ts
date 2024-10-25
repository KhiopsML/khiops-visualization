import { Injectable } from '@angular/core';
import * as _ from 'lodash'; // Important to import lodash in karma
import { AppService } from './app.service';
import { DimensionModel } from '@khiops-library/model/dimension.model';
import { TranslateService } from '@ngstack/translate';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { EvaluationDatasService } from './evaluation-datas.service';
import { Preparation2dVariableModel } from '../model/preparation2d-variable.model';
import { CellModel } from '@khiops-library/model/cell.model';
import { MatrixUtilsService } from '@khiops-library/components/matrix/matrix.utils.service';
import { PreparationDatasService } from './preparation-datas.service';
import { VariableDetailsModel } from '../model/variable-details.model';
import { Variable2dModel } from '../model/variable-2d.model';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
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

@Injectable({
  providedIn: 'root',
})
export class Preparation2dDatasService {
  private preparation2dDatas: Preparation2dDatasModel;

  constructor(
    private translate: TranslateService,
    private preparationDatasService: PreparationDatasService,
    private appService: AppService,
    private khiopsLibraryService: KhiopsLibraryService,
    private evaluationDatasService: EvaluationDatasService,
  ) {}
  /**
   * Initializes the preparation2dDatas with data from the app service.
   * Selects the first variable by default or a saved variable if available.
   */
  initialize() {
    const appDatas = this.appService.getDatas().datas;
    this.preparation2dDatas = new Preparation2dDatasModel(appDatas);

    // select the first item of the list by default
    if (this.preparation2dDatas.isValid()) {
      let defaultVariable: VariablePairStatistics =
        appDatas.bivariatePreparationReport.variablesPairsStatistics[0];

      // Check if there is a saved selected variable into json
      const savedSelected2dRank =
        this.appService.getSavedDatas('selected2dRank');
      if (savedSelected2dRank) {
        defaultVariable = this.getVariableFromRank(savedSelected2dRank);
      }

      this.setSelectedVariable(defaultVariable.name1, defaultVariable.name2);
    }
  }

  /**
   * Returns the current preparation2dDatas.
   * @returns The current Preparation2dDatasModel.
   */
  getDatas(): Preparation2dDatasModel {
    return this.preparation2dDatas;
  }

  /**
   * Retrieves and formats information data for display.
   * @returns An array of InfosDatasI or undefined.
   */
  getInformationsDatas(): InfosDatasI[] | undefined {
    const appDatas = this.appService.getDatas().datas;
    const informationsDatas = new InformationsModel(
      appDatas.bivariatePreparationReport.summary,
    );
    return informationsDatas.displayDatas;
  }

  /**
   * Toggles the isAxisInverted property of preparation2dDatas.
   */
  toggleIsAxisInverted() {
    this.preparation2dDatas.isAxisInverted =
      !this.preparation2dDatas.isAxisInverted;
  }

  /**
   * Checks if the axis is inverted.
   * @returns True if the axis is inverted, otherwise false.
   */
  isAxisInverted() {
    return this.preparation2dDatas.isAxisInverted;
  }

  /**
   * Sets the selected cell index and updates the selected cell.
   * @param index - The index of the cell to select.
   */
  setSelectedCellIndex(index: number) {
    this.preparation2dDatas.selectedCellIndex = index;
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
      this.preparation2dDatas.selectedCellIndex = cell.index;
      this.preparation2dDatas.selectedCell = cell;
    }
  }

  /**
   * Gets the index of the selected cell.
   * @returns The index of the selected cell.
   */
  getSelectedCellIndex(): number {
    return this.preparation2dDatas.selectedCellIndex;
  }

  /**
   * Gets the selected cell.
   * @returns The selected CellModel.
   */
  getSelectedCell(): CellModel {
    return this.preparation2dDatas.selectedCell;
  }

  /**
   * Computes the distribution index from the matrix cell index.
   * @param index - The index of the matrix cell.
   * @returns The distribution index.
   */
  computeDistributionIndexFromMatrixCellIndex(index: number): number {
    // get distribution bar chart index from selected matrix cell index
    if (this.preparation2dDatas.matrixDatas) {
      let moduloOfCellIndex = 0;
      moduloOfCellIndex =
        ((index / this.preparation2dDatas?.selectedVariable?.parts) % 1) *
        this.preparation2dDatas?.selectedVariable?.parts;
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
      const variable = this.getVariableFromNames(name1, name2);
      if (variable) {
        this.preparation2dDatas.selectedVariable =
          new Preparation2dVariableModel(variable);
        this.setSelectedCellIndex(0);
        return this.preparation2dDatas.selectedVariable;
      }
    }
    return undefined;
  }

  /**
   * Sets the selected regression variable.
   * @param currentVar - The current regression variable to select.
   */
  setSelectedRegressionVariable(currentVar: Preparation2dVariableModel) {
    this.preparation2dDatas.selectedVariable = currentVar;
  }

  /**
   * Gets the selected variable.
   * @returns The selected Preparation2dVariableModel or undefined.
   */
  getSelectedVariable(): Preparation2dVariableModel | undefined {
    return this.preparation2dDatas.selectedVariable;
  }

  /**
   * Gets the rank of the selected variable.
   * @returns The rank of the selected variable.
   */
  getSelectedVariableRank(): string {
    return this.preparation2dDatas?.selectedVariable?.rank;
  }

  /**
   * Checks if the variable is supervised.
   * @returns True if the variable is supervised, otherwise false.
   */
  isSupervised(): boolean {
    return this.preparation2dDatas.isSupervisedVariable();
  }

  /**
   * Gets the 2D variable data.
   * @returns An array of Variable2dModel.
   */
  getVariablesd2Datas(): Variable2dModel[] {
    const appDatas = this.appService.getDatas().datas;
    const variableDatas: Variable2dModel[] = [];
    if (appDatas?.bivariatePreparationReport?.variablesPairsStatistics) {
      const currentDatas =
        appDatas.bivariatePreparationReport.variablesPairsStatistics;
      if (currentDatas) {
        for (let i = 0; i < currentDatas.length; i++) {
          const varItem: Variable2dModel | undefined = new Variable2dModel(
            currentDatas[i],
          );
          variableDatas.push(varItem);
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
    const appDatas = this.appService.getDatas().datas;
    if (appDatas?.bivariatePreparationReport?.variablesPairsStatistics) {
      const currentPreparation2dVariable: VariablePairStatistics =
        appDatas.bivariatePreparationReport.variablesPairsStatistics.find(
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
    const appDatas = this.appService.getDatas().datas;
    variable =
      appDatas.bivariatePreparationReport.variablesPairsStatistics.find(
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
        this.translate,
        selectedVariable?.nameX,
        selectedVariable?.nameY,
      );

      const values: CoocurenceCellModel[] = [];

      for (
        let i = 0;
        i < this.preparation2dDatas.matrixDatas.matrixCellDatas.length;
        i++
      ) {
        const cell: CellModel =
          this.preparation2dDatas.matrixDatas.matrixCellDatas[i];
        const coocurenceCell = new CoocurenceCellModel(cell.index);

        // coocurenceCell has dynamic fields
        coocurenceCell[matrixCells.displayedColumns[1].field] =
          UtilsService.ellipsis(cell.xDisplayaxisPart, 60);
        coocurenceCell[matrixCells.displayedColumns[2].field] =
          UtilsService.ellipsis(cell.yDisplayaxisPart, 60);
        coocurenceCell.frequency = cell.cellFreq;
        coocurenceCell.coverage = cell.coverage;
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
  getCurrentCellDatas(): {
    values: any[][]; // Dynamic values according to the input datas
    displayedColumns: GridColumnsI[][];
  } {
    const selectedVariable = this.getSelectedVariable();

    const datasX: any = [],
      datasY: any = [],
      displayedColumnsX: GridColumnsI[] = [],
      displayedColumnsY: GridColumnsI[] = [];

    this.preparation2dDatas.currentCellDatas = {
      values: [datasX, datasY],
      displayedColumns: [displayedColumnsX, displayedColumnsY],
    };

    if (selectedVariable) {
      const variableDetails = this.getVariableDetails(selectedVariable.rank);
      const selectedCell = this.getSelectedCell();

      if (selectedCell && variableDetails?.dataGrid) {
        const xName = selectedVariable.nameX;
        const yName = selectedVariable.nameY;
        const xType = variableDetails.dataGrid.dimensions[0].type;
        const yType = variableDetails.dataGrid.dimensions[1].type;

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

        this.getCellDatasByAxis(
          xType,
          selectedCell.xaxisPartValues,
          selectedCell.xDisplayaxisPart,
          datasX,
          displayedColumnsX,
          xName,
        );
        this.getCellDatasByAxis(
          yType,
          selectedCell.yaxisPartValues,
          selectedCell.yDisplayaxisPart,
          datasY,
          displayedColumnsY,
          yName,
        );
      }
    }

    return this.preparation2dDatas.currentCellDatas;
  }

  /**
   * Retrieves cell data for a given axis and formats it for display.
   * @param type - The type of the axis (e.g., numerical or categorical).
   * @param axisPartValues - The values of the axis parts.
   * @param displayaxisPart - The display value of the axis part.
   * @param datasAxis - The data array to store the formatted axis data.
   * @param displayedColumns - The columns to be displayed.
   * @param variableName - The name of the variable.
   */
  getCellDatasByAxis(
    type: string,
    axisPartValues: number[] | string,
    displayaxisPart: string,
    datasAxis: any,
    displayedColumns: GridColumnsI[],
    variableName: string,
  ) {
    if (axisPartValues) {
      if (type === TYPES.NUMERICAL) {
        axisPartValues = [Number(displayaxisPart)]; // join into one array for numerical values (bivar)
      }

      const appDatas = this.appService.getDatas().datas;
      for (let k = 0; k < axisPartValues.length; k++) {
        // get value into global json
        datasAxis[k] = {};
        datasAxis[k][displayedColumns[0].field] = axisPartValues[k];
        if (displayedColumns[1]) {
          const modalityFreq = this.getModalityFrequency(
            appDatas.preparationReport.variablesDetailedStatistics,
            variableName,
            axisPartValues[k].toString(),
          );
          datasAxis[k][displayedColumns[1].field] = modalityFreq;
        }
      }
    }
  }

  /**
   * Retrieves the frequency of a given modality for a variable.
   * @param source - The source data containing variable statistics.
   * @param variable - The name of the variable.
   * @param partition - The partition value of the variable.
   * @returns The frequency of the modality or undefined if not found.
   */
  getModalityFrequency(source: any, variable: string, partition: string) {
    let currentVar;
    Object.keys(source).forEach((key) => {
      if (source[key].dataGrid.dimensions[0].variable === variable) {
        currentVar = source[key].inputValues;
      }
    });
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
  getTargetsIfAvailable() {
    // Initialize
    this.preparation2dDatas.isTargetAvailable = false;
    let targets: any;

    const variablesDetails: VariableDetailsModel | undefined =
      this.getVariableDetails(this.preparation2dDatas?.selectedVariable?.rank);

    if (variablesDetails?.dataGrid?.cellIds) {
      const isTargetAvailable: any = variablesDetails.dataGrid.dimensions.find(
        (e) => e.variable === 'Target',
      );

      if (isTargetAvailable) {
        targets = isTargetAvailable.partition;
      }
      this.preparation2dDatas.isTargetAvailable = isTargetAvailable;
      return targets;
    }
  }

  /**
   * Retrieves detailed information about a variable based on its rank.
   * @param rank - The rank of the variable.
   * @returns The VariableDetailsModel containing detailed information about the variable, or undefined if not found.
   */
  getVariableDetails(rank: string): VariableDetailsModel | undefined {
    const appDatas = this.appService.getDatas().datas;
    let variableDetails: VariableDetailsModel | undefined;
    const isRegressionOrExplanatoryAnalysis =
      this.preparationDatasService.isExplanatoryAnalysis() ||
      this.evaluationDatasService.isRegressionAnalysis();

    if (
      !isRegressionOrExplanatoryAnalysis &&
      appDatas?.bivariatePreparationReport?.variablesPairsDetailedStatistics?.[
        rank
      ]
    ) {
      // normal case
      const currentVar =
        appDatas.bivariatePreparationReport.variablesPairsDetailedStatistics[
          rank
        ];
      variableDetails = new VariableDetailsModel(
        currentVar,
        this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_TABLE_SIZE,
      );
    } else if (
      isRegressionOrExplanatoryAnalysis &&
      appDatas?.textPreparationReport?.variablesDetailedStatistics?.[rank]
    ) {
      // regression or explanatory case: textPreparationReport
      const currentVar =
        appDatas.textPreparationReport.variablesDetailedStatistics[rank];
      variableDetails = new VariableDetailsModel(
        currentVar,
        this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_TABLE_SIZE,
      );
    } else if (
      isRegressionOrExplanatoryAnalysis &&
      appDatas?.preparationReport?.variablesDetailedStatistics?.[rank]
    ) {
      // regression or explanatory case: preparationReport
      const currentVar =
        appDatas.preparationReport.variablesDetailedStatistics[rank];
      variableDetails = new VariableDetailsModel(
        currentVar,
        this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_TABLE_SIZE,
      );
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
  ): any {
    this.preparation2dDatas.matrixDatas = undefined;
    const variablesDetails: VariableDetailsModel | undefined =
      this.getVariableDetails(selectedVariable.rank);

    if (variablesDetails) {
      const variableDatas: VariableDetailsModel = _.cloneDeep(variablesDetails);

      if (variableDatas) {
        const xDimension = new DimensionModel(
          variableDatas.dataGrid.dimensions[0],
        );
        const yDimension = new DimensionModel(
          variableDatas.dataGrid.dimensions[1],
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
          const computedCellFreqs = MatrixUtilsService.getCellFrequencies(
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
          const sum = UtilsService.sumArrayItemsOfArray(
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
              variableDatas.dataGrid.cellFrequencies ||
                variableDatas.dataGrid.cellTargetFrequencies,
            );
          [xValues.standard, yValues.standard] =
            MatrixUtilsService.getStandardAxisValues(xDimension, yDimension);
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
          this.preparation2dDatas.matrixDatas = {
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

    return this.preparation2dDatas.matrixDatas;
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
      const inputDatas = this.getMatrixDatas(variablesDatas[i]);
      if (inputDatas) {
        let matrixFreqsValues, matrixValues, matrixExtras;
        let graphMode: MatrixModeI = {
          mode: 'MUTUAL_INFO_TARGET_WITH_CELL',
        };
        [matrixFreqsValues, matrixValues, matrixExtras] =
          MatrixUtilsService.computeMatrixValues(
            graphMode,
            inputDatas.matrixCellDatas,
            undefined,
            0,
          );
        currentRes['MUTUAL_INFO_TARGET_WITH_CELL'].push(matrixValues);

        graphMode = {
          mode: 'CELL_INTEREST',
        };
        [matrixFreqsValues, matrixValues, matrixExtras] =
          MatrixUtilsService.computeMatrixValues(
            graphMode,
            inputDatas.matrixCellDatas,
            undefined,
            0,
          );
        currentRes['CELL_INTEREST'].push(matrixValues);

        for (let j = 0; j < inputDatas.matrixCellDatas.length; j++) {
          currentRes['FREQUENCY'].push(
            UtilsService.arraySum(inputDatas.matrixCellDatas[j].cellFreqs),
          );
          currentRes['FREQUENCY_CELL'].push(
            inputDatas.matrixCellDatas[j].cellFreqs,
          );
        }
      }
    }

    // Reinit values after computing
    this.preparation2dDatas.matrixDatas = undefined;
    const res: any = {};

    res['MUTUAL_INFO_TARGET_WITH_CELL'] = UtilsService.getMinAndMaxFromArray(
      currentRes['MUTUAL_INFO_TARGET_WITH_CELL'].flat(),
    );
    res['MUTUAL_INFO_TARGET_WITH_CELL'] = UtilsService.averageMinAndMaxValues(
      res['MUTUAL_INFO_TARGET_WITH_CELL'][0],
      res['MUTUAL_INFO_TARGET_WITH_CELL'][1],
    );
    res['MUTUAL_INFO'] = res['MUTUAL_INFO_TARGET_WITH_CELL'];

    res['CELL_INTEREST'] = UtilsService.getMinAndMaxFromArray(
      currentRes['CELL_INTEREST'].flat(),
    );

    res['FREQUENCY'] = UtilsService.getMinAndMaxFromArray(
      currentRes['FREQUENCY'].flat(),
    );
    res['FREQUENCY_CELL'] = UtilsService.getMinAndMaxFromArray(
      currentRes['FREQUENCY_CELL'].flat(),
    );

    res['PROB_CELL'] = [0, 1];
    res['PROB_TARGET_WITH_CELL'] = [0, 1];
    res['PROB_CELL_REVERSE'] = [0, 1];
    res['PROB_CELL_WITH_TARGET'] = [0, 1];

    return res;
  }
}
