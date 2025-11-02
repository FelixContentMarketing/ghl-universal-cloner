// Content Script für GHL Universal Cloner
// Läuft auf allen Webseiten und ermöglicht die Kommunikation zwischen Extension und Page

(function() {
  'use strict';

  console.log('GHL Universal Cloner: Content Script loaded');

  // Listen for messages from popup or background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request);

    switch (request.action) {
      case 'detectGHLEditor':
        sendResponse({ isGHLEditor: detectGHLEditor() });
        break;

      case 'extractWebsite':
        extractWebsiteData(request.settings)
          .then(data => sendResponse({ success: true, data }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response

      case 'injectIntoGHL':
        injectIntoGHL(request.data, request.settings)
          .then(result => sendResponse({ success: true, result }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response

      case 'ping':
        sendResponse({ pong: true });
        break;

      default:
        sendResponse({ error: 'Unknown action' });
    }
  });

  // Detect if current page is GHL Editor
  function detectGHLEditor() {
    const url = window.location.href;
    
    // Check URL patterns
    const ghlPatterns = [
      'app.gohighlevel.com',
      'builder.gohighlevel.com',
      '.myleadconnectorhq.com',
      'app.msgsndr.com'
    ];

    const isGHLUrl = ghlPatterns.some(pattern => url.includes(pattern));

    // Check for GHL-specific DOM elements
    const ghlSelectors = [
      '[data-ghl-editor]',
      '[data-ghl-builder]',
      '.ghl-builder',
      '#ghl-editor',
      '.builder-canvas',
      '[class*="FunnelBuilder"]',
      '[class*="PageBuilder"]'
    ];

    const hasGHLElements = ghlSelectors.some(selector => 
      document.querySelector(selector) !== null
    );

    // Check for GHL-specific JavaScript objects
    const hasGHLObjects = !!(
      window.__GHL_BUILDER_DATA__ ||
      window.__INITIAL_STATE__ ||
      window.ghlBuilderData ||
      window.ghl
    );

    return isGHLUrl || hasGHLElements || hasGHLObjects;
  }

  // Extract website data
  async function extractWebsiteData(settings = {}) {
    console.log('Extracting website data with settings:', settings);

    const data = {
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString(),
      html: '',
      css: [],
      images: [],
      fonts: [],
      colors: [],
      meta: {},
      structure: {},
      responsive: {}
    };

    try {
      // Extract meta information
      data.meta = extractMetaData();

      // Extract HTML structure
      data.html = extractHTML();

      // Extract CSS if enabled
      if (settings.extractCss !== false) {
        data.css = await extractCSS();
        data.colors = extractColors();
      }

      // Extract images if enabled
      if (settings.extractImages !== false) {
        data.images = await extractImages();
      }

      // Extract fonts if enabled
      if (settings.extractFonts !== false) {
        data.fonts = extractFonts();
      }

      // Analyze structure
      data.structure = analyzeStructure();

      // Analyze responsive breakpoints
      data.responsive = analyzeResponsive();

      // Calculate size
      const dataStr = JSON.stringify(data);
      data.size = Math.round(dataStr.length / 1024); // Size in KB

      console.log('Extraction complete:', data);
      return data;

    } catch (error) {
      console.error('Error extracting website data:', error);
      throw error;
    }
  }

  function extractMetaData() {
    const meta = {
      charset: document.characterSet,
      description: getMetaContent('description'),
      keywords: getMetaContent('keywords'),
      author: getMetaContent('author'),
      viewport: getMetaContent('viewport'),
      robots: getMetaContent('robots'),
      
      // Open Graph
      ogTitle: getMetaProperty('og:title'),
      ogDescription: getMetaProperty('og:description'),
      ogImage: getMetaProperty('og:image'),
      ogUrl: getMetaProperty('og:url'),
      ogType: getMetaProperty('og:type'),
      
      // Twitter Card
      twitterCard: getMetaContent('twitter:card'),
      twitterTitle: getMetaContent('twitter:title'),
      twitterDescription: getMetaContent('twitter:description'),
      twitterImage: getMetaContent('twitter:image'),
      
      // Favicon
      favicon: document.querySelector('link[rel*="icon"]')?.href || ''
    };

    return meta;
  }

  function getMetaContent(name) {
    return document.querySelector(`meta[name="${name}"]`)?.content || '';
  }

  function getMetaProperty(property) {
    return document.querySelector(`meta[property="${property}"]`)?.content || '';
  }

  function extractHTML() {
    // Clone body to avoid modifying original
    const body = document.body.cloneNode(true);
    
    // Remove unwanted elements
    const unwantedSelectors = [
      'script',
      'noscript',
      'iframe[src*="google"]',
      'iframe[src*="facebook"]',
      '[class*="cookie"]',
      '[id*="cookie"]',
      '[class*="gdpr"]',
      '[id*="gdpr"]'
    ];

    unwantedSelectors.forEach(selector => {
      body.querySelectorAll(selector).forEach(el => el.remove());
    });

    return body.innerHTML;
  }

  async function extractCSS() {
    const styles = [];
    const inlineStyles = [];

    // Extract from stylesheets
    for (const sheet of document.styleSheets) {
      try {
        // Only process same-origin stylesheets
        if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
          // Try to fetch cross-origin stylesheets
          try {
            const response = await fetch(sheet.href);
            const cssText = await response.text();
            styles.push({ source: sheet.href, rules: [cssText] });
          } catch (e) {
            console.warn('Could not fetch stylesheet:', sheet.href);
          }
        } else {
          const rules = [];
          for (const rule of sheet.cssRules || []) {
            rules.push(rule.cssText);
          }
          styles.push({ 
            source: sheet.href || 'inline', 
            rules 
          });
        }
      } catch (e) {
        console.warn('Could not access stylesheet:', e);
      }
    }

    // Extract inline styles
    document.querySelectorAll('[style]').forEach(el => {
      if (el.style.cssText) {
        inlineStyles.push({
          selector: getElementSelector(el),
          style: el.style.cssText
        });
      }
    });

    return { stylesheets: styles, inline: inlineStyles };
  }

  function extractColors() {
    const colors = new Set();
    
    // Extract from computed styles
    document.querySelectorAll('*').forEach(el => {
      const style = window.getComputedStyle(el);
      
      ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
        const value = style[prop];
        if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
          colors.add(value);
        }
      });
    });

    return Array.from(colors);
  }

  async function extractImages() {
    const images = [];

    // Extract img tags
    document.querySelectorAll('img').forEach(img => {
      if (img.src && !img.src.startsWith('data:')) {
        images.push({
          type: 'img',
          src: img.src,
          alt: img.alt || '',
          width: img.naturalWidth,
          height: img.naturalHeight,
          loading: img.loading || 'eager',
          selector: getElementSelector(img)
        });
      }
    });

    // Extract background images
    document.querySelectorAll('*').forEach(el => {
      const bg = window.getComputedStyle(el).backgroundImage;
      if (bg && bg !== 'none') {
        const matches = bg.matchAll(/url\(['"]?(.*?)['"]?\)/g);
        for (const match of matches) {
          if (match[1] && !match[1].startsWith('data:')) {
            images.push({
              type: 'background',
              src: match[1],
              alt: '',
              selector: getElementSelector(el)
            });
          }
        }
      }
    });

    // Extract picture sources
    document.querySelectorAll('picture source').forEach(source => {
      if (source.srcset) {
        images.push({
          type: 'source',
          srcset: source.srcset,
          media: source.media || '',
          type: source.type || ''
        });
      }
    });

    return images;
  }

  function extractFonts() {
    const fonts = new Set();
    
    document.querySelectorAll('*').forEach(el => {
      const fontFamily = window.getComputedStyle(el).fontFamily;
      if (fontFamily) {
        fontFamily.split(',').forEach(font => {
          const cleanFont = font.trim().replace(/['"]/g, '');
          if (cleanFont) fonts.add(cleanFont);
        });
      }
    });

    // Also extract from @font-face rules
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          if (rule instanceof CSSFontFaceRule) {
            const fontFamily = rule.style.fontFamily?.replace(/['"]/g, '');
            if (fontFamily) fonts.add(fontFamily);
          }
        }
      } catch (e) {
        // Ignore cross-origin errors
      }
    }

    return Array.from(fonts);
  }

  function analyzeStructure() {
    return {
      // Semantic sections
      sections: document.querySelectorAll('section, [role="region"]').length,
      articles: document.querySelectorAll('article').length,
      asides: document.querySelectorAll('aside').length,
      navs: document.querySelectorAll('nav').length,
      headers: document.querySelectorAll('header').length,
      footers: document.querySelectorAll('footer').length,
      mains: document.querySelectorAll('main').length,

      // Common layout patterns
      containers: document.querySelectorAll('.container, [class*="container"]').length,
      rows: document.querySelectorAll('.row, [class*="row"]').length,
      columns: document.querySelectorAll('.col, [class*="col"]').length,
      grids: document.querySelectorAll('[style*="grid"], [class*="grid"]').length,
      flexboxes: document.querySelectorAll('[style*="flex"], [class*="flex"]').length,

      // Content elements
      headings: {
        h1: document.querySelectorAll('h1').length,
        h2: document.querySelectorAll('h2').length,
        h3: document.querySelectorAll('h3').length,
        h4: document.querySelectorAll('h4').length,
        h5: document.querySelectorAll('h5').length,
        h6: document.querySelectorAll('h6').length
      },
      paragraphs: document.querySelectorAll('p').length,
      lists: document.querySelectorAll('ul, ol').length,
      tables: document.querySelectorAll('table').length,

      // Interactive elements
      buttons: document.querySelectorAll('button, .btn, [class*="button"], [role="button"]').length,
      links: document.querySelectorAll('a[href]').length,
      forms: document.querySelectorAll('form').length,
      inputs: document.querySelectorAll('input, textarea, select').length,

      // Media
      images: document.querySelectorAll('img').length,
      videos: document.querySelectorAll('video').length,
      audios: document.querySelectorAll('audio').length,
      iframes: document.querySelectorAll('iframe').length,

      // Total elements
      totalElements: document.querySelectorAll('*').length
    };
  }

  function analyzeResponsive() {
    const breakpoints = [];
    
    // Extract media queries from stylesheets
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          if (rule instanceof CSSMediaRule) {
            breakpoints.push({
              media: rule.media.mediaText,
              rules: Array.from(rule.cssRules).map(r => r.cssText)
            });
          }
        }
      } catch (e) {
        // Ignore cross-origin errors
      }
    }

    // Get viewport meta
    const viewport = document.querySelector('meta[name="viewport"]');
    
    return {
      viewport: viewport?.content || '',
      breakpoints,
      hasResponsiveImages: document.querySelectorAll('img[srcset], picture').length > 0,
      hasMediaQueries: breakpoints.length > 0
    };
  }

  function getElementSelector(el) {
    if (el.id) return `#${el.id}`;
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.split(' ').filter(c => c).slice(0, 2);
      if (classes.length) return `.${classes.join('.')}`;
    }
    return el.tagName.toLowerCase();
  }

  // Inject data into GHL Editor
  async function injectIntoGHL(websiteData, settings = {}) {
    console.log('Injecting into GHL...', websiteData);

    if (!detectGHLEditor()) {
      throw new Error('Nicht im GHL Editor. Bitte öffne den GHL Page/Funnel Builder.');
    }

    try {
      // Try to find GHL builder elements
      const builderSelectors = [
        '[data-ghl-builder]',
        '.builder-canvas',
        '#builder-root',
        '[class*="FunnelBuilder"]',
        '[class*="PageBuilder"]',
        '.ghl-builder'
      ];

      let builderElement = null;
      for (const selector of builderSelectors) {
        builderElement = document.querySelector(selector);
        if (builderElement) break;
      }

      if (!builderElement) {
        // Try alternative: inject a script that can access GHL's internal state
        return await injectViaScript(websiteData, settings);
      }

      // Convert website data to GHL format
      const ghlData = convertToGHLFormat(websiteData);

      // Try to inject into GHL
      // This is where actual GHL manipulation would happen
      // Requires reverse engineering of GHL's internal structure

      console.log('GHL formatted data:', ghlData);

      // For now, we'll provide the data in a format that can be manually used
      // or trigger GHL's own import mechanisms if available
      
      return {
        success: true,
        message: 'Daten wurden konvertiert. Manuelle Integration erforderlich.',
        data: ghlData
      };

    } catch (error) {
      console.error('Error injecting into GHL:', error);
      throw error;
    }
  }

  async function injectViaScript(websiteData, settings) {
    // Inject a script into the page that can access GHL's internal state
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('injected.js');
      
      script.onload = () => {
        // Send data to injected script
        window.postMessage({
          type: 'GHL_CLONER_INJECT',
          data: websiteData,
          settings
        }, '*');

        // Listen for response
        const listener = (event) => {
          if (event.data.type === 'GHL_CLONER_RESULT') {
            window.removeEventListener('message', listener);
            resolve(event.data.result);
          }
        };
        window.addEventListener('message', listener);

        // Timeout after 10 seconds
        setTimeout(() => {
          window.removeEventListener('message', listener);
          reject(new Error('Timeout: Keine Antwort vom injected script'));
        }, 10000);
      };

      script.onerror = () => reject(new Error('Failed to load injected script'));
      
      (document.head || document.documentElement).appendChild(script);
    });
  }

  function convertToGHLFormat(websiteData) {
    // Convert extracted website data to GHL page builder format
    // This is a simplified conversion - actual GHL format would need reverse engineering

    const ghlPage = {
      type: 'page',
      version: '2.0',
      name: websiteData.title || 'Imported Page',
      meta: {
        title: websiteData.meta.ogTitle || websiteData.title,
        description: websiteData.meta.ogDescription || websiteData.meta.description,
        keywords: websiteData.meta.keywords,
        image: websiteData.meta.ogImage,
        favicon: websiteData.meta.favicon
      },
      sections: [],
      globalStyles: {
        fonts: websiteData.fonts || [],
        colors: websiteData.colors || [],
        css: websiteData.css?.stylesheets?.map(s => s.rules).flat() || []
      }
    };

    // Create a main section with the HTML content
    ghlPage.sections.push({
      id: generateId(),
      type: 'section',
      name: 'Main Content',
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
                  content: websiteData.html,
                  css: websiteData.css?.inline || []
                }
              ]
            }
          ]
        }
      ],
      settings: {
        background: {},
        padding: {},
        margin: {}
      }
    });

    // Add images as separate elements if needed
    if (websiteData.images && websiteData.images.length > 0) {
      ghlPage.assets = {
        images: websiteData.images.map(img => ({
          id: generateId(),
          src: img.src,
          alt: img.alt,
          width: img.width,
          height: img.height
        }))
      };
    }

    return ghlPage;
  }

  function generateId() {
    return 'ghl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

})();
