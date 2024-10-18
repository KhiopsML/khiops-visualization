import { TYPES } from '@khiops-library/enum/types';

export class MatrixOptionsModel {
  types: string[] = [TYPES.STANDARD, TYPES.FREQUENCY];
  selected: string | undefined = undefined;
}
