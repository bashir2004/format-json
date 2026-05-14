/* ===================================================================
   JSON Viewer — Application Logic
   100% client-side. No frameworks, no build step.
   =================================================================== */

(function () {
  'use strict';

  // ── DOM refs ──────────────────────────────────────────────────────
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  const els = {
    tabs: $$('.tab'),
    panels: $$('.panel'),
    input: $('#json-input'),
    lineNumbers: $('#line-numbers'),
    validationBar: $('#validation-bar'),
    validationIcon: $('#validation-icon'),
    validationMsg: $('#validation-msg'),
    validationGoto: $('#validation-goto'),
    validationDismiss: $('#validation-dismiss'),
    treeContainer: $('#tree-container'),
    searchBar: $('#search-bar'),
    searchInput: $('#search-input'),
    searchCount: $('#search-count'),
    searchPrev: $('#search-prev'),
    searchNext: $('#search-next'),
    searchClear: $('#search-clear'),
    btnTheme: $('#btn-theme'),
    btnFormat: $('#btn-format'),
    btnMinify: $('#btn-minify'),
    btnCopy: $('#btn-copy'),
    btnClear: $('#btn-clear'),
    btnLoadFile: $('#btn-load-file'),
    btnLoadUrl: $('#btn-load-url'),
    fileInput: $('#file-input'),
    exportSelect: $('#export-select'),
    btnExport: $('#btn-export'),
    urlDialog: $('#url-dialog'),
    urlInput: $('#url-input'),
    urlCancel: $('#url-cancel'),
    urlLoad: $('#url-load'),
    dropOverlay: $('#drop-overlay'),
    diffLeft: $('#diff-left'),
    diffRight: $('#diff-right'),
    btnDiff: $('#btn-diff'),
    diffResult: $('#diff-result'),
    codegenLang: $('#codegen-lang'),
    codegenRootName: $('#codegen-rootname'),
    btnCodegen: $('#btn-codegen'),
    btnCodegenCopy: $('#btn-codegen-copy'),
    codegenOutput: $('#codegen-output'),
    btnFilter: $('#btn-filter'),
    filterDialog: $('#filter-dialog'),
    filterTree: $('#filter-tree'),
    filterSelectAll: $('#filter-select-all'),
    filterDeselectAll: $('#filter-deselect-all'),
    filterApply: $('#filter-apply'),
    filterCancel: $('#filter-cancel'),
    filterReset: $('#filter-reset'),
    presetSelect: $('#filter-preset-select'),
    presetSaveBtn: $('#filter-preset-save'),
    presetDeleteBtn: $('#filter-preset-delete'),
    presetNameRow: $('#filter-preset-name-row'),
    presetNameInput: $('#filter-preset-name'),
    presetConfirmBtn: $('#filter-preset-confirm'),
    presetNameCancel: $('#filter-preset-name-cancel'),
    presetToast: $('#filter-preset-toast'),
    tableContainer: $('#table-container'),
    btnTableView: $('#btn-table-view'),
  };

  let parsedJson = null;
  let currentTab = 'editor';
  let treeSearchMatches = [];
  let treeSearchIndex = -1;
  let tableViewActive = false;
  let activeFilter = null;   // Set of schema paths or null (no filter)
  let currentSchema = null;  // Extracted schema nodes for the filter modal

  // ── Theme ─────────────────────────────────────────────────────────
  function initTheme() {
    const saved = localStorage.getItem('jv-theme');
    const prefer = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(saved || prefer);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('jv-theme', theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  // ── Tabs ──────────────────────────────────────────────────────────
  function switchTab(tab) {
    currentTab = tab;
    els.tabs.forEach(t => {
      const isActive = t.dataset.tab === tab;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', isActive);
    });
    els.panels.forEach(p => {
      const isActive = p.id === `panel-${tab}`;
      p.classList.toggle('active', isActive);
      p.hidden = !isActive;
    });

    // Show/hide action groups based on tab
    const editorGroup = $('#action-group-editor');
    const treeGroup = $('#action-group-tree');
    editorGroup.hidden = (tab === 'viewer');
    treeGroup.hidden = (tab !== 'viewer');
    els.searchBar.hidden = true;
    els.searchBar.classList.remove('sticky-open');

    if (tab === 'viewer') {
      if (tableViewActive) {
        renderTableView();
      } else {
        renderTree();
      }
      // Keep tree-only controls in sync with current view mode
      ['#btn-filter', '#btn-search-toggle', '#btn-expand-all', '#btn-collapse-all'].forEach(id => {
        const el = $(id); if (el) el.hidden = tableViewActive;
      });
    }
    if (tab === 'diff') {
      els.diffLeft.value = els.input.value;
    }
  }

  // ── Line Numbers ──────────────────────────────────────────────────
  function updateLineNumbers() {
    const text = els.input.value;
    const count = text ? text.split('\n').length : 1;
    const nums = [];
    for (let i = 1; i <= count; i++) nums.push(i);
    els.lineNumbers.textContent = nums.join('\n');
  }

  function syncScroll() {
    els.lineNumbers.scrollTop = els.input.scrollTop;
  }

  // ── Validation ────────────────────────────────────────────────────
  let validationError = null;

  function validate(text) {
    if (!text.trim()) {
      parsedJson = null;
      validationError = null;
      showValidation(null);
      return;
    }
    try {
      parsedJson = JSON.parse(text);
      validationError = null;
      showValidation({ valid: true });
      updateLineNumbers();
    } catch (e) {
      parsedJson = null;
      const errorInfo = parseJsonError(e.message, text);
      validationError = errorInfo;
      showValidation({ valid: false, error: errorInfo });
      highlightErrorLine(errorInfo.line);
    }
  }

  function parseJsonError(message, text) {
    let line = null, column = null, position = null;

    // Chrome/Edge: "at position 45"
    const posMatch = message.match(/position\s+(\d+)/i);
    // Firefox: "at line 3 column 10"
    const lineColMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
    // Safari: "at character 45"
    const charMatch = message.match(/character\s+(\d+)/i);

    if (lineColMatch) {
      line = parseInt(lineColMatch[1]);
      column = parseInt(lineColMatch[2]);
    } else if (posMatch) {
      position = parseInt(posMatch[1]);
    } else if (charMatch) {
      position = parseInt(charMatch[1]);
    }

    // Convert absolute position to line/column
    if (position !== null && line === null) {
      const upToPos = text.substring(0, position);
      const lines = upToPos.split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    // Clean up the error message
    let cleanMsg = message
      .replace(/^JSON\.parse:\s*/i, '')
      .replace(/^SyntaxError:\s*/i, '');

    return { message: cleanMsg, line, column, position };
  }

  function showValidation(result) {
    if (!result) {
      els.validationBar.hidden = true;
      return;
    }
    els.validationBar.hidden = false;
    if (result.valid) {
      els.validationBar.className = 'validation-bar valid';
      els.validationIcon.textContent = '\u2713';
      els.validationMsg.textContent = 'Valid JSON';
      els.validationGoto.hidden = true;
      els.validationGoto.style.display = 'none';
    } else {
      els.validationBar.className = 'validation-bar invalid';
      els.validationIcon.textContent = '\u2717';
      const loc = result.error.line ? ` (line ${result.error.line}, col ${result.error.column || '?'})` : '';
      els.validationMsg.textContent = `${result.error.message}${loc}`;
      els.validationGoto.hidden = !result.error.line;
      els.validationGoto.style.display = result.error.line ? '' : 'none';
    }
  }

  function highlightErrorLine(lineNum) {
    if (!lineNum) return;
    const text = els.input.value;
    const count = text ? text.split('\n').length : 1;
    const nums = [];
    for (let i = 1; i <= count; i++) {
      nums.push(i === lineNum ? '\u25CF' + i : ' ' + i);
    }
    els.lineNumbers.textContent = nums.join('\n');
  }

  function goToError() {
    if (!validationError || !validationError.line) return;
    const text = els.input.value;
    const lines = text.split('\n');
    let pos = 0;
    for (let i = 0; i < validationError.line - 1 && i < lines.length; i++) {
      pos += lines[i].length + 1;
    }
    pos += (validationError.column || 1) - 1;
    els.input.focus();
    els.input.setSelectionRange(pos, Math.min(pos + 1, text.length));
    // Scroll to error line
    const lineHeight = 19.5;
    els.input.scrollTop = Math.max(0, (validationError.line - 5) * lineHeight);
  }

  function computeStats(text) {
    const bytes = new Blob([text]).size;
    const lines = text.split('\n').length;
    const sizeStr = bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
    return `${lines} lines · ${sizeStr}`;
  }

  // ── Format / Minify ───────────────────────────────────────────────
  function formatJson() {
    if (!parsedJson && !els.input.value.trim()) return;
    try {
      const obj = JSON.parse(els.input.value);
      els.input.value = JSON.stringify(obj, null, 2);
      updateLineNumbers();
      validate(els.input.value);
    } catch (_) { /* already flagged invalid */ }
  }

  function minifyJson() {
    if (!parsedJson && !els.input.value.trim()) return;
    try {
      const obj = JSON.parse(els.input.value);
      els.input.value = JSON.stringify(obj);
      updateLineNumbers();
      validate(els.input.value);
    } catch (_) {}
  }

  // ── Clipboard ─────────────────────────────────────────────────────
  async function copyToClipboard() {
    if (!els.input.value) return;
    try {
      await navigator.clipboard.writeText(els.input.value);
      flashButton(els.btnCopy, 'Copied!');
    } catch (_) {
      els.input.select();
      document.execCommand('copy');
      flashButton(els.btnCopy, 'Copied!');
    }
  }

  function flashButton(btn, msg) {
    const orig = btn.textContent;
    btn.textContent = msg;
    setTimeout(() => { btn.textContent = orig; }, 1200);
  }

  // ── File Import ───────────────────────────────────────────────────
  function handleFileImport(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      els.input.value = reader.result;
      updateLineNumbers();
      validate(els.input.value);
    };
    reader.readAsText(file);
  }

  // ── URL Load ──────────────────────────────────────────────────────
  async function loadFromUrl(url) {
    // Basic URL validation — only allow http/https
    let parsed;
    try {
      parsed = new URL(url);
    } catch (_) {
      alert('Please enter a valid URL.');
      return;
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      alert('Only HTTP and HTTPS URLs are supported.');
      return;
    }
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const text = await resp.text();
      els.input.value = text;
      updateLineNumbers();
      validate(els.input.value);
      switchTab('editor');
    } catch (e) {
      alert(`Failed to load URL: ${e.message}\n\nMake sure the URL supports CORS.`);
    }
  }

  // ── Drag & Drop ───────────────────────────────────────────────────
  function initDragDrop() {
    let dragCounter = 0;
    document.addEventListener('dragenter', e => {
      e.preventDefault();
      dragCounter++;
      els.dropOverlay.hidden = false;
    });
    document.addEventListener('dragleave', e => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        els.dropOverlay.hidden = true;
      }
    });
    document.addEventListener('dragover', e => e.preventDefault());
    document.addEventListener('drop', e => {
      e.preventDefault();
      dragCounter = 0;
      els.dropOverlay.hidden = true;
      const file = e.dataTransfer.files[0];
      if (file) handleFileImport(file);
    });
  }

  // ── Tree Viewer ───────────────────────────────────────────────────
  const MAX_INLINE_LENGTH = 80;
  const INITIAL_EXPAND_DEPTH = 3;

  function renderTree() {
    els.treeContainer.innerHTML = '';
    if (parsedJson === null) {
      try {
        parsedJson = JSON.parse(els.input.value);
      } catch (_) {
        els.treeContainer.innerHTML = '<div style="padding:24px;color:var(--danger);">Cannot render tree: invalid JSON.</div>';
        return;
      }
    }
    const root = buildTreeNode('root', parsedJson, 0, []);
    root.classList.add('root');
    els.treeContainer.appendChild(root);
  }

  function buildTreeNode(key, value, depth, path) {
    const node = document.createElement('div');
    node.className = 'tree-node';
    node.dataset.path = JSON.stringify(path);

    const row = document.createElement('div');
    row.className = 'tree-row';

    const type = getType(value);
    const isExpandable = type === 'object' || type === 'array';

    if (isExpandable) {
      const toggle = document.createElement('button');
      toggle.className = 'tree-toggle';
      toggle.innerHTML = '&#9660;';
      toggle.setAttribute('aria-label', 'Toggle expand');
      if (depth >= INITIAL_EXPAND_DEPTH) toggle.classList.add('collapsed');

      const childrenDiv = document.createElement('div');
      childrenDiv.className = 'tree-children';
      if (depth >= INITIAL_EXPAND_DEPTH) childrenDiv.classList.add('collapsed');

      toggle.addEventListener('click', () => {
        toggle.classList.toggle('collapsed');
        childrenDiv.classList.toggle('collapsed');
      });

      row.appendChild(toggle);

      // key
      if (key !== 'root') {
        const keySpan = document.createElement('span');
        keySpan.className = 'tree-key';
        keySpan.textContent = typeof key === 'number' ? `[${key}]` : `"${key}"`;
        row.appendChild(keySpan);
        const colon = document.createElement('span');
        colon.className = 'tree-colon';
        colon.textContent = ': ';
        row.appendChild(colon);
      }

      // bracket + size
      let objEntries = type === 'object' ? Object.entries(value) : null;
      if (activeFilter && type === 'object') {
        objEntries = objEntries.filter(([k]) => isPathVisible(toSchemaPath([...path, k])));
      }
      const count = type === 'array' ? value.length : objEntries.length;
      const bracket = document.createElement('span');
      bracket.className = 'tree-bracket';
      bracket.textContent = type === 'array' ? '[' : '{';
      row.appendChild(bracket);
      const size = document.createElement('span');
      size.className = 'tree-size';
      size.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
      row.appendChild(size);

      node.appendChild(row);

      // children
      if (type === 'array') {
        value.forEach((item, i) => {
          childrenDiv.appendChild(buildTreeNode(i, item, depth + 1, [...path, i]));
        });
      } else {
        objEntries.forEach(([k, v]) => {
          childrenDiv.appendChild(buildTreeNode(k, v, depth + 1, [...path, k]));
        });
      }

      // closing bracket
      const closingRow = document.createElement('div');
      closingRow.className = 'tree-row';
      closingRow.innerHTML = `<span class="tree-toggle-placeholder"></span><span class="tree-bracket">${type === 'array' ? ']' : '}'}</span>`;
      childrenDiv.appendChild(closingRow);

      node.appendChild(childrenDiv);
    } else {
      // leaf
      const placeholder = document.createElement('span');
      placeholder.className = 'tree-toggle-placeholder';
      row.appendChild(placeholder);

      if (key !== 'root') {
        const keySpan = document.createElement('span');
        keySpan.className = 'tree-key';
        keySpan.textContent = typeof key === 'number' ? `[${key}]` : `"${key}"`;
        row.appendChild(keySpan);
        const colon = document.createElement('span');
        colon.className = 'tree-colon';
        colon.textContent = ': ';
        row.appendChild(colon);
      }

      const valSpan = document.createElement('span');
      valSpan.className = `tree-value tree-${type}`;
      valSpan.textContent = formatValue(value, type);
      valSpan.title = 'Click to copy value';
      valSpan.addEventListener('click', () => {
        navigator.clipboard.writeText(type === 'string' ? value : JSON.stringify(value));
        valSpan.style.outline = '1px solid var(--accent)';
        setTimeout(() => { valSpan.style.outline = ''; }, 600);
      });
      row.appendChild(valSpan);
      node.appendChild(row);
    }

    return node;
  }

  function getType(val) {
    if (val === null) return 'null';
    if (Array.isArray(val)) return 'array';
    return typeof val; // 'object', 'string', 'number', 'boolean'
  }

  function formatValue(val, type) {
    switch (type) {
      case 'string': return `"${val}"`;
      case 'null': return 'null';
      default: return String(val);
    }
  }

  function scrollToPath(path) {
    const pathStr = JSON.stringify(path);
    const node = els.treeContainer.querySelector(`[data-path='${CSS.escape(pathStr)}']`);
    if (node) {
      // expand parents
      let parent = node.parentElement;
      while (parent && parent !== els.treeContainer) {
        if (parent.classList.contains('tree-children') && parent.classList.contains('collapsed')) {
          parent.classList.remove('collapsed');
          const toggle = parent.previousElementSibling?.querySelector('.tree-toggle');
          if (toggle) toggle.classList.remove('collapsed');
        }
        parent = parent.parentElement;
      }
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const row = node.querySelector('.tree-row');
      if (row) {
        row.classList.add('highlight');
        setTimeout(() => row.classList.remove('highlight'), 1500);
      }
    }
  }

  // ── Table View ────────────────────────────────────────────────────
  function toggleTableView() {
    tableViewActive = !tableViewActive;
    els.treeContainer.hidden = tableViewActive;
    els.tableContainer.hidden = !tableViewActive;

    const treeOnlyIds = ['#btn-filter', '#btn-search-toggle', '#btn-expand-all', '#btn-collapse-all'];
    treeOnlyIds.forEach(id => { const el = $(id); if (el) el.hidden = tableViewActive; });

    if (tableViewActive) {
      els.searchBar.hidden = true;
      els.searchBar.classList.remove('sticky-open');
      renderTableView();
    } else {
      renderTree();
    }

    els.btnTableView.classList.toggle('active-filter', tableViewActive);
    els.btnTableView.title = tableViewActive ? 'Switch to tree view' : 'Switch to table view';
  }

  function renderTableView() {
    els.tableContainer.innerHTML = '';
    let data = parsedJson;
    if (!data) {
      try { data = JSON.parse(els.input.value); }
      catch (_) {
        els.tableContainer.innerHTML = '<div class="jt-empty-msg" style="color:var(--danger);">Cannot render table: invalid JSON.</div>';
        return;
      }
    }
    if (data === null || data === undefined) {
      els.tableContainer.innerHTML = '<div class="jt-empty-msg">No JSON data to display.</div>';
      return;
    }
    const wrap = document.createElement('div');
    wrap.className = 'jt-wrap';
    wrap.appendChild(buildTableView(data, []));
    els.tableContainer.appendChild(wrap);
  }

  function buildTableView(data, path) {
    const type = getType(data);
    if (type === 'array') {
      if (data.length === 0) return jtEmptyNode('Empty array');
      const allObjs = data.every(item => getType(item) === 'object');
      if (allObjs) return buildObjectArrayTable(data, path);
      const allPrim = data.every(item => getType(item) !== 'object' && getType(item) !== 'array');
      if (allPrim) return buildPrimitiveArrayTable(data, path);
      return buildMixedArrayTable(data, path);
    }
    if (type === 'object') return buildObjectTable(data, path);
    const div = document.createElement('div');
    div.className = 'jt-scalar-root';
    renderCellValue(div, data, path);
    return div;
  }

  function buildObjectArrayTable(data, path) {
    // Collect union of all keys preserving first-seen order
    const seen = new Map();
    data.forEach(item => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        Object.keys(item).forEach(k => { if (!seen.has(k)) seen.set(k, true); });
      }
    });
    const keys = [...seen.keys()];

    const wrapper = document.createElement('div');
    wrapper.className = 'jt-overflow-wrap';
    const table = document.createElement('table');
    table.className = 'jt-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    hr.appendChild(jtTh('#', 'jt-th-index'));
    keys.forEach(k => hr.appendChild(jtTh(k)));
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach((item, i) => {
      const row = document.createElement('tr');
      row.className = 'jt-row';

      const idxTd = document.createElement('td');
      idxTd.className = 'jt-td jt-td-index';
      idxTd.textContent = i;
      row.appendChild(idxTd);

      keys.forEach(k => {
        const td = document.createElement('td');
        td.className = 'jt-td';
        if (!item || !(k in item)) {
          td.classList.add('jt-missing');
          td.textContent = '—';
        } else {
          renderCellValue(td, item[k], [...path, i, k]);
        }
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    wrapper.appendChild(table);
    return wrapper;
  }

  function buildObjectTable(data, path) {
    const keys = Object.keys(data);
    const wrapper = document.createElement('div');
    wrapper.className = 'jt-overflow-wrap';
    const table = document.createElement('table');
    table.className = 'jt-table';

    // Keys become column headers
    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    keys.forEach(k => hr.appendChild(jtTh(k)));
    thead.appendChild(hr);
    table.appendChild(thead);

    // Values fill a single row
    const tbody = document.createElement('tbody');
    const row = document.createElement('tr');
    row.className = 'jt-row';
    keys.forEach(k => {
      const td = document.createElement('td');
      td.className = 'jt-td';
      renderCellValue(td, data[k], [...path, k]);
      row.appendChild(td);
    });
    tbody.appendChild(row);
    table.appendChild(tbody);
    wrapper.appendChild(table);
    return wrapper;
  }

  function buildPrimitiveArrayTable(data, path) {
    const wrapper = document.createElement('div');
    wrapper.className = 'jt-overflow-wrap';
    const table = document.createElement('table');
    table.className = 'jt-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    hr.appendChild(jtTh('#', 'jt-th-index'));
    hr.appendChild(jtTh('Value'));
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach((v, i) => {
      const row = document.createElement('tr');
      row.className = 'jt-row';

      const idxTd = document.createElement('td');
      idxTd.className = 'jt-td jt-td-index';
      idxTd.textContent = i;
      row.appendChild(idxTd);

      const valTd = document.createElement('td');
      valTd.className = 'jt-td';
      renderCellValue(valTd, v, [...path, i]);
      row.appendChild(valTd);

      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    wrapper.appendChild(table);
    return wrapper;
  }

  function buildMixedArrayTable(data, path) {
    const wrapper = document.createElement('div');
    wrapper.className = 'jt-overflow-wrap';
    const table = document.createElement('table');
    table.className = 'jt-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    hr.appendChild(jtTh('#', 'jt-th-index'));
    hr.appendChild(jtTh('Type'));
    hr.appendChild(jtTh('Value / Preview'));
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach((v, i) => {
      const row = document.createElement('tr');
      row.className = 'jt-row';

      const idxTd = document.createElement('td');
      idxTd.className = 'jt-td jt-td-index';
      idxTd.textContent = i;
      row.appendChild(idxTd);

      const typeTd = document.createElement('td');
      typeTd.className = 'jt-td jt-type-cell';
      const typeBadge = document.createElement('span');
      typeBadge.className = `jt-type-badge jt-type-${getType(v)}`;
      typeBadge.textContent = getType(v);
      typeTd.appendChild(typeBadge);
      row.appendChild(typeTd);

      const valTd = document.createElement('td');
      valTd.className = 'jt-td';
      renderCellValue(valTd, v, [...path, i]);
      row.appendChild(valTd);

      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    wrapper.appendChild(table);
    return wrapper;
  }

  function renderCellValue(container, value, path) {
    const type = getType(value);
    if (type === 'null') {
      const s = document.createElement('span');
      s.className = 'jt-null';
      s.textContent = 'null';
      container.appendChild(s);
    } else if (type === 'string') {
      const s = document.createElement('span');
      s.className = 'jt-string';
      s.textContent = value.length > 120 ? value.slice(0, 120) + '\u2026' : value;
      if (value.length > 120) s.title = value;
      container.appendChild(s);
    } else if (type === 'number') {
      const s = document.createElement('span');
      s.className = 'jt-number';
      s.textContent = value;
      container.appendChild(s);
    } else if (type === 'boolean') {
      const s = document.createElement('span');
      s.className = `jt-boolean jt-bool-${value}`;
      s.textContent = String(value);
      container.appendChild(s);
    } else if (type === 'array') {
      if (value.length === 0) {
        const s = document.createElement('span');
        s.className = 'jt-empty';
        s.textContent = '[ ]';
        container.appendChild(s);
      } else {
        const allPrim = value.every(v => getType(v) !== 'object' && getType(v) !== 'array');
        if (allPrim && value.length <= 7) {
          const pillsWrap = document.createElement('div');
          pillsWrap.className = 'jt-pills';
          value.forEach(v => {
            const pill = document.createElement('span');
            pill.className = `jt-pill jt-pill-${getType(v)}`;
            pill.textContent = String(v);
            pillsWrap.appendChild(pill);
          });
          container.appendChild(pillsWrap);
        } else {
          container.appendChild(createExpandBadge(`[ ${value.length} ]`, value, path));
        }
      }
    } else if (type === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        const s = document.createElement('span');
        s.className = 'jt-empty';
        s.textContent = '{ }';
        container.appendChild(s);
      } else {
        container.appendChild(createExpandBadge(`{ ${keys.length} }`, value, path));
      }
    }
  }

  function createExpandBadge(label, value, path) {
    const badge = document.createElement('button');
    badge.className = 'jt-badge';
    badge.type = 'button';
    badge.innerHTML = `<span>${escapeHtml(label)}</span><span class="jt-badge-icon">&#9658;</span>`;

    badge.addEventListener('click', () => {
      const row = badge.closest('tr');
      if (!row) return;
      const colspan = row.children.length;
      const pathKey = JSON.stringify(path);

      const next = row.nextElementSibling;
      if (next && next.classList.contains('jt-expand-row') && next.dataset.expandPath === pathKey) {
        next.remove();
        badge.classList.remove('jt-badge-open');
        badge.querySelector('.jt-badge-icon').innerHTML = '&#9658;';
        return;
      }

      badge.classList.add('jt-badge-open');
      badge.querySelector('.jt-badge-icon').innerHTML = '&#9660;';

      const expandRow = document.createElement('tr');
      expandRow.className = 'jt-expand-row';
      expandRow.dataset.expandPath = pathKey;

      const expandTd = document.createElement('td');
      expandTd.className = 'jt-expand-td';
      expandTd.colSpan = colspan;

      if (path.length > 0) {
        const bc = document.createElement('div');
        bc.className = 'jt-expand-bc';
        bc.textContent = path.map(p => typeof p === 'number' ? `[${p}]` : p).join(' \u203a ');
        expandTd.appendChild(bc);
      }

      const nested = document.createElement('div');
      nested.className = 'jt-nested-wrap';
      nested.appendChild(buildTableView(value, path));
      expandTd.appendChild(nested);

      expandRow.appendChild(expandTd);
      row.insertAdjacentElement('afterend', expandRow);
    });

    return badge;
  }

  function jtTh(text, extraClass) {
    const th = document.createElement('th');
    th.className = 'jt-th' + (extraClass ? ' ' + extraClass : '');
    th.textContent = text;
    return th;
  }

  function jtEmptyNode(msg) {
    const div = document.createElement('div');
    div.className = 'jt-empty-msg';
    div.textContent = msg;
    return div;
  }

  // ── Search ────────────────────────────────────────────────────────
  function performTreeSearch(query) {
    // Clear previous highlights
    $$('.tree-row.highlight', els.treeContainer).forEach(r => r.classList.remove('highlight'));
    treeSearchMatches = [];
    treeSearchIndex = -1;

    if (!query.trim()) {
      els.searchCount.textContent = '';
      return;
    }

    const rows = $$('.tree-row', els.treeContainer);
    const lowerQuery = query.toLowerCase();

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      if (text.includes(lowerQuery)) {
        treeSearchMatches.push(row);
      }
    });

    els.searchCount.textContent = `${treeSearchMatches.length} match${treeSearchMatches.length !== 1 ? 'es' : ''}`;
    if (treeSearchMatches.length > 0) {
      treeSearchIndex = 0;
      highlightTreeMatch();
    }
  }

  function highlightTreeMatch() {
    $$('.tree-row.highlight', els.treeContainer).forEach(r => r.classList.remove('highlight'));
    if (treeSearchMatches.length === 0) return;
    const row = treeSearchMatches[treeSearchIndex];
    // Expand parents
    let parent = row.closest('.tree-children.collapsed');
    while (parent) {
      parent.classList.remove('collapsed');
      const toggle = parent.previousElementSibling?.querySelector('.tree-toggle');
      if (toggle) toggle.classList.remove('collapsed');
      parent = parent.parentElement?.closest('.tree-children.collapsed');
    }
    row.classList.add('highlight');
    row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    els.searchCount.textContent = `${treeSearchIndex + 1}/${treeSearchMatches.length}`;

    // Keep search UX stable while navigating matches.
    if (!els.searchBar.hidden) {
      const caretPos = els.searchInput.value.length;
      els.searchInput.focus({ preventScroll: true });
      els.searchInput.setSelectionRange(caretPos, caretPos);
    }
  }

  // ── Diff ──────────────────────────────────────────────────────────
  function computeDiff() {
    let left, right;
    try {
      left = JSON.parse(els.diffLeft.value);
    } catch (_) {
      alert('Left JSON is invalid.');
      return;
    }
    try {
      right = JSON.parse(els.diffRight.value);
    } catch (_) {
      alert('Right JSON is invalid.');
      return;
    }
    const diffs = diffObjects(left, right, '');
    els.diffResult.hidden = false;
    if (diffs.length === 0) {
      els.diffResult.innerHTML = '<div style="padding:8px;color:var(--success);font-weight:600;">Documents are identical.</div>';
    } else {
      els.diffResult.innerHTML = diffs.map(d => {
        const cls = d.type === 'added' ? 'added' : d.type === 'removed' ? 'removed' : 'changed';
        let text = '';
        if (d.type === 'added') text = `+ ${d.path}: ${JSON.stringify(d.value)}`;
        else if (d.type === 'removed') text = `- ${d.path}: ${JSON.stringify(d.value)}`;
        else text = `~ ${d.path}: ${JSON.stringify(d.oldValue)} → ${JSON.stringify(d.newValue)}`;
        return `<div class="diff-line ${cls}">${escapeHtml(text)}</div>`;
      }).join('');
    }
  }

  function diffObjects(a, b, prefix) {
    const diffs = [];
    const aKeys = new Set(typeof a === 'object' && a !== null ? Object.keys(a) : []);
    const bKeys = new Set(typeof b === 'object' && b !== null ? Object.keys(b) : []);

    if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b) || a === null !== (b === null)) {
      diffs.push({ type: 'changed', path: prefix || '$', oldValue: a, newValue: b });
      return diffs;
    }

    if (typeof a !== 'object' || a === null) {
      if (a !== b) diffs.push({ type: 'changed', path: prefix || '$', oldValue: a, newValue: b });
      return diffs;
    }

    // All keys
    const allKeys = new Set([...aKeys, ...bKeys]);
    for (const key of allKeys) {
      const path = prefix ? `${prefix}.${key}` : `$.${key}`;
      if (!aKeys.has(key)) {
        diffs.push({ type: 'added', path, value: b[key] });
      } else if (!bKeys.has(key)) {
        diffs.push({ type: 'removed', path, value: a[key] });
      } else {
        diffs.push(...diffObjects(a[key], b[key], path));
      }
    }
    return diffs;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Field Filter ──────────────────────────────────────────────────
  // Check if a schema path (or any descendant) is in the active filter
  function isPathVisible(schemaPath) {
    if (!activeFilter) return true;
    if (activeFilter.has(schemaPath)) return true;
    const dotPrefix = schemaPath + '.';
    const arrPrefix = schemaPath + '[]';
    for (const p of activeFilter) {
      if (p.startsWith(dotPrefix) || p.startsWith(arrPrefix)) return true;
    }
    return false;
  }

  // Convert actual path array (e.g. ["users",0,"name"]) to schema path ("users[].name")
  function toSchemaPath(pathArray) {
    const parts = [];
    for (let i = 0; i < pathArray.length; i++) {
      if (typeof pathArray[i] === 'number') {
        if (i === 0) parts.push('[]');
        // Consecutive numbers = nested arrays; append [] for each extra level
        else if (i > 0 && typeof pathArray[i - 1] === 'number' && parts.length > 0) {
          parts[parts.length - 1] += '[]';
        }
        continue;
      }
      let part = pathArray[i];
      if (i + 1 < pathArray.length && typeof pathArray[i + 1] === 'number') {
        part += '[]';
      }
      parts.push(part);
    }
    return parts.join('.');
  }

  // Extract schema structure — arrays appear once (first element), objects enumerate keys
  function extractSchema(obj, parentPath) {
    const nodes = [];
    for (const [key, val] of Object.entries(obj)) {
      const childType = getType(val);
      const path = parentPath ? parentPath + '.' + key : key;
      if (childType === 'array') {
        let children = [];
        // Unwrap nested arrays (e.g. array of arrays) to find object items
        let inner = val;
        let suffix = '[]';
        while (inner.length > 0 && getType(inner[0]) === 'array') {
          inner = inner[0];
          suffix += '[]';
        }
        if (inner.length > 0 && getType(inner[0]) === 'object') {
          children = extractSchema(inner[0], path + suffix);
        }
        nodes.push({ key, path, type: 'array', children });
      } else if (childType === 'object') {
        nodes.push({ key, path, type: 'object', children: extractSchema(val, path) });
      } else {
        nodes.push({ key, path, type: 'leaf', children: [] });
      }
    }
    return nodes;
  }

  function extractSchemaFromData(data) {
    const type = getType(data);
    if (type === 'array' && data.length > 0 && getType(data[0]) === 'object') {
      return extractSchema(data[0], '[]');
    }
    if (type === 'object') {
      return extractSchema(data, '');
    }
    return [];
  }

  function collectAllPaths(nodes) {
    const paths = new Set();
    (function walk(list) {
      list.forEach(n => { paths.add(n.path); walk(n.children); });
    })(nodes);
    return paths;
  }

  // Open filter dialog — build schema tree with checkboxes
  function openFilterDialog() {
    let data = parsedJson;
    if (!data) {
      try { data = JSON.parse(els.input.value); } catch (_) { return; }
    }
    currentSchema = extractSchemaFromData(data);
    if (currentSchema.length === 0) return;

    els.filterTree.innerHTML = '';
    renderFilterTree(currentSchema, els.filterTree, activeFilter);
    populatePresetDropdown();
    hidePresetNameInput();
    els.filterDialog.showModal();
  }

  function renderFilterTree(nodes, container, currentFilter) {
    nodes.forEach(node => {
      const item = document.createElement('div');
      item.className = 'filter-node';

      const row = document.createElement('div');
      row.className = 'filter-row';

      let childrenDiv;
      if (node.children.length > 0) {
        const toggle = document.createElement('button');
        toggle.className = 'filter-toggle';
        toggle.type = 'button';
        toggle.innerHTML = '&#9660;';
        childrenDiv = document.createElement('div');
        childrenDiv.className = 'filter-children';
        toggle.addEventListener('click', () => {
          toggle.classList.toggle('collapsed');
          childrenDiv.classList.toggle('collapsed');
        });
        row.appendChild(toggle);
      } else {
        const ph = document.createElement('span');
        ph.className = 'filter-toggle-placeholder';
        row.appendChild(ph);
      }

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'filter-checkbox';
      checkbox.dataset.path = node.path;
      checkbox.checked = currentFilter ? currentFilter.has(node.path) : true;

      checkbox.addEventListener('change', () => {
        const checked = checkbox.checked;
        item.querySelectorAll('.filter-checkbox').forEach(cb => {
          cb.checked = checked;
          cb.indeterminate = false;
        });
        updateFilterAncestors(item);
      });

      row.appendChild(checkbox);

      const label = document.createElement('span');
      label.className = 'filter-label';
      label.textContent = node.key;
      label.addEventListener('click', () => {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change'));
      });
      row.appendChild(label);

      if (node.type === 'array' || node.type === 'object') {
        const badge = document.createElement('span');
        badge.className = 'filter-type-badge';
        badge.textContent = node.type === 'array' ? '[ ]' : '{ }';
        row.appendChild(badge);
      }

      item.appendChild(row);

      if (childrenDiv) {
        renderFilterTree(node.children, childrenDiv, currentFilter);
        item.appendChild(childrenDiv);
      }

      container.appendChild(item);
    });

    // Set indeterminate states after rendering
    updateFilterIndeterminate(container);
  }

  function updateFilterIndeterminate(container) {
    // Process innermost nodes first — querySelectorAll returns document order,
    // so reverse to get bottom-up
    const allNodes = [...container.querySelectorAll('.filter-node')].reverse();
    allNodes.forEach(node => {
      const childCbs = node.querySelectorAll(':scope > .filter-children .filter-checkbox');
      if (childCbs.length === 0) return;
      const parentCb = node.querySelector(':scope > .filter-row > .filter-checkbox');
      if (!parentCb) return;
      const total = childCbs.length;
      const checked = [...childCbs].filter(cb => cb.checked).length;
      if (checked === 0) { parentCb.checked = false; parentCb.indeterminate = false; }
      else if (checked === total) { parentCb.checked = true; parentCb.indeterminate = false; }
      else { parentCb.checked = false; parentCb.indeterminate = true; }
    });
  }

  function updateFilterAncestors(element) {
    const parent = element.parentElement?.closest('.filter-node');
    if (!parent) return;
    const parentCb = parent.querySelector(':scope > .filter-row > .filter-checkbox');
    if (!parentCb) return;
    const childCbs = parent.querySelectorAll(':scope > .filter-children .filter-checkbox');
    const total = childCbs.length;
    const checked = [...childCbs].filter(cb => cb.checked).length;
    if (checked === 0) { parentCb.checked = false; parentCb.indeterminate = false; }
    else if (checked === total) { parentCb.checked = true; parentCb.indeterminate = false; }
    else { parentCb.checked = false; parentCb.indeterminate = true; }
    updateFilterAncestors(parent);
  }

  function applyFilter() {
    const allPaths = collectAllPaths(currentSchema);
    const checkedPaths = new Set();
    els.filterTree.querySelectorAll('.filter-checkbox').forEach(cb => {
      if (cb.checked) checkedPaths.add(cb.dataset.path);
    });
    activeFilter = checkedPaths.size === allPaths.size ? null : checkedPaths;
    els.filterDialog.close();
    renderTree();
    updateFilterBtnState();
  }

  function resetFilter() {
    activeFilter = null;
    els.filterDialog.close();
    renderTree();
    updateFilterBtnState();
  }

  function updateFilterBtnState() {
    if (activeFilter) {
      els.btnFilter.classList.add('active-filter');
      els.btnFilter.title = 'Filter active (' + activeFilter.size + ' fields selected)';
    } else {
      els.btnFilter.classList.remove('active-filter');
      els.btnFilter.title = 'Filter fields to simplify tree';
    }
  }

  // ── Filter Presets (localStorage) ─────────────────────────────────
  const PRESET_STORAGE_KEY = 'jv_filter_presets';

  function loadPresets() {
    try {
      return JSON.parse(localStorage.getItem(PRESET_STORAGE_KEY)) || [];
    } catch (_) { return []; }
  }

  function savePresetsToStorage(presets) {
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
  }

  function populatePresetDropdown() {
    const presets = loadPresets();
    const sel = els.presetSelect;
    sel.innerHTML = '<option value="">-- Saved Presets --</option>';
    // Sort by most recently saved first
    const sorted = presets.map((p, i) => ({ ...p, _idx: i })).sort((a, b) => b.ts - a.ts);
    sorted.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p._idx;
      const date = new Date(p.ts).toLocaleDateString();
      opt.textContent = p.name + ' (' + date + ')';
      sel.appendChild(opt);
    });
    els.presetDeleteBtn.disabled = true;
  }

  function showPresetNameInput() {
    // If a preset is already selected, save directly under that name
    const idx = parseInt(els.presetSelect.value, 10);
    if (!isNaN(idx)) {
      const presets = loadPresets();
      if (presets[idx]) {
        savePresetByName(presets[idx].name);
        return;
      }
    }
    els.presetNameRow.hidden = false;
    els.presetNameInput.value = '';
    els.presetNameInput.focus();
  }

  function hidePresetNameInput() {
    els.presetNameRow.hidden = true;
    els.presetNameInput.value = '';
  }

  function saveCurrentAsPreset() {
    const name = els.presetNameInput.value.trim();
    if (!name) { els.presetNameInput.focus(); return; }
    savePresetByName(name);
    hidePresetNameInput();
  }

  function savePresetByName(name) {
    const excluded = [];
    els.filterTree.querySelectorAll('.filter-checkbox').forEach(cb => {
      if (!cb.checked) excluded.push(cb.dataset.path);
    });

    const presets = loadPresets();
    const existing = presets.findIndex(p => p.name === name);
    const preset = { name, excluded, ts: Date.now() };
    if (existing >= 0) {
      presets[existing] = preset;
    } else {
      presets.push(preset);
    }
    savePresetsToStorage(presets);
    populatePresetDropdown();
    const savedIdx = existing >= 0 ? existing : presets.length - 1;
    els.presetSelect.value = savedIdx;
    els.presetDeleteBtn.disabled = false;
    showPresetToast('\u2713 Saved "' + name + '"');
  }

  function showPresetToast(msg) {
    els.presetToast.textContent = msg;
    els.presetToast.hidden = false;
    // Re-trigger animation
    els.presetToast.style.animation = 'none';
    els.presetToast.offsetHeight; // force reflow
    els.presetToast.style.animation = '';
    clearTimeout(showPresetToast._timer);
    showPresetToast._timer = setTimeout(() => { els.presetToast.hidden = true; }, 2500);
  }

  function deleteSelectedPreset() {
    const idx = parseInt(els.presetSelect.value, 10);
    if (isNaN(idx)) return;
    const presets = loadPresets();
    const name = presets[idx]?.name;
    if (!name) return;
    presets.splice(idx, 1);
    savePresetsToStorage(presets);
    populatePresetDropdown();
  }

  function applySelectedPreset() {
    const idx = parseInt(els.presetSelect.value, 10);
    els.presetDeleteBtn.disabled = isNaN(idx);
    if (isNaN(idx)) return;
    const presets = loadPresets();
    const preset = presets[idx];
    if (!preset) return;

    const excludedSet = new Set(preset.excluded);
    // Set checkboxes: checked = not in excluded list
    els.filterTree.querySelectorAll('.filter-checkbox').forEach(cb => {
      cb.checked = !excludedSet.has(cb.dataset.path);
      cb.indeterminate = false;
    });
    // Fix indeterminate states for parent nodes
    updateFilterIndeterminate(els.filterTree);
  }

  // ── Code Generation ───────────────────────────────────────────────
  function generateCode() {
    const lang = els.codegenLang.value;
    const rootName = (els.codegenRootName.value || 'Root').trim().replace(/[^a-zA-Z0-9_]/g, '');
    
    let data = parsedJson;
    if (!data) {
      try { data = JSON.parse(els.input.value); }
      catch (_) { els.codegenOutput.textContent = '// Error: No valid JSON in editor. Paste JSON in the Editor tab first.'; return; }
    }

    const classes = [];
    inferType(data, rootName, classes, lang);
    const code = classes.reverse().join('\n\n');
    els.codegenOutput.textContent = code;
  }

  function inferType(value, name, classes, lang) {
    if (value === null) return typeNull(lang);
    if (Array.isArray(value)) {
      if (value.length === 0) return typeArray(typeAny(lang), lang);
      const itemType = inferType(value[0], singularize(name), classes, lang);
      return typeArray(itemType, lang);
    }
    if (typeof value === 'object') {
      generateClass(value, name, classes, lang);
      return name;
    }
    if (typeof value === 'string') return typeString(lang);
    if (typeof value === 'number') return Number.isInteger(value) ? typeInt(lang) : typeFloat(lang);
    if (typeof value === 'boolean') return typeBool(lang);
    return typeAny(lang);
  }

  function generateClass(obj, name, classes, lang) {
    const props = Object.entries(obj).map(([key, val]) => {
      const propType = inferType(val, pascalCase(key), classes, lang);
      return { key, propType };
    });

    switch (lang) {
      case 'typescript': classes.push(genTypeScript(name, props)); break;
      case 'csharp': classes.push(genCSharp(name, props)); break;
      case 'java': classes.push(genJava(name, props)); break;
      case 'python': classes.push(genPython(name, props)); break;
      case 'go': classes.push(genGo(name, props)); break;
      case 'rust': classes.push(genRust(name, props)); break;
      case 'kotlin': classes.push(genKotlin(name, props)); break;
      case 'swift': classes.push(genSwift(name, props)); break;
    }
  }

  // ── Language-specific generators ──────────────────────────────────
  function genTypeScript(name, props) {
    const lines = [`export interface ${name} {`];
    for (const { key, propType } of props) {
      lines.push(`  ${key}: ${propType};`);
    }
    lines.push('}');
    return lines.join('\n');
  }

  function genCSharp(name, props) {
    const lines = [`public class ${name}\n{`];
    for (const { key, propType } of props) {
      lines.push(`    public ${propType} ${pascalCase(key)} { get; set; }`);
    }
    lines.push('}');
    return lines.join('\n');
  }

  function genJava(name, props) {
    const lines = [`public class ${name} {`];
    for (const { key, propType } of props) {
      lines.push(`    private ${propType} ${camelCase(key)};`);
    }
    lines.push('');
    for (const { key, propType } of props) {
      const pName = pascalCase(key);
      const cName = camelCase(key);
      lines.push(`    public ${propType} get${pName}() { return this.${cName}; }`);
      lines.push(`    public void set${pName}(${propType} ${cName}) { this.${cName} = ${cName}; }`);
      lines.push('');
    }
    lines.push('}');
    return lines.join('\n');
  }

  function genPython(name, props) {
    const lines = [`from dataclasses import dataclass`, `from typing import List, Optional`, '', '', `@dataclass`, `class ${name}:`];
    if (props.length === 0) {
      lines.push('    pass');
    } else {
      for (const { key, propType } of props) {
        lines.push(`    ${snakeCase(key)}: ${propType}`);
      }
    }
    return lines.join('\n');
  }

  function genGo(name, props) {
    const lines = [`type ${name} struct {`];
    for (const { key, propType } of props) {
      lines.push(`\t${pascalCase(key)} ${propType} \`json:"${key}"\``);
    }
    lines.push('}');
    return lines.join('\n');
  }

  function genRust(name, props) {
    const lines = [`#[derive(Debug, Serialize, Deserialize)]`, `pub struct ${name} {`];
    for (const { key, propType } of props) {
      lines.push(`    pub ${snakeCase(key)}: ${propType},`);
    }
    lines.push('}');
    return lines.join('\n');
  }

  function genKotlin(name, props) {
    const lines = [`data class ${name}(`];
    props.forEach(({ key, propType }, i) => {
      const comma = i < props.length - 1 ? ',' : '';
      lines.push(`    val ${camelCase(key)}: ${propType}${comma}`);
    });
    lines.push(')');
    return lines.join('\n');
  }

  function genSwift(name, props) {
    const lines = [`struct ${name}: Codable {`];
    for (const { key, propType } of props) {
      lines.push(`    let ${camelCase(key)}: ${propType}`);
    }
    lines.push('}');
    return lines.join('\n');
  }

  // ── Type mappers ──────────────────────────────────────────────────
  function typeString(lang) {
    const map = { typescript: 'string', csharp: 'string', java: 'String', python: 'str', go: 'string', rust: 'String', kotlin: 'String', swift: 'String' };
    return map[lang];
  }
  function typeInt(lang) {
    const map = { typescript: 'number', csharp: 'int', java: 'int', python: 'int', go: 'int', rust: 'i64', kotlin: 'Int', swift: 'Int' };
    return map[lang];
  }
  function typeFloat(lang) {
    const map = { typescript: 'number', csharp: 'double', java: 'double', python: 'float', go: 'float64', rust: 'f64', kotlin: 'Double', swift: 'Double' };
    return map[lang];
  }
  function typeBool(lang) {
    const map = { typescript: 'boolean', csharp: 'bool', java: 'boolean', python: 'bool', go: 'bool', rust: 'bool', kotlin: 'Boolean', swift: 'Bool' };
    return map[lang];
  }
  function typeNull(lang) {
    const map = { typescript: 'null', csharp: 'object?', java: 'Object', python: 'None', go: 'interface{}', rust: 'Option<()>', kotlin: 'Any?', swift: 'Any?' };
    return map[lang];
  }
  function typeAny(lang) {
    const map = { typescript: 'any', csharp: 'object', java: 'Object', python: 'Any', go: 'interface{}', rust: 'serde_json::Value', kotlin: 'Any', swift: 'Any' };
    return map[lang];
  }
  function typeArray(itemType, lang) {
    const map = {
      typescript: `${itemType}[]`,
      csharp: `List<${itemType}>`,
      java: `List<${boxJavaType(itemType)}>`,
      python: `List[${itemType}]`,
      go: `[]${itemType}`,
      rust: `Vec<${itemType}>`,
      kotlin: `List<${itemType}>`,
      swift: `[${itemType}]`
    };
    return map[lang];
  }

  function boxJavaType(t) {
    const map = { int: 'Integer', double: 'Double', boolean: 'Boolean' };
    return map[t] || t;
  }

  // ── Naming utilities ──────────────────────────────────────────────
  function pascalCase(str) {
    return str.replace(/(?:^|[_\-\s])(\w)/g, (_, c) => c.toUpperCase()).replace(/^(\w)/, (_, c) => c.toUpperCase());
  }
  function camelCase(str) {
    const p = pascalCase(str);
    return p.charAt(0).toLowerCase() + p.slice(1);
  }
  function snakeCase(str) {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '').replace(/[\-\s]+/g, '_');
  }
  function singularize(str) {
    if (str.endsWith('ies')) return str.slice(0, -3) + 'y';
    if (str.endsWith('ses') || str.endsWith('xes')) return str.slice(0, -2);
    if (str.endsWith('s') && !str.endsWith('ss')) return str.slice(0, -1);
    return str + 'Item';
  }

  // ── Export ─────────────────────────────────────────────────────────
  function exportData() {
    const format = els.exportSelect.value;
    if (!format) return;
    if (!parsedJson) {
      alert('No valid JSON to export.');
      return;
    }

    let content, filename, mime;

    switch (format) {
      case 'json':
        content = JSON.stringify(parsedJson, null, 2);
        filename = 'data.json';
        mime = 'application/json';
        break;
      case 'json-min':
        content = JSON.stringify(parsedJson);
        filename = 'data.min.json';
        mime = 'application/json';
        break;
      case 'csv':
        content = jsonToCsv(parsedJson);
        if (!content) { alert('CSV export works best with arrays of objects.'); return; }
        filename = 'data.csv';
        mime = 'text/csv';
        break;
      case 'yaml':
        content = jsonToYaml(parsedJson, 0);
        filename = 'data.yaml';
        mime = 'text/yaml';
        break;
      default: return;
    }

    downloadFile(content, filename, mime);
  }

  function downloadFile(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function jsonToCsv(data) {
    const arr = Array.isArray(data) ? data : [data];
    if (arr.length === 0 || typeof arr[0] !== 'object' || arr[0] === null) return null;
    const headers = [...new Set(arr.flatMap(item => typeof item === 'object' && item !== null ? Object.keys(item) : []))];
    if (headers.length === 0) return null;
    const escape = val => {
      const s = val === null || val === undefined ? '' : String(val);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = [headers.map(escape).join(',')];
    for (const item of arr) {
      if (typeof item !== 'object' || item === null) continue;
      rows.push(headers.map(h => escape(item[h])).join(','));
    }
    return rows.join('\n');
  }

  function jsonToYaml(obj, indent) {
    const pad = '  '.repeat(indent);
    if (obj === null) return 'null';
    if (typeof obj === 'boolean') return obj ? 'true' : 'false';
    if (typeof obj === 'number') return String(obj);
    if (typeof obj === 'string') {
      if (obj.includes('\n') || obj.includes(':') || obj.includes('#') || obj.includes('"') || obj.includes("'") || obj.trim() !== obj) {
        return `"${obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
      }
      return obj;
    }
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return obj.map(item => {
        const val = jsonToYaml(item, indent + 1);
        if (typeof item === 'object' && item !== null) {
          return `${pad}- ${val.trimStart()}`;
        }
        return `${pad}- ${val}`;
      }).join('\n');
    }
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) return '{}';
      return keys.map(key => {
        const val = obj[key];
        const yamlVal = jsonToYaml(val, indent + 1);
        if (typeof val === 'object' && val !== null && !Array.isArray(val) && Object.keys(val).length > 0) {
          return `${pad}${key}:\n${yamlVal}`;
        }
        if (Array.isArray(val) && val.length > 0) {
          return `${pad}${key}:\n${yamlVal}`;
        }
        return `${pad}${key}: ${yamlVal}`;
      }).join('\n');
    }
    return String(obj);
  }

  // ── Keyboard Shortcuts ────────────────────────────────────────────
  function initShortcuts() {
    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.key.toLowerCase() === 'f') {
        if (currentTab === 'viewer') {
          e.preventDefault();
          els.searchBar.hidden = false;
          els.searchBar.classList.add('sticky-open');
          els.searchInput.focus();
        }
      }

      // Ctrl+Shift+F → Format
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        formatJson();
      }
      // Ctrl+Shift+M → Minify
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        minifyJson();
      }
      // Escape → close dialog
      if (e.key === 'Escape' && els.urlDialog.open) {
        els.urlDialog.close();
      }
    });
  }

  // ── Debounce ──────────────────────────────────────────────────────
  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  // ── PWA / Service Worker ──────────────────────────────────────────
  function initPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }

  // ── Init ──────────────────────────────────────────────────────────
  function init() {
    initTheme();
    initDragDrop();
    initShortcuts();
    initPWA();

    // Tab switching
    els.tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));

    // Editor input
    const debouncedValidate = debounce(text => validate(text), 200);
    els.input.addEventListener('input', () => {
      updateLineNumbers();
      debouncedValidate(els.input.value);
    });
    els.input.addEventListener('scroll', syncScroll);

    // Tab key support in editor
    els.input.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = els.input.selectionStart;
        const end = els.input.selectionEnd;
        els.input.value = els.input.value.substring(0, start) + '  ' + els.input.value.substring(end);
        els.input.selectionStart = els.input.selectionEnd = start + 2;
        updateLineNumbers();
      }
    });

    // Buttons
    els.btnTheme.addEventListener('click', toggleTheme);
    els.btnFormat.addEventListener('click', formatJson);
    els.btnMinify.addEventListener('click', minifyJson);
    els.btnCopy.addEventListener('click', copyToClipboard);
    els.btnClear.addEventListener('click', () => {
      els.input.value = '';
      parsedJson = null;
      updateLineNumbers();
      validate('');
    });
    els.btnLoadFile.addEventListener('click', () => els.fileInput.click());
    els.fileInput.addEventListener('change', e => {
      if (e.target.files[0]) handleFileImport(e.target.files[0]);
      e.target.value = '';
    });
    els.btnLoadUrl.addEventListener('click', () => els.urlDialog.showModal());
    els.urlCancel.addEventListener('click', () => els.urlDialog.close());
    els.urlDialog.addEventListener('submit', e => {
      e.preventDefault();
      const url = els.urlInput.value.trim();
      if (url) loadFromUrl(url);
      els.urlDialog.close();
    });

    // Export
    els.btnExport.addEventListener('click', exportData);

    // Search
    const debouncedSearch = debounce(q => performTreeSearch(q), 250);
    els.searchInput.addEventListener('input', () => debouncedSearch(els.searchInput.value));
    els.searchInput.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      if (treeSearchMatches.length === 0) return;

      if (e.shiftKey) {
        treeSearchIndex = (treeSearchIndex - 1 + treeSearchMatches.length) % treeSearchMatches.length;
      } else {
        treeSearchIndex = (treeSearchIndex + 1) % treeSearchMatches.length;
      }
      highlightTreeMatch();

      // Ensure Enter navigation never collapses/hides the search UI.
      els.searchBar.hidden = false;
      els.searchBar.classList.add('sticky-open');
    });
    els.searchNext.addEventListener('click', () => {
      if (treeSearchMatches.length === 0) return;
      treeSearchIndex = (treeSearchIndex + 1) % treeSearchMatches.length;
      highlightTreeMatch();
    });
    els.searchPrev.addEventListener('click', () => {
      if (treeSearchMatches.length === 0) return;
      treeSearchIndex = (treeSearchIndex - 1 + treeSearchMatches.length) % treeSearchMatches.length;
      highlightTreeMatch();
    });
    els.searchClear.addEventListener('click', () => {
      els.searchInput.value = '';
      performTreeSearch('');
      els.searchBar.hidden = true;
      els.searchBar.classList.remove('sticky-open');
    });

    // Search toggle button
    const btnSearchToggle = $('#btn-search-toggle');
    if (btnSearchToggle) {
      btnSearchToggle.addEventListener('click', () => {
        els.searchBar.hidden = !els.searchBar.hidden;
        if (!els.searchBar.hidden) {
          els.searchBar.classList.add('sticky-open');
          els.searchInput.focus();
        } else {
          els.searchBar.classList.remove('sticky-open');
        }
      });
    }

    // Expand/Collapse all
    const btnExpandAll = $('#btn-expand-all');
    const btnCollapseAll = $('#btn-collapse-all');
    btnExpandAll.addEventListener('click', () => {
      $$('.tree-toggle.collapsed', els.treeContainer).forEach(t => {
        t.classList.remove('collapsed');
        t.closest('.tree-node').querySelector(':scope > .tree-children')?.classList.remove('collapsed');
      });
    });
    btnCollapseAll.addEventListener('click', () => {
      $$('.tree-toggle:not(.collapsed)', els.treeContainer).forEach(t => {
        t.classList.add('collapsed');
        t.closest('.tree-node').querySelector(':scope > .tree-children')?.classList.add('collapsed');
      });
    });

    // Table View toggle
    els.btnTableView.addEventListener('click', toggleTableView);

    // Filter
    els.btnFilter.addEventListener('click', openFilterDialog);
    els.filterApply.addEventListener('click', applyFilter);
    els.filterCancel.addEventListener('click', () => { hidePresetNameInput(); els.filterDialog.close(); });
    els.filterReset.addEventListener('click', resetFilter);
    els.filterSelectAll.addEventListener('click', () => {
      els.filterTree.querySelectorAll('.filter-checkbox').forEach(cb => { cb.checked = true; cb.indeterminate = false; });
    });
    els.filterDeselectAll.addEventListener('click', () => {
      els.filterTree.querySelectorAll('.filter-checkbox').forEach(cb => { cb.checked = false; cb.indeterminate = false; });
    });

    // Filter Presets
    els.presetSaveBtn.addEventListener('click', showPresetNameInput);
    els.presetConfirmBtn.addEventListener('click', saveCurrentAsPreset);
    els.presetNameCancel.addEventListener('click', hidePresetNameInput);
    els.presetNameInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); saveCurrentAsPreset(); }
      if (e.key === 'Escape') hidePresetNameInput();
    });
    els.presetDeleteBtn.addEventListener('click', deleteSelectedPreset);
    els.presetSelect.addEventListener('change', applySelectedPreset);

    // Diff
    els.btnDiff.addEventListener('click', computeDiff);

    // Validation bar
    els.validationGoto.addEventListener('click', goToError);
    els.validationDismiss.addEventListener('click', () => {
      els.validationBar.hidden = true;
    });

    // Code Gen
    els.btnCodegen.addEventListener('click', generateCode);
    els.btnCodegenCopy.addEventListener('click', async () => {
      const text = els.codegenOutput.textContent;
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        flashButton(els.btnCodegenCopy, 'Copied!');
      } catch (_) {
        flashButton(els.btnCodegenCopy, 'Failed');
      }
    });

    // Paste event - auto-format JSON
    els.input.addEventListener('paste', () => {
      setTimeout(() => {
        try {
          const obj = JSON.parse(els.input.value);
          els.input.value = JSON.stringify(obj, null, 2);
        } catch (_) {}
        updateLineNumbers();
        validate(els.input.value);
      }, 0);
    });

    // About link — scroll to section and open first <details>
    const btnAbout = $('#btn-about');
    if (btnAbout) {
      btnAbout.addEventListener('click', e => {
        e.preventDefault();
        const aboutSection = $('#about');
        if (aboutSection) {
          aboutSection.classList.remove('hidden');
          const firstDetails = aboutSection.querySelector('details');
          if (firstDetails && !firstDetails.open) firstDetails.open = true;
          aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // Close button — hide the about section
    const btnCloseAbout = $('#btn-close-about');
    if (btnCloseAbout) {
      btnCloseAbout.addEventListener('click', () => {
        const aboutSection = $('#about');
        if (aboutSection) {
          aboutSection.classList.add('hidden');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    // Load sample if empty
    updateLineNumbers();
  }

  // ── Start ─────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
