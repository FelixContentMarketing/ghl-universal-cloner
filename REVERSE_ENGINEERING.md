# 🔬 GHL Backend API - Reverse Engineering Dokumentation

## Ziel

Vollautomatische Page-Erstellung in GoHighLevel durch Nutzung der internen Backend-APIs, wie Super Cloner es macht.

## Erkenntnisse aus der Analyse

### 1. Öffentliche API (marketplace.gohighlevel.com)

**Verfügbare Endpoints:**
- ✅ `GET /funnels` - Funnels auflisten
- ✅ `GET /funnels/{funnelId}/pages` - Pages auflisten
- ✅ `GET /funnels/{funnelId}/pages/count` - Pages zählen
- ❌ **KEINE** POST/PUT Endpoints für Pages!

**Fazit:** Die öffentliche API bietet **KEINE** Möglichkeit, Pages zu erstellen oder zu aktualisieren.

### 2. Interne Backend API (backend.leadconnectorhq.com)

**Von Super Cloner verwendet:**
```
https://backend.leadconnectorhq.com
```

Diese API ist:
- ❌ Nicht öffentlich dokumentiert
- ✅ Vom GHL Page Builder verwendet
- ✅ Über Browser-Session zugänglich
- ✅ Kann Pages erstellen/aktualisieren

## 🎯 Reverse Engineering Strategie

### Phase 1: Network Traffic Analyse

**Schritte:**
1. In GHL einloggen
2. Page Builder öffnen
3. Browser DevTools → Network Tab
4. Neue Page erstellen
5. Alle API-Calls aufzeichnen

**Zu dokumentieren:**
- Request URLs
- Request Methods (POST, PUT, etc.)
- Request Headers (Authorization, etc.)
- Request Body (JSON-Struktur)
- Response Body (JSON-Struktur)

### Phase 2: Datenstruktur-Analyse

**Zu untersuchen:**
- Wie ist eine Page strukturiert?
- Welche Felder sind required?
- Welche Validierungen gibt es?
- Wie werden Sections/Rows/Columns definiert?

### Phase 3: Authentication-Analyse

**Zu klären:**
- Welche Auth-Token werden verwendet?
- Wo werden sie gespeichert?
- Wie lange sind sie gültig?
- Wie können wir sie aus der Extension nutzen?

## 🔍 Erwartete API-Endpoints

Basierend auf Super Cloner's Verhalten:

### 1. Page Creation
```
POST https://backend.leadconnectorhq.com/funnels/{funnelId}/pages
POST https://backend.leadconnectorhq.com/sites/{siteId}/pages
```

**Erwartete Request-Struktur:**
```json
{
  "name": "Page Name",
  "slug": "page-slug",
  "sections": [...],
  "customCSS": "...",
  "trackingCode": "...",
  "meta": {
    "title": "...",
    "description": "...",
    "ogImage": "..."
  }
}
```

### 2. Page Update
```
PUT https://backend.leadconnectorhq.com/funnels/{funnelId}/pages/{pageId}
PATCH https://backend.leadconnectorhq.com/funnels/{funnelId}/pages/{pageId}
```

### 3. Page Data Retrieval (für Copy)
```
GET https://backend.leadconnectorhq.com/funnels/{funnelId}/pages/{pageId}/full
GET https://backend.leadconnectorhq.com/pages/{pageId}/builder-data
```

**Erwartete Response:**
```json
{
  "id": "page_123",
  "name": "Page Name",
  "sections": [
    {
      "id": "section_1",
      "type": "section",
      "settings": {...},
      "rows": [...]
    }
  ],
  "customCSS": "...",
  "globalStyles": {...}
}
```

## 🔐 Authentication & Session Management

### Browser Session Cookies

**Erwartete Cookies:**
- `_ghl_session` - Haupt-Session-Cookie
- `_ghl_token` - Auth-Token
- `locationId` - Aktuelle Location ID

**Zugriff aus Extension:**
```javascript
// In content script oder background script
chrome.cookies.getAll({
  domain: '.leadconnectorhq.com'
}, (cookies) => {
  const sessionCookie = cookies.find(c => c.name === '_ghl_session');
  const authToken = cookies.find(c => c.name === '_ghl_token');
});
```

### Authorization Headers

**Erwartetes Format:**
```javascript
headers: {
  'Authorization': 'Bearer ' + authToken,
  'Content-Type': 'application/json',
  'X-Location-Id': locationId
}
```

## 📊 GHL Page Datenstruktur

### Erwartete Struktur (zu verifizieren)

```json
{
  "version": "2.0",
  "type": "funnel_page",
  "name": "My Page",
  "slug": "my-page",
  "meta": {
    "title": "Page Title",
    "description": "Page Description",
    "keywords": "keywords",
    "ogTitle": "OG Title",
    "ogDescription": "OG Description",
    "ogImage": "https://...",
    "favicon": "https://..."
  },
  "settings": {
    "responsive": true,
    "seo": {
      "indexable": true,
      "sitemap": true
    },
    "tracking": {
      "googleAnalytics": "UA-...",
      "facebookPixel": "...",
      "customCode": {
        "head": "...",
        "body": "..."
      }
    }
  },
  "sections": [
    {
      "id": "sec_abc123",
      "type": "section",
      "name": "Header Section",
      "settings": {
        "background": {
          "type": "color",
          "color": "#ffffff",
          "image": null,
          "video": null
        },
        "padding": {
          "top": 40,
          "bottom": 40,
          "left": 20,
          "right": 20
        },
        "margin": {
          "top": 0,
          "bottom": 0
        },
        "fullWidth": false,
        "containerWidth": 1200
      },
      "rows": [
        {
          "id": "row_xyz789",
          "type": "row",
          "settings": {
            "columnGap": 20,
            "verticalAlign": "top"
          },
          "columns": [
            {
              "id": "col_def456",
              "type": "column",
              "width": 12,
              "settings": {
                "padding": {...},
                "background": {...}
              },
              "elements": [
                {
                  "id": "elem_ghi012",
                  "type": "headline",
                  "settings": {
                    "text": "Welcome",
                    "tag": "h1",
                    "align": "center"
                  },
                  "styles": {
                    "fontSize": "48px",
                    "fontWeight": "700",
                    "color": "#000000",
                    "fontFamily": "Arial"
                  }
                },
                {
                  "id": "elem_jkl345",
                  "type": "text",
                  "settings": {
                    "html": "<p>This is text content</p>"
                  },
                  "styles": {...}
                },
                {
                  "id": "elem_mno678",
                  "type": "button",
                  "settings": {
                    "text": "Click Me",
                    "url": "https://...",
                    "action": "link",
                    "openInNewTab": true
                  },
                  "styles": {...}
                },
                {
                  "id": "elem_pqr901",
                  "type": "image",
                  "settings": {
                    "src": "https://...",
                    "alt": "Image description",
                    "link": null
                  },
                  "styles": {
                    "width": "100%",
                    "maxWidth": "600px"
                  }
                },
                {
                  "id": "elem_stu234",
                  "type": "custom_html",
                  "settings": {
                    "html": "<div>Custom HTML</div>",
                    "css": ".custom { color: red; }"
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "globalStyles": {
    "fonts": [
      {
        "family": "Arial",
        "weights": [400, 700],
        "source": "system"
      },
      {
        "family": "Roboto",
        "weights": [300, 400, 700],
        "source": "google"
      }
    ],
    "colors": [
      "#000000",
      "#ffffff",
      "#7c3aed"
    ],
    "customCSS": "body { margin: 0; }"
  }
}
```

## 🛠️ Implementation Plan

### Schritt 1: Network Sniffer entwickeln

**Erstelle ein Debug-Tool:**

```javascript
// debug-network-sniffer.js
// Läuft im GHL Page Builder und loggt alle API-Calls

(function() {
  const originalFetch = window.fetch;
  
  window.fetch = function(...args) {
    const [url, options] = args;
    
    if (url.includes('leadconnectorhq.com')) {
      console.log('🔍 API Call detected:');
      console.log('URL:', url);
      console.log('Method:', options?.method || 'GET');
      console.log('Headers:', options?.headers);
      console.log('Body:', options?.body);
    }
    
    return originalFetch.apply(this, args).then(response => {
      if (url.includes('leadconnectorhq.com')) {
        response.clone().json().then(data => {
          console.log('📥 Response:', data);
        });
      }
      return response;
    });
  };
  
  console.log('✅ Network Sniffer active!');
})();
```

### Schritt 2: API-Calls dokumentieren

**Erstelle eine Test-Page in GHL und dokumentiere:**

1. **Create Page:**
   - URL
   - Request Body
   - Response

2. **Update Page:**
   - URL
   - Request Body
   - Response

3. **Get Page Data:**
   - URL
   - Response Structure

### Schritt 3: Extension erweitern

**Neue Dateien:**

```
ghl-universal-cloner/
├── api/
│   ├── ghl-backend-api.js    # API-Client für backend.leadconnectorhq.com
│   ├── auth-manager.js        # Session & Token Management
│   └── page-converter.js      # Website → GHL Format Converter
├── content.js                 # (erweitert)
├── background.js              # (erweitert)
└── injected.js                # (erweitert)
```

### Schritt 4: API-Client implementieren

```javascript
// api/ghl-backend-api.js

class GHLBackendAPI {
  constructor() {
    this.baseURL = 'https://backend.leadconnectorhq.com';
    this.authToken = null;
    this.locationId = null;
  }
  
  async init() {
    // Get auth token from cookies
    this.authToken = await this.getAuthToken();
    this.locationId = await this.getLocationId();
  }
  
  async getAuthToken() {
    // Extract from cookies or localStorage
    return new Promise((resolve) => {
      chrome.cookies.get({
        url: 'https://backend.leadconnectorhq.com',
        name: '_ghl_token'
      }, (cookie) => {
        resolve(cookie?.value);
      });
    });
  }
  
  async createPage(funnelId, pageData) {
    const response = await fetch(`${this.baseURL}/funnels/${funnelId}/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
        'X-Location-Id': this.locationId
      },
      body: JSON.stringify(pageData)
    });
    
    return response.json();
  }
  
  async updatePage(funnelId, pageId, pageData) {
    const response = await fetch(`${this.baseURL}/funnels/${funnelId}/pages/${pageId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
        'X-Location-Id': this.locationId
      },
      body: JSON.stringify(pageData)
    });
    
    return response.json();
  }
  
  async getPageData(pageId) {
    const response = await fetch(`${this.baseURL}/pages/${pageId}/builder-data`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'X-Location-Id': this.locationId
      }
    });
    
    return response.json();
  }
}
```

### Schritt 5: Page Converter implementieren

```javascript
// api/page-converter.js

class PageConverter {
  convertWebsiteToGHL(websiteData) {
    return {
      version: '2.0',
      type: 'funnel_page',
      name: websiteData.title || 'Imported Page',
      slug: this.generateSlug(websiteData.title),
      meta: this.convertMeta(websiteData.meta),
      settings: this.generateDefaultSettings(),
      sections: this.convertToSections(websiteData),
      globalStyles: this.convertStyles(websiteData)
    };
  }
  
  convertToSections(websiteData) {
    // Hauptlogik: HTML → GHL Sections
    return [
      {
        id: this.generateId(),
        type: 'section',
        name: 'Main Content',
        settings: this.generateDefaultSectionSettings(),
        rows: [
          {
            id: this.generateId(),
            type: 'row',
            columns: [
              {
                id: this.generateId(),
                type: 'column',
                width: 12,
                elements: [
                  {
                    id: this.generateId(),
                    type: 'custom_html',
                    settings: {
                      html: websiteData.html,
                      css: this.extractInlineCSS(websiteData)
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
  }
  
  convertMeta(meta) {
    return {
      title: meta.ogTitle || meta.title || '',
      description: meta.ogDescription || meta.description || '',
      keywords: meta.keywords || '',
      ogTitle: meta.ogTitle || meta.title || '',
      ogDescription: meta.ogDescription || meta.description || '',
      ogImage: meta.ogImage || '',
      favicon: meta.favicon || ''
    };
  }
  
  convertStyles(websiteData) {
    return {
      fonts: websiteData.fonts || [],
      colors: websiteData.colors || [],
      customCSS: this.combineCSS(websiteData.css)
    };
  }
  
  generateId() {
    return 'ghl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  generateSlug(title) {
    return (title || 'imported-page')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }
}
```

## 🧪 Testing Plan

### Test 1: Network Sniffer
1. Injiziere Sniffer in GHL Page Builder
2. Erstelle Test-Page
3. Dokumentiere alle API-Calls
4. Verifiziere Datenstruktur

### Test 2: API Authentication
1. Extrahiere Auth-Token aus Browser
2. Teste API-Call mit Token
3. Verifiziere Response

### Test 3: Page Creation
1. Konvertiere einfache Website
2. Sende via Backend-API
3. Prüfe ob Page in GHL erscheint

### Test 4: Complex Page
1. Konvertiere komplexe Website
2. Teste alle Element-Typen
3. Verifiziere Styles und Layout

## ⚠️ Risiken & Mitigation

### Risiko 1: API-Änderungen
**Problem:** Interne APIs können sich ändern
**Mitigation:** 
- Versionierung implementieren
- Error Handling für API-Änderungen
- Fallback auf manuelle Methode

### Risiko 2: Authentication
**Problem:** Token-Format könnte sich ändern
**Mitigation:**
- Flexible Auth-Manager-Implementierung
- Multiple Auth-Methoden testen

### Risiko 3: Rate Limiting
**Problem:** API könnte Rate Limits haben
**Mitigation:**
- Request-Throttling implementieren
- Retry-Logic mit Exponential Backoff

### Risiko 4: ToS Violation
**Problem:** Nutzung interner APIs könnte gegen ToS verstoßen
**Mitigation:**
- Disclaimer in Extension
- Nur für eigene Accounts
- Kein Missbrauch

## 📋 Nächste Schritte

1. ✅ Network Sniffer entwickeln und testen
2. ⏳ API-Calls in GHL Page Builder dokumentieren
3. ⏳ Datenstruktur vollständig analysieren
4. ⏳ API-Client implementieren
5. ⏳ Page Converter implementieren
6. ⏳ Extension-Integration
7. ⏳ Testing & Debugging
8. ⏳ Dokumentation & Release

## 🎯 Erwartetes Ergebnis

Nach Abschluss des Reverse Engineering:

**Workflow:**
```
1. User besucht beliebige Website
2. Klickt "Website kopieren" in Extension
3. Extension extrahiert Daten
4. Konvertiert zu GHL-Format
5. Sendet via Backend-API
6. Page wird automatisch in GHL erstellt
7. Fertig! ✅
```

**Automatisierung:** 95-100% (vs. aktuell 70-80%)
