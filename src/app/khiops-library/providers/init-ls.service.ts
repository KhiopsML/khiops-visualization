import { ViewLayoutVO } from '../../khiops-covisualization/model/view-layout.model';

/**
 * Initializes the local storage with default view layout settings.
 *
 * @returns {ViewLayoutVO} The initialized view layout object with default settings.
 */
export function initLS() {
  let ls: ViewLayoutVO = new ViewLayoutVO();
  // @ts-ignore
  ls = {
    isDimensionsChecked: true,
    isCooccurrenceChecked: true,
    dimensionsViewsLayoutsVO: [
      {
        isChecked: true,
        isHierarchyChecked: true,
        isClustersChecked: true,
        isAnnotationChecked: true,
        isCompositionChecked: true,
        isExternalDataChecked: true,
        isDistributionChecked: true,
        name: '',
      },
      {
        isChecked: true,
        isHierarchyChecked: true,
        isClustersChecked: true,
        isAnnotationChecked: true,
        isCompositionChecked: true,
        isExternalDataChecked: true,
        isDistributionChecked: true,
        name: '',
      },
      {
        isChecked: true,
        isHierarchyChecked: true,
        isClustersChecked: true,
        isAnnotationChecked: true,
        isCompositionChecked: true,
        isExternalDataChecked: true,
        isDistributionChecked: true,
        name: '',
      },
      {
        isChecked: true,
        isHierarchyChecked: true,
        isClustersChecked: true,
        isAnnotationChecked: true,
        isCompositionChecked: true,
        isExternalDataChecked: true,
        isDistributionChecked: true,
        name: '',
      },
      {
        isChecked: true,
        isHierarchyChecked: true,
        isClustersChecked: true,
        isAnnotationChecked: true,
        isCompositionChecked: true,
        isExternalDataChecked: true,
        isDistributionChecked: true,
        name: '',
      },
      {
        isChecked: true,
        isHierarchyChecked: true,
        isClustersChecked: true,
        isAnnotationChecked: true,
        isCompositionChecked: true,
        isExternalDataChecked: true,
        isDistributionChecked: true,
        name: '',
      },
    ],
  };

  return ls;
}
