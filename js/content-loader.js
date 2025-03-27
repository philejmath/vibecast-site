// Available themes
const AVAILABLE_THEMES = {
  cosmic: '/content/themes/cosmic.yaml',
  professional: '/content/themes/professional.yaml',
  futuristic: '/content/themes/futuristic.yaml',
  humorous: '/content/themes/humorous.yaml',
  minimalist: '/content/themes/minimalist.yaml'
};

// Default theme
let currentTheme = 'cosmic';

// Store approved content
let approvedContent = {};

// Store content elements for reference
let contentElements = [];

// Function to load YAML content
async function loadSiteContent(theme = null) {
  try {
    // If theme is provided, update current theme
    if (theme && AVAILABLE_THEMES[theme]) {
      currentTheme = theme;
    }
    
    // Get the theme from URL parameter if present
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('theme');
    if (themeParam && AVAILABLE_THEMES[themeParam]) {
      currentTheme = themeParam;
    }
    
    // Get the path for the current theme
    const themePath = AVAILABLE_THEMES[currentTheme] || AVAILABLE_THEMES.cosmic;
    
    // Load the theme content
    const response = await fetch(themePath);
    const yamlText = await response.text();
    
    // Parse YAML using js-yaml (loaded in the HTML)
    const content = jsyaml.load(yamlText);
    
    // Apply approved content if available
    if (approvedContent[currentTheme]) {
      mergeApprovedContent(content, approvedContent[currentTheme]);
    }
    
    // Store content in window object for global access
    window.siteContent = content;
    
    // Reset content elements array
    contentElements = [];
    
    // Apply content to the page
    applySiteContent();
    
    // Add theme selector to the page
    addThemeSelector();
    
    // Add content approval controls
    addContentApprovalControls();
    
    console.log(`Site content loaded successfully using theme: ${currentTheme}`);
  } catch (error) {
    console.error('Error loading site content:', error);
  }
}

// Function to merge approved content with theme content
function mergeApprovedContent(content, approved) {
  for (const key in approved) {
    if (typeof approved[key] === 'object' && approved[key] !== null) {
      if (!content[key]) content[key] = {};
      mergeApprovedContent(content[key], approved[key]);
    } else {
      content[key] = approved[key];
    }
  }
}

// Function to change theme
function changeTheme(theme) {
  if (AVAILABLE_THEMES[theme]) {
    // Update URL parameter
    const url = new URL(window.location);
    url.searchParams.set('theme', theme);
    window.history.pushState({}, '', url);
    
    // Reload content with new theme
    loadSiteContent(theme);
  }
}

// Function to add theme selector to the page
function addThemeSelector() {
  // Check if theme selector already exists
  if (document.getElementById('theme-selector')) {
    return;
  }
  
  // Create theme selector container
  const themeSelector = document.createElement('div');
  themeSelector.id = 'theme-selector';
  themeSelector.className = 'theme-selector';
  themeSelector.style.position = 'fixed';
  themeSelector.style.bottom = '20px';
  themeSelector.style.right = '20px';
  themeSelector.style.zIndex = '1000';
  themeSelector.style.backgroundColor = '#fff';
  themeSelector.style.padding = '10px';
  themeSelector.style.borderRadius = '5px';
  themeSelector.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  
  // Add theme selector title
  const title = document.createElement('div');
  title.textContent = 'Select Theme:';
  title.style.marginBottom = '5px';
  title.style.fontWeight = 'bold';
  themeSelector.appendChild(title);
  
  // Add theme options
  Object.keys(AVAILABLE_THEMES).forEach(theme => {
    const option = document.createElement('button');
    option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    option.className = 'btn btn-sm ' + (theme === currentTheme ? 'btn-primary' : 'btn-outline-primary');
    option.style.margin = '2px';
    option.style.textTransform = 'capitalize';
    option.onclick = () => changeTheme(theme);
    themeSelector.appendChild(option);
  });
  
  // Add to the page
  document.body.appendChild(themeSelector);
}

// Function to add content approval controls
function addContentApprovalControls() {
  // Add styles for content approval
  if (!document.getElementById('content-approval-styles')) {
    const styles = document.createElement('style');
    styles.id = 'content-approval-styles';
    styles.textContent = `
      .content-element {
        position: relative;
        transition: background-color 0.2s;
      }
      .content-element:hover {
        background-color: rgba(0, 123, 255, 0.1);
        cursor: pointer;
      }
      .content-controls {
        display: none;
        position: absolute;
        top: 0;
        right: 0;
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
      }
      .content-element:hover .content-controls {
        display: flex;
      }
      .content-controls button {
        margin: 0 2px;
        padding: 2px 5px;
        font-size: 12px;
      }
      .content-edit-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
      }
      .content-edit-panel {
        background-color: #fff;
        border-radius: 5px;
        padding: 20px;
        width: 80%;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
      }
      .content-edit-panel textarea {
        width: 100%;
        min-height: 100px;
        margin-bottom: 10px;
      }
    `;
    document.head.appendChild(styles);
  }
  
  // Add event listeners to content elements
  contentElements.forEach(element => {
    // Skip if already processed
    if (element.el.classList.contains('content-element')) {
      return;
    }
    
    // Add content-element class
    element.el.classList.add('content-element');
    
    // Create controls container
    const controls = document.createElement('div');
    controls.className = 'content-controls';
    
    // Add approve button
    const approveBtn = document.createElement('button');
    approveBtn.className = 'btn btn-sm btn-success';
    approveBtn.innerHTML = '<i class="fas fa-check"></i>';
    approveBtn.title = 'Approve Content';
    approveBtn.onclick = (e) => {
      e.stopPropagation();
      approveContent(element);
    };
    controls.appendChild(approveBtn);
    
    // Add edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm btn-primary';
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.title = 'Edit Content';
    editBtn.onclick = (e) => {
      e.stopPropagation();
      editContent(element);
    };
    controls.appendChild(editBtn);
    
    // Add regenerate button
    const regenerateBtn = document.createElement('button');
    regenerateBtn.className = 'btn btn-sm btn-warning';
    regenerateBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
    regenerateBtn.title = 'Regenerate Content';
    regenerateBtn.onclick = (e) => {
      e.stopPropagation();
      regenerateContent(element);
    };
    controls.appendChild(regenerateBtn);
    
    // Add controls to element
    element.el.appendChild(controls);
    
    // Add click handler to element
    element.el.onclick = () => editContent(element);
  });
}

// Function to approve content
function approveContent(element) {
  // Initialize theme in approved content if not exists
  if (!approvedContent[currentTheme]) {
    approvedContent[currentTheme] = {};
  }
  
  // Set the path in the approved content
  let current = approvedContent[currentTheme];
  const pathParts = element.path.split('.');
  const lastPart = pathParts.pop();
  
  pathParts.forEach(part => {
    if (!current[part]) {
      current[part] = {};
    }
    current = current[part];
  });
  
  current[lastPart] = element.value;
  
  // Visual feedback
  const originalBg = element.el.style.backgroundColor;
  element.el.style.backgroundColor = 'rgba(40, 167, 69, 0.2)';
  setTimeout(() => {
    element.el.style.backgroundColor = originalBg;
  }, 1000);
  
  console.log(`Content approved: ${element.path}`);
  console.log('Current approved content:', approvedContent);
}

// Function to edit content
function editContent(element) {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'content-edit-overlay';
  
  // Create edit panel
  const panel = document.createElement('div');
  panel.className = 'content-edit-panel';
  
  // Add title
  const title = document.createElement('h4');
  title.textContent = `Edit Content: ${element.path}`;
  panel.appendChild(title);
  
  // Add textarea
  const textarea = document.createElement('textarea');
  textarea.className = 'form-control';
  textarea.value = element.value;
  panel.appendChild(textarea);
  
  // Add buttons
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'd-flex justify-content-end';
  
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-secondary me-2';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = () => document.body.removeChild(overlay);
  buttonContainer.appendChild(cancelBtn);
  
  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn btn-primary';
  saveBtn.textContent = 'Save Changes';
  saveBtn.onclick = () => {
    // Update element value
    element.value = textarea.value;
    element.el.textContent = textarea.value;
    
    // Approve the content
    approveContent(element);
    
    // Close overlay
    document.body.removeChild(overlay);
  };
  buttonContainer.appendChild(saveBtn);
  
  panel.appendChild(buttonContainer);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}

// Function to regenerate content
function regenerateContent(element) {
  // Show loading state
  const originalText = element.el.textContent;
  element.el.textContent = 'Regenerating...';
  
  // Call the content generator API
  fetch('http://localhost:5001/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      path: element.path,
      content: element.value,
      theme: currentTheme
    }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    // Update element with improved content
    element.value = data.improved;
    element.el.textContent = data.improved;
    
    // Visual feedback
    const originalBg = element.el.style.backgroundColor;
    element.el.style.backgroundColor = 'rgba(255, 193, 7, 0.2)';
    setTimeout(() => {
      element.el.style.backgroundColor = originalBg;
    }, 1000);
    
    console.log(`Content regenerated: ${element.path}`);
  })
  .catch(error => {
    console.error('Error regenerating content:', error);
    // Fallback to mock regeneration if API fails
    const newContent = generateMockContent(element.path, originalText);
    element.value = newContent;
    element.el.textContent = newContent;
  });
}

// Function to generate mock content
function generateMockContent(path, originalText) {
  // This is a simple mock function
  // In a real implementation, this would call an AI service
  
  const prefixes = [
    "Enhanced: ",
    "Improved: ",
    "Refined: ",
    "Optimized: ",
    "Rewritten: "
  ];
  
  // Choose a random prefix
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  
  // For longer content, just add the prefix to the first few words
  if (originalText.length > 50) {
    const firstPart = originalText.substring(0, 30);
    const lastPart = originalText.substring(30);
    return prefix + firstPart + lastPart;
  }
  
  // For shorter content, add the prefix to the whole text
  return prefix + originalText;
}

// Helper function to register a content element
function registerContentElement(el, path, value) {
  contentElements.push({ el, path, value });
  return el;
}

// Function to apply content to the page
function applySiteContent() {
  // Get current page
  const path = window.location.pathname;
  const page = path.split('/').pop().replace('.html', '') || 'index';
  
  // Apply common elements
  applyCommonElements();
  
  // Apply page-specific content
  switch(page) {
    case 'index':
      applyHomeContent();
      break;
    case 'episodes':
      applyEpisodesContent();
      break;
    case 'about':
      applyAboutContent();
      break;
    default:
      console.log('Unknown page:', page);
  }
}

// Apply common elements across all pages
function applyCommonElements() {
  const content = window.siteContent;
  
  // Apply site name
  document.querySelectorAll('.navbar-brand').forEach(el => {
    const brandEl = registerContentElement(el, 'site.name', content.site.name);
    brandEl.innerHTML = `<i class="fas fa-rocket me-2"></i>${content.site.name}`;
  });
  
  // Apply navigation items
  const navItems = document.querySelectorAll('.navbar-nav .nav-link');
  navItems.forEach(item => {
    const href = item.getAttribute('href').replace('.html', '');
    if (href === 'index') {
      registerContentElement(item, 'navigation.home', content.navigation.home);
      item.textContent = content.navigation.home;
    } else if (href === 'episodes') {
      registerContentElement(item, 'navigation.episodes', content.navigation.episodes);
      item.textContent = content.navigation.episodes;
    } else if (href === 'about') {
      registerContentElement(item, 'navigation.about', content.navigation.about);
      item.textContent = content.navigation.about;
    }
  });
  
  // Apply footer content
  const footerBrand = document.querySelector('footer h5:first-child');
  if (footerBrand) {
    const brandEl = registerContentElement(footerBrand, 'site.name', content.site.name);
    brandEl.innerHTML = `<i class="fas fa-rocket me-2"></i> ${content.site.name}`;
  }
  
  const footerDesc = document.querySelector('footer p:first-of-type');
  if (footerDesc) {
    registerContentElement(footerDesc, 'site.description', content.site.description);
    footerDesc.textContent = content.site.description;
  }
  
  const footerLinks = document.querySelector('footer h5:nth-of-type(2)');
  if (footerLinks) {
    registerContentElement(footerLinks, 'footer.links.title', content.footer.links.title);
    footerLinks.textContent = content.footer.links.title;
  }
  
  const footerConnect = document.querySelector('footer h5:nth-of-type(3)');
  if (footerConnect) {
    registerContentElement(footerConnect, 'footer.connect.title', content.footer.connect.title);
    footerConnect.textContent = content.footer.connect.title;
  }
  
  const copyright = document.querySelector('footer .text-center p');
  if (copyright) {
    registerContentElement(copyright, 'site.copyright', content.site.copyright);
    copyright.textContent = content.site.copyright;
  }
}

// Apply home page content
function applyHomeContent() {
  const content = window.siteContent;
  
  // Apply callout section
  const calloutHeading = document.querySelector('.bg-image-callout .callout-heading');
  if (calloutHeading) {
    registerContentElement(calloutHeading, 'callout.home.title', content.callout.home.title);
    calloutHeading.textContent = content.callout.home.title;
  }
  
  const calloutText = document.querySelector('.bg-image-callout .callout-text');
  if (calloutText) {
    registerContentElement(calloutText, 'callout.home.text', content.callout.home.text);
    calloutText.textContent = content.callout.home.text;
  }
  
  const calloutButton = document.querySelector('.bg-image-callout .btn-callout');
  if (calloutButton) {
    const btnEl = registerContentElement(calloutButton, 'callout.home.button', content.callout.home.button);
    btnEl.innerHTML = `${content.callout.home.button} <i class="fas fa-angle-right ms-2"></i>`;
  }
  
  // Apply hero section
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle) {
    registerContentElement(heroTitle, 'home.hero.title', content.home.hero.title);
    heroTitle.textContent = content.home.hero.title;
  }
  
  const heroSubtitle = document.querySelector('.hero p.lead');
  if (heroSubtitle) {
    registerContentElement(heroSubtitle, 'home.hero.subtitle', content.home.hero.subtitle);
    heroSubtitle.textContent = content.home.hero.subtitle;
  }
  
  const heroPrimaryBtn = document.querySelector('.hero .btn-primary');
  if (heroPrimaryBtn) {
    const btnEl = registerContentElement(heroPrimaryBtn, 'home.hero.button_primary', content.home.hero.button_primary);
    btnEl.innerHTML = `${content.home.hero.button_primary} <i class="fas fa-headphones ms-2"></i>`;
  }
  
  const heroSecondaryBtn = document.querySelector('.hero .btn-outline-light');
  if (heroSecondaryBtn) {
    const btnEl = registerContentElement(heroSecondaryBtn, 'home.hero.button_secondary', content.home.hero.button_secondary);
    btnEl.innerHTML = `${content.home.hero.button_secondary} <i class="fas fa-calendar-alt ms-2"></i>`;
  }
  
  // Apply features section
  const featureBoxes = document.querySelectorAll('.feature-box');
  content.home.features.forEach((feature, index) => {
    if (featureBoxes[index]) {
      const icon = featureBoxes[index].querySelector('.feature-icon');
      const title = featureBoxes[index].querySelector('h3');
      const desc = featureBoxes[index].querySelector('p');
      
      if (icon) {
        registerContentElement(icon, `home.features.${index}.icon`, feature.icon);
        icon.className = `fas fa-${feature.icon} feature-icon mb-3`;
      }
      
      if (title) {
        registerContentElement(title, `home.features.${index}.title`, feature.title);
        title.textContent = feature.title;
      }
      
      if (desc) {
        registerContentElement(desc, `home.features.${index}.description`, feature.description);
        desc.textContent = feature.description;
      }
    }
  });
  
  // Apply episodes section
  const episodesTitle = document.querySelector('.py-5.bg-light h2');
  if (episodesTitle) {
    registerContentElement(episodesTitle, 'home.episodes_section.title', content.home.episodes_section.title);
    episodesTitle.textContent = content.home.episodes_section.title;
  }
  
  const episodesSubtitle = document.querySelector('.py-5.bg-light p.lead');
  if (episodesSubtitle) {
    registerContentElement(episodesSubtitle, 'home.episodes_section.subtitle', content.home.episodes_section.subtitle);
    episodesSubtitle.textContent = content.home.episodes_section.subtitle;
  }
  
  // Apply episode cards
  const episodeCards = document.querySelectorAll('.py-5.bg-light .card');
  content.home.episodes_section.episodes.forEach((episode, index) => {
    if (episodeCards[index]) {
      const title = episodeCards[index].querySelector('.card-title');
      const date = episodeCards[index].querySelector('.text-muted.small');
      const desc = episodeCards[index].querySelector('.card-text');
      const button = episodeCards[index].querySelector('.btn');
      
      if (title) {
        registerContentElement(title, `home.episodes_section.episodes.${index}.title`, episode.title);
        title.textContent = `Coming Soon: Episode ${episode.number}`;
      }
      
      if (date) {
        registerContentElement(date, `home.episodes_section.episodes.${index}.date`, episode.date);
        date.textContent = `Expected: ${episode.date}`;
      }
      
      if (desc) {
        registerContentElement(desc, `home.episodes_section.episodes.${index}.description`, episode.description);
        desc.textContent = episode.description;
      }
      
      if (button) {
        const btnEl = registerContentElement(button, `home.episodes_section.episodes.${index}.button`, episode.button);
        btnEl.innerHTML = `<i class="fas fa-bell me-1"></i> ${episode.button}`;
      }
    }
  });
  
  const viewAllBtn = document.querySelector('.py-5.bg-light .text-center .btn');
  if (viewAllBtn) {
    const btnEl = registerContentElement(viewAllBtn, 'home.episodes_section.button', content.home.episodes_section.button);
    btnEl.innerHTML = `${content.home.episodes_section.button} <i class="fas fa-arrow-right ms-2"></i>`;
  }
  
  // Apply subscribe section
  const subscribeTitle = document.querySelector('#signup h2');
  if (subscribeTitle) {
    registerContentElement(subscribeTitle, 'home.subscribe.title', content.home.subscribe.title);
    subscribeTitle.textContent = content.home.subscribe.title;
  }
  
  const subscribeSubtitle = document.querySelector('#signup p.mb-4');
  if (subscribeSubtitle) {
    registerContentElement(subscribeSubtitle, 'home.subscribe.subtitle', content.home.subscribe.subtitle);
    subscribeSubtitle.textContent = content.home.subscribe.subtitle;
  }
  
  const subscribeBtn = document.querySelector('#signup button');
  if (subscribeBtn) {
    const btnEl = registerContentElement(subscribeBtn, 'home.subscribe.button', content.home.subscribe.button);
    btnEl.innerHTML = `${content.home.subscribe.button} <i class="fas fa-paper-plane ms-2"></i>`;
  }
  
  const privacyNote = document.querySelector('#signup .text-muted.small');
  if (privacyNote) {
    registerContentElement(privacyNote, 'home.subscribe.privacy', content.home.subscribe.privacy);
    privacyNote.textContent = content.home.subscribe.privacy;
  }
  
  const successMsg = document.querySelector('#signup-success');
  if (successMsg) {
    registerContentElement(successMsg, 'home.subscribe.success', content.home.subscribe.success);
    successMsg.textContent = content.home.subscribe.success;
  }
}

// Apply episodes page content
function applyEpisodesContent() {
  const content = window.siteContent;
  
  // Apply callout section
  const calloutHeading = document.querySelector('.bg-image-callout .callout-heading');
  if (calloutHeading) {
    registerContentElement(calloutHeading, 'callout.home.title', content.callout.home.title);
    calloutHeading.textContent = content.callout.home.title;
  }
  
  const calloutText = document.querySelector('.bg-image-callout .callout-text');
  if (calloutText) {
    registerContentElement(calloutText, 'callout.home.text', content.callout.home.text);
    calloutText.textContent = content.callout.home.text;
  }
  
  const calloutButton = document.querySelector('.bg-image-callout .btn-callout');
  if (calloutButton) {
    const btnEl = registerContentElement(calloutButton, 'callout.home.button', content.callout.home.button);
    btnEl.innerHTML = `${content.callout.home.button} <i class="fas fa-angle-right ms-2"></i>`;
  }
  
  // Apply page header
  const pageTitle = document.querySelector('.page-header h1');
  if (pageTitle) {
    registerContentElement(pageTitle, 'episodes.header.title', content.episodes.header.title);
    pageTitle.textContent = content.episodes.header.title;
  }
  
  const pageSubtitle = document.querySelector('.page-header p.lead');
  if (pageSubtitle) {
    registerContentElement(pageSubtitle, 'episodes.header.subtitle', content.episodes.header.subtitle);
    pageSubtitle.textContent = content.episodes.header.subtitle;
  }
  
  // Apply episode cards
  const episodeCards = document.querySelectorAll('section > .container > .card');
  content.episodes.episode_details.forEach((episode, index) => {
    if (episodeCards[index]) {
      const title = episodeCards[index].querySelector('h3');
      const date = episodeCards[index].querySelector('p.text-muted:not(.small)');
      const desc = episodeCards[index].querySelector('p.card-text');
      const button = episodeCards[index].querySelector('.btn');
      const badge = episodeCards[index].querySelector('.badge.bg-primary');
      
      if (title) {
        registerContentElement(title, `episodes.episode_details.${index}.title`, episode.title);
        title.textContent = episode.title;
      }
      
      if (date) {
        registerContentElement(date, `episodes.episode_details.${index}.date`, episode.date);
        date.innerHTML = `<i class="fas fa-calendar-alt me-2"></i>Expected: ${episode.date}`;
      }
      
      if (desc) {
        registerContentElement(desc, `episodes.episode_details.${index}.description`, episode.description);
        desc.textContent = episode.description;
      }
      
      if (button) {
        const btnEl = registerContentElement(button, `episodes.episode_details.${index}.button`, episode.button);
        btnEl.innerHTML = `<i class="fas fa-bell me-1"></i> ${episode.button}`;
      }
      
      if (badge) {
        registerContentElement(badge, `episodes.episode_details.${index}.number`, episode.number);
        badge.textContent = `EPISODE ${episode.number}`;
      }
      
      // Apply topics
      const topicsContainer = episodeCards[index].querySelector('.episode-topics');
      if (topicsContainer) {
        topicsContainer.innerHTML = '';
        episode.topics.forEach((topic, topicIndex) => {
          const badge = document.createElement('span');
          badge.className = 'badge bg-secondary text-white me-2 mb-2';
          registerContentElement(badge, `episodes.episode_details.${index}.topics.${topicIndex}`, topic);
          badge.textContent = topic;
          topicsContainer.appendChild(badge);
        });
      }
    }
  });
  
  // Apply subscribe section
  const subscribeTitle = document.querySelector('#signup h2');
  if (subscribeTitle) {
    registerContentElement(subscribeTitle, 'episodes.subscribe.title', content.episodes.subscribe.title);
    subscribeTitle.textContent = content.episodes.subscribe.title;
  }
  
  const subscribeSubtitle = document.querySelector('#signup p.mb-4');
  if (subscribeSubtitle) {
    registerContentElement(subscribeSubtitle, 'episodes.subscribe.subtitle', content.episodes.subscribe.subtitle);
    subscribeSubtitle.textContent = content.episodes.subscribe.subtitle;
  }
  
  const subscribeBtn = document.querySelector('#signup button');
  if (subscribeBtn) {
    const btnEl = registerContentElement(subscribeBtn, 'episodes.subscribe.button', content.episodes.subscribe.button);
    btnEl.innerHTML = `${content.episodes.subscribe.button} <i class="fas fa-paper-plane ms-2"></i>`;
  }
  
  const privacyNote = document.querySelector('#signup .text-muted.small');
  if (privacyNote) {
    registerContentElement(privacyNote, 'episodes.subscribe.privacy', content.episodes.subscribe.privacy);
    privacyNote.textContent = content.episodes.subscribe.privacy;
  }
  
  const successMsg = document.querySelector('#signup-success');
  if (successMsg) {
    registerContentElement(successMsg, 'episodes.subscribe.success', content.episodes.subscribe.success);
    successMsg.textContent = content.episodes.subscribe.success;
  }
}

// Apply about page content
function applyAboutContent() {
  const content = window.siteContent;
  
  // Apply callout section
  const calloutHeading = document.querySelector('.bg-image-callout .callout-heading');
  if (calloutHeading) {
    registerContentElement(calloutHeading, 'callout.about.title', content.callout.about.title);
    calloutHeading.textContent = content.callout.about.title;
  }
  
  const calloutText = document.querySelector('.bg-image-callout .callout-text');
  if (calloutText) {
    registerContentElement(calloutText, 'callout.about.text', content.callout.about.text);
    calloutText.textContent = content.callout.about.text;
  }
  
  const calloutButton = document.querySelector('.bg-image-callout .btn-callout');
  if (calloutButton) {
    const btnEl = registerContentElement(calloutButton, 'callout.about.button', content.callout.about.button);
    btnEl.innerHTML = `${content.callout.about.button} <i class="fas fa-rocket ms-2"></i>`;
  }
  
  // Apply page header
  const pageTitle = document.querySelector('header h1');
  if (pageTitle) {
    registerContentElement(pageTitle, 'about.header.title', content.about.header.title);
    pageTitle.textContent = content.about.header.title;
  }
  
  const pageSubtitle = document.querySelector('header p.lead');
  if (pageSubtitle) {
    registerContentElement(pageSubtitle, 'about.header.subtitle', content.about.header.subtitle);
    pageSubtitle.textContent = content.about.header.subtitle;
  }
  
  // Apply story section
  const storyTitle = document.querySelector('.card h2:first-of-type');
  if (storyTitle) {
    registerContentElement(storyTitle, 'about.story.title', content.about.story.title);
    storyTitle.textContent = content.about.story.title;
  }
  
  const storyParagraphs = document.querySelectorAll('.card:first-of-type p');
  content.about.story.paragraphs.forEach((paragraph, index) => {
    if (storyParagraphs[index]) {
      registerContentElement(storyParagraphs[index], `about.story.paragraphs.${index}`, paragraph);
      storyParagraphs[index].textContent = paragraph;
    }
  });
  
  // Apply hosts section
  const hostsTitle = document.querySelector('.my-5:first-of-type h2');
  if (hostsTitle) {
    registerContentElement(hostsTitle, 'about.hosts.title', content.about.hosts.title);
    hostsTitle.textContent = content.about.hosts.title;
  }
  
  const hostCards = document.querySelectorAll('.team-member');
  content.about.hosts.people.forEach((person, index) => {
    if (hostCards[index]) {
      const name = hostCards[index].querySelector('h4');
      const role = hostCards[index].querySelector('p.text-muted');
      const bio = hostCards[index].querySelector('p:not(.text-muted)');
      const img = hostCards[index].querySelector('img');
      
      if (name) {
        registerContentElement(name, `about.hosts.people.${index}.name`, person.name);
        name.textContent = person.name;
      }
      
      if (role) {
        registerContentElement(role, `about.hosts.people.${index}.role`, person.role);
        role.textContent = person.role;
      }
      
      if (bio) {
        registerContentElement(bio, `about.hosts.people.${index}.bio`, person.bio);
        bio.textContent = person.bio;
      }
      
      if (img) {
        img.src = person.image;
        img.alt = person.name;
      }
      
      // Apply social links
      const socialLinks = hostCards[index].querySelectorAll('.social-icons a');
      let i = 0;
      for (const [platform, url] of Object.entries(person.social)) {
        if (socialLinks[i]) {
          socialLinks[i].href = url;
          i++;
        }
      }
    }
  });
  
  // Apply mission section
  const missionTitle = document.querySelector('.my-5:nth-of-type(2) h2');
  if (missionTitle) {
    registerContentElement(missionTitle, 'about.mission.title', content.about.mission.title);
    missionTitle.textContent = content.about.mission.title;
  }
  
  const missionIntro = document.querySelector('.my-5:nth-of-type(2) p');
  if (missionIntro) {
    registerContentElement(missionIntro, 'about.mission.intro', content.about.mission.intro);
    missionIntro.textContent = content.about.mission.intro;
  }
  
  const missionPoints = document.querySelectorAll('.list-group-item');
  content.about.mission.points.forEach((point, index) => {
    if (missionPoints[index]) {
      const pointEl = registerContentElement(missionPoints[index], `about.mission.points.${index}`, point);
      pointEl.innerHTML = `<i class="fas fa-check-circle text-primary me-2"></i> ${point}`;
    }
  });
  
  // Apply contact section
  const contactTitle = document.querySelector('#contact h2');
  if (contactTitle) {
    registerContentElement(contactTitle, 'about.contact.title', content.about.contact.title);
    contactTitle.textContent = content.about.contact.title;
  }
  
  const contactIntro = document.querySelector('#contact p:first-of-type');
  if (contactIntro) {
    registerContentElement(contactIntro, 'about.contact.intro', content.about.contact.intro);
    contactIntro.textContent = content.about.contact.intro;
  }
  
  const contactEmail = document.querySelector('#contact p:nth-of-type(2)');
  if (contactEmail) {
    registerContentElement(contactEmail, 'about.contact.email', content.about.contact.email);
    contactEmail.innerHTML = `<i class="fas fa-envelope text-primary me-2"></i> <strong>Email:</strong> <a href="mailto:${content.about.contact.email}">${content.about.contact.email}</a>`;
  }
  
  const contactTwitter = document.querySelector('#contact p:nth-of-type(3)');
  if (contactTwitter) {
    registerContentElement(contactTwitter, 'about.contact.twitter', content.about.contact.twitter);
    contactTwitter.innerHTML = `<i class="fab fa-twitter text-primary me-2"></i> <strong>Twitter:</strong> <a href="https://twitter.com/${content.about.contact.twitter.substring(1)}">${content.about.contact.twitter}</a>`;
  }
}

// Load content when DOM is ready
document.addEventListener('DOMContentLoaded', loadSiteContent);
