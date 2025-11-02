/**
 * GHL Backend API Network Sniffer
 * 
 * Dieses Script wird in den GHL Page Builder injiziert und loggt
 * alle API-Calls zu backend.leadconnectorhq.com
 * 
 * VERWENDUNG:
 * 1. In GHL einloggen
 * 2. Page Builder öffnen
 * 3. Browser DevTools öffnen (F12)
 * 4. Console Tab öffnen
 * 5. Dieses Script in die Console pasten und Enter drücken
 * 6. Eine neue Page erstellen oder eine existierende bearbeiten
 * 7. Alle API-Calls werden in der Console geloggt
 */

(function() {
  console.log('%c🔍 GHL Backend API Network Sniffer', 'background: #7c3aed; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
  console.log('%cStarting network monitoring...', 'color: #10b981; font-weight: bold;');
  
  // Storage für alle API-Calls
  window.ghlApiCalls = [];
  
  // Intercept fetch
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const [url, options = {}] = args;
    const method = options.method || 'GET';
    
    // Nur GHL-relevante Calls loggen
    if (url.includes('leadconnectorhq.com') || url.includes('gohighlevel.com')) {
      const callId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      console.group(`%c🌐 ${method} ${url}`, 'color: #3b82f6; font-weight: bold;');
      console.log('%cRequest ID:', 'font-weight: bold;', callId);
      console.log('%cURL:', 'font-weight: bold;', url);
      console.log('%cMethod:', 'font-weight: bold;', method);
      console.log('%cHeaders:', 'font-weight: bold;', options.headers);
      
      if (options.body) {
        console.log('%cRequest Body:', 'font-weight: bold;');
        try {
          const bodyData = JSON.parse(options.body);
          console.log(bodyData);
        } catch (e) {
          console.log(options.body);
        }
      }
      
      const apiCall = {
        id: callId,
        timestamp: new Date().toISOString(),
        url: url,
        method: method,
        headers: options.headers,
        requestBody: options.body,
        response: null,
        responseBody: null
      };
      
      window.ghlApiCalls.push(apiCall);
      
      return originalFetch.apply(this, args).then(response => {
        const clonedResponse = response.clone();
        
        console.log('%cResponse Status:', 'font-weight: bold;', response.status, response.statusText);
        console.log('%cResponse Headers:', 'font-weight: bold;');
        
        const headers = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });
        console.log(headers);
        
        apiCall.response = {
          status: response.status,
          statusText: response.statusText,
          headers: headers
        };
        
        clonedResponse.text().then(text => {
          console.log('%cResponse Body:', 'font-weight: bold;');
          try {
            const jsonData = JSON.parse(text);
            console.log(jsonData);
            apiCall.responseBody = jsonData;
          } catch (e) {
            console.log(text);
            apiCall.responseBody = text;
          }
          console.groupEnd();
        });
        
        return response;
      }).catch(error => {
        console.error('%cRequest Failed:', 'font-weight: bold; color: red;', error);
        apiCall.error = error.message;
        console.groupEnd();
        throw error;
      });
    }
    
    return originalFetch.apply(this, args);
  };
  
  // Intercept XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this._ghlSnifferMethod = method;
    this._ghlSnifferUrl = url;
    return originalXHROpen.apply(this, [method, url, ...rest]);
  };
  
  XMLHttpRequest.prototype.send = function(body) {
    const url = this._ghlSnifferUrl;
    const method = this._ghlSnifferMethod;
    
    if (url && (url.includes('leadconnectorhq.com') || url.includes('gohighlevel.com'))) {
      const callId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      console.group(`%c🌐 XHR ${method} ${url}`, 'color: #8b5cf6; font-weight: bold;');
      console.log('%cRequest ID:', 'font-weight: bold;', callId);
      console.log('%cURL:', 'font-weight: bold;', url);
      console.log('%cMethod:', 'font-weight: bold;', method);
      
      if (body) {
        console.log('%cRequest Body:', 'font-weight: bold;');
        try {
          const bodyData = JSON.parse(body);
          console.log(bodyData);
        } catch (e) {
          console.log(body);
        }
      }
      
      const apiCall = {
        id: callId,
        timestamp: new Date().toISOString(),
        url: url,
        method: method,
        requestBody: body,
        response: null,
        responseBody: null,
        type: 'XHR'
      };
      
      window.ghlApiCalls.push(apiCall);
      
      this.addEventListener('load', function() {
        console.log('%cResponse Status:', 'font-weight: bold;', this.status, this.statusText);
        console.log('%cResponse Body:', 'font-weight: bold;');
        
        try {
          const jsonData = JSON.parse(this.responseText);
          console.log(jsonData);
          apiCall.responseBody = jsonData;
        } catch (e) {
          console.log(this.responseText);
          apiCall.responseBody = this.responseText;
        }
        
        apiCall.response = {
          status: this.status,
          statusText: this.statusText
        };
        
        console.groupEnd();
      });
      
      this.addEventListener('error', function() {
        console.error('%cRequest Failed', 'font-weight: bold; color: red;');
        apiCall.error = 'Request failed';
        console.groupEnd();
      });
    }
    
    return originalXHRSend.apply(this, [body]);
  };
  
  // Helper-Funktionen
  window.ghlSnifferExport = function() {
    const dataStr = JSON.stringify(window.ghlApiCalls, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ghl-api-calls-${Date.now()}.json`;
    link.click();
    console.log('%c✅ API Calls exported!', 'color: #10b981; font-weight: bold;');
  };
  
  window.ghlSnifferClear = function() {
    window.ghlApiCalls = [];
    console.clear();
    console.log('%c🧹 API Calls cleared!', 'color: #f59e0b; font-weight: bold;');
  };
  
  window.ghlSnifferStats = function() {
    console.log('%c📊 Network Sniffer Statistics', 'background: #7c3aed; color: white; padding: 10px; font-size: 14px; font-weight: bold;');
    console.log('Total API Calls:', window.ghlApiCalls.length);
    
    const methods = {};
    const endpoints = {};
    
    window.ghlApiCalls.forEach(call => {
      methods[call.method] = (methods[call.method] || 0) + 1;
      
      try {
        const url = new URL(call.url);
        const path = url.pathname;
        endpoints[path] = (endpoints[path] || 0) + 1;
      } catch (e) {}
    });
    
    console.log('\nMethods:');
    console.table(methods);
    
    console.log('\nTop Endpoints:');
    const sortedEndpoints = Object.entries(endpoints)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    console.table(Object.fromEntries(sortedEndpoints));
  };
  
  window.ghlSnifferFind = function(searchTerm) {
    const results = window.ghlApiCalls.filter(call => {
      const callStr = JSON.stringify(call).toLowerCase();
      return callStr.includes(searchTerm.toLowerCase());
    });
    
    console.log(`%c🔍 Found ${results.length} matching calls for "${searchTerm}"`, 'color: #3b82f6; font-weight: bold;');
    results.forEach(call => {
      console.group(`${call.method} ${call.url}`);
      console.log(call);
      console.groupEnd();
    });
    
    return results;
  };
  
  // Startup-Nachricht
  console.log('%c✅ Network Sniffer is now active!', 'color: #10b981; font-weight: bold; font-size: 14px;');
  console.log('\n%cAvailable Commands:', 'font-weight: bold; text-decoration: underline;');
  console.log('%cghlSnifferExport()', 'color: #3b82f6;', '- Export all API calls to JSON file');
  console.log('%cghlSnifferClear()', 'color: #3b82f6;', '- Clear all recorded API calls');
  console.log('%cghlSnifferStats()', 'color: #3b82f6;', '- Show statistics about recorded calls');
  console.log('%cghlSnifferFind("search")', 'color: #3b82f6;', '- Search for specific API calls');
  console.log('%cwindow.ghlApiCalls', 'color: #3b82f6;', '- Access raw data array');
  console.log('\n%c📝 Instructions:', 'font-weight: bold; text-decoration: underline;');
  console.log('1. Create or edit a page in GHL Page Builder');
  console.log('2. All API calls will be logged automatically');
  console.log('3. Use ghlSnifferExport() to save the data');
  console.log('4. Analyze the JSON file to understand the API structure');
  console.log('\n%c⚠️ Note:', 'font-weight: bold; color: #f59e0b;', 'This tool is for educational purposes only. Respect GHL\'s Terms of Service.');
})();
