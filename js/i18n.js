/* ===================================================================
   i18n — Internationalization module
   Supported languages: en, nl, de, ru
   =================================================================== */

(function (root) {
  'use strict';

  const translations = {
    en: {
      // Toolbar / nav
      'tab.editor': 'Editor',
      'tab.viewer': 'Tree Viewer',
      'tab.codegen': 'Code Gen',
      'tab.diff': 'Diff',
      'nav.about': 'About',
      'nav.toggle_theme': 'Toggle dark/light theme',
      'nav.toggle_theme_label': 'Toggle theme',

      // Action bar
      'btn.format': 'Format',
      'btn.format_title': 'Format / Beautify JSON (Ctrl+Shift+F)',
      'btn.minify': 'Minify',
      'btn.minify_title': 'Minify JSON',
      'btn.copy': 'Copy',
      'btn.copy_title': 'Copy to clipboard',
      'btn.clear': 'Clear',
      'btn.clear_title': 'Clear editor',
      'btn.import': 'Import',
      'btn.import_title': 'Import JSON file',
      'btn.url': 'URL',
      'btn.url_title': 'Load JSON from URL',
      'btn.filter_fields': 'Filter Fields',
      'btn.filter_fields_title': 'Filter fields to simplify tree',
      'btn.search': 'Search',
      'btn.search_title': 'Search (Ctrl+F)',
      'btn.expand_all': 'Expand All',
      'btn.expand_all_title': 'Expand all nodes',
      'btn.collapse_all': 'Collapse All',
      'btn.collapse_all_title': 'Collapse all nodes',
      'btn.table': 'Table',
      'btn.table_title': 'Switch to table view',
      'btn.table_tree_title': 'Switch to tree view',
      'btn.download': 'Download',
      'label.export': 'Export:',
      'export.choose': '— choose —',
      'export.json': 'JSON (formatted)',
      'export.json_min': 'JSON (minified)',
      'export.csv': 'CSV (arrays)',
      'export.yaml': 'YAML',

      // Editor panel
      'editor.placeholder': 'Paste JSON here, drop a file, or load from URL…',
      'editor.aria': 'JSON input editor',
      'validation.valid': 'Valid JSON',
      'validation.goto': 'Go to error',
      'validation.dismiss_title': 'Dismiss',
      'validation.dismiss_label': 'Dismiss',

      // Tree panel
      'search.placeholder': 'Search keys or values…',
      'search.aria': 'Search JSON',
      'search.prev_title': 'Previous match',
      'search.prev_label': 'Previous match',
      'search.next_title': 'Next match',
      'search.next_label': 'Next match',
      'search.clear_title': 'Clear search',
      'search.clear_label': 'Clear search',
      'tree.aria': 'JSON tree viewer',
      'tree.invalid': 'Cannot render tree: invalid JSON.',
      'tree.items_one': 'item',
      'tree.items_many': 'items',
      'tree.copy_title': 'Click to copy value',

      // Table panel
      'table.invalid': 'Cannot render table: invalid JSON.',
      'table.empty': 'No JSON data to display.',
      'table.empty_array': 'Empty array',
      'table.col_index': '#',
      'table.col_value': 'Value',
      'table.col_type': 'Type',
      'table.col_preview': 'Value / Preview',

      // Diff panel
      'diff.left': 'Left',
      'diff.right': 'Right',
      'diff.left_placeholder': 'Paste first JSON…',
      'diff.right_placeholder': 'Paste second JSON…',
      'diff.left_aria': 'Diff left JSON',
      'diff.right_aria': 'Diff right JSON',
      'btn.compare': 'Compare',
      'diff.identical': 'Documents are identical.',
      'diff.left_invalid': 'Left JSON is invalid.',
      'diff.right_invalid': 'Right JSON is invalid.',

      // Code Gen panel
      'codegen.label_lang': 'Language:',
      'codegen.label_root': 'Root class:',
      'codegen.root_placeholder': 'Root',
      'btn.generate': 'Generate',
      'btn.codegen_copy': 'Copy',
      'codegen.no_json': '// Error: No valid JSON in editor. Paste JSON in the Editor tab first.',
      'codegen.aria': 'Generated code',

      // URL dialog
      'dialog.url_title': 'Load JSON from URL',
      'dialog.url_note': 'The URL must support CORS or be a public API endpoint.',
      'dialog.url_placeholder': 'https://api.example.com/data.json',
      'dialog.url_aria': 'JSON URL',
      'btn.cancel': 'Cancel',
      'btn.load': 'Load',

      // Filter dialog
      'dialog.filter_title': 'Filter Fields',
      'dialog.filter_note': 'Uncheck fields to hide them from the tree view. Arrays appear once.',
      'filter.presets_default': '-- Saved Presets --',
      'filter.save_title': 'Save current selection as preset',
      'filter.delete_title': 'Delete selected preset',
      'btn.select_all': 'Select All',
      'btn.deselect_all': 'Deselect All',
      'btn.reset': 'Reset',
      'btn.apply': 'Apply',
      'filter.preset_name_placeholder': 'Enter preset name…',
      'btn.save': 'Save',
      'filter.btn_active': 'Filter active ({n} fields selected)',
      'filter.btn_default': 'Filter fields to simplify tree',

      // Drop overlay
      'drop.message': 'Drop JSON file here',

      // Alerts
      'alert.invalid_url': 'Please enter a valid URL.',
      'alert.https_only': 'Only HTTP and HTTPS URLs are supported.',
      'alert.load_failed': 'Failed to load URL: {msg}\n\nMake sure the URL supports CORS.',
      'alert.no_valid_json': 'No valid JSON to export.',
      'alert.csv_note': 'CSV export works best with arrays of objects.',

      // Misc flash
      'flash.copied': 'Copied!',
      'flash.failed': 'Failed',

      // Footer
      'footer.text': '© 2026 Format JSON · Free & open source · 100% client-side',

      // Validation bar (dynamic)
      'validation.error_loc': ' (line {line}, col {col})',

      // Search count
      'search.match_one': 'match',
      'search.match_many': 'matches',
    },

    nl: {
      // Toolbar / nav
      'tab.editor': 'Editor',
      'tab.viewer': 'Boomstructuur',
      'tab.codegen': 'Code Gen',
      'tab.diff': 'Vergelijk',
      'nav.about': 'Info',
      'nav.toggle_theme': 'Donker/licht thema wisselen',
      'nav.toggle_theme_label': 'Thema wisselen',

      // Action bar
      'btn.format': 'Opmaak',
      'btn.format_title': 'Opmaak / Verfraai JSON (Ctrl+Shift+F)',
      'btn.minify': 'Minimaliseer',
      'btn.minify_title': 'JSON minimaliseren',
      'btn.copy': 'Kopiëren',
      'btn.copy_title': 'Naar klembord kopiëren',
      'btn.clear': 'Wissen',
      'btn.clear_title': 'Editor wissen',
      'btn.import': 'Importeren',
      'btn.import_title': 'JSON-bestand importeren',
      'btn.url': 'URL',
      'btn.url_title': 'JSON van URL laden',
      'btn.filter_fields': 'Velden filteren',
      'btn.filter_fields_title': 'Velden filteren om boom te vereenvoudigen',
      'btn.search': 'Zoeken',
      'btn.search_title': 'Zoeken (Ctrl+F)',
      'btn.expand_all': 'Alles uitvouwen',
      'btn.expand_all_title': 'Alle knooppunten uitvouwen',
      'btn.collapse_all': 'Alles invouwen',
      'btn.collapse_all_title': 'Alle knooppunten invouwen',
      'btn.table': 'Tabel',
      'btn.table_title': 'Naar tabelweergave schakelen',
      'btn.table_tree_title': 'Naar boomweergave schakelen',
      'btn.download': 'Downloaden',
      'label.export': 'Exporteren:',
      'export.choose': '— kies —',
      'export.json': 'JSON (opgemaakt)',
      'export.json_min': 'JSON (geminimaliseerd)',
      'export.csv': 'CSV (arrays)',
      'export.yaml': 'YAML',

      // Editor panel
      'editor.placeholder': 'Plak JSON hier, sleep een bestand of laad van een URL…',
      'editor.aria': 'JSON-invoereditor',
      'validation.valid': 'Geldige JSON',
      'validation.goto': 'Naar fout gaan',
      'validation.dismiss_title': 'Sluiten',
      'validation.dismiss_label': 'Sluiten',

      // Tree panel
      'search.placeholder': 'Zoek sleutels of waarden…',
      'search.aria': 'JSON doorzoeken',
      'search.prev_title': 'Vorige overeenkomst',
      'search.prev_label': 'Vorige overeenkomst',
      'search.next_title': 'Volgende overeenkomst',
      'search.next_label': 'Volgende overeenkomst',
      'search.clear_title': 'Zoekopdracht wissen',
      'search.clear_label': 'Zoekopdracht wissen',
      'tree.aria': 'JSON-boomstructuur',
      'tree.invalid': 'Kan boom niet renderen: ongeldige JSON.',
      'tree.items_one': 'item',
      'tree.items_many': "items",
      'tree.copy_title': 'Klik om waarde te kopiëren',

      // Table panel
      'table.invalid': 'Kan tabel niet renderen: ongeldige JSON.',
      'table.empty': 'Geen JSON-gegevens om weer te geven.',
      'table.empty_array': 'Lege array',
      'table.col_index': '#',
      'table.col_value': 'Waarde',
      'table.col_type': 'Type',
      'table.col_preview': 'Waarde / Voorbeeld',

      // Diff panel
      'diff.left': 'Links',
      'diff.right': 'Rechts',
      'diff.left_placeholder': 'Plak eerste JSON…',
      'diff.right_placeholder': 'Plak tweede JSON…',
      'diff.left_aria': 'Diff linker JSON',
      'diff.right_aria': 'Diff rechter JSON',
      'btn.compare': 'Vergelijken',
      'diff.identical': 'Documenten zijn identiek.',
      'diff.left_invalid': 'Linker JSON is ongeldig.',
      'diff.right_invalid': 'Rechter JSON is ongeldig.',

      // Code Gen panel
      'codegen.label_lang': 'Taal:',
      'codegen.label_root': 'Root-klasse:',
      'codegen.root_placeholder': 'Root',
      'btn.generate': 'Genereren',
      'btn.codegen_copy': 'Kopiëren',
      'codegen.no_json': '// Fout: geen geldige JSON in editor. Plak JSON eerst in het tabblad Editor.',
      'codegen.aria': 'Gegenereerde code',

      // URL dialog
      'dialog.url_title': 'JSON van URL laden',
      'dialog.url_note': 'De URL moet CORS ondersteunen of een openbaar API-eindpunt zijn.',
      'dialog.url_placeholder': 'https://api.voorbeeld.nl/data.json',
      'dialog.url_aria': 'JSON-URL',
      'btn.cancel': 'Annuleren',
      'btn.load': 'Laden',

      // Filter dialog
      'dialog.filter_title': 'Velden filteren',
      'dialog.filter_note': 'Vink velden uit om ze te verbergen in de boomweergave. Arrays verschijnen eenmalig.',
      'filter.presets_default': '-- Opgeslagen filters --',
      'filter.save_title': 'Huidige selectie opslaan als filter',
      'filter.delete_title': 'Geselecteerd filter verwijderen',
      'btn.select_all': 'Alles selecteren',
      'btn.deselect_all': 'Alles deselecteren',
      'btn.reset': 'Herstellen',
      'btn.apply': 'Toepassen',
      'filter.preset_name_placeholder': 'Voer filternaam in…',
      'btn.save': 'Opslaan',
      'filter.btn_active': 'Filter actief ({n} velden geselecteerd)',
      'filter.btn_default': 'Velden filteren om boom te vereenvoudigen',

      // Drop overlay
      'drop.message': 'JSON-bestand hier neerzetten',

      // Alerts
      'alert.invalid_url': 'Voer een geldige URL in.',
      'alert.https_only': 'Alleen HTTP- en HTTPS-URL\'s worden ondersteund.',
      'alert.load_failed': 'URL laden mislukt: {msg}\n\nZorg dat de URL CORS ondersteunt.',
      'alert.no_valid_json': 'Geen geldige JSON om te exporteren.',
      'alert.csv_note': 'CSV-export werkt het beste met arrays van objecten.',

      // Misc flash
      'flash.copied': 'Gekopieerd!',
      'flash.failed': 'Mislukt',

      // Footer
      'footer.text': '© 2026 Format JSON · Gratis & open source · 100% client-side',

      // Validation bar (dynamic)
      'validation.error_loc': ' (regel {line}, kolom {col})',

      // Search count
      'search.match_one': 'overeenkomst',
      'search.match_many': 'overeenkomsten',
    },

    de: {
      // Toolbar / nav
      'tab.editor': 'Editor',
      'tab.viewer': 'Baumansicht',
      'tab.codegen': 'Code-Gen',
      'tab.diff': 'Vergleich',
      'nav.about': 'Info',
      'nav.toggle_theme': 'Hell-/Dunkel-Modus umschalten',
      'nav.toggle_theme_label': 'Design wechseln',

      // Action bar
      'btn.format': 'Formatieren',
      'btn.format_title': 'JSON formatieren / verschönern (Ctrl+Shift+F)',
      'btn.minify': 'Minimieren',
      'btn.minify_title': 'JSON minimieren',
      'btn.copy': 'Kopieren',
      'btn.copy_title': 'In Zwischenablage kopieren',
      'btn.clear': 'Löschen',
      'btn.clear_title': 'Editor leeren',
      'btn.import': 'Importieren',
      'btn.import_title': 'JSON-Datei importieren',
      'btn.url': 'URL',
      'btn.url_title': 'JSON von URL laden',
      'btn.filter_fields': 'Felder filtern',
      'btn.filter_fields_title': 'Felder filtern, um den Baum zu vereinfachen',
      'btn.search': 'Suchen',
      'btn.search_title': 'Suchen (Ctrl+F)',
      'btn.expand_all': 'Alle aufklappen',
      'btn.expand_all_title': 'Alle Knoten aufklappen',
      'btn.collapse_all': 'Alle zuklappen',
      'btn.collapse_all_title': 'Alle Knoten zuklappen',
      'btn.table': 'Tabelle',
      'btn.table_title': 'Zur Tabellenansicht wechseln',
      'btn.table_tree_title': 'Zur Baumansicht wechseln',
      'btn.download': 'Herunterladen',
      'label.export': 'Exportieren:',
      'export.choose': '— wählen —',
      'export.json': 'JSON (formatiert)',
      'export.json_min': 'JSON (minimiert)',
      'export.csv': 'CSV (Arrays)',
      'export.yaml': 'YAML',

      // Editor panel
      'editor.placeholder': 'JSON hier einfügen, Datei ablegen oder von URL laden…',
      'editor.aria': 'JSON-Eingabe-Editor',
      'validation.valid': 'Gültiges JSON',
      'validation.goto': 'Zum Fehler springen',
      'validation.dismiss_title': 'Schließen',
      'validation.dismiss_label': 'Schließen',

      // Tree panel
      'search.placeholder': 'Schlüssel oder Werte suchen…',
      'search.aria': 'JSON durchsuchen',
      'search.prev_title': 'Vorheriges Ergebnis',
      'search.prev_label': 'Vorheriges Ergebnis',
      'search.next_title': 'Nächstes Ergebnis',
      'search.next_label': 'Nächstes Ergebnis',
      'search.clear_title': 'Suche löschen',
      'search.clear_label': 'Suche löschen',
      'tree.aria': 'JSON-Baumansicht',
      'tree.invalid': 'Baum kann nicht gerendert werden: ungültiges JSON.',
      'tree.items_one': 'Element',
      'tree.items_many': 'Elemente',
      'tree.copy_title': 'Klicken, um Wert zu kopieren',

      // Table panel
      'table.invalid': 'Tabelle kann nicht gerendert werden: ungültiges JSON.',
      'table.empty': 'Keine JSON-Daten zum Anzeigen.',
      'table.empty_array': 'Leeres Array',
      'table.col_index': '#',
      'table.col_value': 'Wert',
      'table.col_type': 'Typ',
      'table.col_preview': 'Wert / Vorschau',

      // Diff panel
      'diff.left': 'Links',
      'diff.right': 'Rechts',
      'diff.left_placeholder': 'Erstes JSON einfügen…',
      'diff.right_placeholder': 'Zweites JSON einfügen…',
      'diff.left_aria': 'Diff linkes JSON',
      'diff.right_aria': 'Diff rechtes JSON',
      'btn.compare': 'Vergleichen',
      'diff.identical': 'Dokumente sind identisch.',
      'diff.left_invalid': 'Linkes JSON ist ungültig.',
      'diff.right_invalid': 'Rechtes JSON ist ungültig.',

      // Code Gen panel
      'codegen.label_lang': 'Sprache:',
      'codegen.label_root': 'Root-Klasse:',
      'codegen.root_placeholder': 'Root',
      'btn.generate': 'Generieren',
      'btn.codegen_copy': 'Kopieren',
      'codegen.no_json': '// Fehler: Kein gültiges JSON im Editor. Fügen Sie zuerst JSON im Editor-Tab ein.',
      'codegen.aria': 'Generierter Code',

      // URL dialog
      'dialog.url_title': 'JSON von URL laden',
      'dialog.url_note': 'Die URL muss CORS unterstützen oder ein öffentlicher API-Endpunkt sein.',
      'dialog.url_placeholder': 'https://api.beispiel.de/data.json',
      'dialog.url_aria': 'JSON-URL',
      'btn.cancel': 'Abbrechen',
      'btn.load': 'Laden',

      // Filter dialog
      'dialog.filter_title': 'Felder filtern',
      'dialog.filter_note': 'Felder abwählen, um sie aus der Baumansicht auszublenden. Arrays erscheinen einmalig.',
      'filter.presets_default': '-- Gespeicherte Filter --',
      'filter.save_title': 'Aktuelle Auswahl als Filter speichern',
      'filter.delete_title': 'Ausgewählten Filter löschen',
      'btn.select_all': 'Alle auswählen',
      'btn.deselect_all': 'Alle abwählen',
      'btn.reset': 'Zurücksetzen',
      'btn.apply': 'Anwenden',
      'filter.preset_name_placeholder': 'Filtername eingeben…',
      'btn.save': 'Speichern',
      'filter.btn_active': 'Filter aktiv ({n} Felder ausgewählt)',
      'filter.btn_default': 'Felder filtern, um den Baum zu vereinfachen',

      // Drop overlay
      'drop.message': 'JSON-Datei hier ablegen',

      // Alerts
      'alert.invalid_url': 'Bitte eine gültige URL eingeben.',
      'alert.https_only': 'Nur HTTP- und HTTPS-URLs werden unterstützt.',
      'alert.load_failed': 'URL konnte nicht geladen werden: {msg}\n\nStellen Sie sicher, dass die URL CORS unterstützt.',
      'alert.no_valid_json': 'Kein gültiges JSON zum Exportieren.',
      'alert.csv_note': 'CSV-Export funktioniert am besten mit Arrays von Objekten.',

      // Misc flash
      'flash.copied': 'Kopiert!',
      'flash.failed': 'Fehlgeschlagen',

      // Footer
      'footer.text': '© 2026 Format JSON · Kostenlos & Open Source · 100% client-seitig',

      // Validation bar (dynamic)
      'validation.error_loc': ' (Zeile {line}, Spalte {col})',

      // Search count
      'search.match_one': 'Treffer',
      'search.match_many': 'Treffer',
    },

    ru: {
      // Toolbar / nav
      'tab.editor': 'Редактор',
      'tab.viewer': 'Дерево',
      'tab.codegen': 'Код',
      'tab.diff': 'Сравнение',
      'nav.about': 'О нас',
      'nav.toggle_theme': 'Переключить тёмную/светлую тему',
      'nav.toggle_theme_label': 'Сменить тему',

      // Action bar
      'btn.format': 'Форматировать',
      'btn.format_title': 'Форматировать / Украсить JSON (Ctrl+Shift+F)',
      'btn.minify': 'Минифицировать',
      'btn.minify_title': 'Минифицировать JSON',
      'btn.copy': 'Копировать',
      'btn.copy_title': 'Копировать в буфер обмена',
      'btn.clear': 'Очистить',
      'btn.clear_title': 'Очистить редактор',
      'btn.import': 'Импорт',
      'btn.import_title': 'Импортировать JSON-файл',
      'btn.url': 'URL',
      'btn.url_title': 'Загрузить JSON по URL',
      'btn.filter_fields': 'Фильтр полей',
      'btn.filter_fields_title': 'Отфильтровать поля для упрощения дерева',
      'btn.search': 'Поиск',
      'btn.search_title': 'Поиск (Ctrl+F)',
      'btn.expand_all': 'Развернуть всё',
      'btn.expand_all_title': 'Развернуть все узлы',
      'btn.collapse_all': 'Свернуть всё',
      'btn.collapse_all_title': 'Свернуть все узлы',
      'btn.table': 'Таблица',
      'btn.table_title': 'Переключиться на таблицу',
      'btn.table_tree_title': 'Переключиться на дерево',
      'btn.download': 'Скачать',
      'label.export': 'Экспорт:',
      'export.choose': '— выбрать —',
      'export.json': 'JSON (форматированный)',
      'export.json_min': 'JSON (минифицированный)',
      'export.csv': 'CSV (массивы)',
      'export.yaml': 'YAML',

      // Editor panel
      'editor.placeholder': 'Вставьте JSON, перетащите файл или загрузите по URL…',
      'editor.aria': 'Редактор ввода JSON',
      'validation.valid': 'Корректный JSON',
      'validation.goto': 'Перейти к ошибке',
      'validation.dismiss_title': 'Закрыть',
      'validation.dismiss_label': 'Закрыть',

      // Tree panel
      'search.placeholder': 'Поиск ключей или значений…',
      'search.aria': 'Поиск в JSON',
      'search.prev_title': 'Предыдущее совпадение',
      'search.prev_label': 'Предыдущее совпадение',
      'search.next_title': 'Следующее совпадение',
      'search.next_label': 'Следующее совпадение',
      'search.clear_title': 'Очистить поиск',
      'search.clear_label': 'Очистить поиск',
      'tree.aria': 'Дерево JSON',
      'tree.invalid': 'Невозможно отобразить дерево: некорректный JSON.',
      'tree.items_one': 'элемент',
      'tree.items_many': 'элементов',
      'tree.copy_title': 'Нажмите, чтобы скопировать значение',

      // Table panel
      'table.invalid': 'Невозможно отобразить таблицу: некорректный JSON.',
      'table.empty': 'Нет данных JSON для отображения.',
      'table.empty_array': 'Пустой массив',
      'table.col_index': '#',
      'table.col_value': 'Значение',
      'table.col_type': 'Тип',
      'table.col_preview': 'Значение / Предпросмотр',

      // Diff panel
      'diff.left': 'Слева',
      'diff.right': 'Справа',
      'diff.left_placeholder': 'Вставьте первый JSON…',
      'diff.right_placeholder': 'Вставьте второй JSON…',
      'diff.left_aria': 'Diff левый JSON',
      'diff.right_aria': 'Diff правый JSON',
      'btn.compare': 'Сравнить',
      'diff.identical': 'Документы идентичны.',
      'diff.left_invalid': 'Левый JSON некорректен.',
      'diff.right_invalid': 'Правый JSON некорректен.',

      // Code Gen panel
      'codegen.label_lang': 'Язык:',
      'codegen.label_root': 'Корневой класс:',
      'codegen.root_placeholder': 'Root',
      'btn.generate': 'Сгенерировать',
      'btn.codegen_copy': 'Копировать',
      'codegen.no_json': '// Ошибка: нет корректного JSON в редакторе. Вставьте JSON во вкладке «Редактор».',
      'codegen.aria': 'Сгенерированный код',

      // URL dialog
      'dialog.url_title': 'Загрузить JSON по URL',
      'dialog.url_note': 'URL должен поддерживать CORS или быть публичным API-эндпоинтом.',
      'dialog.url_placeholder': 'https://api.primer.ru/data.json',
      'dialog.url_aria': 'JSON URL',
      'btn.cancel': 'Отмена',
      'btn.load': 'Загрузить',

      // Filter dialog
      'dialog.filter_title': 'Фильтр полей',
      'dialog.filter_note': 'Снимите флажки с полей, чтобы скрыть их в дереве. Массивы отображаются один раз.',
      'filter.presets_default': '-- Сохранённые фильтры --',
      'filter.save_title': 'Сохранить текущий выбор как фильтр',
      'filter.delete_title': 'Удалить выбранный фильтр',
      'btn.select_all': 'Выбрать всё',
      'btn.deselect_all': 'Снять выбор',
      'btn.reset': 'Сбросить',
      'btn.apply': 'Применить',
      'filter.preset_name_placeholder': 'Введите название фильтра…',
      'btn.save': 'Сохранить',
      'filter.btn_active': 'Фильтр активен ({n} полей выбрано)',
      'filter.btn_default': 'Отфильтровать поля для упрощения дерева',

      // Drop overlay
      'drop.message': 'Перетащите JSON-файл сюда',

      // Alerts
      'alert.invalid_url': 'Пожалуйста, введите корректный URL.',
      'alert.https_only': 'Поддерживаются только HTTP и HTTPS URL.',
      'alert.load_failed': 'Не удалось загрузить URL: {msg}\n\nУбедитесь, что URL поддерживает CORS.',
      'alert.no_valid_json': 'Нет корректного JSON для экспорта.',
      'alert.csv_note': 'Экспорт CSV лучше всего работает с массивами объектов.',

      // Misc flash
      'flash.copied': 'Скопировано!',
      'flash.failed': 'Ошибка',

      // Footer
      'footer.text': '© 2026 Format JSON · Бесплатно и открытый исходный код · 100% на стороне клиента',

      // Validation bar (dynamic)
      'validation.error_loc': ' (строка {line}, столбец {col})',

      // Search count
      'search.match_one': 'совпадение',
      'search.match_many': 'совпадений',
    },
  };

  const LANG_KEY = 'jv-lang';

  // Detect browser language and map to supported language
  function detectLang() {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && translations[saved]) return saved;
    const nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase().split('-')[0];
    if (translations[nav]) return nav;
    return 'en';
  }

  let currentLang = detectLang();

  function t(key, vars) {
    const dict = translations[currentLang] || translations['en'];
    let str = dict[key] !== undefined ? dict[key] : (translations['en'][key] || key);
    if (vars) {
      Object.keys(vars).forEach(k => {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
      });
    }
    return str;
  }

  function setLang(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    applyTranslations();
    // Update html lang attribute
    document.documentElement.lang = lang;
  }

  function getLang() {
    return currentLang;
  }

  function applyTranslations() {
    // Translate all elements with data-i18n attribute (text content)
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
    // Translate title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = t(el.dataset.i18nTitle);
    });
    // Translate placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    // Translate aria-label attributes
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });
    // Keep lang selector value in sync
    const sel = document.getElementById('lang-select');
    if (sel) sel.value = currentLang;
  }

  // Expose
  root.i18n = { t, setLang, getLang, applyTranslations, LANGUAGES: Object.keys(translations) };
})(window);
