import { DimensionViewLayoutModel } from './dimension-view-layout.model';

export class ViewLayoutVO {
  isDimensionsChecked = true;
  isCoocurenceChecked = true;

  dimensionsViewsLayoutsVO: DimensionViewLayoutModel[];

  constructor() {
    this.dimensionsViewsLayoutsVO = [];
  }

  /**
   * Adds a new DimensionViewLayoutModel to the dimensionsViewsLayoutsVO array.
   * If a previous layout is provided, it merges the previous values into the new layout.
   *
   * @param dimensionName - The name of the dimension.
   * @param isContextView - Boolean indicating if it is a context view.
   * @param previousLayout - Optional previous layout to merge values from.
   */
  addDimensionViewLayout(
    dimensionName: string,
    isContextView: boolean,
    previousLayout?: DimensionViewLayoutModel,
  ) {
    let viewLayoutDimension = new DimensionViewLayoutModel(
      dimensionName,
      isContextView,
    );
    if (previousLayout) {
      // assign previous values
      viewLayoutDimension = Object.assign(viewLayoutDimension, previousLayout);
    }
    this.dimensionsViewsLayoutsVO.push(viewLayoutDimension);
  }

  /**
   * Merges the current ViewLayoutVO instance with previous values.
   * Updates the properties of the current instance with the values from the provided lsValues.
   *
   * @param lsValues - The previous values to merge with.
   */
  megeWithPreviousValues(lsValues: any) {
    this.isDimensionsChecked = lsValues.isDimensionsChecked;
    this.isCoocurenceChecked = lsValues.isCoocurenceChecked;
    for (let i = 0; i < this.dimensionsViewsLayoutsVO.length; i++) {
      const prevValue = lsValues.dimensionsViewsLayoutsVO[i];
      if (
        prevValue &&
        (!prevValue.name || // Allow init for cypress tests
          prevValue?.name === this.dimensionsViewsLayoutsVO[i]?.name)
      ) {
        this.dimensionsViewsLayoutsVO[i] = Object.assign(
          this.dimensionsViewsLayoutsVO[i]!,
          prevValue,
        );
      }
    }
  }
}
