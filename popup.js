// Popup Script für GHL Universal Cloner
class PopupController {
  constructor() {
    this.currentTab = null;
    this.copiedData = null;
    this.init();
  }

  async init() {
    await this.loadCurrentTab();
    this.setupEventListeners();
    this.loadSettings();
    await this.updateUI();
  }

  async loadCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    this.currentTab = tab;
  }

  setupEventListeners() {
    // Tab Navigation
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Action Buttons
    document.getElementById('copyBtn').addEventListener('click', () => this.copyWebsite());
    document.getElementById('pasteBtn').addEventListener('click', () => this.pasteToGHL());
    document.getElementById('previewBtn').addEventListener('click', () => this.showPreview());

    // Settings
    document.getElementById('clearStorageBtn').addEventListener('click', () => this.clearStorage());
    
    // Save settings on change
    ['extractImages', 'extractCss', 'extractFonts', 'optimizeImages', 'debugMode'].forEach(id => {
      document.getElementById(id).addEventListener('change', () => this.saveSettings());
    });

    ['ghlLocationId', 'ghlApiToken'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => this.saveSettings());
    });
  }

  switchTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = 'none';
    });
    
    const tabMap = {
      'actions': 'actionsTab',
      'settings': 'settingsTab'
    };
    
    document.getElementById(tabMap[tabName]).style.display = 'block';
  }

  async updateUI() {
    // Update current URL
    document.getElementById('currentUrl').textContent = this.currentTab.url;

    // Detect mode (GHL Editor or regular website)
    const isGHLEditor = await this.detectGHLEditor();
    const mode = isGHLEditor ? 'GHL Editor (Einfügen möglich)' : 'Normale Website (Kopieren möglich)';
    document.getElementById('currentMode').textContent = mode;

    // Check if we have copied data
    const result = await chrome.storage.local.get(['copiedWebsiteData']);
    this.copiedData = result.copiedWebsiteData;

    // Enable/disable buttons based on context
    if (isGHLEditor && this.copiedData) {
      document.getElementById('pasteBtn').disabled = false;
      document.getElementById('previewBtn').disabled = false;
    } else {
      document.getElementById('pasteBtn').disabled = true;
      document.getElementById('previewBtn').disabled = !this.copiedData;
    }

    // Show stats if we have copied data
    if (this.copiedData) {
      this.showStats(this.copiedData);
    }
  }

  async detectGHLEditor() {
    try {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: this.currentTab.id },
        func: () => {
          // Check for GHL-specific elements or URLs
          const url = window.location.href;
          return url.includes('app.gohighlevel.com') || 
                 url.includes('builder.gohighlevel.com') ||
                 url.includes('.myleadconnectorhq.com') ||
                 document.querySelector('[data-ghl-editor]') !== null;
        }
      });
      return result.result;
    } catch (error) {
      console.error('Error detecting GHL editor:', error);
      return false;
    }
  }

  async copyWebsite() {
    this.setStatus('Analysiere Website...', 'loading');
    this.showProgress(0, 'Starte Analyse...');

    try {
      // Execute content script to extract website data
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: this.currentTab.id },
        func: this.extractWebsiteData,
        args: [await this.getSettings()]
      });

      if (result.result.success) {
        const websiteData = result.result.data;
        
        // Save to storage
        await chrome.storage.local.set({ copiedWebsiteData: websiteData });
        this.copiedData = websiteData;

        this.showProgress(100, 'Erfolgreich kopiert!');
        this.setStatus('Website erfolgreich kopiert', 'success');
        this.showStats(websiteData);

        setTimeout(() => {
          this.hideProgress();
          this.updateUI();
        }, 1500);
      } else {
        throw new Error(result.result.error || 'Unbekannter Fehler');
      }
    } catch (error) {
      console.error('Copy error:', error);
      this.setStatus('Fehler beim Kopieren', 'error');
      this.hideProgress();
      alert(`Fehler beim Kopieren der Website: ${error.message}`);
    }
  }

  // This function runs in the page context
  extractWebsiteData(settings) {
    try {
      const data = {
        url: window.location.href,
        title: document.title,
        timestamp: new Date().toISOString(),
        html: '',
        css: [],
        images: [],
        fonts: [],
        meta: {},
        structure: {}
      };

      // Extract HTML structure
      const body = document.body.cloneNode(true);
      
      // Remove scripts and unwanted elements
      body.querySelectorAll('script, noscript, iframe').forEach(el => el.remove());
      
      data.html = body.innerHTML;

      // Extract meta information
      data.meta = {
        description: document.querySelector('meta[name="description"]')?.content || '',
        keywords: document.querySelector('meta[name="keywords"]')?.content || '',
        viewport: document.querySelector('meta[name="viewport"]')?.content || '',
        ogTitle: document.querySelector('meta[property="og:title"]')?.content || '',
        ogDescription: document.querySelector('meta[property="og:description"]')?.content || '',
        ogImage: document.querySelector('meta[property="og:image"]')?.content || ''
      };

      // Extract CSS if enabled
      if (settings.extractCss) {
        const styles = [];
        for (const sheet of document.styleSheets) {
          try {
            for (const rule of sheet.cssRules) {
              styles.push(rule.cssText);
            }
          } catch (e) {
            // Cross-origin stylesheets can't be accessed
            console.warn('Could not access stylesheet:', e);
          }
        }
        data.css = styles;
      }

      // Extract images if enabled
      if (settings.extractImages) {
        const images = [];
        document.querySelectorAll('img').forEach(img => {
          images.push({
            src: img.src,
            alt: img.alt,
            width: img.naturalWidth,
            height: img.naturalHeight
          });
        });
        
        // Also extract background images from CSS
        document.querySelectorAll('*').forEach(el => {
          const bg = window.getComputedStyle(el).backgroundImage;
          if (bg && bg !== 'none') {
            const match = bg.match(/url\(['"]?(.*?)['"]?\)/);
            if (match) {
              images.push({
                src: match[1],
                alt: '',
                type: 'background'
              });
            }
          }
        });
        
        data.images = images;
      }

      // Extract fonts if enabled
      if (settings.extractFonts) {
        const fonts = new Set();
        document.querySelectorAll('*').forEach(el => {
          const fontFamily = window.getComputedStyle(el).fontFamily;
          if (fontFamily) {
            fontFamily.split(',').forEach(font => {
              fonts.add(font.trim().replace(/['"]/g, ''));
            });
          }
        });
        data.fonts = Array.from(fonts);
      }

      // Analyze structure
      data.structure = {
        sections: document.querySelectorAll('section, .section, [class*="section"]').length,
        containers: document.querySelectorAll('.container, [class*="container"]').length,
        rows: document.querySelectorAll('.row, [class*="row"]').length,
        columns: document.querySelectorAll('.col, [class*="col"]').length,
        headings: {
          h1: document.querySelectorAll('h1').length,
          h2: document.querySelectorAll('h2').length,
          h3: document.querySelectorAll('h3').length,
          h4: document.querySelectorAll('h4').length,
          h5: document.querySelectorAll('h5').length,
          h6: document.querySelectorAll('h6').length
        },
        buttons: document.querySelectorAll('button, .btn, [class*="button"]').length,
        forms: document.querySelectorAll('form').length,
        links: document.querySelectorAll('a').length
      };

      // Calculate size
      const dataStr = JSON.stringify(data);
      data.size = Math.round(dataStr.length / 1024); // Size in KB

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async pasteToGHL() {
    if (!this.copiedData) {
      alert('Keine kopierten Daten vorhanden. Bitte zuerst eine Website kopieren.');
      return;
    }

    this.setStatus('Füge in GHL ein...', 'loading');
    this.showProgress(0, 'Bereite Daten vor...');

    try {
      // Execute injection script
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: this.currentTab.id },
        func: this.injectIntoGHL,
        args: [this.copiedData, await this.getSettings()]
      });

      if (result.result.success) {
        this.showProgress(100, 'Erfolgreich eingefügt!');
        this.setStatus('In GHL eingefügt', 'success');
        
        setTimeout(() => {
          this.hideProgress();
        }, 1500);
      } else {
        throw new Error(result.result.error || 'Unbekannter Fehler');
      }
    } catch (error) {
      console.error('Paste error:', error);
      this.setStatus('Fehler beim Einfügen', 'error');
      this.hideProgress();
      alert(`Fehler beim Einfügen in GHL: ${error.message}`);
    }
  }

  // This function runs in the GHL page context
  injectIntoGHL(websiteData, settings) {
    try {
      // This is a placeholder - actual GHL injection requires reverse engineering
      // of the GHL page builder's internal structure
      
      console.log('Attempting to inject into GHL...', websiteData);
      
      // Check if we're in the GHL builder
      const ghlBuilder = document.querySelector('[data-ghl-builder]') || 
                        document.querySelector('.builder-canvas') ||
                        document.querySelector('#builder-root');
      
      if (!ghlBuilder) {
        throw new Error('GHL Builder nicht gefunden. Bitte öffne den Page Builder.');
      }

      // Try to find the GHL data structure
      // This would need to be adapted based on actual GHL implementation
      const ghlData = window.__GHL_BUILDER_DATA__ || 
                     window.__INITIAL_STATE__ ||
                     window.ghlBuilderData;

      if (!ghlData) {
        console.warn('GHL data structure not found, attempting alternative method...');
      }

      // Convert website data to GHL format
      const ghlFormat = convertToGHLFormat(websiteData);
      
      // Inject into GHL
      // This is where we would manipulate the GHL builder's DOM/state
      // Actual implementation requires reverse engineering
      
      console.log('Converted to GHL format:', ghlFormat);
      
      // For now, we'll show a message that manual intervention is needed
      alert('Daten wurden vorbereitet. Aufgrund der GHL-Struktur ist eine manuelle Anpassung erforderlich. Die Daten wurden in der Console ausgegeben.');
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }

    function convertToGHLFormat(data) {
      // Convert extracted website data to GHL page builder format
      // This is a simplified conversion - actual implementation would be much more complex
      
      return {
        type: 'page',
        name: data.title,
        sections: [
          {
            type: 'section',
            id: generateId(),
            rows: [
              {
                type: 'row',
                id: generateId(),
                columns: [
                  {
                    type: 'column',
                    id: generateId(),
                    width: 12,
                    elements: [
                      {
                        type: 'html',
                        id: generateId(),
                        content: data.html
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        styles: data.css.join('\n'),
        meta: data.meta
      };
    }

    function generateId() {
      return 'ghl_' + Math.random().toString(36).substr(2, 9);
    }
  }

  showPreview() {
    if (!this.copiedData) {
      alert('Keine kopierten Daten vorhanden.');
      return;
    }

    // Open preview in new tab
    chrome.tabs.create({
      url: chrome.runtime.getURL('preview.html')
    });
  }

  showStats(data) {
    document.getElementById('stats').style.display = 'block';
    document.getElementById('statElements').textContent = 
      (data.structure?.sections || 0) + (data.structure?.containers || 0);
    document.getElementById('statImages').textContent = data.images?.length || 0;
    document.getElementById('statCss').textContent = data.css?.length || 0;
    document.getElementById('statSize').textContent = data.size || 0;
  }

  showProgress(percent, text) {
    document.getElementById('progressContainer').style.display = 'block';
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressText').textContent = text;
  }

  hideProgress() {
    document.getElementById('progressContainer').style.display = 'none';
  }

  setStatus(text, type = 'ready') {
    const statusText = document.getElementById('statusText');
    const statusIcon = document.querySelector('.status-icon');
    
    statusText.textContent = text;
    
    const colors = {
      ready: '#10b981',
      loading: '#f59e0b',
      success: '#10b981',
      error: '#ef4444'
    };
    
    statusIcon.style.color = colors[type] || colors.ready;
  }

  async getSettings() {
    const result = await chrome.storage.local.get([
      'extractImages',
      'extractCss',
      'extractFonts',
      'optimizeImages',
      'debugMode',
      'ghlLocationId',
      'ghlApiToken'
    ]);

    return {
      extractImages: result.extractImages !== false,
      extractCss: result.extractCss !== false,
      extractFonts: result.extractFonts !== false,
      optimizeImages: result.optimizeImages || false,
      debugMode: result.debugMode || false,
      ghlLocationId: result.ghlLocationId || '',
      ghlApiToken: result.ghlApiToken || ''
    };
  }

  async loadSettings() {
    const settings = await this.getSettings();
    
    document.getElementById('extractImages').checked = settings.extractImages;
    document.getElementById('extractCss').checked = settings.extractCss;
    document.getElementById('extractFonts').checked = settings.extractFonts;
    document.getElementById('optimizeImages').checked = settings.optimizeImages;
    document.getElementById('debugMode').checked = settings.debugMode;
    document.getElementById('ghlLocationId').value = settings.ghlLocationId;
    document.getElementById('ghlApiToken').value = settings.ghlApiToken;
  }

  async saveSettings() {
    const settings = {
      extractImages: document.getElementById('extractImages').checked,
      extractCss: document.getElementById('extractCss').checked,
      extractFonts: document.getElementById('extractFonts').checked,
      optimizeImages: document.getElementById('optimizeImages').checked,
      debugMode: document.getElementById('debugMode').checked,
      ghlLocationId: document.getElementById('ghlLocationId').value,
      ghlApiToken: document.getElementById('ghlApiToken').value
    };

    await chrome.storage.local.set(settings);
  }

  async clearStorage() {
    if (confirm('Möchtest du wirklich alle gespeicherten Daten löschen?')) {
      await chrome.storage.local.clear();
      this.copiedData = null;
      document.getElementById('stats').style.display = 'none';
      this.setStatus('Daten gelöscht', 'ready');
      await this.updateUI();
    }
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
