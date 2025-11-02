// Injected Script - Läuft im Page Context (nicht im Extension Context)
// Ermöglicht Zugriff auf window-Objekte und GHL-interne Strukturen

(function() {
  'use strict';

  console.log('GHL Universal Cloner: Injected script loaded');

  // Listen for messages from content script
  window.addEventListener('message', async (event) => {
    if (event.data.type === 'GHL_CLONER_INJECT') {
      console.log('Injected script received data:', event.data);
      
      try {
        const result = await injectIntoGHLInternal(event.data.data, event.data.settings);
        
        window.postMessage({
          type: 'GHL_CLONER_RESULT',
          result
        }, '*');
      } catch (error) {
        window.postMessage({
          type: 'GHL_CLONER_RESULT',
          result: {
            success: false,
            error: error.message
          }
        }, '*');
      }
    }
  });

  async function injectIntoGHLInternal(websiteData, settings) {
    console.log('Attempting internal GHL injection...', websiteData);

    // Try to find GHL's internal state/store
    const ghlState = findGHLState();
    
    if (!ghlState) {
      console.warn('Could not find GHL internal state');
      return {
        success: false,
        error: 'GHL internal state not found. Manual injection required.',
        data: websiteData
      };
    }

    console.log('Found GHL state:', ghlState);

    // Try different injection methods
    const methods = [
      tryReactDevTools,
      tryVueDevTools,
      tryAngularDevTools,
      tryDirectDOMManipulation,
      tryClipboardInjection
    ];

    for (const method of methods) {
      try {
        const result = await method(websiteData, ghlState);
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.warn(`Injection method failed: ${method.name}`, error);
      }
    }

    // If all methods fail, provide data for manual use
    return {
      success: false,
      error: 'Automatische Injection fehlgeschlagen. Bitte nutze die manuelle Methode.',
      data: convertToGHLFormat(websiteData),
      instructions: getManualInstructions()
    };
  }

  function findGHLState() {
    // Try to find GHL's internal state in various places
    const possibleLocations = [
      // React
      () => {
        const root = document.querySelector('#root, #app, [data-reactroot]');
        if (root && root._reactRootContainer) {
          return { type: 'react', root: root._reactRootContainer };
        }
      },
      
      // Vue
      () => {
        if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
          return { type: 'vue', hook: window.__VUE_DEVTOOLS_GLOBAL_HOOK__ };
        }
      },
      
      // Angular
      () => {
        if (window.ng) {
          return { type: 'angular', ng: window.ng };
        }
      },
      
      // GHL-specific objects
      () => {
        if (window.__GHL_BUILDER_DATA__) {
          return { type: 'ghl_builder', data: window.__GHL_BUILDER_DATA__ };
        }
      },
      
      () => {
        if (window.__INITIAL_STATE__) {
          return { type: 'initial_state', data: window.__INITIAL_STATE__ };
        }
      },
      
      () => {
        if (window.ghlBuilderData) {
          return { type: 'ghl_data', data: window.ghlBuilderData };
        }
      },
      
      () => {
        if (window.ghl) {
          return { type: 'ghl', data: window.ghl };
        }
      },

      // Redux store
      () => {
        if (window.__REDUX_DEVTOOLS_EXTENSION__) {
          return { type: 'redux', extension: window.__REDUX_DEVTOOLS_EXTENSION__ };
        }
      }
    ];

    for (const locator of possibleLocations) {
      try {
        const result = locator();
        if (result) return result;
      } catch (e) {
        // Continue to next locator
      }
    }

    return null;
  }

  async function tryReactDevTools(websiteData, ghlState) {
    if (ghlState.type !== 'react') {
      throw new Error('Not a React app');
    }

    console.log('Trying React DevTools injection...');

    // Try to find React Fiber
    const root = document.querySelector('#root, #app, [data-reactroot]');
    if (!root) throw new Error('React root not found');

    const fiber = root._reactRootContainer?._internalRoot?.current;
    if (!fiber) throw new Error('React fiber not found');

    // This would require deep knowledge of GHL's React component structure
    // For now, we'll just log what we found
    console.log('React fiber found:', fiber);

    throw new Error('React injection not yet implemented');
  }

  async function tryVueDevTools(websiteData, ghlState) {
    if (ghlState.type !== 'vue') {
      throw new Error('Not a Vue app');
    }

    console.log('Trying Vue DevTools injection...');
    throw new Error('Vue injection not yet implemented');
  }

  async function tryAngularDevTools(websiteData, ghlState) {
    if (ghlState.type !== 'angular') {
      throw new Error('Not an Angular app');
    }

    console.log('Trying Angular injection...');
    throw new Error('Angular injection not yet implemented');
  }

  async function tryDirectDOMManipulation(websiteData, ghlState) {
    console.log('Trying direct DOM manipulation...');

    // Find the builder canvas or editor area
    const canvasSelectors = [
      '.builder-canvas',
      '[data-builder-canvas]',
      '#builder-canvas',
      '.editor-canvas',
      '[data-editor-canvas]',
      '.ghl-canvas',
      '[class*="Canvas"]',
      '[class*="canvas"]'
    ];

    let canvas = null;
    for (const selector of canvasSelectors) {
      canvas = document.querySelector(selector);
      if (canvas) break;
    }

    if (!canvas) {
      throw new Error('Builder canvas not found');
    }

    console.log('Found canvas:', canvas);

    // Try to inject HTML directly into canvas
    const ghlFormatted = convertToGHLFormat(websiteData);
    
    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = websiteData.html;
    tempContainer.style.cssText = 'width: 100%; min-height: 100px;';
    
    // Try to append to canvas
    canvas.appendChild(tempContainer);

    // Trigger any change events
    canvas.dispatchEvent(new Event('change', { bubbles: true }));
    canvas.dispatchEvent(new Event('input', { bubbles: true }));

    return {
      success: true,
      message: 'Content injected via DOM manipulation. May require manual adjustment.',
      method: 'dom'
    };
  }

  async function tryClipboardInjection(websiteData, ghlState) {
    console.log('Trying clipboard injection...');

    const ghlFormatted = convertToGHLFormat(websiteData);
    const jsonString = JSON.stringify(ghlFormatted, null, 2);

    try {
      // Try to write to clipboard
      await navigator.clipboard.writeText(jsonString);

      return {
        success: true,
        message: 'Daten in Zwischenablage kopiert. Nutze Strg+V im GHL Editor.',
        method: 'clipboard',
        instructions: [
          '1. Die Daten wurden in die Zwischenablage kopiert',
          '2. Klicke in den GHL Page Builder',
          '3. Drücke Strg+V (oder Cmd+V auf Mac)',
          '4. Falls das nicht funktioniert, öffne die Browser-Console und kopiere die Daten manuell'
        ]
      };
    } catch (error) {
      throw new Error('Clipboard access denied');
    }
  }

  function convertToGHLFormat(websiteData) {
    // Convert to GHL-compatible format
    return {
      version: '2.0',
      type: 'page_data',
      name: websiteData.title || 'Imported Page',
      sections: [
        {
          id: generateId(),
          type: 'section',
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
                      styles: websiteData.css?.inline || []
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      globalStyles: {
        css: websiteData.css?.stylesheets?.map(s => s.rules).flat().join('\n') || '',
        fonts: websiteData.fonts || [],
        colors: websiteData.colors || []
      },
      assets: {
        images: websiteData.images || []
      },
      meta: websiteData.meta || {}
    };
  }

  function getManualInstructions() {
    return [
      'Manuelle Injection-Anleitung:',
      '',
      '1. Öffne die Browser Developer Console (F12)',
      '2. Gehe zum "Console" Tab',
      '3. Die konvertierten Daten sind im "data" Feld verfügbar',
      '4. Kopiere die Daten und füge sie manuell in GHL ein',
      '',
      'Alternative:',
      '1. Nutze die "Custom HTML" Komponente in GHL',
      '2. Füge den HTML-Code dort ein',
      '3. Füge die CSS-Styles in den Custom CSS Bereich ein',
      '4. Lade die Bilder manuell hoch'
    ];
  }

  function generateId() {
    return 'ghl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Expose some functions for debugging
  window.GHL_CLONER_DEBUG = {
    findGHLState,
    convertToGHLFormat,
    version: '1.0.0'
  };

  console.log('GHL Cloner Debug tools available at window.GHL_CLONER_DEBUG');

})();
