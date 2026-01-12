// Common component configuration
const componentConfig = {
  visualization: {
    tagName: 'khiops-visualization',
    demoFile: './demo-visualization.json',
    hasConfig: true,
  },
  covisualization: {
    tagName: 'khiops-covisualization',
    demoFile: './demo-covisualization.json',
    hasConfig: false,
  },
};

let currentComponent = 'visualization';

// Initialize tabs
function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', function () {
      const component = this.getAttribute('data-component');
      if (component !== currentComponent) {
        currentComponent = component;
        updateActiveTab();
        updateUrlParams();
        recreateComponent();
      }
    });
  });
}

// Update URL parameters when component changes
function updateUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set('component', currentComponent);
  const newUrl = window.location.pathname + '?' + urlParams.toString();
  window.history.pushState({ component: currentComponent }, '', newUrl);
}

// Update active tab styling
function updateActiveTab() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach((tab) => {
    if (tab.getAttribute('data-component') === currentComponent) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

// Recreate component based on current selection
function recreateComponent() {
  const container = document.getElementById('container');
  const config = componentConfig[currentComponent];

  // Clear container
  container.innerHTML = '';

  // Create new component
  const element = document.createElement(config.tagName);
  element.id = 'kv1';
  element.style.width = '100%';
  element.style.height = '100%';
  container.appendChild(element);

  // Wait a bit for component to be ready
  setTimeout(initializeComponent, 500);
}

// Initialize component with demo data
function initializeComponent() {
  loadDemoData();
}

// Load demo data for the current component
async function loadDemoData() {
  try {
    const config = componentConfig[currentComponent];
    const response = await fetch(config.demoFile);
    const data = await response.json();

    const element = document.querySelector(config.tagName);
    if (element && typeof element.clean === 'function') {
      element.clean();
      element.setDatas(data);
      if (config.hasConfig) {
        element.setConfig({
          showOpenFileBtn: true,
        });
      }
    } else if (!element) {
      console.error(`${config.tagName} element not found`);
    } else {
      console.error(
        'element.clean is not a function - component not fully initialized',
      );
    }
  } catch (error) {
    console.error('Error loading demo data:', error);
  }
}
