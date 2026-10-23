#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity */
/**
 * 将“医学专业名词大全.csv”转换为前端术语词库。
 * 用法：node scripts/import-medical-csv.js [csvPath]
 *
 * 本地一次性导入脚本，不属于前端运行时。CSV 状态机刻意写在一个循环里，
 * 拆开反而要把引号/转义状态在多个函数之间传来传去，所以这里关掉复杂度检查。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_CSV = path.join(ROOT, '医学专业名词大全.csv');
const OUTPUT_JSON = path.join(ROOT, 'src/assets/term-dictionaries/medical.generated.json');
const OUTPUT_REPORT = path.join(ROOT, 'src/assets/term-dictionaries/medical.conflicts.md');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === ',') {
      row.push(field);
      field = '';
      continue;
    }
    if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }
    if (char === '\r') continue;

    field += char;
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function normalizeKey(value) {
  return String(value || '')
    .normalize('NFKC')
    .trim();
}

function splitAliases(value) {
  return String(value || '')
    .split(/[；;]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function uniqueKeys(keys, canonical) {
  const seen = new Set();
  const canonicalKey = normalizeKey(canonical);
  return keys.filter(key => {
    const normalized = normalizeKey(key);
    if (!normalized || normalized === canonicalKey || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

function escapeCell(value) {
  return String(value || '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ');
}

function formatCandidate(term) {
  const category = escapeCell(term.category || '-');
  const canonical = escapeCell(term.canonical);
  const priority = term.priority ?? '-';

  return `${canonical}（${category} / p${priority}）`;
}

function formatConflictRow(item) {
  return `| ${escapeCell(item.key)} | ${item.terms.map(formatCandidate).join('<br>')} |`;
}

function buildConflictReport(terms) {
  const keyMap = new Map();

  terms.forEach(term => {
    [term.canonical, ...(term.aliases || [])].forEach(key => {
      const normalized = normalizeKey(key);
      if (!normalized) return;
      if (!keyMap.has(normalized)) keyMap.set(normalized, new Map());
      keyMap.get(normalized).set(term.id, term);
    });
  });

  const conflicts = [...keyMap.entries()]
    .map(([key, termMap]) => ({ key, terms: [...termMap.values()] }))
    .filter(item => item.terms.length > 1)
    .sort(
      (first, second) =>
        second.terms.length - first.terms.length || first.key.localeCompare(second.key),
    );

  const sameCategory = conflicts.filter(item => {
    const categories = item.terms.map(term => term.category || '').filter(Boolean);
    return categories.length > 1 && new Set(categories).size < categories.length;
  });

  const lines = [
    '# 医学术语词库冲突报告',
    '',
    `- 词条总数：${terms.length}`,
    `- 唯一匹配键：${keyMap.size}`,
    `- 多义匹配键：${conflicts.length}`,
    `- 同一 category 内多义：${sameCategory.length}`,
    '',
    '> 默认按“canonical 完全匹配 > priority 数字小 > id 稳定排序”选择；仍有多义时，前端卡片会展示全部候选供手动切换。',
    '',
    '## 同一 category 内多义',
    '',
    '| 匹配键 | 候选术语（category / priority） |',
    '| --- | --- |',
  ];

  sameCategory.forEach(item => {
    lines.push(formatConflictRow(item));
  });

  lines.push(
    '',
    '## 其他多义',
    '',
    '| 匹配键 | 候选术语（category / priority） |',
    '| --- | --- |',
  );

  conflicts
    .filter(item => !sameCategory.includes(item))
    .forEach(item => {
      lines.push(formatConflictRow(item));
    });

  return { report: lines.join('\n') + '\n', conflicts, sameCategory, keyCount: keyMap.size };
}

function main() {
  const csvPath = path.resolve(process.argv[2] || DEFAULT_CSV);
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV 不存在：${csvPath}`);
  }

  let text = fs.readFileSync(csvPath, 'utf8');
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  const rows = parseCsv(text);
  const headers = rows.shift();
  const requiredHeaders = [
    'main_term',
    'abbr',
    'match_aliases',
    'zh_def',
    'en_def',
    'remark',
    'category',
    'priority',
  ];
  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
  if (missingHeaders.length) {
    throw new Error(`缺少字段：${missingHeaders.join(', ')}`);
  }

  const terms = [];
  const skipped = [];

  rows.forEach((row, rowIndex) => {
    if (!row.some(cell => String(cell).trim())) return;

    const record = {};
    headers.forEach((header, index) => {
      record[header] = String(row[index] || '').trim();
    });

    if (!record.main_term || !record.zh_def || !record.en_def) {
      skipped.push(rowIndex + 2);
      return;
    }

    const aliases = uniqueKeys(
      [record.abbr, ...splitAliases(record.match_aliases)],
      record.main_term,
    );
    const priority = Number(record.priority);
    const line = rowIndex + 2;

    terms.push({
      id: `medical.csv-${String(line).padStart(3, '0')}`,
      track: 'medical',
      canonical: record.main_term,
      aliases,
      zh: record.zh_def,
      en: record.en_def,
      note: record.remark,
      category: record.category,
      priority: Number.isFinite(priority) ? priority : undefined,
    });
  });

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(terms, null, 2)}\n`, 'utf8');

  const analysis = buildConflictReport(terms);
  fs.writeFileSync(OUTPUT_REPORT, analysis.report, 'utf8');

  console.log(`CSV: ${csvPath}`);
  console.log(`生成词条: ${terms.length}，跳过缺字段行: ${skipped.length}`);
  console.log(
    `唯一匹配键: ${analysis.keyCount}，多义键: ${analysis.conflicts.length}，同一 category 多义: ${analysis.sameCategory.length}`,
  );
  console.log(`JSON: ${OUTPUT_JSON}`);
  console.log(`报告: ${OUTPUT_REPORT}`);
  if (skipped.length) console.log(`跳过行号: ${skipped.join(', ')}`);
}

try {
  main();
} catch (error) {
  console.error(error.message || error);
  process.exitCode = 1;
}
