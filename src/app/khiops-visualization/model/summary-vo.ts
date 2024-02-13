import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';

export class SummaryVO {
  dictionary: string;
  database: string;
  targetVariable: string;
  instances: string;
  learningTask: string;
  samplePercentage: number;
  samplingMode: string;
  selectionVariable: string;
  selectionValue: string;
  evaluatedVariables: string;

  displayDatas: InfosDatasI[];

  constructor(object) {
    this.dictionary = object.dictionary || '';
    this.database = object.database || '';
    this.targetVariable = object.targetVariable || '';
    this.instances = object.instances || '';
    this.learningTask = object.learningTask || '';
    this.samplePercentage = object.samplePercentage || '';
    this.samplingMode = object.samplingMode || '';
    this.selectionVariable = object.selectionVariable || '';
    this.selectionValue = object.selectionValue || '';
    this.evaluatedVariables = object.evaluatedVariables || '';

    this.formatDatas();
  }

  formatDatas() {
    this.displayDatas = [];
    if (this.dictionary) {
      this.displayDatas.push({
        title: 'GLOBAL.DICTIONARY',
        value: this.dictionary,
      });
    }
    if (this.database) {
      this.displayDatas.push({
        title: 'GLOBAL.DATABASE',
        value: this.database,
      });
    }
    if (this.targetVariable) {
      this.displayDatas.push({
        title: 'GLOBAL.TARGET_VARIABLE',
        value: this.targetVariable,
      });
    }
    if (this.instances) {
      this.displayDatas.push({
        title: 'GLOBAL.INSTANCES',
        value: this.instances,
      });
    }
    if (this.learningTask) {
      this.displayDatas.push({
        title: 'GLOBAL.LEARNING_TASK',
        value: this.learningTask,
      });
    }
    if (this.samplePercentage) {
      this.displayDatas.push({
        title: 'GLOBAL.SAMPLE_PERCENTAGE',
        value: this.samplePercentage,
      });
    }
    if (this.samplingMode) {
      this.displayDatas.push({
        title: 'GLOBAL.SAMPLING_MODE',
        value: this.samplingMode,
      });
    }
    if (this.selectionVariable) {
      this.displayDatas.push({
        title: 'GLOBAL.SELECTION_VARIABLE',
        value: this.selectionVariable,
      });
    }
    if (this.selectionValue) {
      this.displayDatas.push({
        title: 'GLOBAL.SELECTION_VALUE',
        value: this.selectionValue,
      });
    }
    if (this.evaluatedVariables) {
      this.displayDatas.push({
        title: 'GLOBAL.EVALUATED_VARIABLES',
        value: this.evaluatedVariables,
      });
    }
  }
}
