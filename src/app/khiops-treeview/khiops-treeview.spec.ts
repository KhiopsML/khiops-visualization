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

  describe('TreeView node renaming', () => {
    let root: HTMLElement;
    let tree: TreeView;
    let updateName: jasmine.Spy;
    let error: jasmine.Spy;

    beforeEach(() => {
      root = document.createElement('div');
      root.innerHTML = '<div id="tree"></div>';
      tree = new TreeView(
        [
          {
            id: 1,
            name: ']-inf;5[',
            bounds: '[0;5[',
            shortDescription: 'Saved name',
            isLeaf: true,
          },
        ],
        root,
        'tree',
      );
      updateName = jasmine.createSpy('updateNodeName');
      error = jasmine.createSpy('error');
      tree.on('updateNodeName', updateName);
      tree.on('error', error);
    });

    function editNode(): HTMLInputElement {
      root.querySelector<HTMLElement>('.edit-button')!.click();
      return root.querySelector<HTMLInputElement>('.tree-leaf-text-input input')!;
    }

    it('restores the original formatted name when an empty name is confirmed', () => {
      const input = editNode();
      expect(input.value).toBe('Saved name');
      input.value = '';
      root.querySelector<HTMLElement>('.valid-rename')!.click();

      expect(root.querySelector('.tree-leaf-text')!.firstChild!.textContent).toBe(
        '[0;5[',
      );
      expect(root.querySelector('.tree-leaf-text-input')).toBeNull();
      expect(root.querySelector('.edit-button')).not.toBeNull();
      expect(updateName).toHaveBeenCalledOnceWith({
        data: { name: ']-inf;5[', newName: '[0;5[' },
      });
      expect(error).not.toHaveBeenCalled();
      const data = JSON.parse(
        root.querySelector('.tree-leaf-content')!.getAttribute('data-item')!,
      );
      expect(data.shortDescription).toBe('[0;5[');
    });

    it('restores the original name with Enter after another rename', () => {
      let input = editNode();
      input.value = 'New name';
      root.querySelector<HTMLElement>('.valid-rename')!.click();
      expect(updateName).toHaveBeenCalledWith({
        data: { name: ']-inf;5[', newName: 'New name' },
      });

      input = editNode();
      expect(input.value).toBe('New name');
      input.value = '';
      input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));

      expect(root.querySelector('.tree-leaf-text')!.firstChild!.textContent).toBe(
        '[0;5[',
      );
      expect(updateName).toHaveBeenCalledWith({
        data: { name: ']-inf;5[', newName: '[0;5[' },
      });
      expect(updateName).toHaveBeenCalledTimes(2);
    });

    it('leaves the current name unchanged when editing is cancelled', () => {
      const input = editNode();
      input.value = '';
      root
        .querySelector<HTMLElement>('.tree-leaf-text-input .edit-icons')!
        .click();

      expect(root.querySelector('.tree-leaf-text')!.firstChild!.textContent).toBe(
        'Saved name',
      );
      expect(root.querySelector('.tree-leaf-text-input')).toBeNull();
      expect(updateName).not.toHaveBeenCalled();
    });

    it('uses the node name when formatted bounds are unavailable', () => {
      tree = new TreeView(
        [{ id: 2, name: 'Original', shortDescription: 'Renamed', isLeaf: true }],
        root,
        'tree',
      );
      tree.on('updateNodeName', updateName);
      editNode().value = '';
      root.querySelector<HTMLElement>('.valid-rename')!.click();

      expect(root.querySelector('.tree-leaf-text')!.firstChild!.textContent).toBe(
        'Original',
      );
      expect(updateName).toHaveBeenCalledOnceWith({
        data: { name: 'Original', newName: 'Original' },
      });
    });

    it('continues to accept nonempty whitespace-only names', () => {
      editNode().value = '  ';
      root.querySelector<HTMLElement>('.valid-rename')!.click();

      expect(root.querySelector('.tree-leaf-text')!.firstChild!.textContent).toBe(
        '  ',
      );
      expect(updateName).toHaveBeenCalledOnceWith({
        data: { name: ']-inf;5[', newName: '  ' },
      });
    });
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
