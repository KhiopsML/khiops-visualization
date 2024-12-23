export class DimensionViewLayoutModel {
  name: string;
  isChecked = true;
  isHierarchyChecked = true;
  isClustersChecked = false;
  isAnnotationChecked = false;
  isCompositionChecked = true;
  isExternalDataChecked = false;
  isDistributionChecked = false;

  constructor(name: string, isContextView: boolean) {
    this.name = name || '';

    if (isContextView) {
      this.isDistributionChecked = false;
    }
  }
}
