# Khiops TreeView

A customized pure JavaScript tree view component specifically adapted for the Khiops visualization ecosystem. This library provides interactive hierarchical tree navigation with Material Design icons and modern styling.

## 🔍 Overview

This lightweight tree view component is an integral part of the [Khiops Visualization](https://github.com/KhiopsML/khiops-visualization) ecosystem, providing intuitive navigation for hierarchical data structures in machine learning analysis. Built with vanilla JavaScript and no external dependencies, it offers excellent performance and easy integration.

## ✨ Features

- **Pure JavaScript**: No external dependencies, lightweight and fast
- **Material Design Icons**: Integrated Material Icons for folders and files
- **Interactive Navigation**: Click to select, expand/collapse nodes
- **Keyboard Navigation**: Arrow key support for accessibility
- **Inline Editing**: Rename nodes directly in the tree (optional)
- **Event System**: Comprehensive event handling for custom integrations
- **Customizable Styling**: SCSS-based styling with CSS custom properties
- **Multi-selection Support**: Select multiple nodes simultaneously
- **Smooth Scrolling**: Auto-scroll to selected nodes

## 💻 Usage

### Basic Integration

```html
<!-- Include the CSS -->
<link rel="stylesheet" href="treeview.css" />

<!-- Tree container -->
<div id="myTreeContainer"></div>

<!-- Include the JavaScript -->
<script src="treeview.js"></script>
```

### JavaScript Implementation

```javascript
// Sample tree data structure
const treeData = [
  {
    id: 'root1',
    name: 'Root Folder',
    shortDescription: 'Main Directory',
    isLeaf: false,
    isCollapsed: true,
    color: '#1976d2',
    children: [
      {
        id: 'child1',
        name: 'Subfolder',
        shortDescription: 'Documents',
        isLeaf: false,
        isCollapsed: true,
        children: [
          {
            id: 'leaf1',
            name: 'Document',
            shortDescription: 'report.pdf',
            isLeaf: true,
            color: '#4caf50',
          },
        ],
      },
      {
        id: 'leaf2',
        name: 'File',
        shortDescription: 'data.json',
        isLeaf: true,
        color: '#ff9800',
      },
    ],
  },
];

// Configuration options
const options = {
  disableCollapse: false, // Enable/disable expand/collapse functionality
  disableUpdateName: false, // Enable/disable inline editing
};

// Initialize the tree view
const treeView = new TreeView(
  treeData, // Tree data
  document.body, // Root DOM element
  'myTreeContainer', // Container ID
  options, // Configuration options
);

// Event handlers
treeView.on(
  'select',
  function (event) {
    console.log('Node selected:', event.data);
  },
  this,
);

treeView.on(
  'expand',
  function (event) {
    console.log('Node expanded:', event.data);
  },
  this,
);

treeView.on(
  'collapse',
  function (event) {
    console.log('Node collapsed:', event.data);
  },
  this,
);

treeView.on(
  'updateNodeName',
  function (event) {
    console.log('Node renamed:', event.data);
  },
  this,
);
```

### Data Structure

Each tree node should follow this structure:

```javascript
{
  id: 'unique-identifier',           // Unique node identifier
  name: 'internal-name',             // Internal name for data processing
  shortDescription: 'Display Name',  // Text shown in the tree
  isLeaf: false,                     // true for files, false for folders
  isCollapsed: true,                 // Initial collapsed state (folders only)
  color: '#1976d2',                  // Optional: custom color for the node
  isTruncated: false,                // Optional: hide expand/collapse button
  isUnfoldedByDefault: false,        // Optional: special rendering mode
  children: [...]                    // Child nodes array (folders only)
}
```

## 🎯 API Reference

### Constructor

```javascript
new TreeView(data, rootElementDom, nodeId, options);
```

- **data**: Array of tree node objects
- **rootElementDom**: Parent DOM element
- **nodeId**: String ID of the container element
- **options**: Configuration object

### Methods

#### Navigation Methods

```javascript
// Select a specific node
treeView.selectNode(nodeId, propagateEvent = true)

// Select multiple nodes
treeView.selectNodes([{nodeId: 'id1', isTrusted: true}, ...])

// Unselect all nodes
treeView.unselectNodes()

// Navigate with keyboard
treeView.selectNextNode(containerId, keyCode) // 38=UP, 40=DOWN

// Scroll to a specific node
treeView.scrollToNode(nodeId)
```

#### Expand/Collapse Methods

```javascript
// Expand a specific node
treeView.expand(nodeElement, leavesElement, (skipEmit = false));

// Collapse a specific node
treeView.collapse(nodeElement, leavesElement, (skipEmit = false));

// Expand all nodes
treeView.expandAll();

// Collapse all nodes
treeView.collapseAll();

// Toggle node state
treeView.toggleNode(nodeId, 'expand' | 'collapse', (propagateEvent = true));
```

#### Information Methods

```javascript
// Get selected node ID
const selectedId = treeView.getSelectedNodeId();

// Get selected node name
const selectedName = treeView.getSelectedNodeName();
```

#### Event Methods

```javascript
// Attach event handler
treeView.on(eventName, callback, scope);

// Detach event handler
treeView.off(eventName, callback);
```

### Events

The tree view supports the following events:

- **init**: Fired when the tree is initialized
- **select**: Fired when a node is selected
- **expand**: Fired when a node is expanded
- **collapse**: Fired when a node is collapsed
- **expandAll**: Fired when all nodes are expanded
- **collapseAll**: Fired when all nodes are collapsed
- **selectNode**: Fired when a node is programmatically selected
- **selectNextNode**: Fired during keyboard navigation
- **unselectNodes**: Fired when nodes are unselected
- **selectNodes**: Fired when multiple nodes are selected
- **updateNodeName**: Fired when a node is renamed
- **error**: Fired when an error occurs (e.g., empty name during rename)

### Configuration Options

```javascript
const options = {
  disableCollapse: false, // Disable expand/collapse functionality
  disableUpdateName: false, // Disable inline editing feature
};
```

## 🎨 Styling

The component uses SCSS for styling with CSS custom properties for theming:

```scss
:root {
  --primary: #1976d2; // Primary color for file icons
  --yellowMain: #ffc107; // Folder icon color
}
```

### Key CSS Classes

- `.tree-leaf`: Individual tree node container
- `.tree-leaf-content`: Node content wrapper
- `.tree-icon`: Material icon element
- `.tree-leaf-text`: Node text/label
- `.tree-expando`: Expand/collapse button
- `.tree-child-leaves`: Child nodes container
- `.tree-selected`: Selected node styling
- `.edit-button`: Inline edit button
- `.tree-leaf-text-input`: Edit mode input container

## 🏗️ Architecture

The library follows a modular architecture:

- **Core Module**: Main TreeView constructor and initialization
- **Rendering Engine**: DOM manipulation and tree structure rendering
- **Event System**: Comprehensive event handling and propagation
- **Navigation**: Keyboard and mouse interaction management
- **Editing**: Inline node name editing functionality

## 🤝 Contributing

This library is part of the Khiops ecosystem. For contributing guidelines, please refer to the [main project's contribution guide](../../CONTRIBUTING.md).

## 📄 License

This project is licensed under the MIT License - see the main project's [LICENSE](../../LICENSE) file for details.

## 🔗 Related Projects

- [Khiops Visualization](https://github.com/KhiopsML/khiops-visualization) - Main visualization component
- [Khiops](https://khiops.org/) - AutoML suite for data preparation and modeling

---

_A pure JavaScript tree view component optimized for the Khiops machine learning visualization ecosystem._
