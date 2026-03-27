/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

Cypress.Commands.add('loadFile', (ctx: string, file: string) => {
  // Load the visualization or covisualization page
  cy.visit('/' + ctx + '/', {
    onBeforeLoad: (win) => {
      // Intercept localStorage.getItem to always return '8' for SETTING_NUMBER_PRECISION
      // regardless of the dynamic LS_ID prefix (which includes Date.now() and Math.random())
      const originalGetItem = win.localStorage.getItem.bind(win.localStorage);
      win.localStorage.getItem = (key: string) => {
        if (key.endsWith('SETTING_NUMBER_PRECISION')) {
          return '8';
        }
        return originalGetItem(key);
      };
    },
  });

  // Switch to the desired tab (assuming it's the last tab)
  cy.get('.mat-mdc-tab').last().click();

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
  // No-op: number precision is now handled via localStorage.getItem interception in loadFile
});

Cypress.Commands.add(
  'testComponentCopyDatas',
  (id: string, mockFileName: string) => {
    // Wait for the component to be visible and trigger trustedClick
    cy.get(id, { timeout: 1000 })
      .should('exist')
      .should('be.visible')
      .trigger('trustedClick');

    // Verify the component is selected (has selected class)
    cy.get(id).should('have.class', 'selected');

    cy.window().then((win) => {
      cy.get('#header-tools-copy-datas-button').first().click({ force: true });
      cy.window()
        .its('lastCopiedData')
        .then((clipboardText) => {
          // Verify the snackbar success message appears
          cy.get('.mat-mdc-snack-bar-container')
            .should('be.visible')
            .and('contain', 'copied');

          // Read the expected content from the mock file
          cy.readFile(`cypress/e2e/mocks/${mockFileName}`, 'utf8').then(
            (expectedContent) => {
              const normalizeContent = (text) => {
                // Normalize line endings and remove trailing spaces
                return text
                  .replace(/\r\n/g, '\n') // Normalize line endings to \n
                  .replace(/\r/g, '\n') // Convert \r to \n
                  .replace(/\s+$/gm, '') // Remove trailing spaces at end of lines
                  .trim(); // Remove leading and trailing spaces
              };

              const normalizedClipboard = normalizeContent(clipboardText);
              const normalizedExpected = normalizeContent(expectedContent);

              expect(normalizedClipboard).to.equal(normalizedExpected);
            },
          );
        });
    });
  },
);

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
