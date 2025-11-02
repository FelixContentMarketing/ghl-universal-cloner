// Background Service Worker für GHL Universal Cloner

console.log('GHL Universal Cloner: Background service worker loaded');

// Installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.local.set({
      extractImages: true,
      extractCss: true,
      extractFonts: true,
      optimizeImages: false,
      debugMode: false,
      ghlLocationId: '',
      ghlApiToken: ''
    });

    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html')
    });
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);

  switch (request.action) {
    case 'downloadImage':
      downloadImage(request.url, request.filename)
        .then(result => sendResponse({ success: true, result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep channel open for async response

    case 'optimizeImage':
      optimizeImage(request.imageData)
        .then(result => sendResponse({ success: true, result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'convertToGHL':
      convertToGHL(request.data)
        .then(result => sendResponse({ success: true, result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'uploadToGHL':
      uploadToGHL(request.data, request.settings)
        .then(result => sendResponse({ success: true, result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Context menu for quick actions
chrome.contextMenus.create({
  id: 'ghl-cloner-copy',
  title: 'Mit GHL Cloner kopieren',
  contexts: ['page']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'ghl-cloner-copy') {
    // Send message to content script to start copying
    chrome.tabs.sendMessage(tab.id, { action: 'startCopy' });
  }
});

// Download image from URL
async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}

// Optimize image (placeholder - would need actual image processing)
async function optimizeImage(imageData) {
  // This would require an image processing library
  // For now, just return the original data
  console.log('Image optimization not yet implemented');
  return imageData;
}

// Convert website data to GHL format
async function convertToGHL(websiteData) {
  console.log('Converting to GHL format...', websiteData);

  try {
    const ghlData = {
      version: '2.0',
      type: 'funnel_page',
      name: websiteData.title || 'Imported Page',
      slug: generateSlug(websiteData.title),
      meta: {
        title: websiteData.meta?.ogTitle || websiteData.title,
        description: websiteData.meta?.ogDescription || websiteData.meta?.description || '',
        keywords: websiteData.meta?.keywords || '',
        ogImage: websiteData.meta?.ogImage || '',
        favicon: websiteData.meta?.favicon || ''
      },
      settings: {
        responsive: true,
        seo: {
          indexable: true,
          sitemap: true
        }
      },
      sections: convertSections(websiteData),
      globalStyles: convertStyles(websiteData),
      assets: convertAssets(websiteData)
    };

    return ghlData;
  } catch (error) {
    console.error('Error converting to GHL format:', error);
    throw error;
  }
}

function convertSections(websiteData) {
  // Analyze HTML structure and convert to GHL sections
  const sections = [];

  // Create main content section
  sections.push({
    id: generateId(),
    type: 'section',
    name: 'Main Content',
    settings: {
      background: {
        type: 'color',
        color: '#ffffff'
      },
      padding: {
        top: 40,
        bottom: 40,
        left: 20,
        right: 20
      },
      fullWidth: false
    },
    rows: [
      {
        id: generateId(),
        type: 'row',
        columns: [
          {
            id: generateId(),
            type: 'column',
            width: 12,
            elements: [
              {
                id: generateId(),
                type: 'custom_html',
                settings: {
                  html: websiteData.html || '',
                  css: websiteData.css?.inline?.map(s => s.style).join('\n') || ''
                }
              }
            ]
          }
        ]
      }
    ]
  });

  return sections;
}

function convertStyles(websiteData) {
  const styles = {
    fonts: [],
    colors: [],
    customCss: ''
  };

  // Extract fonts
  if (websiteData.fonts && websiteData.fonts.length > 0) {
    styles.fonts = websiteData.fonts.map(font => ({
      family: font,
      weights: [400, 700],
      source: 'google' // Assume Google Fonts
    }));
  }

  // Extract colors
  if (websiteData.colors && websiteData.colors.length > 0) {
    styles.colors = websiteData.colors.slice(0, 20); // Limit to 20 colors
  }

  // Combine CSS
  if (websiteData.css?.stylesheets) {
    const cssRules = websiteData.css.stylesheets
      .map(sheet => sheet.rules.join('\n'))
      .join('\n\n');
    styles.customCss = cssRules;
  }

  return styles;
}

function convertAssets(websiteData) {
  const assets = {
    images: [],
    videos: [],
    files: []
  };

  // Convert images
  if (websiteData.images && websiteData.images.length > 0) {
    assets.images = websiteData.images.map(img => ({
      id: generateId(),
      url: img.src,
      alt: img.alt || '',
      width: img.width,
      height: img.height,
      type: img.type || 'img'
    }));
  }

  return assets;
}

// Upload to GHL via API (if API token is provided)
async function uploadToGHL(ghlData, settings) {
  console.log('Uploading to GHL...', ghlData, settings);

  if (!settings.ghlApiToken || !settings.ghlLocationId) {
    throw new Error('GHL API Token und Location ID sind erforderlich für den Upload.');
  }

  try {
    // Note: GHL API doesn't currently support page creation via public API
    // This would need to use internal/undocumented endpoints or manual injection
    
    console.warn('GHL API upload not yet implemented - API does not support page creation');
    
    // Return data for manual use
    return {
      message: 'GHL API unterstützt derzeit keine Page-Erstellung. Nutze die manuelle Einfüge-Funktion.',
      data: ghlData
    };

  } catch (error) {
    console.error('Error uploading to GHL:', error);
    throw error;
  }
}

// Helper functions
function generateId() {
  return 'ghl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateSlug(title) {
  if (!title) return 'imported-page';
  
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// Keep service worker alive
let keepAliveInterval;

function keepAlive() {
  keepAliveInterval = setInterval(() => {
    chrome.runtime.getPlatformInfo(() => {
      // Just to keep the service worker alive
    });
  }, 20000); // Every 20 seconds
}

keepAlive();

// Clean up on unload
self.addEventListener('beforeunload', () => {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
});
