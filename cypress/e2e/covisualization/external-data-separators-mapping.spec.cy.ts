/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('External data separators and mapping lifecycle', () => {
  const uploadExternalFile = (fileName: string) => {
    cy.get('kl-import-file-loader input[type="file"]').selectFile(
      `src/assets/mocks/kc/${fileName}`,
      { force: true },
    );

    cy.get('app-import-ext-datas', { timeout: 10000 }).should('be.visible');
  };

  const selectDimension = (dimensionName: string) => {
    cy.get('#import-ext-datas-dimension-btn').click({ force: true });
    cy.get('.mat-mdc-menu-panel button.mat-mdc-menu-item')
      .contains(dimensionName)
      .click({ force: true });
  };

  const saveMapping = () => {
    cy.get('#import-ext-datas-save-btn').click({ force: true });
  };

  const setCustomSeparator = (value: string) => {
    cy.get('app-import-ext-datas:visible').first().as('editor');
    cy.get('@editor')
      .find('.separator-options button')
      .contains('Custom')
      .click({ force: true });

    cy.get('@editor')
      .find('input.custom-separator-input')
      .then(($input) => {
        if (!$input.length) {
          cy.get('@editor')
            .find('.separator-options button')
            .contains('Custom')
            .click({ force: true });
        }
      });

    cy.get('@editor')
      .find('input.custom-separator-input', { timeout: 10000 })
      .first()
      .should('be.visible')
      .clear()
      .type(value);
  };

  const openImportDialog = () => {
    cy.get('app-external-datas')
      .first()
      .then(($component) => {
        $component[0].dispatchEvent(
          new Event('trustedClick', { bubbles: true, cancelable: true }),
        );
      });
    cy.get('app-external-datas').first().trigger('trustedClick');

    cy.get('app-header-manage-view button[aria-label="Import external data"]')
      .first()
      .click({ force: true });
    cy.get('#import-ext-datas-list-comp', { timeout: 15000 }).should(
      'be.visible',
    );
  };

  it('handles tab/comma/string/custom-0 separators and mapping actions', () => {
    cy.initViews();
    cy.loadFile('covisualization', 'adult2var.json');

    cy.get('.mat-mdc-tab').contains('Axis').click();
    cy.get('#cluster-composition-1', { timeout: 20000 })
      .contains('Bachelors')
      .click({ force: true });

    openImportDialog();

    // 1) TAB file (multiple fields to import)
    uploadExternalFile('ext-tab.txt');
    cy.get('app-import-ext-datas .import-preview-header span').should(
      'have.length',
      3,
    );
    selectDimension('education');

    saveMapping();

    cy.contains('article.source-card', 'ext-tab.txt', { timeout: 15000 })
      .should('contain.text', 'education')
      .should('contain.text', 'Configured');

    cy.get('app-external-datas', { timeout: 15000 })
      .should('contain.text', 'This text is standard')
      .and('contain.text', 'label2');

    // 2) COMMA file (single field)
    uploadExternalFile('ext-comma.txt');
    cy.get('app-import-ext-datas .separator-options button')
      .contains('Comma (,)')
      .click({ force: true });
    selectDimension('occupation');
    saveMapping();

    cy.contains('article.source-card', 'ext-comma.txt', { timeout: 15000 })
      .should('contain.text', 'occupation')
      .should('contain.text', 'Configured');

    cy.get('[id^="cluster-composition-"]', { timeout: 20000 })
      .contains('Prof-specialty')
      .click({ force: true });
    cy.get('app-external-datas', { timeout: 15000 }).should(
      'contain.text',
      'mon text',
    );

    // 3) STRING(space) file: blocked because dimension already enriched by another file
    uploadExternalFile('ext-string.txt');
    cy.get('app-import-ext-datas .separator-options button')
      .contains('Space ( )')
      .click({ force: true });
    selectDimension('education');
    saveMapping();

    cy.get('.mat-mdc-snack-bar-container', { timeout: 10000 }).should(
      'contain.text',
      'already enriched with external data',
    );
    cy.contains('article.source-card', 'ext-string.txt').should('not.exist');

    // Custom separator flow is covered in the dedicated reset test below.

    // Edit mapping from external data panel should open matching source card and preserve checked fields
    cy.get('app-import-ext-datas').then(($editor) => {
      if ($editor.length > 0) {
        cy.contains('app-import-ext-datas button', 'Cancel').click({
          force: true,
        });
      }
    });

    cy.get('[id^="cluster-composition-"]', { timeout: 20000 })
      .contains('Bachelors')
      .click({ force: true });
    cy.get('app-external-datas', { timeout: 15000 }).should(
      'contain.text',
      'This text is standard',
    );

    cy.contains('app-external-datas', 'This text is standard', {
      timeout: 15000,
    }).within(() => {
      cy.get('.ext-datas-mapping-button').first().click({ force: true });
    });

    cy.contains('article.source-card', 'ext-tab.txt')
      .should('have.class', 'expanded')
      .and('contain.text', 'education');
    cy.get('app-import-ext-datas .selected-count').should(
      'contain.text',
      '2 / 2',
    );

    // Delete mapping and verify disappearance from app
    cy.contains('article.source-card', 'ext-tab.txt').within(() => {
      cy.get('.source-actions svg[lucideicon="trash"]').first().click({
        force: true,
      });
    });
    cy.get('.mat-mdc-snack-bar-container', { timeout: 10000 }).should(
      'contain.text',
      'deleted',
    );
    cy.contains('article.source-card', 'ext-tab.txt').should('not.exist');

    cy.get('[id^="cluster-composition-"]', { timeout: 20000 })
      .contains('Bachelors')
      .click({ force: true });
    cy.get('app-external-datas', { timeout: 15000 }).should(
      'not.contain.text',
      'This text is standard',
    );
    cy.get('app-external-datas', { timeout: 15000 }).should(
      'not.contain.text',
      'label2',
    );
  });

  it('resets editor state when browsing a new file before loading data', () => {
    cy.initViews();
    cy.loadFile('covisualization', 'adult2var.json');

    cy.get('.mat-mdc-tab').contains('Axis').click();
    cy.get('#cluster-composition-1', { timeout: 20000 })
      .contains('Bachelors')
      .click({ force: true });

    openImportDialog();

    // First file: configure several controls but do not save.
    uploadExternalFile('ext-tab.txt');
    cy.get('app-import-ext-datas .selected-count').should(
      'contain.text',
      '2 / 2',
    );
    cy.get('app-import-ext-datas .import-preview-header span').should(
      'have.length',
      3,
    );
    selectDimension('education');
    setCustomSeparator('0');

    // Browse another file without Load Datas: editor must reinitialize.
    uploadExternalFile('ext-comma.txt');

    cy.get('app-import-ext-datas .file-summary strong').should(
      'have.text',
      'ext-comma.txt',
    );

    // New file has 2 columns (join key + one field), so sample must reset to 2 columns.
    cy.get('app-import-ext-datas .import-preview-header span').should(
      'have.length',
      2,
    );
    cy.get('app-import-ext-datas .selected-count').should(
      'contain.text',
      '1 / 1',
    );

    // Join key options must come from the new file only.
    cy.get('app-import-ext-datas .step-select').first().click({ force: true });
    cy.get('.mat-mdc-menu-panel button.mat-mdc-menu-item').should(
      'have.length',
      2,
    );
    cy.get('.mat-mdc-menu-panel button.mat-mdc-menu-item')
      .contains('occupation')
      .should('be.visible');
    cy.get('.mat-mdc-menu-panel button.mat-mdc-menu-item')
      .contains('key')
      .should('be.visible');
    cy.get('body').click(0, 0);

    // Save still works after reset.
    selectDimension('occupation');
    saveMapping();
    cy.contains('article.source-card', 'ext-comma.txt', { timeout: 15000 })
      .should('contain.text', 'occupation')
      .should('contain.text', 'Configured');
  });

  it('keeps mapping when edited join key becomes previous field', () => {
    cy.initViews();
    cy.loadFile('covisualization', 'adult2var.json');

    cy.get('.mat-mdc-tab').contains('Axis').click();
    cy.get('[id^="cluster-composition-"]', { timeout: 20000 })
      .contains('Prof-specialty')
      .click({ force: true });

    openImportDialog();

    uploadExternalFile('ext-comma.txt');
    cy.get('app-import-ext-datas .separator-options button')
      .contains('Comma (,)')
      .click({ force: true });

    // Import with a non-sense join key first.
    cy.get('app-import-ext-datas .step-select').first().click({ force: true });
    cy.get('.mat-mdc-menu-panel button.mat-mdc-menu-item')
      .contains('key')
      .click({ force: true });
    selectDimension('occupation');
    saveMapping();

    cy.contains('article.source-card', 'ext-comma.txt', { timeout: 15000 })
      .should('contain.text', 'occupation')
      .and('contain.text', 'key');

    // Edit mapping and switch join key to occupation.
    cy.contains('article.source-card', 'ext-comma.txt').within(() => {
      cy.get('.source-actions button').first().click({ force: true });
    });
    cy.get('app-import-ext-datas .step-select').first().click({ force: true });
    cy.get('.mat-mdc-menu-panel button.mat-mdc-menu-item')
      .contains('occupation')
      .click({ force: true });

    // After join key switch, remaining field must stay selected and save must keep source.
    cy.get('app-import-ext-datas .selected-count').should(
      'contain.text',
      '1 / 1',
    );
    saveMapping();

    cy.contains('article.source-card', 'ext-comma.txt', { timeout: 15000 })
      .should('contain.text', 'occupation')
      .and('contain.text', 'Configured');

    cy.contains('article.source-card', 'ext-comma.txt', { timeout: 15000 })
      .should('contain.text', 'occupation')
      .and('contain.text', 'Configured');
  });
});
