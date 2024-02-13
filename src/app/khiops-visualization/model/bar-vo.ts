export class BarVO {
  name: string;
  value: number;
  defaultGroupIndex: boolean = false;

  extra: {
    value: number;
    percent: number;
    name: string;
    index: number;
    frequencyValue: number;
    coverageValue: number;
  };

  constructor() {
    this.name = undefined;
    this.value = undefined;
    this.extra = {
      value: undefined,
      percent: undefined,
      name: undefined,
      index: undefined,
      frequencyValue: undefined,
      coverageValue: undefined,
    };
  }
}
