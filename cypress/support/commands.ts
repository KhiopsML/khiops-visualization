/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

Cypress.Commands.add('loadFile', (ctx: string, file: string) => {
  // Set number precision to 8 before loading any file
  cy.setGlobalNumberPrecision();

  // Load the visualization or covisualization page
  cy.visit('/' + ctx + '/');

  // Set number precision again after page load to ensure it's applied
  cy.setGlobalNumberPrecision();

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

Cypress.Commands.add('checkCanvasIsNotEmpty', (canvasSelector: string) => {
  cy.get(canvasSelector).then(($canvas) => {
    const canvas = $canvas[0];
    const context = canvas.getContext('2d');
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;

    // Checks if at least one pixel is not transparent
    const isNotEmpty = Array.from(pixels).some((value) => value !== 0);
    expect(isNotEmpty).to.be.true;
  });
});

Cypress.Commands.add('setGlobalNumberPrecision', () => {
  // Set number precision to 8 globally for all tests
  // This will work for both visualization and covisualization modules
  cy.window().then((win) => {
    // Set in localStorage directly with the correct prefixes used by the application
    win.localStorage.setItem(
      'KHIOPS_VISUALIZATION_SETTING_NUMBER_PRECISION',
      '8',
    );
    win.localStorage.setItem(
      'KHIOPS_COVISUALIZATION_SETTING_NUMBER_PRECISION',
      '8',
    );

    // Log for debugging
    cy.log('Set number precision to 8 in localStorage');

    // Also try to set through the application if available
    try {
      // Check if Angular is available and get the injector
      const angular = (win as any).ng;
      if (angular && angular.getInjector) {
        const injector = angular.getInjector();
        if (injector) {
          try {
            const appService = injector.get('AppService');
            if (appService && appService.Ls) {
              const LS = (win as any).LS || {
                SETTING_NUMBER_PRECISION: 'SETTING_NUMBER_PRECISION',
              };
              appService.Ls.set(LS.SETTING_NUMBER_PRECISION, 8);
              cy.log('Set number precision to 8 via AppService');
            }
          } catch (serviceError) {
            cy.log('AppService not available, localStorage fallback used');
          }
        }
      }
    } catch (e) {
      // Ignore errors if Angular is not available yet
      cy.log('Angular not available yet, localStorage fallback used');
    }
  });
});
