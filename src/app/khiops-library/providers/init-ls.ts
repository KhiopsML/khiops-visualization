export function initLS() {
  const ls = {
    isDimensionsChecked: true,
    isCoocurenceChecked: true,
    dimensionsViewsLayoutsVO: [
      {
        isChecked: true,
        isHierarchyChecked: true,
        isClustersChecked: true,
        isAnnotationChecked: true,
        isCompositionChecked: true,
        isExternalDataChecked: true,
        isDistributionChecked: true,
      },
      {
        isChecked: true,
        isHierarchyChecked: true,
        isClustersChecked: true,
        isAnnotationChecked: true,
        isCompositionChecked: true,
        isExternalDataChecked: true,
        isDistributionChecked: true,
      },
      {
        isChecked: true,
        isHierarchyChecked: true,
        isClustersChecked: true,
        isAnnotationChecked: true,
        isCompositionChecked: true,
        isExternalDataChecked: true,
        isDistributionChecked: true,
      },
      {
        isChecked: true,
        isHierarchyChecked: true,
        isClustersChecked: true,
        isAnnotationChecked: true,
        isCompositionChecked: true,
        isExternalDataChecked: true,
        isDistributionChecked: true,
      },
      {
        isChecked: true,
        isHierarchyChecked: true,
        isClustersChecked: true,
        isAnnotationChecked: true,
        isCompositionChecked: true,
        isExternalDataChecked: true,
        isDistributionChecked: true,
      },
      {
        isChecked: true,
        isHierarchyChecked: true,
        isClustersChecked: true,
        isAnnotationChecked: true,
        isCompositionChecked: true,
        isExternalDataChecked: true,
        isDistributionChecked: true,
      },
    ],
  };

  window.localStorage.setItem(
    'KHIOPS_COVISUALIZATION_VIEWS_LAYOUT',
    JSON.stringify(ls),
  );
}
