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
  };

  let parsedJson = null;
  let currentTab = 'editor';
  let searchMatches = [];
  let searchIndex = -1;

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

    if (tab === 'viewer') {
      renderTree();
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
      const entries = type === 'array' ? value : Object.entries(value);
      const count = type === 'array' ? value.length : Object.keys(value).length;
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
        Object.entries(value).forEach(([k, v]) => {
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

  // ── Search ────────────────────────────────────────────────────────
  function performSearch(query) {
    // Clear previous highlights
    $$('.tree-row.highlight', els.treeContainer).forEach(r => r.classList.remove('highlight'));
    searchMatches = [];
    searchIndex = -1;

    if (!query.trim()) {
      els.searchCount.textContent = '';
      return;
    }

    const rows = $$('.tree-row', els.treeContainer);
    const lowerQuery = query.toLowerCase();

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      if (text.includes(lowerQuery)) {
        searchMatches.push(row);
      }
    });

    els.searchCount.textContent = `${searchMatches.length} match${searchMatches.length !== 1 ? 'es' : ''}`;
    if (searchMatches.length > 0) {
      searchIndex = 0;
      highlightMatch();
    }
  }

  function highlightMatch() {
    $$('.tree-row.highlight', els.treeContainer).forEach(r => r.classList.remove('highlight'));
    if (searchMatches.length === 0) return;
    const row = searchMatches[searchIndex];
    // Expand parents
    let parent = row.closest('.tree-children.collapsed');
    while (parent) {
      parent.classList.remove('collapsed');
      const toggle = parent.previousElementSibling?.querySelector('.tree-toggle');
      if (toggle) toggle.classList.remove('collapsed');
      parent = parent.parentElement?.closest('.tree-children.collapsed');
    }
    row.classList.add('highlight');
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    els.searchCount.textContent = `${searchIndex + 1}/${searchMatches.length}`;
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
      navigator.serviceWorker.register('sw.js').catch(() => {});
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
    const debouncedSearch = debounce(q => performSearch(q), 250);
    els.searchInput.addEventListener('input', () => debouncedSearch(els.searchInput.value));
    els.searchNext.addEventListener('click', () => {
      if (searchMatches.length === 0) return;
      searchIndex = (searchIndex + 1) % searchMatches.length;
      highlightMatch();
    });
    els.searchPrev.addEventListener('click', () => {
      if (searchMatches.length === 0) return;
      searchIndex = (searchIndex - 1 + searchMatches.length) % searchMatches.length;
      highlightMatch();
    });
    els.searchClear.addEventListener('click', () => {
      els.searchInput.value = '';
      performSearch('');
      els.searchBar.hidden = true;
    });

    // Search toggle button
    const btnSearchToggle = $('#btn-search-toggle');
    btnSearchToggle.addEventListener('click', () => {
      els.searchBar.hidden = !els.searchBar.hidden;
      if (!els.searchBar.hidden) {
        els.searchInput.focus();
      }
    });

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
