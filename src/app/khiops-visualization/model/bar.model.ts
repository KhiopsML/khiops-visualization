export class BarModel {
  name: string | undefined;
  value: number | undefined;
  defaultGroupIndex: boolean = false;

  extra: {
    value: number | undefined;
    percent: number | undefined;
    name: string | undefined;
    index: number | undefined;
    frequencyValue: number | undefined;
    coverageValue: number | undefined;
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
