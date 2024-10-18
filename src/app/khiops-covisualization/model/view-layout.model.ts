export class DimensionViewLayoutModel {
  name: string;
  isChecked = true;
  isHierarchyChecked = true;
  isClustersChecked = false;
  isAnnotationChecked = false;
  isCompositionChecked = true;
  isExternalDataChecked = false;
  isDistributionChecked = false;

  constructor(name, isContextView) {
    this.name = name || '';

    if (isContextView) {
      this.isDistributionChecked = false;
    }
  }
}

export class ViewLayoutVO {
  isDimensionsChecked = true;
  isCoocurenceChecked = true;

  dimensionsViewsLayoutsVO: DimensionViewLayoutModel[];

  constructor() {
    this.dimensionsViewsLayoutsVO = [];
  }

  addDimensionViewLayout(
    dimensionName,
    isContextView,
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

  megeWithPreviousValues(lsValues) {
    this.isDimensionsChecked = lsValues.isDimensionsChecked;
    this.isCoocurenceChecked = lsValues.isCoocurenceChecked;
    for (let i = 0; i < this.dimensionsViewsLayoutsVO.length; i++) {
      const prevValue = lsValues.dimensionsViewsLayoutsVO[i];
      if (
        prevValue &&
        (!prevValue.name || // Alow init for cypress tests
          prevValue?.name === this.dimensionsViewsLayoutsVO[i].name)
      ) {
        this.dimensionsViewsLayoutsVO[i] = Object.assign(
          this.dimensionsViewsLayoutsVO[i],
          prevValue,
        );
      }
    }
  }
}
