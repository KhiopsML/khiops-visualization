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
    isCooccurrenceChecked: true,
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

Cypress.Commands.add('testComponentScreenshot', (id: string) => {
  // Wait for the component to be visible and trigger trustedClick
  cy.get(id, { timeout: 10000 })
    .should('exist')
    .should('be.visible')
    .trigger('trustedClick');

  // Verify the component is selected (has selected class)
  cy.get(id).should('have.class', 'selected');

  cy.wait(100);

  cy.get('#header-tools-copy-image-button').first().click({ force: true });

  // Verify the snackbar success message appears
  cy.get('.mat-mdc-snack-bar-container')
    .should('be.visible')
    .and('contain', 'copied');

  // Verify fetch was called with a data URL
  cy.get('@fetchSpy', { timeout: 2000 }).should((spy) => {
    // Check that fetch was called
    expect(spy).to.have.been.called;

    // Get the last call argument (the dataUrl) since there might be multiple calls
    const lastCallIndex = spy.args.length - 1;
    const dataUrl = spy.args[lastCallIndex]?.[0];

    // Verify it's a PNG data URL
    expect(dataUrl).to.be.a('string');
    expect(dataUrl).to.include('data:image/png;base64,');

    // Verify the image has substantial data (more than just header)
    // A real screenshot should be at least 1000 characters
    expect(dataUrl.length).to.be.greaterThan(1000);
  });
});
