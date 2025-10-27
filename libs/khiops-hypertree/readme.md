# Khiops Hypertree

A customized fork of [d3-hypertree](https://glouwa.github.io/d3-hypertree/) specifically adapted for the Khiops visualization component. This library provides hyperbolic tree visualization capabilities optimized for hierarchical data representation in machine learning analysis.

## 🔍 Overview

This library is an integral part of the [Khiops Visualization](https://github.com/KhiopsML/khiops-visualization) ecosystem, providing interactive hyperbolic tree visualizations for complex hierarchical datasets. It extends the original d3-hypertree with Khiops-specific features and optimizations.

## 📦 Installation

```bash
# Install dependencies
yarn install
```

## 🛠️ Development

### Build

```bash
# Build the library
yarn build
```

### Development Mode

```bash
# Start development server
yarn start
```

For live reload integration with the main visualization component:

```bash
# In the root visualization-component directory
yarn start
```

## 🔗 Resources

- [Original d3-hypertree API Reference](https://github.com/glouwa/d3-hypertree/blob/master/docs/readme.md)
- [Tree of Life Demo](https://hyperbolic-tree-of-life.github.io/)
- [Interactive API Demo](https://glouwa.github.io/d3-hypertree-examples/examples-html/mouse-events/)

## 💻 Usage

### Basic Integration

The hypertree component can be integrated into Angular applications with the following configuration:

```typescript
import * as hyt from 'khiops-hypertree';

export class YourComponent {
  private ht: hyt.Hypertree;
  private options: any;

  ngOnInit() {
    this.initializeHypertree();
  }

  private initializeHypertree() {
    this.options = {
      // Data loading callback
      dataloader: (d: any, callback: any) => {
        // Your data loading logic here
        callback(d);
      },

      // Node labeling initialization
      langInitBFS: (_ht: any, n: N) => (n.precalc.label = n.data.id),

      // Filtering options
      filter: {
        cullingRadius: 1,
        rangeCullingWeight: {
          min: 0,
          max: 0,
        },
        maxlabels: 100000,
      },

      // Geometry configuration
      geometry: {
        nodeRadius: (n: N) => {
          // Your node radius calculation
          return 0.01;
        },
        nodeScale: (n: N) => {
          // Your node scaling logic
          return 1;
        },
        nodeFilter: (n: N) => {
          // Your node filtering logic
          return true;
        },
        captionHeight: 0.04, // Node text overlay background height

        layerOptions: {
          'link-arcs': {
            strokeWidth: (n: N) => {
              // Your link stroke width calculation
              return 0.002;
            },
          },
          λ: {
            invisible: true, // Hide home location circle
            hideOnDrag: true,
          },
          labels: {
            hideOnDrag: false,
            background: (_n: N) => false,
            isVisible: (n: N) => {
              // Your label visibility logic
              return true;
            },
          },
          'labels-force': {
            invisible: true,
          },
          nodes: {
            opacity: (n: N) => {
              // Your node opacity calculation
              return 1;
            },
            fill: (n: N) => {
              // Your node color logic
              return '#ffffff';
            },
            hideOnDrag: false,
            strokeWidth: (n: N) => {
              // Your node stroke width
              return 0.001;
            },
            stroke: (n: N) => {
              // Your node stroke color
              return '#000000';
            },
          },
        },
      },

      // Interaction settings
      interaction: {
        mouseRadius: 5,
        onNodeClick: (n: N) => {
          // Your node click handler
          console.log('Node clicked:', n);
        },
      },
    };

    // Initialize the hypertree
    this.ht = new hyt.Hypertree(
      {
        parent: this.hyperTree?.nativeElement.querySelector('#hyperTree'),
      },
      this.options,
    );

    // Handle initialization completion
    this.ht?.initPromise.then(() => {
      console.log('Hypertree initialized');
      this.ht?.api.updateNodesVisualization();
    });
  }
}
```

### Configuration Options

The hypertree accepts various configuration options:

- **dataloader**: Function to load and process hierarchical data
- **filter**: Controls which nodes are visible and rendered
- **geometry**: Defines visual appearance (size, color, stroke, etc.)
- **interaction**: Handles user interactions (clicks, hover, etc.)

### API Methods

After initialization, you can interact with the hypertree using:

```typescript
// Update visualization
this.ht.api.updateNodesVisualization();

// Navigate to a specific node
this.ht.api.goto({ re: x, im: y });

// Access the current state
const currentNode = this.ht.args.dataloader.data;
```

## 🏗️ Architecture

This library follows a modular architecture with several key components:

- **Hypertree**: Main visualization component
- **Layers**: Rendering layers for different visual elements (nodes, links, labels)
- **Models**: Data models and mathematical transformations
- **Interactions**: User interaction handling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Based on [d3-hypertree](https://github.com/glouwa/d3-hypertree) by Michael Glatzhofer.

## 🔗 Related Projects

- [Khiops Visualization](https://github.com/KhiopsML/khiops-visualization) - Main visualization component
- [Khiops](https://khiops.org/) - AutoML suite for data preparation and modeling
