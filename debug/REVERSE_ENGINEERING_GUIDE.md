# 🔬 Reverse Engineering Guide - GHL Backend API

## Ziel

Dokumentiere die GHL-internen Backend-APIs, um vollautomatische Page-Erstellung zu ermöglichen.

## 📋 Voraussetzungen

- GoHighLevel Account mit aktivem Sub-Account
- Chrome Browser
- GHL Page Builder Zugriff
- Grundkenntnisse in Browser DevTools

## 🚀 Schritt-für-Schritt Anleitung

### Phase 1: Network Sniffer Setup (5 Minuten)

**1. In GHL einloggen**
```
https://app.gohighlevel.com
```

**2. Sub-Account auswählen**
- Wähle einen Test-Sub-Account
- Notiere die Location ID (aus URL)

**3. Funnel/Website Builder öffnen**
```
Sites → Funnels → [Funnel auswählen] → Edit
ODER
Sites → Websites → [Website auswählen] → Edit
```

**4. Browser DevTools öffnen**
- Drücke `F12` oder `Ctrl+Shift+I` (Windows/Linux)
- Drücke `Cmd+Option+I` (Mac)
- Wechsle zum **Console** Tab

**5. Network Sniffer laden**
- Öffne die Datei `debug/network-sniffer.js`
- Kopiere den gesamten Code
- Füge ihn in die Browser Console ein
- Drücke Enter

**Erwartete Ausgabe:**
```
🔍 GHL Backend API Network Sniffer
Starting network monitoring...
✅ Network Sniffer is now active!

Available Commands:
ghlSnifferExport() - Export all API calls to JSON file
ghlSnifferClear() - Clear all recorded API calls
ghlSnifferStats() - Show statistics about recorded calls
ghlSnifferFind("search") - Search for specific API calls
```

### Phase 2: API-Calls aufzeichnen (15-30 Minuten)

**Test 1: Neue Page erstellen**

1. Klicke auf "Add New Page" oder "New Step"
2. Wähle "Blank Page"
3. Gib einen Namen ein: "Test Page API Analysis"
4. Klicke "Create"

**Erwartete Console-Ausgabe:**
```
🌐 POST https://backend.leadconnectorhq.com/funnels/[funnelId]/pages
Request ID: ...
URL: https://backend.leadconnectorhq.com/...
Method: POST
Headers: {
  Authorization: "Bearer ..."
  Content-Type: "application/json"
  X-Location-Id: "..."
}
Request Body: {
  name: "Test Page API Analysis"
  slug: "test-page-api-analysis"
  ...
}
Response Status: 200 OK
Response Body: {
  id: "page_..."
  ...
}
```

**Test 2: Element hinzufügen**

1. Öffne die erstellte Page im Builder
2. Füge ein **Headline**-Element hinzu
3. Ändere den Text zu "Test Headline"
4. Beobachte die API-Calls in der Console

**Test 3: Section hinzufügen**

1. Füge eine neue Section hinzu
2. Ändere Background-Farbe
3. Füge Padding hinzu
4. Beobachte die API-Calls

**Test 4: Custom HTML Element**

1. Füge ein "Custom HTML"-Element hinzu
2. Füge HTML-Code ein:
```html
<div style="padding: 20px; background: #f3f4f6;">
  <h2>Test HTML</h2>
  <p>This is a test paragraph.</p>
</div>
```
3. Speichere die Änderungen
4. Beobachte die API-Calls

**Test 5: Page speichern**

1. Klicke auf "Save"
2. Warte auf Bestätigung
3. Beobachte die API-Calls

**Test 6: Page-Daten abrufen**

1. Lade die Page neu (F5)
2. Beobachte welche GET-Requests gemacht werden
3. Dokumentiere die Response-Struktur

### Phase 3: Daten exportieren (2 Minuten)

**1. API-Calls exportieren**
```javascript
ghlSnifferExport()
```

**2. Datei wird heruntergeladen:**
```
ghl-api-calls-[timestamp].json
```

**3. Statistiken anzeigen:**
```javascript
ghlSnifferStats()
```

**4. Spezifische Calls suchen:**
```javascript
// Suche nach Page-Creation
ghlSnifferFind("pages")

// Suche nach Section-Updates
ghlSnifferFind("sections")

// Suche nach Save-Operations
ghlSnifferFind("save")
```

### Phase 4: Daten analysieren (30-60 Minuten)

**1. JSON-Datei öffnen**
- Öffne die exportierte JSON-Datei in einem Editor
- Verwende einen JSON-Formatter (z.B. jsonformatter.org)

**2. Wichtige Endpoints identifizieren**

Suche nach:
- **Page Creation:** `POST /funnels/{id}/pages`
- **Page Update:** `PUT /funnels/{id}/pages/{pageId}`
- **Page Get:** `GET /funnels/{id}/pages/{pageId}`
- **Section Update:** `PUT /pages/{id}/sections/{sectionId}`
- **Element Update:** `PUT /sections/{id}/elements/{elementId}`

**3. Request-Struktur dokumentieren**

Für jeden wichtigen Endpoint:

```json
{
  "endpoint": "POST /funnels/{funnelId}/pages",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer [token]",
    "Content-Type": "application/json",
    "X-Location-Id": "[locationId]"
  },
  "requestBody": {
    "name": "string",
    "slug": "string",
    "sections": [],
    ...
  },
  "response": {
    "id": "string",
    "name": "string",
    ...
  }
}
```

**4. Datenstruktur verstehen**

Analysiere:
- Welche Felder sind required?
- Welche Felder sind optional?
- Welche Validierungen gibt es?
- Wie sind IDs strukturiert?
- Wie sind Sections/Rows/Columns verschachtelt?

**5. Auth-Mechanismus verstehen**

Untersuche:
- Welcher Token wird verwendet?
- Wo kommt der Token her?
- Wie lange ist er gültig?
- Welche anderen Header sind erforderlich?

### Phase 5: Dokumentation erstellen (30 Minuten)

**1. Erstelle API-Dokumentation**

Datei: `debug/GHL_BACKEND_API_DOCS.md`

```markdown
# GHL Backend API Documentation

## Base URL
https://backend.leadconnectorhq.com

## Authentication
Authorization: Bearer [token]
X-Location-Id: [locationId]

## Endpoints

### Create Page
POST /funnels/{funnelId}/pages

Request:
{
  "name": "string",
  "slug": "string",
  ...
}

Response:
{
  "id": "string",
  ...
}
```

**2. Erstelle Datenstruktur-Dokumentation**

Datei: `debug/GHL_PAGE_STRUCTURE.md`

```markdown
# GHL Page Data Structure

## Page Object
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "sections": [Section],
  ...
}

## Section Object
{
  "id": "string",
  "type": "section",
  "rows": [Row],
  ...
}
```

**3. Erstelle Beispiel-Requests**

Datei: `debug/example-requests.json`

```json
{
  "createPage": {
    "url": "POST /funnels/{funnelId}/pages",
    "body": { ... }
  },
  "updatePage": {
    "url": "PUT /funnels/{funnelId}/pages/{pageId}",
    "body": { ... }
  }
}
```

### Phase 6: Implementation (siehe REVERSE_ENGINEERING.md)

Nach erfolgreicher Dokumentation:
1. API-Client implementieren
2. Page-Converter entwickeln
3. Extension erweitern
4. Testing durchführen

## 📊 Erwartete Ergebnisse

Nach Abschluss solltest du haben:

### 1. Exportierte Daten
- ✅ `ghl-api-calls-[timestamp].json` - Alle API-Calls
- ✅ Screenshots von wichtigen Requests
- ✅ Notes zu Beobachtungen

### 2. Dokumentation
- ✅ `GHL_BACKEND_API_DOCS.md` - API-Dokumentation
- ✅ `GHL_PAGE_STRUCTURE.md` - Datenstruktur
- ✅ `example-requests.json` - Beispiel-Requests

### 3. Erkenntnisse
- ✅ Liste aller relevanten Endpoints
- ✅ Request/Response-Strukturen
- ✅ Auth-Mechanismus verstanden
- ✅ Datenstruktur dokumentiert

## 🎯 Kritische Informationen

### Must-Have Informationen:

**1. Page Creation Endpoint**
```
POST https://backend.leadconnectorhq.com/funnels/{funnelId}/pages
```
- Komplette Request-Struktur
- Alle required Felder
- Response-Struktur mit Page ID

**2. Authentication**
```
Authorization: Bearer [token]
X-Location-Id: [locationId]
```
- Wo kommt der Token her? (Cookie? localStorage?)
- Wie extrahieren wir ihn aus der Extension?

**3. Page Data Structure**
```json
{
  "sections": [
    {
      "rows": [
        {
          "columns": [
            {
              "elements": [...]
            }
          ]
        }
      ]
    }
  ]
}
```
- Komplette Verschachtelung verstehen
- Alle Element-Typen dokumentieren

**4. Custom HTML Element**
```json
{
  "type": "custom_html",
  "settings": {
    "html": "...",
    "css": "..."
  }
}
```
- Wie fügen wir beliebiges HTML ein?
- Gibt es Limitierungen?

## ⚠️ Troubleshooting

### Problem: Keine API-Calls werden geloggt

**Lösung:**
1. Prüfe ob Sniffer korrekt geladen wurde
2. Console-Ausgabe prüfen: "✅ Network Sniffer is now active!"
3. Browser-Cache leeren und neu laden
4. Sniffer erneut injizieren

### Problem: Requests sind leer

**Lösung:**
1. Prüfe ob DevTools geöffnet ist
2. Preserve Log aktivieren (in Network Tab)
3. Disable Cache aktivieren

### Problem: Response-Body ist leer

**Lösung:**
1. Response könnte zu groß sein
2. Verwende Network Tab zusätzlich
3. Exportiere und analysiere offline

### Problem: Auth-Token nicht sichtbar

**Lösung:**
1. Prüfe Application Tab → Cookies
2. Prüfe Application Tab → Local Storage
3. Prüfe Application Tab → Session Storage
4. Suche nach "token", "auth", "session"

## 📝 Checkliste

Vor Abschluss der Analyse:

- [ ] Network Sniffer erfolgreich injiziert
- [ ] Mindestens 5 verschiedene Actions getestet
- [ ] API-Calls exportiert
- [ ] Page Creation Endpoint identifiziert
- [ ] Request-Struktur dokumentiert
- [ ] Response-Struktur dokumentiert
- [ ] Auth-Mechanismus verstanden
- [ ] Token-Extraktion möglich
- [ ] Datenstruktur vollständig dokumentiert
- [ ] Custom HTML Element getestet
- [ ] Beispiel-Requests erstellt

## 🚀 Nächste Schritte

Nach erfolgreicher Analyse:

1. **API-Client entwickeln** (siehe `REVERSE_ENGINEERING.md`)
2. **Page-Converter implementieren**
3. **Extension erweitern**
4. **Testing durchführen**
5. **Release vorbereiten**

## 💡 Tipps

**Tipp 1:** Teste mit einfachen Pages zuerst
- Nur ein Headline-Element
- Dann schrittweise komplexer werden

**Tipp 2:** Dokumentiere während du testest
- Nicht alles am Ende machen
- Notizen direkt beim Testen machen

**Tipp 3:** Mache Screenshots
- Von wichtigen Requests
- Von Response-Strukturen
- Für spätere Referenz

**Tipp 4:** Teste verschiedene Element-Typen
- Headline
- Text
- Button
- Image
- Custom HTML ← **WICHTIG!**
- Form
- Video

**Tipp 5:** Teste Edge Cases
- Sehr lange Texte
- Spezielle Zeichen
- Große Bilder
- Viele Sections

## ⚠️ Rechtliche Hinweise

**Wichtig:**
- Diese Analyse ist für **Bildungszwecke**
- Nutze nur mit **eigenen GHL-Accounts**
- Respektiere **GHL Terms of Service**
- Kein **Missbrauch** der APIs
- Keine **Rate-Limit-Überschreitung**

**Disclaimer:**
Die Nutzung interner APIs könnte gegen GHL's Terms of Service verstoßen. Diese Anleitung ist ausschließlich für Bildungszwecke und zur Verbesserung des eigenen Workflows gedacht.

## 📞 Support

Bei Fragen oder Problemen:
- Prüfe die Dokumentation
- Suche in den exportierten Daten
- Teste verschiedene Szenarien
- Dokumentiere deine Findings

---

**Viel Erfolg beim Reverse Engineering! 🚀**
