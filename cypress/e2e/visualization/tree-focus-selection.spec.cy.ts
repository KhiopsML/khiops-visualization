// @ts-nocheck

import '../../support/commands';

describe('KV decision tree focus selection', () => {
  const treeSelector = '#tree-preparation-select';
  const nodeSelector = `${treeSelector} .tree-leaf`;
  const toggleSelector = `${treeSelector} mat-slide-toggle button[role="switch"]`;
  let root;
  let selectionGroups: string[][];

  function flatten(node) {
    return [node, ...(node.childNodes || []).flatMap(flatten)];
  }

  function pathTo(node, nodeId): string[] {
    if (node.nodeId === nodeId) {
      return [node.nodeId];
    }
    for (const child of node.childNodes || []) {
      const path = pathTo(child, nodeId);
      if (path.length) {
        return [node.nodeId, ...path];
      }
    }
    return [];
  }

  function expectNodes(nodeIds: string[]) {
    cy.get(nodeSelector).should(($nodes) => {
      const actualIds = Array.from($nodes, (node) =>
        node.id.replace('tree-leaf-', ''),
      );
      expect(actualIds.sort()).to.deep.equal([...nodeIds].sort());
    });
  }

  function selectedGroup(nodeId: string): string[] {
    return selectionGroups.find((group) => group.includes(nodeId)) || [nodeId];
  }

  function focusedGroup(nodeId: string): string[] {
    return [...new Set(selectedGroup(nodeId).flatMap((id) => pathTo(root, id)))];
  }

  function selectNode(nodeId: string) {
    cy.get(`${treeSelector} #tree-leaf-${nodeId} > .tree-leaf-content`)
      .scrollIntoView()
      .click();
    cy.get(`${treeSelector} #tree-leaf-${nodeId} > .tree-leaf-content`)
      .should('have.class', 'tree-selected');
  }

  function setFocus(checked: boolean) {
    cy.get(toggleSelector).click();
    cy.get(toggleSelector).should('have.attr', 'aria-checked', String(checked));
  }

  beforeEach(() => {
    cy.readFile('src/assets/mocks/kv/new-hyper-tree.json').then((report) => {
      root = report.treePreparationReport.treeDetails.R01.treeNodes;
      selectionGroups = report.treePreparationReport.variablesDetailedStatistics
        .R01.dataGrid.dimensions[0].partition;
    });
    cy.loadFile('visualization', 'new-hyper-tree.json');
    cy.contains('.mat-mdc-tab', 'Tree preparation').click();
    cy.get(treeSelector).should('not.exist');
    cy.get('#tree-preparation-variables-list .kl-tree-inspect-button')
      .first()
      .should('have.attr', 'aria-label', 'Inspect')
      .click();
    cy.get(treeSelector).should('be.visible');
    cy.get(`${treeSelector} mat-slide-toggle`).should(
      'contain.text',
      'Focus selection',
    );
    cy.get(toggleSelector).should('have.attr', 'aria-checked', 'false');
    cy.then(() => expectNodes(flatten(root).map((node) => node.nodeId)));
  });

  it('keeps only selected leaf group and its ancestors, then restores all nodes', () => {
    selectNode('L75');
    setFocus(true);
    cy.then(() => expectNodes(focusedGroup('L75')));
    cy.get(`${treeSelector} .tree-leaf-content.tree-selected`)
      .should(($selected) => {
        const selectedIds = Array.from($selected, (node) =>
          node.parentElement.id.replace('tree-leaf-', ''),
        );
        expect(selectedIds.sort()).to.deep.equal([...selectedGroup('L75')].sort());
      });
    cy.get(`${treeSelector} #tree-leaf-L76`).should('not.exist');

    setFocus(false);
    cy.then(() => expectNodes(flatten(root).map((node) => node.nodeId)));
    cy.get(`${treeSelector} #tree-leaf-L75 > .tree-leaf-content`)
      .should('have.class', 'tree-selected');
  });

  it('keeps selected internal node, all descendants and its ancestors', () => {
    selectNode('L72');
    setFocus(true);
    cy.then(() => {
      const branch = flatten(root).find((node) => node.nodeId === 'L72');
      expectNodes([
        ...pathTo(root, 'L72').slice(0, -1),
        ...flatten(branch).map((node) => node.nodeId),
      ]);
    });
    cy.get(`${treeSelector} #tree-leaf-L75`).should('exist');
    cy.get(`${treeSelector} #tree-leaf-L76`).should('exist');
    cy.get(`${treeSelector} #tree-leaf-L71`).should('not.exist');

    setFocus(false);
    cy.then(() => expectNodes(flatten(root).map((node) => node.nodeId)));
  });

  it('updates focused branches when selection changes without disabling toggle', () => {
    selectNode('L75');
    setFocus(true);
    cy.then(() => expectNodes(focusedGroup('L75')));

    selectNode('L72');
    cy.get(`${treeSelector} #tree-leaf-L76`).should('exist');
    selectNode('L76');
    cy.then(() => expectNodes(focusedGroup('L76')));
    cy.get(`${treeSelector} #tree-leaf-L75`).should('not.exist');
    cy.get(toggleSelector).should('have.attr', 'aria-checked', 'true');

    setFocus(false);
    cy.then(() => expectNodes(flatten(root).map((node) => node.nodeId)));
    cy.get(`${treeSelector} #tree-leaf-L76 > .tree-leaf-content`)
      .should('have.class', 'tree-selected');
  });
});