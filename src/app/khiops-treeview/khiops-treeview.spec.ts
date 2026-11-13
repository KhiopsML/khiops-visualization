/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import TreeView from './khiops-treeview';

describe('TreeView folder icons', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    root.innerHTML = '<div id="tree"></div>';
    new TreeView(
      [false, true].map((isCollapsed, index) => ({
        id: index,
        name: `folder-${index}`,
        shortDescription: `Folder ${index}`,
        isLeaf: false,
        isCollapsed,
        children: [{ id: `leaf-${index}`, name: 'leaf', shortDescription: 'Leaf', isLeaf: true }],
      })),
      root,
      'tree',
    );
  });

  it('updates the icon class when a folder is collapsed and expanded', () => {
    const node = root.querySelector('#tree-leaf-0')!;
    const icon = node.querySelector('.tree-icon')!;
    const expando = node.querySelector<HTMLElement>('.tree-expando')!;

    expect(icon.classList.contains('folder-open')).toBeTrue();
    expect(icon.classList.contains('folder-close')).toBeFalse();
    expando.click();
    expect(icon.getAttribute('data-lucide-icon')).toBe('folder-close');
    expect(icon.classList.contains('folder-close')).toBeTrue();
    expect(icon.classList.contains('folder-open')).toBeFalse();
    expando.click();
    expect(icon.getAttribute('data-lucide-icon')).toBe('folder-open');
    expect(icon.classList.contains('folder-open')).toBeTrue();
    expect(icon.classList.contains('folder-close')).toBeFalse();
  });

  it('updates an initially collapsed folder when expanded', () => {
    const node = root.querySelector('#tree-leaf-1')!;
    const icon = node.querySelector('.tree-icon')!;
    expect(icon.classList.contains('folder-close')).toBeTrue();
    node.querySelector<HTMLElement>('.tree-expando')!.click();
    expect(icon.getAttribute('data-lucide-icon')).toBe('folder-open');
    expect(icon.classList.contains('folder-open')).toBeTrue();
    expect(icon.classList.contains('folder-close')).toBeFalse();
  });
});
