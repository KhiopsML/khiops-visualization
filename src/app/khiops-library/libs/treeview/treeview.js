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
	}(window, function () {
		return (function () {

			/** List of events supported by the tree view */
			var events = [
				'expand',
				'init',
				'updateNodeName',
				'expandAll',
				'expandAllNodeChildren',
				'collapse',
				'collapseAll',
				'selectNode',
				'selectNextNode',
				'selectNodes',
				'select',
				'error'
			];

			/**
			 * A utilite function to check to see if something is a DOM object
			 * @param {object} Object to test
			 * @returns {boolean} If the object is a DOM object
			 */
			function isDOMElement(obj) {
				try {
					return obj instanceof HTMLElement;
				} catch (e) {
					// Some browsers don't support using the HTMLElement so some extra
					// checks are needed.
					return typeof obj === 'object' && obj.nodeType === 1 && typeof obj.style === 'object' && typeof obj.ownerDocument === 'object';
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
					var i, len = arr.length;
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
				var args = [].slice.call(arguments, 2);
				if (events.indexOf(name) > -1) {
					if (instance.handlers[name] && instance.handlers[name] instanceof Array) {
						forEach(instance.handlers[name], function (handle) {
							// window.setTimeout(function () {
							handle.callback.apply(handle.context, args);
							// });
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
				var container = isDOMElement(self.node) ? self.node : document.getElementById(self.node);
				var clonedContainer;
				if (container) {
					clonedContainer = container.cloneNode(true);
					container.parentNode.replaceChild(clonedContainer, container);
					var leaves = [],
						clickExpandIcon,
						dblclick,
						removeAllEditInputs,
						click;

					var renderLeaf = function (item) {

						var leaf = document.createElement('div');
						var content = document.createElement('div');
						var icon = document.createElement('mat-icon');

						var text = document.createElement('div');
						var expando = document.createElement('div');

						leaf.setAttribute('class', 'tree-leaf');
						leaf.setAttribute('id', 'tree-leaf-' + item.id);
						content.setAttribute('class', 'tree-leaf-content');
						icon.setAttribute('class', 'tree-icon mat-icon material-icons');

						var leafDatas = {
							name: item.name,
							isLeaf: item.isLeaf,
							id: item.id
						};
						content.setAttribute('data-item', JSON.stringify(leafDatas));
						// content.setAttribute('data-item', JSON.stringify(item));

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

						if (!self.options.disableCollapse) {
							expando.setAttribute('class', 'tree-expando ' + (item.isCollapsed ? '' : 'expanded'));
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
							var children = document.createElement('div');
							children.setAttribute('class', 'tree-child-leaves');
							for (var i = 0; i < item.children.length; i++) {
								var childLeaf = renderLeaf(item.children[i]);
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

					for (var i = 0; i < self.data.length; i++) {
						leaves.push(renderLeaf.call(self, self.data[i]));
					}
					clonedContainer.innerHTML = leaves.map(function (leaf) {
						return leaf.outerHTML;
					}).join('');

					dblclick = function (e) {

						var parent = (e.target || e.currentTarget).parentNode;

						var node = e.target;
						node.style.display = 'none';

						var inputForm = document.createElement('div');
						inputForm.setAttribute('class', 'tree-leaf-text-input');

						var input = document.createElement('input');
						input.setAttribute('placeholder', node.innerHTML);

						var iconAccept = document.createElement('mat-icon');
						iconAccept.setAttribute('class', 'edit-icons mat-icon material-icons');

						iconAccept.textContent = 'check_circle_outline';
						iconAccept.onclick = function (e) {

							var newName = input.value;
							newName = newName.replace(/\./g, ''); // dots are replaced by "-" in css
							newName = newName.replace(/\ /g, ''); // spaces are replaced by "-" in css
							newName = newName.replace(/[^\w\s]/gi, '-'); // replace all special chars

							if (newName !== '') {
								// change current node name
								node.innerHTML = newName;
								node.innerText = newName;

								// change data-item object
								var data = JSON.parse(parent.getAttribute('data-item'));
								data.shortDescription = newName;
								parent.setAttribute('data-item', JSON.stringify(data));

								// emit event
								emit(self, 'updateNodeName', {
									target: node.innerText,
									isLeaf: data.isLeaf,
									name: data.name,
									newName: newName
								});

								// remove input
								removeAllEditInputs();
							} else {
								emit(self, 'error', {
									target: e,
									data: 'SNACKS.NAME_CAN_NOT_BE_EMPTY'
								});
							}
						};

						input.addEventListener("keyup", function (event) {
							// Number 13 is the "Enter" key on the keyboard
							if (event.keyCode === 13) {
								event.preventDefault();
								// Trigger the button element with a click
								iconAccept.click();
							}
						});

						var iconCancel = document.createElement('mat-icon');
						iconCancel.setAttribute('class', 'edit-icons mat-icon material-icons');
						iconCancel.textContent = 'cancel';
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
						forEach(clonedContainer.querySelectorAll('.tree-leaf-text'), function (node) {
							node.style.display = 'block';
						});
						forEach(clonedContainer.querySelectorAll('.tree-leaf-text-input'), function (node) {
							node.remove();
						});
					};

					click = function (e) {

						var currentNode = e.target || e.currentTarget;
						var parent = currentNode.parentNode;
						removeAllEditInputs();

						// if (e.isTrusted) {
						// Emit if it is a user click
						// Do not if it is a callback
						var data = JSON.parse(parent.getAttribute('data-item'));
						emit(self, 'select', {
							target: e,
							data: data
						});
						// }

						forEach(clonedContainer.querySelectorAll('.tree-leaf-text'), function (node) {
							var parent = node.parentNode;
							parent.classList.remove("selected");
						});
						parent.classList.add("selected");

						if (!e.isTrusted) {
							parent.scrollIntoViewIfNeeded({
								// block: 'center'
							});
						}

					};

					clickExpandIcon = function (e) {
						var parent = (e.target || e.currentTarget).parentNode;
						var data = JSON.parse(parent.getAttribute('data-item'));
						var leaves = parent.parentNode.querySelector('.tree-child-leaves');
						if (leaves) {
							if (leaves.classList.contains('hidden')) {
								self.expand(parent, leaves);
							} else {
								self.collapse(parent, leaves);
							}
						} else {
							emit(self, 'select', {
								target: e,
								data: data
							});
						}
					};

					forEach(clonedContainer.querySelectorAll('.tree-icon'), function (node) {
						node.onclick = click;
					});

					forEach(clonedContainer.querySelectorAll('.tree-leaf-text'), function (node) {
						node.onclick = click;
					});

					if (!self.options.disableUpdateName) {
						forEach(clonedContainer.querySelectorAll('.tree-leaf-text'), function (node) {
							node.ondblclick = dblclick;
						});
					}

					forEach(clonedContainer.querySelectorAll('.tree-expando'), function (node) {
						node.onclick = clickExpandIcon;
					});
				}

			}

			/**
			 * @constructor
			 * @property {object} handlers The attached event handlers
			 * @property {object} data The JSON object that represents the tree structure
			 * @property {DOMElement} node The DOM element to render the tree in
			 */
			function TreeView(data, node, options) {
				this.handlers = {};
				this.node = node;
				this.data = data;
				this.options = options;

				if (!this.options) {
					this.options = {
						disableCollapse: false,
						disableUpdateName: false
					};
				}

				this.hideExpando = false;
				// if (this.data[0].nbClusters > 200) {
				// 	this.hideExpando = true;
				// }

				render(this);

				var self = this;
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
				var self = this;
				var expando = node.querySelector('.tree-expando');
				expando.textContent = '-';
				var icon = node.querySelector('.tree-icon');
				// icon.setAttribute('class', 'tree-icon mat-icon material-icons expanded');
				icon.textContent = 'folder_open';
				leaves.classList.remove('hidden');
				if (skipEmit) {
					return;
				}
				var data = JSON.parse(node.getAttribute('data-item'));

				emit(this, 'expand', {
					target: node,
					leaves: leaves,
					data: data
				});

				// if (node.children && node.children.length > 0) {
				// 	for (var i = 0; i < node.children.length; i++) {

				// 		var childParent = node.children[i];
				// 		var childLeaves = parent.parentNode.querySelector('.tree-child-leaves');

				// 		self.expand(childParent, childLeaves, false);
				// 	}
				// }
			};

			TreeView.prototype.expandAllNodeChildren = function (nodeId) {
				var self = this;
				var el = document.getElementById('tree-leaf-' + nodeId);
				if (el) {
					var nodes = el.querySelectorAll('.tree-expando');
					forEach(nodes, function (node) {
						var parent = node.parentNode;
						var leaves = parent.parentNode.querySelector('.tree-child-leaves');
						if (parent && leaves && parent.hasAttribute('data-item')) {
							self.expand(parent, leaves, true);
						}
					});
					emit(this, 'expandAllNodeChildren', {});
				}
			};

			TreeView.prototype.expandAll = function () {
				var self = this;
				var el = document.getElementById(self.node);
				if (el) {
					var nodes = el.querySelectorAll('.tree-expando');
					forEach(nodes, function (node) {
						var parent = node.parentNode;
						var leaves = parent.parentNode.querySelector('.tree-child-leaves');
						if (parent && leaves && parent.hasAttribute('data-item')) {
							self.expand(parent, leaves, true);
						}
					});
					emit(this, 'expandAll', {});
				}
			};

			TreeView.prototype.selectNextNode = function (id, keyCode) {
				var self = this;
				var elts = [];
				var nodeId;
				var domId = document.getElementById(id);
				if (domId) {
					Array.from(domId.getElementsByClassName('tree-leaf')).forEach(
						function (element) {
							if (element.offsetParent !== null) {
								elts.push(element.id);
							}
						}
					);
					var currentDomIndex = elts.indexOf('tree-leaf-' + self.getSelectedNodeId());
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
				var el = document.getElementById('tree-leaf-' + nodeId);
				el.parentNode.scrollIntoViewIfNeeded(nodeId);
			};

			TreeView.prototype.selectNode = function (nodeId, propagateEvent = true) {
				var self = this;
				var el = document.getElementById(self.node);
				if (el) {

					var nodes = el.querySelectorAll('.tree-leaf-text');
					if (nodes) {
						var currentNode;
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
								var parent = node.parentNode;
								parent.classList.remove("selected");
							});
							if (currentNode && currentNode.parentNode) {
								currentNode.parentNode.classList.add("selected");

								currentNode.parentNode.scrollIntoViewIfNeeded({
									// block: 'center'
								});
							}
						}
					}
				}
			};

			TreeView.prototype.selectNodes = function (nodesToSelect) {
				var self = this;

				setTimeout(function () { // When we make multiple nodes,
					// we must override simple select node selection with a timeout

					var el = document.getElementById(self.node);
					// console.log("🚀 ~ file: treeview.js ~ line 487 ~ el", el)
					if (el && nodesToSelect) {

						var nodes = el.querySelectorAll('.tree-leaf-text');
						if (nodes) {


							forEach(nodes, function (node) {
								var parent = node.parentNode;
								parent.classList.remove("selected");
							});

							for (var i = 0; i < nodesToSelect.length; i++) {

								var currentNodeToSelect = nodesToSelect[i];

								var currentNode;
								forEach(nodes, function (node) {
									if (node.id === currentNodeToSelect.nodeId && currentNodeToSelect.nodeId.toString()) {
										currentNode = node;
									}
								});
								self.currentSelectedNodeId = currentNodeToSelect.nodeId;

								// if (currentNode && propagateEvent) {
								// 	// Click the node to select it and propagate event
								// 	currentNode.click();
								// } else {
								// Select node without click propagation

								if (currentNode && currentNode.parentNode) {
									currentNode.parentNode.classList.add("selected");

									// if (scrollTree) {
									// 	currentNode.parentNode.scrollIntoViewIfNeeded({
									// 		// block: 'center'
									// 	});
									// }

									if (currentNodeToSelect.isTrusted) {
										currentNode.parentNode.scrollIntoViewIfNeeded({
											block: 'center'
										});
									}

								}
							}

						}
					}
				});

			};

			TreeView.prototype.getSelectedNodeId = function () {
				var self = this;
				return self.currentSelectedNodeId;
			};

			TreeView.prototype.getSelectedNodeName = function () {
				var self = this;
				return self.currentSelectedNodeId;
			};

			TreeView.prototype.toggleNode = function (nodeId, state, propagateEvent = true) {

				var self = this;
				var el = document.getElementById(self.node);
				if (el) {
					var nodes = el.querySelectorAll('.tree-expando');
					if (nodes) {
						var currentNode;
						forEach(nodes, function (node) {
							if (node.id === 'tree-expando-' + nodeId.toString()) {
								currentNode = node;
							}
						});
						if (currentNode && propagateEvent) {
							if ((state === 'collapse' && currentNode.textContent === '-') ||
								state === 'expand' && currentNode.textContent === '+') {
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
				// console.log("TCL: TreeView.prototype.collapse -> node, leaves", node, leaves)
				var expando = node.querySelector('.tree-expando');
				expando.textContent = '+';
				var icon = node.querySelector('.tree-icon');
				// icon.setAttribute('class', 'tree-icon mat-icon material-icons');
				icon.textContent = 'folder';
				leaves.classList.add('hidden');
				if (skipEmit) {
					return;
				}
				var data = JSON.parse(node.getAttribute('data-item'));

				emit(this, 'collapse', {
					target: node,
					leaves: leaves,
					data: data
				});
			};

			/**
			 */
			TreeView.prototype.collapseAll = function () {
				var self = this;
				var nodes = document.getElementById(self.node).querySelectorAll('.tree-expando');
				forEach(nodes, function (node) {
					var parent = node.parentNode;
					var leaves = parent.parentNode.querySelector('.tree-child-leaves');
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
						context: scope
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
				var index, found = false;
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
		}());
	}));
}(window.define));
