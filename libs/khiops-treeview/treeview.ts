/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
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
 * A forEach that will work with a NodeList and generic Arrays
 * @param {array|NodeList} arr The array to iterate over
 * @param {function} callback Function that executes for each element. First parameter is element, second is index
 * @param {object} The context to execute callback with
 */
function forEach(
  arr: any[] | NodeListOf<Element>,
  callback: Function,
  scope?: any,
) {
  if (arr) {
    let i: number,
      len = arr.length;
    for (i = 0; i < len; i += 1) {
      callback.call(scope, arr[i], i);
    }
  }
}

/**
 * Emit an event from the tree view
 * @param {string} name The name of the event to emit
 */
function emit(instance: TreeView, name: string, ...args: any[]) {
  if (events.indexOf(name) > -1) {
    if (instance.handlers[name] && instance.handlers[name] instanceof Array) {
      forEach(instance.handlers[name], function (handle: any) {
        handle.callback.apply(handle.context, args);
      });
    }
  } else {
    throw new Error(name + ' event cannot be found on TreeView.');
  }
}

/**
 * Renders the tree view in the DOM
 */
function render(self: TreeView) {
  let container = self.rootElementDom.querySelector(
    '#' + self.node,
  ) as HTMLElement;

  let clonedContainer: HTMLElement;
  if (container) {
    clonedContainer = container.cloneNode(true) as HTMLElement;
    container.parentNode!.replaceChild(clonedContainer, container);
    let leaves: HTMLElement[] = [],
      clickExpandIcon: (e: Event) => void,
      dblclick: (e: Event) => void,
      removeAllEditInputs: () => void,
      click: (e: Event) => void;

    let renderLeaf = function (item: any): HTMLElement {
      let leaf = document.createElement('div');
      let content = document.createElement('div');
      let icon = document.createElement('mat-icon');

      let text = document.createElement('div');
      let expando = document.createElement('div');

      leaf.setAttribute('class', 'tree-leaf');
      leaf.setAttribute('id', 'tree-leaf-' + item.id);
      content.setAttribute('class', 'tree-leaf-content');
      icon.setAttribute('class', 'tree-icon mat-icon material-icons');

      let leafDatas = {
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
        let editButton = document.createElement('button');
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
        let children = document.createElement('div');
        children.setAttribute('class', 'tree-child-leaves');
        for (let i = 0; i < item.children.length; i++) {
          let childLeaf = renderLeaf(item.children[i]);
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

    for (let i = 0; i < self.data.length; i++) {
      leaves.push(renderLeaf.call(self, self.data[i]));
    }
    clonedContainer.innerHTML = leaves
      .map(function (leaf: HTMLElement) {
        return leaf.outerHTML;
      })
      .join('');

    dblclick = function (e: Event) {
      let node = (e.target || e.currentTarget) as HTMLElement;
      let parent = node.parentNode as HTMLElement;

      // Hide the text element and its edit button
      node.style.display = 'none';

      let inputForm = document.createElement('div');
      inputForm.setAttribute('class', 'tree-leaf-text-input');

      let input = document.createElement('input');
      // Get text content without the edit button
      let textContent = node.childNodes[0]
        ? (node.childNodes[0] as Text).textContent
        : node.textContent;
      if (node.querySelector('.edit-button')) {
        textContent = Array.from(node.childNodes)
          .filter((child) => child.nodeType === Node.TEXT_NODE)
          .map((child) => (child as Text).textContent)
          .join('');
      }
      input.setAttribute('placeholder', textContent || '');

      let iconAccept = document.createElement('button');
      iconAccept.setAttribute('class', 'valid-rename edit-icons');
      iconAccept.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>`; // Modern check SVG
      iconAccept.onclick = function () {
        let newName = input.value;
        newName = newName.replace(/\./g, ''); // dots are replaced by "-" in css
        newName = newName.replace(/\ /g, ''); // spaces are replaced by "-" in css
        newName = newName.replace(/[^\w\s]/gi, '-'); // replace all special chars

        if (newName !== '') {
          // change current node name - preserve the edit button
          let editButton = node.querySelector('.edit-button');
          node.innerHTML = newName;
          if (editButton && !self.options.disableUpdateName) {
            node.appendChild(editButton);
          }

          // change data-item object
          let data = JSON.parse(parent.getAttribute('data-item')!);
          data.shortDescription = newName;
          parent.setAttribute('data-item', JSON.stringify(data));

          // emit event
          emit(self, 'updateNodeName', {
            data: {
              name: data.name,
              newName: newName,
            },
          });

          // remove input
          removeAllEditInputs();
        } else {
          emit(self, 'error', {
            data: {
              message: 'SNACKS.NAME_CAN_NOT_BE_EMPTY',
            },
          });
        }
      };

      input.addEventListener('keyup', function (event: KeyboardEvent) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
          event.preventDefault();
          // Trigger the button element with a click
          iconAccept.click();
        }
      });

      let iconCancel = document.createElement('button');
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
      forEach(
        clonedContainer.querySelectorAll('.tree-leaf-text'),
        function (node: HTMLElement) {
          node.style.display = 'flex';
        },
      );
      forEach(
        clonedContainer.querySelectorAll('.tree-leaf-text-input'),
        function (node: HTMLElement) {
          node.remove();
        },
      );
    };

    click = function (e: Event) {
      let currentNode = (e.target || e.currentTarget) as HTMLElement;

      // Don't trigger selection if clicking on edit button
      if (currentNode.classList.contains('edit-button')) {
        return;
      }

      let parent = currentNode.parentNode as HTMLElement;
      removeAllEditInputs();

      let data = JSON.parse(parent.getAttribute('data-item')!);
      emit(self, 'select', {
        data: data,
      });

      forEach(
        clonedContainer.querySelectorAll('.tree-leaf-text'),
        function (node: HTMLElement) {
          let parent = node.parentNode as HTMLElement;
          parent.classList.remove('tree-selected');
        },
      );
      parent.classList.add('tree-selected');

      if (!(e as any).isTrusted) {
        (parent as any).scrollIntoViewIfNeeded({
          // block: 'center'
        });
      }
    };

    clickExpandIcon = function (e: Event) {
      let parent = ((e.target || e.currentTarget) as HTMLElement)
        .parentNode as HTMLElement;
      let data = JSON.parse(parent.getAttribute('data-item')!);
      let leaves = parent.parentNode!.querySelector(
        '.tree-child-leaves',
      ) as HTMLElement;
      if (leaves) {
        if (leaves.classList.contains('hidden')) {
          self.expand(parent, leaves);
        } else {
          self.collapse(parent, leaves);
        }
      } else {
        emit(self, 'select', {
          data: data,
        });
      }
    };

    forEach(
      clonedContainer.querySelectorAll('.tree-icon'),
      function (node: HTMLElement) {
        node.onclick = click;
      },
    );

    forEach(
      clonedContainer.querySelectorAll('.tree-leaf-text'),
      function (node: HTMLElement) {
        node.onclick = click;
      },
    );

    if (!self.options.disableUpdateName) {
      forEach(
        clonedContainer.querySelectorAll('.edit-button'),
        function (button: HTMLElement) {
          button.onclick = function (e: Event) {
            e.stopPropagation(); // Prevent the tree node selection
            // Find the parent tree-leaf-text element
            let textElement = button.parentNode as HTMLElement;
            dblclick({ target: textElement } as unknown as Event);
          };
        },
      );
    }

    forEach(
      clonedContainer.querySelectorAll('.tree-expando'),
      function (node: HTMLElement) {
        node.onclick = clickExpandIcon;
      },
    );
  }
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

    let self = this;
    setTimeout(function () {
      emit(self, 'init', {});
    });
  }

  /**
   * Expands a leaflet by the expando or the leaf text
   * @param {DOMElement} node The parent node that contains the leaves
   * @param {DOMElement} leaves The leaves wrapper element
   */
  expand(node: HTMLElement, leaves: HTMLElement, skipEmit?: boolean) {
    let expando = node.querySelector('.tree-expando') as HTMLElement;
    expando.textContent = '-';
    let icon = node.querySelector('.tree-icon') as HTMLElement;
    icon.textContent = 'folder_open';
    leaves.classList.remove('hidden');
    if (skipEmit) {
      return;
    }
    let data = JSON.parse(node.getAttribute('data-item')!);

    emit(this, 'expand', {
      data: data,
    });
  }

  expandAll() {
    let self = this;
    let el = self.rootElementDom.querySelector('#' + self.node) as HTMLElement;
    if (el) {
      let nodes = el.querySelectorAll('.tree-expando');
      forEach(nodes, function (node: HTMLElement) {
        let parent = node.parentNode as HTMLElement;
        let leaves = parent.parentNode!.querySelector(
          '.tree-child-leaves',
        ) as HTMLElement;
        if (parent && leaves && parent.hasAttribute('data-item')) {
          self.expand(parent, leaves, true);
        }
      });
      emit(this, 'expandAll', {});
    }
  }

  selectNextNode(id: string, keyCode: number) {
    let self = this;
    let elts: string[] = [];
    let nodeId: string | undefined;
    let domId = self.rootElementDom.querySelector('#' + id) as HTMLElement;
    if (domId) {
      Array.from(domId.getElementsByClassName('tree-leaf')).forEach(function (
        element: Element,
      ) {
        if ((element as HTMLElement).offsetParent !== null) {
          elts.push(element.id);
        }
      });
      let currentDomIndex = elts.indexOf(
        'tree-leaf-' + self.getSelectedNodeId(),
      );
      if (keyCode === 40) {
        // DOWN
        nodeId = elts[currentDomIndex + 1];
      } else if (keyCode === 38) {
        // UP
        nodeId = elts[currentDomIndex - 1];
      }
      if (nodeId) {
        nodeId = nodeId.substring(nodeId.lastIndexOf('-') + 1);
        self.selectNode(nodeId, true);
      }
    }
  }

  scrollToNode(nodeId: string | number) {
    let self = this;
    let el = self.rootElementDom.querySelector(
      '#tree-leaf-' + nodeId,
    ) as HTMLElement;
    if (el) {
      scrollIntoView(el.parentNode as HTMLElement);
    }
  }

  selectNode(nodeId: string | number, propagateEvent = true) {
    let self = this;

    // Avoid redundant selection if the same node is already selected
    if (self.currentSelectedNodeId === nodeId) {
      return;
    }

    let el = self.rootElementDom.querySelector('#' + self.node) as HTMLElement;
    if (el) {
      let nodes = el.querySelectorAll('.tree-leaf-text');
      if (nodes) {
        let currentNode: HTMLElement | undefined;
        forEach(nodes, function (node: HTMLElement) {
          if (node.id === nodeId.toString()) {
            currentNode = node;
          }
        });
        self.currentSelectedNodeId = nodeId;

        if (currentNode && propagateEvent) {
          // Click the node to select it and propagate event
          currentNode.click();
        } else {
          // Select node without click propagation
          forEach(nodes, function (node: HTMLElement) {
            let parent = node.parentNode as HTMLElement;
            parent.classList.remove('tree-selected');
          });
          if (currentNode?.parentNode) {
            (currentNode.parentNode as HTMLElement).classList.add(
              'tree-selected',
            );

            (currentNode.parentNode as any).scrollIntoViewIfNeeded({
              // block: 'center'
            });
          }
        }
      }
    }
  }

  unselectNodes() {
    let self = this;

    setTimeout(function () {
      // When we make multiple nodes,
      // we must override simple select node selection with a timeout
      let el = self.rootElementDom.querySelector(
        '#' + self.node,
      ) as HTMLElement;
      if (el) {
        let nodes = el.querySelectorAll('.tree-leaf-text');
        if (nodes) {
          forEach(nodes, function (node: HTMLElement) {
            let parent = node.parentNode as HTMLElement;
            parent.classList.remove('tree-selected');
          });
        }
      }
    });
  }

  selectNodes(nodesToSelect: any[]) {
    let self = this;

    setTimeout(function () {
      // When we make multiple nodes,
      // we must override simple select node selection with a timeout
      let el = self.rootElementDom.querySelector(
        '#' + self.node,
      ) as HTMLElement;
      if (el && nodesToSelect) {
        let nodes = el.querySelectorAll('.tree-leaf-text');
        if (nodes) {
          forEach(nodes, function (node: HTMLElement) {
            let parent = node.parentNode as HTMLElement;
            parent.classList.remove('tree-selected');
          });

          for (let i = 0; i < nodesToSelect.length; i++) {
            let currentNodeToSelect = nodesToSelect[i];

            let currentNode: HTMLElement | undefined;
            forEach(nodes, function (node: HTMLElement) {
              if (
                node.id === currentNodeToSelect.nodeId &&
                currentNodeToSelect.nodeId.toString()
              ) {
                currentNode = node;
              }
            });
            self.currentSelectedNodeId = currentNodeToSelect.nodeId;

            // Select node without click propagation
            if (currentNode && currentNode.parentNode) {
              (currentNode.parentNode as HTMLElement).classList.add(
                'tree-selected',
              );
              if (currentNodeToSelect.isTrusted) {
                (currentNode.parentNode as any).scrollIntoViewIfNeeded({
                  block: 'center',
                });
              }
            }
          }
        }
      }
    });
  }

  getSelectedNodeId() {
    let self = this;
    return self.currentSelectedNodeId;
  }

  getSelectedNodeName() {
    let self = this;
    return self.currentSelectedNodeId;
  }

  toggleNode(nodeId: string | number, state: string, propagateEvent = true) {
    let self = this;
    let el = self.rootElementDom.querySelector('#' + self.node) as HTMLElement;
    if (el) {
      let nodes = el.querySelectorAll('.tree-expando');
      if (nodes) {
        let currentNode: HTMLElement | undefined;
        forEach(nodes, function (node: HTMLElement) {
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
    }
  }

  /**
   * Collapses a leaflet by the expando or the leaf text
   * @param {DOMElement} node The parent node that contains the leaves
   * @param {DOMElement} leaves The leaves wrapper element
   */
  collapse(node: HTMLElement, leaves: HTMLElement, skipEmit?: boolean) {
    let expando = node.querySelector('.tree-expando') as HTMLElement;
    expando.textContent = '+';
    let icon = node.querySelector('.tree-icon') as HTMLElement;
    icon.textContent = 'folder';
    leaves.classList.add('hidden');
    if (skipEmit) {
      return;
    }
    let data = JSON.parse(node.getAttribute('data-item')!);

    emit(this, 'collapse', {
      data: data,
    });
  }

  /**
   */
  collapseAll() {
    let self = this;
    let nodes = self.rootElementDom
      .querySelector('#' + self.node)!
      .querySelectorAll('.tree-expando');
    forEach(nodes, function (node: HTMLElement) {
      let parent = node.parentNode as HTMLElement;
      let leaves = parent.parentNode!.querySelector(
        '.tree-child-leaves',
      ) as HTMLElement;
      if (parent && leaves && parent.hasAttribute('data-item')) {
        self.collapse(parent, leaves, true);
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
      this.handlers[name].push({
        callback: callback,
        context: scope,
      });
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
    let index: number,
      found = false;
    if (this.handlers[name] instanceof Array) {
      this.handlers[name].forEach(function (handle: EventHandler, i: number) {
        index = i;
        if (handle.callback === callback && !found) {
          found = true;
        }
      });
      if (found) {
        this.handlers[name].splice(index!, 1);
      }
    }
  }
}
