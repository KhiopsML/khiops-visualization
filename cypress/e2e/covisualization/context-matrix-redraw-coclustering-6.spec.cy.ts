/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../../support/commands';

const CONTEXT_POSITIONS = [2, 3, 4, 5];

function normalizeText(value: string | undefined | null): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function getMatrixHash() {
  return cy.get('#matrix').should('be.visible').then(($canvas) => {
    const canvas = $canvas[0] as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx || canvas.width === 0 || canvas.height === 0) {
      return 'empty';
    }

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let hash = 0;

    for (let i = 0; i < data.length; i += 64) {
      hash = (hash * 31 + data[i] + data[i + 1] * 3 + data[i + 2] * 7) >>> 0;
    }

    return `${canvas.width}x${canvas.height}:${hash}`;
  });
}

function getTooltipAtSameMatrixPosition() {
  return cy
    .get('#matrix-selected')
    .should('be.visible')
    .trigger('mousemove', { position: 'topLeft', force: true })
    .then(() => {
      return cy
        .get('.matrix-tooltip-comp.visible', { timeout: 10000 })
        .first()
        .invoke('text')
        .then((text) => normalizeText(text));
    });
}

function clickDifferentLeaf(
  position: number,
  forbiddenTexts: string[],
  allowExpandoFallback = false,
) {
  const selector = `#hierarchy-details-comp-${position}`;

  const tryClickVisibleLeaf = () => {
    return cy.get(selector).should('be.visible').then(($container) => {
      const $leaves = $container.find('.tree-leaf-text:visible');
      const candidate = [...$leaves].find((node) => {
        const text = normalizeText((node as HTMLElement).innerText);
        return text && !forbiddenTexts.includes(text);
      });

      if (candidate) {
        const clickedText = normalizeText((candidate as HTMLElement).innerText);
        return cy
          .wrap(candidate)
          .click({ force: true })
          .then(() => clickedText);
      }

      return cy.wrap('');
    });
  };

  return tryClickVisibleLeaf().then((clickedText) => {
    if (clickedText) {
      return clickedText;
    }

    return cy
      .get(selector)
      .then(($container) => {
        const $expandos = $container.find(
          '.tree-expando:not(.hidden):not(.expanded):visible',
        );
        if ($expandos.length > 0) {
          cy.wrap($expandos[0]).click({ force: true });
        }
      })
      .then(() => tryClickVisibleLeaf())
      .then((clickedAfterExpand) => {
        if (clickedAfterExpand) {
          return clickedAfterExpand;
        }

        if (allowExpandoFallback) {
          return cy
            .get(selector)
            .then(($expandos) => {
              const $visibleExpandos = $expandos.find(
                '.tree-expando:not(.hidden):visible',
              );
              if ($visibleExpandos.length > 0) {
                cy.wrap($visibleExpandos[0]).click({ force: true });
                return '__expando_toggled__';
              }

              throw new Error(
                `Unable to interact with context tree in hierarchy-details-comp-${position}`,
              );
            });
        }

        throw new Error(
          `Unable to find a different visible leaf in hierarchy-details-comp-${position}`,
        );
      });
  });
}

function verifyContextChangeRedrawsMatrix(position: number) {
  const container = `#hierarchy-details-comp-${position}`;

  return cy
    .get(`${container} .tree-selected .tree-leaf-text:visible`)
    .first()
    .invoke('text')
    .then((selectedText) => {
      const selectedBefore = normalizeText(selectedText);

      return getMatrixHash().then((matrixHashBefore) => {
        return getTooltipAtSameMatrixPosition().then((tooltipBefore) => {
          return clickDifferentLeaf(position, [selectedBefore]).then((clickedLeaf) => {
            return getMatrixHash().then((matrixHashAfter) => {
              expect(matrixHashAfter).to.not.equal(matrixHashBefore);

              return getTooltipAtSameMatrixPosition().then((tooltipAfter) => {
                expect(
                  tooltipAfter,
                  `Tooltip should change after selecting ${clickedLeaf} in hierarchy-details-comp-${position}`,
                ).to.not.equal(tooltipBefore);
              });
            });
          });
        });
      });
    });
}

function verifyContextChangeKeepsMatrix(position: number) {
  const container = `#hierarchy-details-comp-${position}`;

  return cy
    .get(`${container} .tree-selected .tree-leaf-text:visible`)
    .first()
    .invoke('text')
    .then((selectedText) => {
      const selectedBefore = normalizeText(selectedText);

      return getMatrixHash().then((matrixHashBefore) => {
        return clickDifferentLeaf(position, [selectedBefore], true).then(() => {
          return getMatrixHash().then((matrixHashAfter) => {
            expect(matrixHashAfter).to.equal(matrixHashBefore);
          });
        });
      });
    });
}

describe('Context matrix redraw with Coclustering-6', () => {
  it('updates matrix on context changes and keeps it stable when expected', () => {
    cy.initViews();
    cy.loadFile('covisualization', 'Coclustering-6.json');

    cy.get('.mat-mdc-tab:contains("Context")', { timeout: 20000 })
      .first()
      .click();

    CONTEXT_POSITIONS.forEach((position) => {
      cy.get(`#hierarchy-details-comp-${position}`, { timeout: 15000 }).should(
        'be.visible',
      );
    });

    const conditionalCheckbox =
      'mat-checkbox.conditionnal-checkbox input[type="checkbox"]';

    cy.get(conditionalCheckbox).should('be.checked');

    cy.wrap(CONTEXT_POSITIONS).each((position: number) => {
      return verifyContextChangeRedrawsMatrix(position);
    });

    // Folding selected context node must not change matrix.
    const context2 = '#hierarchy-details-comp-2';
    cy.get(`${context2} .tree-leaf-content .tree-expando:not(.hidden):visible`)
      .first()
      .then(($expando) => {
        cy.wrap($expando)
          .parents('.tree-leaf-content')
          .find('.tree-leaf-text')
          .first()
          .click({ force: true });

        getMatrixHash().then((hashBeforeFold) => {
          cy.wrap($expando).click({ force: true });

          getMatrixHash().then((hashAfterFold) => {
            expect(hashAfterFold).to.equal(hashBeforeFold);
          });
        });
      });

    // Conditional OFF: changing leaves/nodes in context trees must not redraw matrix.
    cy.get(conditionalCheckbox).then(($checkbox) => {
      if ($checkbox.is(':checked')) {
        cy.wrap($checkbox).click({ force: true });
      }
    });
    cy.get(conditionalCheckbox).should('not.be.checked');

    cy.wrap(CONTEXT_POSITIONS).each((position: number) => {
      return verifyContextChangeKeepsMatrix(position);
    });
  });
});
