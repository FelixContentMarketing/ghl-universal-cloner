# GHL Universal Cloner

Eine Chrome Extension, die es ermöglicht, **beliebige Websites** zu klonen und in GoHighLevel zu importieren - mit erweiterter Funktionalität über GHL-only Tools hinaus.

## 🌟 Features

### Universelles Website-Klonen
Im Gegensatz zu anderen Tools wie "Super Cloner", die nur GoHighLevel-zu-GoHighLevel Seiten kopieren können, unterstützt **GHL Universal Cloner** das Klonen von **jeder beliebigen Website**:

- ✅ Statische HTML/CSS Websites
- ✅ WordPress-Seiten
- ✅ React/Vue/Angular Anwendungen
- ✅ Landing Pages von beliebigen Plattformen
- ✅ Und natürlich auch GoHighLevel-Seiten

### Vollständige Datenextraktion
- **HTML-Struktur**: Komplette DOM-Analyse und Extraktion
- **CSS-Styles**: Alle Stylesheets und Inline-Styles
- **Bilder**: Automatische Erkennung und Extraktion aller Bilder
- **Schriftarten**: Identifikation verwendeter Fonts
- **Farben**: Extraktion der Farbpalette
- **Meta-Daten**: SEO-relevante Informationen (Title, Description, OG-Tags)
- **Responsive Design**: Breakpoints und Media Queries

### GoHighLevel Integration
- Konvertierung in GHL-kompatibles Format
- Direkte Injection in den GHL Page Builder (experimentell)
- JSON-Export für manuelle Integration
- Vorschau-Funktion vor dem Import

## 📦 Installation

### Aus dem Quellcode

1. **Repository klonen oder herunterladen**
   ```bash
   git clone https://github.com/DEIN-USERNAME/ghl-universal-cloner.git
   cd ghl-universal-cloner
   ```

2. **In Chrome laden**
   - Öffne Chrome und navigiere zu `chrome://extensions/`
   - Aktiviere den "Entwicklermodus" (oben rechts)
   - Klicke auf "Entpackte Erweiterung laden"
   - Wähle den `ghl-universal-cloner` Ordner aus

3. **Extension ist bereit!**
   - Das GHL Universal Cloner Icon erscheint in deiner Browser-Toolbar
   - Klicke darauf, um die Extension zu verwenden

## 🚀 Verwendung

### Schritt 1: Website kopieren

1. Navigiere zu der Website, die du klonen möchtest
2. Klicke auf das GHL Universal Cloner Icon in der Toolbar
3. Klicke auf "Website kopieren"
4. Die Extension analysiert die Seite und extrahiert alle Daten (dauert 5-30 Sekunden)
5. Du siehst eine Zusammenfassung der extrahierten Elemente

### Schritt 2: In GoHighLevel einfügen

**Methode 1: Automatische Injection (Experimentell)**
1. Öffne den GoHighLevel Page/Funnel Builder
2. Erstelle eine neue Seite oder öffne eine bestehende
3. Klicke auf das GHL Universal Cloner Icon
4. Klicke auf "In GHL einfügen"
5. Die Extension versucht, die Daten automatisch einzufügen

**Methode 2: Manuelle Integration (Empfohlen)**
1. Klicke auf "Vorschau" in der Extension
2. Wähle den "JSON Export" Tab
3. Klicke auf "JSON kopieren" oder "JSON herunterladen"
4. In GHL:
   - Füge eine "Custom HTML" Komponente hinzu
   - Kopiere den HTML-Code aus der Vorschau
   - Füge die CSS-Styles in den Custom CSS Bereich ein
   - Lade Bilder manuell hoch

### Schritt 3: Anpassen

1. Passe Texte, Bilder und Farben an deine Marke an
2. Optimiere für Mobile Geräte
3. Teste alle Links und Formulare
4. Veröffentliche deine Seite

## ⚙️ Einstellungen

Die Extension bietet verschiedene Konfigurationsoptionen:

### Extraktions-Einstellungen
- **Bilder extrahieren**: Alle Bilder erfassen (empfohlen: ✓)
- **CSS Styles extrahieren**: Alle Stylesheets erfassen (empfohlen: ✓)
- **Schriftarten extrahieren**: Verwendete Fonts identifizieren (empfohlen: ✓)
- **Bilder optimieren**: Komprimierung (experimentell)

### GHL Integration
- **GHL Location ID**: Deine GoHighLevel Location ID
- **API Token**: Für erweiterte Features (optional)

### Erweitert
- **Debug-Modus**: Zusätzliche Logs in der Console

## 🔧 Technische Details

### Architektur

Die Extension besteht aus mehreren Komponenten:

```
ghl-universal-cloner/
├── manifest.json          # Extension Manifest (Manifest V3)
├── popup.html/css/js      # User Interface
├── content.js             # Content Script (läuft auf Webseiten)
├── background.js          # Service Worker (Background-Prozesse)
├── injected.js            # Page Context Script (GHL-Manipulation)
├── preview.html           # Vorschau-Seite
├── welcome.html           # Willkommens-Seite
└── icons/                 # Extension Icons
```

### Wie funktioniert das Klonen?

1. **Analyse-Phase**
   - Content Script wird in die Ziel-Website injiziert
   - DOM wird traversiert und analysiert
   - Computed Styles werden extrahiert
   - Assets werden identifiziert

2. **Extraktions-Phase**
   - HTML-Struktur wird geklont (ohne Scripts)
   - CSS-Rules werden aus allen Stylesheets gesammelt
   - Bilder-URLs werden erfasst
   - Meta-Informationen werden ausgelesen

3. **Konvertierungs-Phase**
   - Extrahierte Daten werden in GHL-Format konvertiert
   - Sections, Rows, Columns werden generiert
   - Styles werden angepasst
   - Assets werden vorbereitet

4. **Injection-Phase**
   - Daten werden in GHL Page Builder eingefügt
   - Verschiedene Methoden werden versucht:
     - React DevTools Manipulation
     - Direkte DOM-Manipulation
     - Clipboard-Injection

### Limitierungen

**Technische Limitierungen:**
- Cross-Origin Stylesheets können nicht vollständig gelesen werden
- Dynamische JavaScript-Funktionalität wird nicht übertragen
- Komplexe Frameworks (React, Vue) werden als statisches HTML extrahiert
- GHL Page Builder hat eigene Limitierungen bei unterstützten Features

**Realistische Erwartungen:**
- 70-80% Automatisierung ist realistisch
- Manuelle Nachbearbeitung ist oft erforderlich
- Perfekte 1:1 Kopien sind aufgrund unterschiedlicher Technologien nicht möglich

## ⚠️ Wichtige Hinweise

### Urheberrecht & Ethik

**Diese Extension ist für Inspiration und Lernzwecke gedacht!**

- ❌ Kopiere NIEMALS 1:1 die Inhalte anderer ohne Erlaubnis
- ✅ Nutze geklonte Strukturen als Ausgangspunkt
- ✅ Erstelle eigene, einzigartige Inhalte
- ✅ Respektiere geistiges Eigentum

**Rechtlicher Hinweis:**
Das Klonen von Websites ohne Erlaubnis kann Urheberrechte verletzen. Der Entwickler übernimmt keine Haftung für missbräuchliche Nutzung dieser Extension.

### Datenschutz

- Die Extension speichert Daten nur lokal in deinem Browser
- Keine Daten werden an externe Server gesendet
- Du hast volle Kontrolle über deine kopierten Daten

## 🐛 Bekannte Probleme & Lösungen

### Problem: "GHL Builder nicht gefunden"
**Lösung:** Stelle sicher, dass du im GHL Page/Funnel Builder bist, nicht nur in der GHL-App.

### Problem: Bilder werden nicht angezeigt
**Lösung:** Bilder müssen manuell in GHL hochgeladen werden. Die Extension erfasst nur die URLs.

### Problem: Styles werden nicht korrekt übertragen
**Lösung:** Nutze die manuelle Methode und kopiere CSS in den Custom CSS Bereich.

### Problem: Extension reagiert nicht
**Lösung:** 
1. Öffne die Browser Console (F12)
2. Prüfe auf Fehler
3. Aktiviere den Debug-Modus in den Einstellungen
4. Lade die Extension neu

## 🔄 Updates & Roadmap

### Version 1.0.0 (Aktuell)
- ✅ Grundlegende Website-Extraktion
- ✅ GHL-Format-Konvertierung
- ✅ Vorschau-Funktion
- ✅ JSON-Export

### Geplante Features
- 🔲 Verbesserte GHL-Injection
- 🔲 Batch-Processing (mehrere Seiten)
- 🔲 Bild-Optimierung
- 🔲 Template-Bibliothek
- 🔲 Cloud-Sync (optional)

## 🤝 Beitragen

Contributions sind willkommen! Wenn du Verbesserungen hast:

1. Fork das Repository
2. Erstelle einen Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 📝 Lizenz

Dieses Projekt ist für den persönlichen Gebrauch gedacht. Bitte respektiere Urheberrechte und nutze es verantwortungsvoll.

## 🙏 Danksagungen

- Inspiriert von "Super Cloner" - aber mit erweiterter Funktionalität
- Entwickelt für die GoHighLevel Community
- Dank an alle Beta-Tester

## 📧 Support

Bei Fragen oder Problemen:
- Öffne ein Issue auf GitHub
- Kontaktiere den Entwickler

---

**Hinweis:** Diese Extension ist ein unabhängiges Projekt und nicht offiziell mit GoHighLevel verbunden.

**Version:** 1.0.0  
**Letzte Aktualisierung:** November 2025
