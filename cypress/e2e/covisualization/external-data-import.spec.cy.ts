/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../../support/commands';
import '../../utils/utils';

describe('Test External Data Import in Khiops Covisualization', () => {
  // test: Load a file with pre-configured savedDatas.importedDatas
  // The external data should be loaded automatically from the saved path (Electron mode)
  const fileNameWithSavedDatas = 'check-ext-datas-e2e.json';

  it(`should auto-load external data from savedDatas for ${fileNameWithSavedDatas}`, () => {
    cy.initViews();

    cy.loadFile('covisualization', fileNameWithSavedDatas);

    // Wait for the file to be loaded - check that tabs are visible
    cy.get('.mat-mdc-tab', { timeout: 20000 }).should(
      'have.length.greaterThan',
      0,
    );

    // Wait for the external data to be loaded automatically from savedDatas
    cy.wait(3000);

    // Select a node that has the external data (e.g., "Bachelors")
    cy.get('app-composition', { timeout: 10000 })
      .contains('Bachelors')
      .click({ force: true });

    // Verify that app-external-datas component displays "This text is standard"
    cy.get('app-external-datas', { timeout: 15000 })
      .should('exist')
      .and('contain.text', 'This text is standard');
  });

  // Mock external data content matching the expected format
  const mockExternalDataContent = `education\tAn example of text
Bachelors\tThis text is standard
HS-grad\tThis one too
Masters\tAnother text
Some-college\tMore text
11th\tFinal text`;

  const fileName = 'adult2var.json';

  it(`should load external data and display it for ${fileName}`, () => {
    cy.initViews();

    cy.loadFile('covisualization', fileName);

    cy.readFile('./src/assets/mocks/kc/' + fileName).then((datas) => {
      // Parse .khcj files if needed
      if (fileName.endsWith('.khcj')) {
        datas = JSON.parse(datas);
      }

      // Wait for the file to be loaded - check that tabs are visible
      cy.get('.mat-mdc-tab', { timeout: 20000 }).should(
        'have.length.greaterThan',
        0,
      );

      // Wait for UI to stabilize after file load
      cy.wait(2000);

      // Click on the import external data button (file_upload icon)
      cy.get('app-header-manage-view button mat-icon', { timeout: 10000 })
        .contains('file_upload')
        .parent('button')
        .click({ force: true });

      // Wait for the import-ext-datas-list dialog to appear
      cy.get('#import-ext-datas-list-table', { timeout: 10000 }).should(
        'be.visible',
      );

      cy.get('#import-new-file-btn').click();
      cy.wait(200);

      // Create a mock file object for external data
      const extFileName = 'ExternalDataEducation.txt';
      const mimeType = 'text/plain';
      const blob = new Blob([mockExternalDataContent], { type: mimeType });
      const file = new File([blob], extFileName, { type: mimeType });

      // Find the hidden file input in kl-import-file-loader and upload the mock file
      cy.get('kl-import-file-loader input[type="file"]', {
        timeout: 10000,
      }).then(($input) => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        $input[0].files = dataTransfer.files;
        $input[0].dispatchEvent(new Event('change', { bubbles: true }));
      });

      // Wait for the import form to appear (shows when file is loaded)
      cy.get('app-import-ext-datas', { timeout: 10000 }).should('be.visible');

      // The dimension dropdown - click to open menu and select "education"
      cy.get('app-import-ext-datas button.button-accent', { timeout: 10000 })
        .last() // The dimension dropdown is the last button-accent
        .click({ force: true });

      // Select "education" from the dropdown menu
      // Note: Material menu panels are rendered in the document body
      cy.get('.mat-mdc-menu-panel button.mat-mdc-menu-item', { timeout: 10000 })
        .contains('education')
        .click({ force: true });

      // Click the "Load data" button to import
      cy.get('#import-ext-datas-save-btn', { timeout: 10000 }).click({
        force: true,
      });

      // Wait for the snackbar and for the dialog state to update
      cy.wait(1500);

      // Close the import-ext-datas-list dialog by clicking the close button
      // This will also trigger the LoadExtDatasComponent to reload external data
      cy.get(
        'app-import-ext-datas-list #import-ext-datas-header button mat-icon',
        { timeout: 10000 },
      )
        .contains('close')
        .parent('button')
        .click({ force: true });

      // Wait for the LoadExtDatasComponent dialog to appear and finish loading
      // This dialog loads the saved external data and then closes automatically
      cy.wait(1000);

      // Wait for all dialogs to be closed
      cy.get('app-import-ext-datas-list', { timeout: 10000 }).should(
        'not.exist',
      );

      // Now verify that the external data is displayed
      // First, we need to select a node that has the external data (e.g., "Bachelors")
      // Click on the composition or cluster that contains "Bachelors"
      cy.get('app-composition', { timeout: 10000 })
        .contains('Bachelors')
        .click({ force: true });

      // Verify that app-external-datas component displays "This text is standard"
      cy.get('app-external-datas', { timeout: 15000 })
        .should('exist')
        .and('contain.text', 'This text is standard');
    });
  });
});
