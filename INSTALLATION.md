# Installation & Setup Guide

## GHL Universal Cloner - Schritt-für-Schritt Installation

### Voraussetzungen

- **Google Chrome** Browser (Version 88 oder höher)
- **Entwicklermodus** für Chrome Extensions aktiviert
- Grundlegende Computer-Kenntnisse

### Installation

#### Schritt 1: Extension-Dateien herunterladen

Du hast zwei Möglichkeiten:

**Option A: Von GitHub herunterladen**
1. Gehe zum GitHub Repository
2. Klicke auf den grünen "Code" Button
3. Wähle "Download ZIP"
4. Entpacke die ZIP-Datei in einen Ordner deiner Wahl

**Option B: Git Clone (für Entwickler)**
```bash
git clone https://github.com/DEIN-USERNAME/ghl-universal-cloner.git
cd ghl-universal-cloner
```

#### Schritt 2: Chrome Extensions-Seite öffnen

1. Öffne Google Chrome
2. Gib in die Adresszeile ein: `chrome://extensions/`
3. Drücke Enter

#### Schritt 3: Entwicklermodus aktivieren

1. Oben rechts auf der Extensions-Seite findest du einen Schalter "Entwicklermodus"
2. Aktiviere diesen Schalter (er sollte blau werden)

![Entwicklermodus](https://via.placeholder.com/600x100/7C3AED/FFFFFF?text=Entwicklermodus+aktivieren)

#### Schritt 4: Extension laden

1. Klicke auf "Entpackte Erweiterung laden" (oben links)
2. Navigiere zu dem Ordner, in dem du die Extension-Dateien entpackt hast
3. Wähle den Ordner `ghl-universal-cloner` aus
4. Klicke auf "Ordner auswählen"

#### Schritt 5: Extension verifizieren

1. Die Extension sollte jetzt in der Liste erscheinen
2. Du siehst das GHL Universal Cloner Icon (lila mit weißen Linien)
3. Stelle sicher, dass der Schalter bei der Extension auf "An" steht

#### Schritt 6: Extension in Toolbar pinnen (optional)

1. Klicke auf das Puzzle-Icon in der Chrome-Toolbar (rechts oben)
2. Finde "GHL Universal Cloner" in der Liste
3. Klicke auf das Pin-Symbol neben dem Namen
4. Das Icon erscheint jetzt dauerhaft in deiner Toolbar

### Erste Schritte

#### 1. Willkommens-Seite

Beim ersten Start öffnet sich automatisch eine Willkommens-Seite mit:
- Feature-Übersicht
- Schritt-für-Schritt Anleitung
- Wichtigen Hinweisen

#### 2. Einstellungen konfigurieren

1. Klicke auf das GHL Universal Cloner Icon
2. Gehe zum "Einstellungen" Tab
3. Konfiguriere nach Bedarf:
   - Extraktions-Optionen (empfohlen: alle aktiviert)
   - GHL Location ID (optional, für erweiterte Features)
   - Debug-Modus (nur bei Problemen aktivieren)

#### 3. Erste Website klonen

1. Navigiere zu einer Website, die du testen möchtest (z.B. eine einfache Landing Page)
2. Klicke auf das Extension-Icon
3. Klicke auf "Website kopieren"
4. Warte, bis die Analyse abgeschlossen ist
5. Klicke auf "Vorschau", um die Ergebnisse zu sehen

### Fehlerbehebung

#### Problem: Extension erscheint nicht in der Liste

**Lösung:**
1. Stelle sicher, dass du den richtigen Ordner ausgewählt hast
2. Der Ordner muss die Datei `manifest.json` enthalten
3. Prüfe, ob Fehlermeldungen angezeigt werden
4. Klicke auf "Neu laden" (Reload-Symbol) bei der Extension

#### Problem: "Manifest-Fehler"

**Lösung:**
1. Stelle sicher, dass alle Dateien vollständig heruntergeladen wurden
2. Prüfe, ob die `manifest.json` korrekt formatiert ist
3. Lade die Extension neu

#### Problem: Icons werden nicht angezeigt

**Lösung:**
1. Prüfe, ob der `icons/` Ordner existiert
2. Stelle sicher, dass die PNG-Dateien vorhanden sind:
   - `icons/icon16.png`
   - `icons/icon48.png`
   - `icons/icon128.png`

#### Problem: Extension funktioniert nicht auf bestimmten Seiten

**Lösung:**
1. Manche Seiten blockieren Extensions (z.B. Chrome Web Store)
2. Prüfe die Browser-Console auf Fehler (F12)
3. Aktiviere den Debug-Modus in den Einstellungen

### Deinstallation

Falls du die Extension entfernen möchtest:

1. Gehe zu `chrome://extensions/`
2. Finde "GHL Universal Cloner"
3. Klicke auf "Entfernen"
4. Bestätige die Deinstallation

**Hinweis:** Alle gespeicherten Daten (kopierte Websites) werden dabei gelöscht.

### Updates

#### Manuelle Updates

1. Lade die neueste Version herunter
2. Entpacke in den gleichen Ordner (überschreibe alte Dateien)
3. Gehe zu `chrome://extensions/`
4. Klicke auf das Reload-Symbol bei der Extension

#### Automatische Updates (zukünftig)

Wenn die Extension im Chrome Web Store veröffentlicht wird, erfolgen Updates automatisch.

### Berechtigungen

Die Extension benötigt folgende Berechtigungen:

| Berechtigung | Zweck |
|--------------|-------|
| `activeTab` | Zugriff auf die aktuell geöffnete Seite |
| `storage` | Speichern von kopierten Daten und Einstellungen |
| `clipboardWrite` | Kopieren von Daten in die Zwischenablage |
| `clipboardRead` | Lesen von Daten aus der Zwischenablage |
| `scripting` | Ausführen von Scripts zur Website-Analyse |
| `<all_urls>` | Funktioniert auf allen Websites |

**Datenschutz:** Alle Daten bleiben lokal auf deinem Computer. Nichts wird an externe Server gesendet.

### Support

Bei Problemen:

1. **Browser-Console prüfen:**
   - Drücke F12
   - Gehe zum "Console" Tab
   - Suche nach Fehlermeldungen

2. **Debug-Modus aktivieren:**
   - Extension öffnen
   - Einstellungen → Debug-Modus aktivieren
   - Aktion wiederholen
   - Console prüfen

3. **GitHub Issue erstellen:**
   - Beschreibe das Problem
   - Füge Screenshots hinzu
   - Teile Console-Logs (ohne sensible Daten)

### Nächste Schritte

Nach erfolgreicher Installation:

1. Lies die [README.md](README.md) für detaillierte Nutzungshinweise
2. Schaue dir die [Beispiele](EXAMPLES.md) an (falls vorhanden)
3. Experimentiere mit einfachen Websites
4. Teile dein Feedback!

---

**Viel Erfolg mit GHL Universal Cloner! 🚀**
