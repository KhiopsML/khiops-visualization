(function (define) {
  'use strict';

  (function (root, factory) {
    if (typeof define === 'function' && define.amd) {
      define(factory);
    } else if (typeof exports === 'object') {
      module.exports = factory();
    } else {
      root.TreeView = factory();
    }
  })(window, function () {
    return (function () {
      /** List of events supported by the tree view */
      let events = [
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

      function scrollIntoView(node, center = true) {
        if (!node.scrollIntoViewIfNeeded) {
          const options = {
            behavior: 'smooth',
            block: center ? 'center' : 'start',
          };
          node.scrollIntoView(options);
        } else {
          node.scrollIntoViewIfNeeded(center);
        }
      }

      /**
       * A forEach that will work with a NodeList and generic Arrays
       * @param {array|NodeList} arr The array to iterate over
       * @param {function} callback Function that executes for each element. First parameter is element, second is index
       * @param {object} The context to execute callback with
       */
      function forEach(arr, callback, scope) {
        if (arr) {
          let i,
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
      function emit(instance, name) {
        let args = [].slice.call(arguments, 2);
        if (events.indexOf(name) > -1) {
          if (
            instance.handlers[name] &&
            instance.handlers[name] instanceof Array
          ) {
            forEach(instance.handlers[name], function (handle) {
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
      function render(self) {
        let container = self.rootElementDom.querySelector('#' + self.node);

        let clonedContainer;
        if (container) {
          clonedContainer = container.cloneNode(true);
          container.parentNode.replaceChild(clonedContainer, container);
          let leaves = [],
            clickExpandIcon,
            dblclick,
            removeAllEditInputs,
            click;

          let renderLeaf = function (item) {
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
            .map(function (leaf) {
              return leaf.outerHTML;
            })
            .join('');

          dblclick = function (e) {
            let node = e.target || e.currentTarget;
            let parent = node.parentNode;

            // Hide the text element and its edit button
            node.style.display = 'none';

            let inputForm = document.createElement('div');
            inputForm.setAttribute('class', 'tree-leaf-text-input');

            let input = document.createElement('input');
            // Get text content without the edit button
            let textContent = node.childNodes[0]
              ? node.childNodes[0].textContent
              : node.textContent;
            if (node.querySelector('.edit-button')) {
              textContent = Array.from(node.childNodes)
                .filter((child) => child.nodeType === Node.TEXT_NODE)
                .map((child) => child.textContent)
                .join('');
            }
            input.setAttribute('placeholder', textContent);

            let iconAccept = document.createElement('button');
            iconAccept.setAttribute('class', 'valid-rename edit-icons');
            iconAccept.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>`; // Modern check SVG
            iconAccept.onclick = function (e) {
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
                let data = JSON.parse(parent.getAttribute('data-item'));
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

            input.addEventListener('keyup', function (event) {
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
              function (node) {
                node.style.display = 'flex';
              },
            );
            forEach(
              clonedContainer.querySelectorAll('.tree-leaf-text-input'),
              function (node) {
                node.remove();
              },
            );
          };

          click = function (e) {
            let currentNode = e.target || e.currentTarget;

            // Don't trigger selection if clicking on edit button
            if (currentNode.classList.contains('edit-button')) {
              return;
            }

            let parent = currentNode.parentNode;
            removeAllEditInputs();

            let data = JSON.parse(parent.getAttribute('data-item'));
            emit(self, 'select', {
              data: data,
            });

            forEach(
              clonedContainer.querySelectorAll('.tree-leaf-text'),
              function (node) {
                let parent = node.parentNode;
                parent.classList.remove('tree-selected');
              },
            );
            parent.classList.add('tree-selected');

            if (!e.isTrusted) {
              parent.scrollIntoViewIfNeeded({
                // block: 'center'
              });
            }
          };

          clickExpandIcon = function (e) {
            let parent = (e.target || e.currentTarget).parentNode;
            let data = JSON.parse(parent.getAttribute('data-item'));
            let leaves = parent.parentNode.querySelector('.tree-child-leaves');
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
            function (node) {
              node.onclick = click;
            },
          );

          forEach(
            clonedContainer.querySelectorAll('.tree-leaf-text'),
            function (node) {
              node.onclick = click;
            },
          );

          if (!self.options.disableUpdateName) {
            forEach(
              clonedContainer.querySelectorAll('.edit-button'),
              function (button) {
                button.onclick = function (e) {
                  e.stopPropagation(); // Prevent the tree node selection
                  // Find the parent tree-leaf-text element
                  let textElement = button.parentNode;
                  dblclick({ target: textElement });
                };
              },
            );
          }

          forEach(
            clonedContainer.querySelectorAll('.tree-expando'),
            function (node) {
              node.onclick = clickExpandIcon;
            },
          );
        }
      }

      /**
       * @constructor
       * @property {object} handlers The attached event handlers
       * @property {object} data The JSON object that represents the tree structure
       * @property {DOMElement} node The DOM element to render the tree in
       */
      function TreeView(data, rootElementDom, node, options) {
        this.handlers = {};
        this.rootElementDom = rootElementDom;
        this.node = node;
        this.data = data;
        this.options = options;

        if (!this.options) {
          this.options = {
            disableCollapse: false,
            disableUpdateName: false,
          };
        }

        this.hideExpando = false;

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
      TreeView.prototype.expand = function (node, leaves, skipEmit) {
        let expando = node.querySelector('.tree-expando');
        expando.textContent = '-';
        let icon = node.querySelector('.tree-icon');
        icon.textContent = 'folder_open';
        leaves.classList.remove('hidden');
        if (skipEmit) {
          return;
        }
        let data = JSON.parse(node.getAttribute('data-item'));

        emit(this, 'expand', {
          data: data,
        });
      };

      TreeView.prototype.expandAll = function () {
        let self = this;
        let el = self.rootElementDom.querySelector('#' + self.node);
        if (el) {
          let nodes = el.querySelectorAll('.tree-expando');
          forEach(nodes, function (node) {
            let parent = node.parentNode;
            let leaves = parent.parentNode.querySelector('.tree-child-leaves');
            if (parent && leaves && parent.hasAttribute('data-item')) {
              self.expand(parent, leaves, true);
            }
          });
          emit(this, 'expandAll', {});
        }
      };

      TreeView.prototype.selectNextNode = function (id, keyCode) {
        let self = this;
        let elts = [];
        let nodeId;
        let domId = self.rootElementDom.querySelector('#' + id);
        if (domId) {
          Array.from(domId.getElementsByClassName('tree-leaf')).forEach(
            function (element) {
              if (element.offsetParent !== null) {
                elts.push(element.id);
              }
            },
          );
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
      };

      TreeView.prototype.scrollToNode = function (nodeId) {
        let self = this;
        let el = self.rootElementDom.querySelector('#tree-leaf-' + nodeId);
        if (el) {
          scrollIntoView(el.parentNode);
        }
      };

      TreeView.prototype.selectNode = function (nodeId, propagateEvent = true) {
        let self = this;
        let el = self.rootElementDom.querySelector('#' + self.node);
        if (el) {
          let nodes = el.querySelectorAll('.tree-leaf-text');
          if (nodes) {
            let currentNode;
            forEach(nodes, function (node) {
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
              forEach(nodes, function (node) {
                let parent = node.parentNode;
                parent.classList.remove('tree-selected');
              });
              if (currentNode?.parentNode) {
                currentNode.parentNode.classList.add('tree-selected');

                currentNode.parentNode.scrollIntoViewIfNeeded({
                  // block: 'center'
                });
              }
            }
          }
        }
      };

      TreeView.prototype.unselectNodes = function () {
        let self = this;

        setTimeout(function () {
          // When we make multiple nodes,
          // we must override simple select node selection with a timeout
          let el = self.rootElementDom.querySelector('#' + self.node);
          if (el) {
            let nodes = el.querySelectorAll('.tree-leaf-text');
            if (nodes) {
              forEach(nodes, function (node) {
                let parent = node.parentNode;
                parent.classList.remove('tree-selected');
              });
            }
          }
        });
      };

      TreeView.prototype.selectNodes = function (nodesToSelect) {
        let self = this;

        setTimeout(function () {
          // When we make multiple nodes,
          // we must override simple select node selection with a timeout
          let el = self.rootElementDom.querySelector('#' + self.node);
          if (el && nodesToSelect) {
            let nodes = el.querySelectorAll('.tree-leaf-text');
            if (nodes) {
              forEach(nodes, function (node) {
                let parent = node.parentNode;
                parent.classList.remove('tree-selected');
              });

              for (let i = 0; i < nodesToSelect.length; i++) {
                let currentNodeToSelect = nodesToSelect[i];

                let currentNode;
                forEach(nodes, function (node) {
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
                  currentNode.parentNode.classList.add('tree-selected');
                  if (currentNodeToSelect.isTrusted) {
                    currentNode.parentNode.scrollIntoViewIfNeeded({
                      block: 'center',
                    });
                  }
                }
              }
            }
          }
        });
      };

      TreeView.prototype.getSelectedNodeId = function () {
        let self = this;
        return self.currentSelectedNodeId;
      };

      TreeView.prototype.getSelectedNodeName = function () {
        let self = this;
        return self.currentSelectedNodeId;
      };

      TreeView.prototype.toggleNode = function (
        nodeId,
        state,
        propagateEvent = true,
      ) {
        let self = this;
        let el = self.rootElementDom.querySelector('#' + self.node);
        if (el) {
          let nodes = el.querySelectorAll('.tree-expando');
          if (nodes) {
            let currentNode;
            forEach(nodes, function (node) {
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
      };

      /**
       * Collapses a leaflet by the expando or the leaf text
       * @param {DOMElement} node The parent node that contains the leaves
       * @param {DOMElement} leaves The leaves wrapper element
       */
      TreeView.prototype.collapse = function (node, leaves, skipEmit) {
        let expando = node.querySelector('.tree-expando');
        expando.textContent = '+';
        let icon = node.querySelector('.tree-icon');
        icon.textContent = 'folder';
        leaves.classList.add('hidden');
        if (skipEmit) {
          return;
        }
        let data = JSON.parse(node.getAttribute('data-item'));

        emit(this, 'collapse', {
          data: data,
        });
      };

      /**
       */
      TreeView.prototype.collapseAll = function () {
        let self = this;
        let nodes = self.rootElementDom
          .querySelector('#' + self.node)
          .querySelectorAll('.tree-expando');
        forEach(nodes, function (node) {
          let parent = node.parentNode;
          let leaves = parent.parentNode.querySelector('.tree-child-leaves');
          if (parent && leaves && parent.hasAttribute('data-item')) {
            self.collapse(parent, leaves, true);
          }
        });
        emit(this, 'collapseAll', {});
      };

      /**
       * Attach an event handler to the tree view
       * @param {string} name Name of the event to attach
       * @param {function} callback The callback to execute on the event
       * @param {object} scope The context to call the callback with
       */
      TreeView.prototype.on = function (name, callback, scope) {
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
      };

      /**
       * Deattach an event handler from the tree view
       * @param {string} name Name of the event to deattach
       * @param {function} callback The function to deattach
       */
      TreeView.prototype.off = function (name, callback) {
        let index,
          found = false;
        if (this.handlers[name] instanceof Array) {
          this.handlers[name].forEach(function (handle, i) {
            index = i;
            if (handle.callback === callback && !found) {
              found = true;
            }
          });
          if (found) {
            this.handlers[name].splice(index, 1);
          }
        }
      };

      return TreeView;
    })();
  });
})(window.define);
