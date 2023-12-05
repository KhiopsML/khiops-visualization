import { TYPES } from "@khiops-library/enum/types";

export class MatrixOptionsI {
	types: string[] = [TYPES.STANDARD, TYPES.FREQUENCY];
	selected: string = undefined;
}
