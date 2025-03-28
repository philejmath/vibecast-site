// Theme configuration
const THEMES = {
  'base': 'content/themes/base.yaml',
  'humorous': 'content/themes/humorous.yaml',
  'cosmic': 'content/themes/cosmic.yaml'
};

// Default theme
const DEFAULT_THEME = 'base';

// Global content storage
let siteContent = {};
let currentTheme = '';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initThemeSystem();
});

// Main initialization function
async function initThemeSystem() {
  try {
    // Load theme from URL param or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    currentTheme = urlParams.get('theme') || localStorage.getItem('selectedTheme') || DEFAULT_THEME;
    
    // Validate theme exists
    if (!THEMES[currentTheme]) {
      console.warn(`Theme '${currentTheme}' not found, falling back to default theme`);
      currentTheme = DEFAULT_THEME;
    }
    
    // Load theme content
    await loadThemeContent(currentTheme);
    
    // Apply content to page
    applyThemeContent();
    
    // Add theme selector
    addThemeSelector();
    
    console.log(`Theme system initialized with theme: ${currentTheme}`);
  } catch (error) {
    console.error('Theme system initialization failed:', error);
    // Attempt to load default theme as fallback
    if (currentTheme !== DEFAULT_THEME) {
      console.log('Attempting to load default theme as fallback...');
      currentTheme = DEFAULT_THEME;
      try {
        await loadThemeContent(DEFAULT_THEME);
        applyThemeContent();
        addThemeSelector();
      } catch (fallbackError) {
        console.error('Failed to load default theme:', fallbackError);
      }
    }
  }
}

// Load theme content from YAML file
async function loadThemeContent(theme) {
  try {
    // Check if theme exists
    if (!THEMES[theme]) {
      throw new Error(`Theme '${theme}' not found in available themes`);
    }
    
    // Always load base theme first
    const baseResponse = await fetch(THEMES['base']);
    if (!baseResponse.ok) throw new Error(`Failed to load base theme: ${baseResponse.status}`);
    
    const baseYaml = await baseResponse.text();
    // Check if jsyaml is defined
    if (typeof jsyaml === 'undefined') {
      throw new Error('jsyaml library is not loaded. Please include js-yaml in your project.');
    }
    
    const baseContent = jsyaml.load(baseYaml);
    
    // If selected theme is not base, load and merge with it
    let themeContent = baseContent;
    if (theme !== 'base') {
      const themeResponse = await fetch(THEMES[theme]);
      if (!themeResponse.ok) throw new Error(`Failed to load theme ${theme}: ${themeResponse.status}`);
      
      const themeYaml = await themeResponse.text();
      const overlayContent = jsyaml.load(themeYaml);
      
      // Merge theme with base
      themeContent = deepMerge(baseContent, overlayContent);
    }
    
    // Store content globally
    siteContent = themeContent;
    
    // Save theme selection
    localStorage.setItem('selectedTheme', theme);
    currentTheme = theme;
    
    return themeContent;
  } catch (error) {
    console.error('Error loading theme content:', error);
    throw error;
  }
}

// Apply theme content to the page
function applyThemeContent() {
  if (!siteContent) return;

  // Recursive function to update DOM based on YAML keys
  function updateDOMFromYAML(yamlContent, parentKey = '') {
    for (const key in yamlContent) {
      if (yamlContent.hasOwnProperty(key)) {
        const value = yamlContent[key];
        const currentKeyPath = parentKey ? `${parentKey}-${key}` : key;

        // If value is an object, recurse
        if (typeof value === 'object' && value !== null) {
          updateDOMFromYAML(value, currentKeyPath);
        } else {
          // Construct selector based on key path
          const selector = `.${currentKeyPath}`;
          const element = document.querySelector(selector);

          // Update element if it exists
          if (element) {
            element.textContent = value;
          }
        }
      }
    }
  }

  // Start updating DOM from the root of the YAML content
  updateDOMFromYAML(siteContent);
}

// Apply theme-specific CSS
function applyThemeStyles() {
  // Remove any existing theme styles
  const existingStyles = document.querySelector('#dynamic-theme-styles');
  if (existingStyles) {
    existingStyles.remove();
  }
  
  // If theme has custom CSS, apply it
  if (siteContent.theme?.css) {
    const styleElement = document.createElement('style');
    styleElement.id = 'dynamic-theme-styles';
    styleElement.textContent = siteContent.theme.css;
    document.head.appendChild(styleElement);
  }
  
  // Apply theme colors if available
  if (siteContent.theme?.colors) {
    const colors = siteContent.theme.colors;
    const root = document.documentElement;
    
    // Set CSS variables for colors
    if (colors.primary) root.style.setProperty('--bs-primary', colors.primary);
    if (colors.secondary) root.style.setProperty('--bs-secondary', colors.secondary);
    if (colors.background) root.style.setProperty('--bs-body-bg', colors.background);
    if (colors.text) root.style.setProperty('--bs-body-color', colors.text);
  }
}

// Add theme selector to the page
function addThemeSelector() {
  // Remove existing theme selector if present
  const existingSelector = document.querySelector('#theme-selector');
  if (existingSelector) existingSelector.remove();
  
  // Create theme selector container
  const selectorContainer = document.createElement('div');
  selectorContainer.id = 'theme-selector';
  selectorContainer.className = 'theme-selector';
  
  // Create theme options
  Object.keys(THEMES).forEach(themeName => {
    const themeOption = document.createElement('div');
    themeOption.className = `theme-option ${themeName === currentTheme ? 'active' : ''}`;
    themeOption.dataset.theme = themeName;
    themeOption.textContent = themeName.charAt(0).toUpperCase() + themeName.slice(1);
    
    themeOption.addEventListener('click', () => changeTheme(themeName));
    selectorContainer.appendChild(themeOption);
  });
  
  // Add to page
  document.body.appendChild(selectorContainer);
  
  // Add styles if not already present
  if (!document.querySelector('#theme-selector-styles')) {
    const styles = document.createElement('style');
    styles.id = 'theme-selector-styles';
    styles.textContent = `
      .theme-selector {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 10px;
        padding: 10px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .theme-option {
        padding: 8px 15px;
        color: white;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      .theme-option:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
      .theme-option.active {
        background-color: #0d6efd;
      }
    `;
    document.head.appendChild(styles);
  }
}

// Change theme
async function changeTheme(theme) {
  if (!THEMES[theme] || theme === currentTheme) return;
  
  try {
    // Show loading indicator
    showLoadingIndicator();
    
    // Load new theme content
    await loadThemeContent(theme);
    
    // Apply to page
    applyThemeContent();
    
    // Update theme selector
    const options = document.querySelectorAll('.theme-option');
    options.forEach(option => {
      option.classList.toggle('active', option.dataset.theme === theme);
    });
    
    // Update URL with theme parameter without page reload
    const url = new URL(window.location);
    url.searchParams.set('theme', theme);
    window.history.replaceState({}, '', url);
    
    console.log(`Theme changed to: ${theme}`);
  } catch (error) {
    console.error('Error changing theme:', error);
    alert(`Failed to load theme: ${theme}`);
  } finally {
    // Hide loading indicator
    hideLoadingIndicator();
  }
}

// Show loading indicator
function showLoadingIndicator() {
  // Remove existing loader if present
  hideLoadingIndicator();
  
  // Create loader element
  const loader = document.createElement('div');
  loader.id = 'theme-loader';
  loader.innerHTML = `
    <div class="spinner-border text-light" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <p>Changing theme...</p>
  `;
  
  // Style the loader
  loader.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    color: white;
  `;
  
  // Add to document
  document.body.appendChild(loader);
}

// Hide loading indicator
function hideLoadingIndicator() {
  const loader = document.querySelector('#theme-loader');
  if (loader) {
    loader.remove();
  }
}

// Helper function to deep merge objects
function deepMerge(target, source) {
  const output = Object.assign({}, target);
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else if (Array.isArray(source[key]) && Array.isArray(target[key])) {
        output[key] = source[key]; // For arrays, replace completely
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

// Helper to check if value is an object
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}
