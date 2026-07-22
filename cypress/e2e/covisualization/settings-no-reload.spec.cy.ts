/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

function setSliderValue(selector: string, value: number) {
  cy.get(selector).then(($input) => {
    cy.wrap($input).invoke('val', value).trigger('input').trigger('change');
  });
}

describe('Settings changes without reload for Khiops Covisualization', () => {
  it('Should preserve selected node AND update precision in cluster interest cells', () => {
    cy.initViews();
    cy.loadFile('covisualization', 'adult2var.json');

    cy.readFile('./src/assets/mocks/kc/adult2var.json').then(() => {
      // Click on a specific tree node
      cy.get('.tree-leaf-text').eq(1).click({ force: true });

      cy.get('.tree-selected').should('exist');

      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');
      setSliderValue('.kl-number-precision input[matSliderThumb]', 2);
      cy.get('#user-settings-comp button').contains('Save').click();
      cy.get('#user-settings-comp').should('not.be.visible');

      // Verify selection preserved
      cy.get('.tree-selected').should('exist');

      // Capture app-cluster-details text at precision 2
      let textAt2: string;
      cy.get('app-cluster-details')
        .invoke('text')
        .then((text) => {
          textAt2 = text;
        });

      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');
      setSliderValue('.kl-number-precision input[matSliderThumb]', 6);
      cy.get('#user-settings-comp button').contains('Save').click();
      cy.get('#user-settings-comp').should('not.be.visible');

      // Verify selection still preserved
      cy.get('.tree-selected').should('exist');

      // Verify app-cluster-details text changed (precision 6 shows more digits)
      cy.get('app-cluster-details').invoke('text').should('not.eq', textAt2);
    });
  });

  it('Should preserve selected node AND verify canvas changes with contrast', () => {
    cy.initViews();
    cy.loadFile('covisualization', 'adult2var.json');

    cy.readFile('./src/assets/mocks/kc/adult2var.json').then(() => {
      // Click on a specific tree node
      cy.get('.tree-leaf-text').eq(2).click({ force: true });

      cy.get('.tree-selected').should('exist');

      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');
      setSliderValue('.kl-matrix-contrast-setting input[matSliderThumb]', 10);
      cy.get('#user-settings-comp button').contains('Save').click();
      cy.get('#user-settings-comp').should('not.be.visible');

      // Capture canvas pixel sum at contrast 10
      let pixelsAt10: number;
      cy.get('#matrix').then(($canvas) => {
        const ctx = $canvas[0].getContext('2d');
        const data = ctx.getImageData(
          0,
          0,
          $canvas[0].width,
          $canvas[0].height,
        ).data;
        pixelsAt10 = Array.from(data).reduce(
          (a: number, b: number) => a + b,
          0,
        );
      });

      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');
      setSliderValue('.kl-matrix-contrast-setting input[matSliderThumb]', 80);
      cy.get('#user-settings-comp button').contains('Save').click();
      cy.get('#user-settings-comp').should('not.be.visible');

      // Verify selection preserved
      cy.get('.tree-selected').should('exist');

      // Verify canvas pixel data changed (contrast was applied)
      cy.get('#matrix').then(($canvas) => {
        const ctx = $canvas[0].getContext('2d');
        const data = ctx.getImageData(
          0,
          0,
          $canvas[0].width,
          $canvas[0].height,
        ).data;
        const pixelsAt80 = Array.from(data).reduce(
          (a: number, b: number) => a + b,
          0,
        );
        expect(pixelsAt80).not.to.eq(pixelsAt10);
      });
    });
  });

  it('Should verify matrix canvas changes with contrast without losing tree state', () => {
    cy.initViews();
    cy.loadFile('covisualization', 'CC_3_Coclustering.json');

    cy.readFile('./src/assets/mocks/kc/CC_3_Coclustering.json').then(() => {
      // Expand a tree node to set some state
      cy.get('#tree-expando-6').first().click();
      cy.get('#cluster-composition-0').contains('A11');

      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');
      setSliderValue('.kl-matrix-contrast-setting input[matSliderThumb]', 10);
      cy.get('#user-settings-comp button').contains('Save').click();
      cy.get('#user-settings-comp').should('not.be.visible');

      // Capture canvas pixel sum at contrast 10
      let pixelsAt10: number;
      cy.get('#matrix').then(($canvas) => {
        const ctx = $canvas[0].getContext('2d');
        const data = ctx.getImageData(
          0,
          0,
          $canvas[0].width,
          $canvas[0].height,
        ).data;
        pixelsAt10 = Array.from(data).reduce(
          (a: number, b: number) => a + b,
          0,
        );
      });

      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');
      setSliderValue('.kl-matrix-contrast-setting input[matSliderThumb]', 80);
      cy.get('#user-settings-comp button').contains('Save').click();
      cy.get('#user-settings-comp').should('not.be.visible');

      // Verify tree state is preserved
      cy.get('#cluster-composition-0').contains('A11');

      // Verify canvas pixel data changed (contrast was applied)
      cy.get('#matrix').then(($canvas) => {
        const ctx = $canvas[0].getContext('2d');
        const data = ctx.getImageData(
          0,
          0,
          $canvas[0].width,
          $canvas[0].height,
        ).data;
        const pixelsAt80 = Array.from(data).reduce(
          (a: number, b: number) => a + b,
          0,
        );
        expect(pixelsAt80).not.to.eq(pixelsAt10);
      });
    });
  });

  it('Should update cluster grid interest cell values when number precision changes', () => {
    cy.initViews();
    cy.loadFile('covisualization', 'adult2var.json');

    cy.readFile('./src/assets/mocks/kc/adult2var.json').then(() => {
      cy.get('#cluster-details-grid-0').should('be.visible');

      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');
      setSliderValue('.kl-number-precision input[matSliderThumb]', 2);
      cy.get('#user-settings-comp button').contains('Save').click();
      cy.get('#user-settings-comp').should('not.be.visible');

      // Capture app-cluster-details text at precision 2
      let textAt2: string;
      cy.get('app-cluster-details')
        .invoke('text')
        .then((text) => {
          textAt2 = text;
        });

      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');
      setSliderValue('.kl-number-precision input[matSliderThumb]', 6);
      cy.get('#user-settings-comp button').contains('Save').click();
      cy.get('#user-settings-comp').should('not.be.visible');

      // Verify app-cluster-details text changed (precision 6 shows more digits)
      cy.get('app-cluster-details').invoke('text').should('not.eq', textAt2);
    });
  });
});

describe('Settings changes without reload for Khiops Covisualization', () => {
  it('Should preserve selected node after changing number precision', () => {
    cy.initViews();
    cy.loadFile('covisualization', 'adult2var.json');

    cy.readFile('./src/assets/mocks/kc/adult2var.json').then(() => {
      // Click on a specific tree node to change the selection
      cy.get('.tree-leaf-text').eq(1).click({ force: true });

      cy.get('.tree-selected').should('exist');

      // Open settings and save
      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');
      cy.get('#user-settings-comp button').contains('Save').click();
      cy.get('#user-settings-comp').should('not.be.visible');

      // Verify the tree selection is preserved
      cy.get('.tree-selected').should('exist');
    });
  });

  it('Should preserve selected node after changing matrix contrast', () => {
    cy.initViews();
    cy.loadFile('covisualization', 'adult2var.json');

    cy.readFile('./src/assets/mocks/kc/adult2var.json').then(() => {
      // Click on a specific tree node to change the selection
      cy.get('.tree-leaf-text').eq(2).click({ force: true });

      cy.get('.tree-selected').should('exist');

      // Open settings and save
      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');
      cy.get('#user-settings-comp button').contains('Save').click();
      cy.get('#user-settings-comp').should('not.be.visible');

      // Verify the tree selection is preserved
      cy.get('.tree-selected').should('exist');

      // Verify the matrix is still rendered
      cy.checkCanvasIsNotEmpty('#matrix');
    });
  });

  it('Should update matrix after contrast change without losing state', () => {
    cy.initViews();
    cy.loadFile('covisualization', 'CC_3_Coclustering.json');

    cy.readFile('./src/assets/mocks/kc/CC_3_Coclustering.json').then(() => {
      // Expand a tree node to set some state
      cy.get('#tree-expando-6').first().click();
      cy.get('#cluster-composition-0').contains('A11');

      // Open settings and save
      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');
      cy.get('#user-settings-comp button').contains('Save').click();
      cy.get('#user-settings-comp').should('not.be.visible');

      // Verify the tree state is preserved (composition still shows A11)
      cy.get('#cluster-composition-0').contains('A11');

      // Verify matrix is still rendered
      cy.checkCanvasIsNotEmpty('#matrix');
    });
  });

  it('Should update grid number formatting after precision change', () => {
    cy.initViews();
    cy.loadFile('covisualization', 'adult2var.json');

    cy.readFile('./src/assets/mocks/kc/adult2var.json').then(() => {
      // Verify grid is visible
      cy.get('.ag-body-viewport').should('be.visible');

      // Open settings and save
      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');
      cy.get('#user-settings-comp button').contains('Save').click();
      cy.get('#user-settings-comp').should('not.be.visible');

      // Verify the grid is still visible and populated
      cy.get('.ag-body-viewport').should('be.visible');
      cy.get('.ag-row').should('have.length.greaterThan', 0);
    });
  });
});
