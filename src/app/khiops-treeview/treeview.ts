/*
 * Based on js-treeview by Justin Chmura
 * MIT License - Copyright (c) 2014 Justin Chmura
 * https://github.com/justinchmura/js-treeview
 *
 * Modifications: Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

/** List of events supported by the tree view */
const events = [
  'expand',
  'init',
  'updateNodeName',
  'expandAll',
  'collapse',
  'collapseAll',
  'selectNode',
  'selectNextNode',
  'unselectNodes',
  'selectNodes',
  'select',
  'error',
];

/**
 * Scrolls the given node into view
 * @param node The HTML element to scroll into view
 * @param center Whether to center the element in the viewport
 */
function scrollIntoView(node: HTMLElement, center = true) {
  if (!(node as any).scrollIntoViewIfNeeded) {
    const options: ScrollIntoViewOptions = {
      behavior: 'smooth',
      block: center ? 'center' : 'start',
    };
    node.scrollIntoView(options);
  } else {
    (node as any).scrollIntoViewIfNeeded(center);
  }
}

/**
 * Emit an event from the tree view
 * @param {string} name The name of the event to emit
 */
function emit(instance: TreeView, name: string, ...args: any[]) {
  if (events.indexOf(name) > -1) {
    if (instance.handlers[name] && instance.handlers[name] instanceof Array) {
      instance.handlers[name].forEach((handle) => {
        handle.callback.apply(handle.context, args);
      });
    }
  } else {
    throw new Error(name + ' event cannot be found on TreeView.');
  }
}

/**
 * Safely parse a data-item attribute, returns null on failure
 */
function parseDataItem(node: HTMLElement): any | null {
  try {
    const raw = node.getAttribute('data-item');
    return raw ? JSON.parse(raw) : null;
  } catch {
    console.error('TreeView: failed to parse data-item attribute', node);
    return null;
  }
}

/**
 * Renders the tree view in the DOM
 */
function render(self: TreeView) {
  const container = self.rootElementDom.querySelector(
    '#' + self.node,
  ) as HTMLElement | null;

  if (!container) return;

  const clonedContainer = container.cloneNode(true) as HTMLElement;
  container.parentNode!.replaceChild(clonedContainer, container);

  let removeAllEditInputs: () => void;

  const renderLeaf = function (item: any): HTMLElement {
    const leaf = document.createElement('div');
    const content = document.createElement('div');
    const icon = document.createElement('mat-icon');
    const text = document.createElement('div');
    const expando = document.createElement('div');

    leaf.setAttribute('class', 'tree-leaf');
    leaf.setAttribute('id', 'tree-leaf-' + item.id);
    content.setAttribute('class', 'tree-leaf-content');
    icon.setAttribute('class', 'tree-icon mat-icon material-icons');

    const leafDatas = {
      name: item.name,
      isLeaf: item.isLeaf,
      id: item.id,
    };
    content.setAttribute('data-item', JSON.stringify(leafDatas));

    text.setAttribute('class', 'tree-leaf-text');
    text.setAttribute('id', item.id);

    if (item.isLeaf) {
      icon.classList.add('is-leaf');
      icon.textContent = 'web_asset';
      icon.className += ' web_asset';
    } else {
      icon.textContent = item.isCollapsed ? 'folder' : 'folder_open';
    }

    if (item.color) {
      if (item.isLeaf) {
        icon.style.backgroundColor = item.color;
        icon.style.color = '#fff';
        text.style.color = item.color;
      } else {
        icon.style.color = item.color;
        text.style.color = item.color;
      }
    }

    text.textContent = item.shortDescription;

    // Add edit button if editing is enabled
    if (!self.options.disableUpdateName) {
      const editButton = document.createElement('button');
      editButton.setAttribute('class', 'edit-button');
      editButton.setAttribute('title', 'Edit name');
      editButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
      </svg>`;
      text.appendChild(editButton);
    }

    if (!self.options.disableCollapse) {
      expando.setAttribute(
        'class',
        'tree-expando ' + (item.isCollapsed ? '' : 'expanded'),
      );
      expando.setAttribute('id', 'tree-expando-' + item.id);
      expando.textContent = item.isCollapsed ? '+' : '-';
      if (!item.isUnfoldedByDefault) {
        content.appendChild(expando);
      }
    }

    content.appendChild(icon);
    content.appendChild(text);
    leaf.appendChild(content);

    if (item.isTruncated) {
      expando.classList.add('hidden');
    }

    if (item.children && item.children.length > 0) {
      const children = document.createElement('div');
      children.setAttribute('class', 'tree-child-leaves');
      for (let i = 0; i < item.children.length; i++) {
        const childLeaf = renderLeaf(item.children[i]);
        children.appendChild(childLeaf);
      }
      if (item.isCollapsed) {
        children.classList.add('hidden');
      }
      leaf.appendChild(children);
    } else {
      expando.classList.add('hidden');
    }

    return leaf;
  };

  const leaves: HTMLElement[] = [];
  for (let i = 0; i < self.data.length; i++) {
    leaves.push(renderLeaf(self.data[i]));
  }
  clonedContainer.innerHTML = leaves.map((leaf) => leaf.outerHTML).join('');

  const dblclick = function (e: Event) {
    const node = (e.target || e.currentTarget) as HTMLElement;
    const parent = node.parentNode as HTMLElement;

    node.style.display = 'none';

    const inputForm = document.createElement('div');
    inputForm.setAttribute('class', 'tree-leaf-text-input');

    const input = document.createElement('input');

    // text extraction without the edit button content
    const textContent =
      Array.from(node.childNodes)
        .filter((child) => child.nodeType === Node.TEXT_NODE)
        .map((child) => (child as Text).textContent)
        .join('') ||
      node.textContent ||
      '';
    input.setAttribute('placeholder', textContent.trim());

    const iconAccept = document.createElement('button');
    iconAccept.setAttribute('class', 'valid-rename edit-icons');
    iconAccept.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>`; // Modern check SVG
    iconAccept.onclick = function () {
      let newName = input.value
        .replace(/\./g, '') // dots are replaced by "-" in css
        .replace(/ /g, '') // spaces are replaced by "-" in css
        .replace(/[^\w\s]/gi, '-'); // replace all special chars

      if (newName !== '') {
        // change current node name - preserve the edit button
        const editButton = node.querySelector('.edit-button');
        node.innerHTML = newName;
        if (editButton && !self.options.disableUpdateName) {
          node.appendChild(editButton);
        }

        // change data-item object
        const data = parseDataItem(parent);
        if (data) {
          data.shortDescription = newName;
          parent.setAttribute('data-item', JSON.stringify(data));
          emit(self, 'updateNodeName', { data: { name: data.name, newName } });
        }
        // remove input

        removeAllEditInputs();
      } else {
        emit(self, 'error', {
          data: { message: 'SNACKS.NAME_CAN_NOT_BE_EMPTY' },
        });
      }
    };

    input.addEventListener('keyup', function (event: KeyboardEvent) {
      if (event.key === 'Enter') {
        event.preventDefault();
        // Trigger the button element with a click
        iconAccept.click();
      }
    });

    const iconCancel = document.createElement('button');
    iconCancel.setAttribute('class', 'edit-icons');
    iconCancel.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>`; // Modern X SVG
    iconCancel.onclick = function () {
      removeAllEditInputs();
    };

    inputForm.appendChild(input);
    inputForm.appendChild(iconCancel);
    inputForm.appendChild(iconAccept);
    parent.appendChild(inputForm);
    input.focus();
  };

  removeAllEditInputs = function () {
    clonedContainer
      .querySelectorAll<HTMLElement>('.tree-leaf-text')
      .forEach((node) => {
        node.style.display = 'flex';
      });
    clonedContainer
      .querySelectorAll<HTMLElement>('.tree-leaf-text-input')
      .forEach((node) => {
        node.remove();
      });
  };

  const click = function (e: Event) {
    const currentNode = (e.target || e.currentTarget) as HTMLElement;

    // Don't trigger selection if clicking on edit button
    if (currentNode.classList.contains('edit-button')) {
      return;
    }

    const parent = currentNode.parentNode as HTMLElement;
    removeAllEditInputs();

    const data = parseDataItem(parent);
    if (data) {
      emit(self, 'select', { data });
    }

    clonedContainer
      .querySelectorAll<HTMLElement>('.tree-leaf-text')
      .forEach((node) => {
        (node.parentNode as HTMLElement).classList.remove('tree-selected');
      });
    parent.classList.add('tree-selected');

    if (!(e as any).isTrusted) {
      scrollIntoView(parent);
    }
  };

  const clickExpandIcon = function (e: Event) {
    const target = (e.target || e.currentTarget) as HTMLElement;
    const parent = target.parentNode as HTMLElement;
    const data = parseDataItem(parent);
    const leaves = parent.parentNode?.querySelector(
      '.tree-child-leaves',
    ) as HTMLElement | null;

    if (leaves) {
      if (leaves.classList.contains('hidden')) {
        self.expand(parent, leaves);
      } else {
        self.collapse(parent, leaves);
      }
    } else if (data) {
      emit(self, 'select', { data });
    }
  };

  clonedContainer
    .querySelectorAll<HTMLElement>('.tree-icon')
    .forEach((node) => {
      node.onclick = click;
    });

  clonedContainer
    .querySelectorAll<HTMLElement>('.tree-leaf-text')
    .forEach((node) => {
      node.onclick = click;
    });

  if (!self.options.disableUpdateName) {
    clonedContainer
      .querySelectorAll<HTMLElement>('.edit-button')
      .forEach((button) => {
        button.onclick = function (e: Event) {
          e.stopPropagation(); // Prevent the tree node selection
          // Find the parent tree-leaf-text element
          const textElement = button.parentNode as HTMLElement;
          dblclick({ target: textElement } as unknown as Event);
        };
      });
  }

  clonedContainer
    .querySelectorAll<HTMLElement>('.tree-expando')
    .forEach((node) => {
      node.onclick = clickExpandIcon;
    });
}

interface TreeViewOptions {
  disableCollapse?: boolean;
  disableUpdateName?: boolean;
}

interface EventHandler {
  callback: Function;
  context?: any;
}

/**
 * @constructor
 * @property {object} handlers The attached event handlers
 * @property {object} data The JSON object that represents the tree structure
 * @property {DOMElement} node The DOM element to render the tree in
 */
export default class TreeView {
  public handlers: { [key: string]: EventHandler[] } = {};
  public rootElementDom: HTMLElement;
  public node: string;
  public data: any[];
  public options: TreeViewOptions;
  public hideExpando: boolean = false;
  private currentSelectedNodeId?: string | number;

  constructor(
    data: any[],
    rootElementDom: HTMLElement,
    node: string,
    options?: TreeViewOptions,
  ) {
    this.handlers = {};
    this.rootElementDom = rootElementDom;
    this.node = node;
    this.data = data;
    this.options = options || {
      disableCollapse: false,
      disableUpdateName: false,
    };

    render(this);

    setTimeout(() => {
      emit(this, 'init', {});
    });
  }

  /**
   * Expands a leaflet by the expando or the leaf text
   * @param {DOMElement} node The parent node that contains the leaves
   * @param {DOMElement} leaves The leaves wrapper element
   */
  expand(node: HTMLElement, leaves: HTMLElement, skipEmit?: boolean) {
    const expando = node.querySelector('.tree-expando') as HTMLElement | null;
    if (expando) expando.textContent = '-';
    const icon = node.querySelector('.tree-icon') as HTMLElement | null;
    if (icon) icon.textContent = 'folder_open';
    leaves.classList.remove('hidden');

    if (skipEmit) return;

    const data = parseDataItem(node);
    if (data) {
      emit(this, 'expand', { data });
    }
  }

  expandAll() {
    const el = this.rootElementDom.querySelector(
      '#' + this.node,
    ) as HTMLElement | null;
    if (!el) return;

    el.querySelectorAll<HTMLElement>('.tree-expando').forEach((node) => {
      const parent = node.parentNode as HTMLElement;
      const leaves = parent.parentNode?.querySelector(
        '.tree-child-leaves',
      ) as HTMLElement | null;
      if (parent && leaves && parent.hasAttribute('data-item')) {
        this.expand(parent, leaves, true);
      }
    });
    emit(this, 'expandAll', {});
  }

  selectNextNode(id: string, keyCode: number) {
    const domId = this.rootElementDom.querySelector(
      '#' + id,
    ) as HTMLElement | null;
    if (!domId) return;

    const elts: string[] = Array.from(domId.getElementsByClassName('tree-leaf'))
      .filter((el) => (el as HTMLElement).offsetParent !== null)
      .map((el) => el.id);

    const currentDomIndex = elts.indexOf(
      'tree-leaf-' + this.getSelectedNodeId(),
    );
    let nodeId: string | undefined;

    if (keyCode === 40) {
      // DOWN
      nodeId = elts[currentDomIndex + 1];
    } else if (keyCode === 38) {
      // UP
      nodeId = elts[currentDomIndex - 1];
    }

    if (nodeId) {
      nodeId = nodeId.substring(nodeId.lastIndexOf('-') + 1);
      this.selectNode(nodeId, true);
    }
  }

  scrollToNode(nodeId: string | number) {
    const el = this.rootElementDom.querySelector(
      '#tree-leaf-' + nodeId,
    ) as HTMLElement | null;
    if (el) {
      scrollIntoView(el);
    }
  }

  selectNode(nodeId: string | number, propagateEvent = true) {
    // Avoid redundant selection if the same node is already selected
    if (this.currentSelectedNodeId === nodeId) return;

    const el = this.rootElementDom.querySelector(
      '#' + this.node,
    ) as HTMLElement | null;
    if (!el) return;

    const nodes = el.querySelectorAll<HTMLElement>('.tree-leaf-text');
    let currentNode: HTMLElement | undefined;

    nodes.forEach((node) => {
      if (node.id === nodeId.toString()) {
        currentNode = node;
      }
    });

    this.currentSelectedNodeId = nodeId;

    if (currentNode && propagateEvent) {
      // Click the node to select it and propagate event
      currentNode.click();
    } else {
      // Select node without click propagation
      nodes.forEach((node) => {
        (node.parentNode as HTMLElement).classList.remove('tree-selected');
      });
      if (currentNode?.parentNode) {
        (currentNode.parentNode as HTMLElement).classList.add('tree-selected');
        scrollIntoView(currentNode.parentNode as HTMLElement);
      }
    }
  }

  unselectNodes() {
    setTimeout(() => {
      // When we make multiple nodes,
      // we must override simple select node selection with a timeout
      const el = this.rootElementDom.querySelector(
        '#' + this.node,
      ) as HTMLElement | null;
      if (!el) return;

      el.querySelectorAll<HTMLElement>('.tree-leaf-text').forEach((node) => {
        (node.parentNode as HTMLElement).classList.remove('tree-selected');
      });
    });
  }

  selectNodes(nodesToSelect: any[]) {
    setTimeout(() => {
      // When we make multiple nodes,
      // we must override simple select node selection with a timeout
      const el = this.rootElementDom.querySelector(
        '#' + this.node,
      ) as HTMLElement | null;
      if (!el || !nodesToSelect) return;

      const nodes = el.querySelectorAll<HTMLElement>('.tree-leaf-text');

      nodes.forEach((node) => {
        (node.parentNode as HTMLElement).classList.remove('tree-selected');
      });

      for (const currentNodeToSelect of nodesToSelect) {
        let currentNode: HTMLElement | undefined;

        nodes.forEach((node) => {
          if (node.id === currentNodeToSelect.nodeId?.toString()) {
            currentNode = node;
          }
        });

        this.currentSelectedNodeId = currentNodeToSelect.nodeId;

        // Select node without click propagation
        if (currentNode?.parentNode) {
          (currentNode.parentNode as HTMLElement).classList.add(
            'tree-selected',
          );
          if (currentNodeToSelect.isTrusted) {
            scrollIntoView(currentNode.parentNode as HTMLElement);
          }
        }
      }
    });
  }

  getSelectedNodeId() {
    return this.currentSelectedNodeId;
  }

  getSelectedNodeName(): string | undefined {
    if (this.currentSelectedNodeId === undefined) return undefined;

    const el = this.rootElementDom.querySelector(
      '#' + this.node,
    ) as HTMLElement | null;
    if (!el) return undefined;

    const nodes = el.querySelectorAll<HTMLElement>('.tree-leaf-text');
    let name: string | undefined;

    nodes.forEach((node) => {
      if (node.id === this.currentSelectedNodeId?.toString()) {
        // Extract text content, excluding the edit button text
        name = Array.from(node.childNodes)
          .filter((child) => child.nodeType === Node.TEXT_NODE)
          .map((child) => (child as Text).textContent)
          .join('')
          .trim();
      }
    });

    return name;
  }

  toggleNode(nodeId: string | number, state: string, propagateEvent = true) {
    const el = this.rootElementDom.querySelector(
      '#' + this.node,
    ) as HTMLElement | null;
    if (!el) return;

    const nodes = el.querySelectorAll<HTMLElement>('.tree-expando');
    let currentNode: HTMLElement | undefined;

    nodes.forEach((node) => {
      if (node.id === 'tree-expando-' + nodeId.toString()) {
        currentNode = node;
      }
    });

    if (currentNode && propagateEvent) {
      if (
        (state === 'collapse' && currentNode.textContent === '-') ||
        (state === 'expand' && currentNode.textContent === '+')
      ) {
        currentNode.click();
      }
    }
  }

  /**
   * Collapses a leaflet by the expando or the leaf text
   * @param {DOMElement} node The parent node that contains the leaves
   * @param {DOMElement} leaves The leaves wrapper element
   */
  collapse(node: HTMLElement, leaves: HTMLElement, skipEmit?: boolean) {
    const expando = node.querySelector('.tree-expando') as HTMLElement | null;
    if (expando) expando.textContent = '+';
    const icon = node.querySelector('.tree-icon') as HTMLElement | null;
    if (icon) icon.textContent = 'folder';
    leaves.classList.add('hidden');

    if (skipEmit) return;

    const data = parseDataItem(node);
    if (data) {
      emit(this, 'collapse', { data });
    }
  }

  collapseAll() {
    const el = this.rootElementDom.querySelector('#' + this.node);
    if (!el) return;

    el.querySelectorAll<HTMLElement>('.tree-expando').forEach((node) => {
      const parent = node.parentNode as HTMLElement;
      const leaves = parent.parentNode?.querySelector(
        '.tree-child-leaves',
      ) as HTMLElement | null;
      if (parent && leaves && parent.hasAttribute('data-item')) {
        this.collapse(parent, leaves, true);
      }
    });
    emit(this, 'collapseAll', {});
  }

  /**
   * Attach an event handler to the tree view
   * @param {string} name Name of the event to attach
   * @param {function} callback The callback to execute on the event
   * @param {object} scope The context to call the callback with
   */
  on(name: string, callback: Function, scope?: any) {
    if (events.indexOf(name) > -1) {
      if (!this.handlers[name]) {
        this.handlers[name] = [];
      }
      this.handlers[name].push({ callback, context: scope });
    } else {
      throw new Error(name + ' is not supported by TreeView.');
    }
  }

  /**
   * Deattach an event handler from the tree view
   * @param {string} name Name of the event to deattach
   * @param {function} callback The function to deattach
   */
  off(name: string, callback: Function) {
    if (this.handlers[name] instanceof Array) {
      const index = this.handlers[name].findIndex(
        (handle) => handle.callback === callback,
      );
      if (index !== -1) {
        this.handlers[name].splice(index, 1);
      }
    }
  }
}
