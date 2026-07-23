/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

Cypress.Commands.add(
  'loadFile',
  (ctx: string, file: string, options?: { skipLsMerge?: boolean }) => {
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

        // When skipLsMerge is true, preserve the file's savedDatas view layout
        // instead of forcing all views visible via LS defaults
        if (options?.skipLsMerge) {
          (win as any).cypressSkipLsMerge = true;
        }
      },
    });

    // Switch to the desired tab (assuming it's the last tab)
    cy.get('.mat-mdc-tab').last().click();

    // Upload the file
    cy.get('#open-file-input').first().type(file, { force: true });
    cy.get('#open-file-button').first().click({ force: true });
  },
);

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
  cy.get(canvasSelector).should(($canvas) => {
    const canvas = $canvas[0] as HTMLCanvasElement;

    expect(canvas.width).to.be.greaterThan(0);
    expect(canvas.height).to.be.greaterThan(0);

    const context = canvas.getContext('2d');
    expect(context).to.not.be.null;

    const pixels = context!.getImageData(
      0,
      0,
      canvas.width,
      canvas.height,
    ).data;

    // Retry until chart paints at least one non-transparent pixel.
    const isNotEmpty = Array.from(pixels).some((value) => value !== 0);
    expect(isNotEmpty).to.be.true;
  });
});

Cypress.Commands.add('setGlobalSetting', (settingKey: string, value: any) => {
  // Generic function to set any global setting for all tests
  // This will work for both visualization and covisualization modules
  cy.window().then((win) => {
    // Set in localStorage directly with the correct module prefixes
    win.localStorage.setItem(
      `KHIOPS_VISUALIZATION_${settingKey}`,
      String(value),
    );
    win.localStorage.setItem(
      `KHIOPS_COVISUALIZATION_${settingKey}`,
      String(value),
    );

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
              appService.Ls.set(settingKey, value);
            }
          } catch (serviceError) {
            // AppService not available, localStorage fallback used
          }
        }
      }
    } catch (e) {
      // Ignore errors if Angular is not available yet
    }
  });
});

Cypress.Commands.add('setGlobalAutoScale', (value: boolean) => {
  // Set auto scale setting globally for all tests
  cy.setGlobalSetting('SETTING_AUTO_SCALE', value);
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

Cypress.Commands.add('testComponentScreenshot', (id: string, tab?: string) => {
  cy.task(
    'log',
    `Testing screenshot copy for component with id: ${id} for tab: ${tab}`,
  );

  // Wait for the component to be visible and trigger trustedClick
  cy.get(id).should('exist').should('be.visible').trigger('trustedClick');

  // Verify the component is selected (has selected class)
  cy.get(id).should('have.class', 'selected');

  cy.get('#header-tools-copy-image-button').first().click({ force: true });

  // Verify the snackbar success message appears
  cy.get('.mat-mdc-snack-bar-container')
    .should('be.visible')
    .and('contain', 'copied');

  // Verify fetch was called with a valid PNG data URL
  cy.get('@fetchSpy', { timeout: 2000 }).should((spy) => {
    const dataUrl = spy.args.at(-1)?.[0];
    expect(spy).to.have.been.called;
    expect(dataUrl)
      .to.be.a('string')
      .and.include('data:image/png;base64,')
      .and.have.length.greaterThan(1000);
  });
});
