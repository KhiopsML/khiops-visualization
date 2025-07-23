/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

Cypress.Commands.add('loadFile', (ctx: string, file: string) => {
  // Load the visualization or covisualization page
  cy.visit('/' + ctx + '/');

  // Switch to the desired tab (assuming it's the last tab)
  cy.get('.mat-mdc-tab').last().click();

  // Upload the file
  cy.get('#open-file-input').first().type(file, { force: true });
  cy.get('#open-file-button').first().click({ force: true });
});

Cypress.Commands.add('initViews', () => {
  const viewsLayout: any = {
    isDimensionsChecked: true,
    isCoocurenceChecked: true,
    dimensionsViewsLayoutsVO: [],
  };

  for (let index = 0; index < 10; index++) {
    viewsLayout.dimensionsViewsLayoutsVO.push({
      isChecked: true,
      isHierarchyChecked: true,
      isClustersChecked: true,
      isAnnotationChecked: true,
      isCompositionChecked: true,
      isExternalDataChecked: true,
      isDistributionChecked: true,
    });
  }
});
