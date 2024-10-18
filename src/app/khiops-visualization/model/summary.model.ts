import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';

export class SummaryModel {
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

  displayDatas!: InfosDatasI[];

  constructor(object) {
    // Assign values from input
    Object.assign(this, object);

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
