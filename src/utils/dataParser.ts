import * as XLSX from 'xlsx';
import { ColumnMeta, VariableType } from '../types/segmentation';

export interface ParseResult {
  fileName: string;
  data: Record<string, any>[];
  columns: ColumnMeta[];
  previewRows: Record<string, any>[];
  totalRows: number;
  totalColumns: number;
}

export function parseDelimitedText(text: string): Record<string, any>[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    throw new Error('El archivo no contiene suficientes filas (mínimo cabecera y una fila de datos).');
  }

  // Detect delimiter: comma, semicolon, tab, pipe
  const firstLine = lines[0];
  const delimiters = [',', ';', '\t', '|'];
  let bestDelimiter = ',';
  let maxCount = -1;

  for (const d of delimiters) {
    const count = firstLine.split(d).length;
    if (count > maxCount) {
      maxCount = count;
      bestDelimiter = d;
    }
  }

  const rawHeaders = firstLine
    .split(bestDelimiter)
    .map((h) => h.replace(/^["']|["']$/g, '').trim());

  const rows: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const parts = line.split(bestDelimiter).map((p) => p.replace(/^["']|["']$/g, '').trim());
    const row: Record<string, any> = {};

    rawHeaders.forEach((header, idx) => {
      const val = parts[idx] ?? '';
      // Parse numeric if possible (handling both . and , as decimals if needed)
      if (val !== '' && !isNaN(Number(val))) {
        row[header] = Number(val);
      } else if (val !== '' && !isNaN(Number(val.replace(',', '.')))) {
        row[header] = Number(val.replace(',', '.'));
      } else {
        row[header] = val;
      }
    });

    rows.push(row);
  }

  return rows;
}

export async function parseFile(file: File): Promise<ParseResult> {
  const fileName = file.name;
  const ext = fileName.split('.').pop()?.toLowerCase();
  let data: Record<string, any>[] = [];

  if (ext === 'xlsx' || ext === 'xls') {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error('El libro de Excel no contiene hojas de cálculo con datos.');
    }
    const worksheet = workbook.Sheets[firstSheetName];
    data = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
  } else {
    // csv, txt, tsv
    const text = await file.text();
    data = parseDelimitedText(text);
  }

  if (data.length === 0) {
    throw new Error('No se encontraron registros de datos en el archivo cargado.');
  }

  const columns = analyzeColumns(data);

  return {
    fileName,
    data,
    columns,
    previewRows: data.slice(0, 5),
    totalRows: data.length,
    totalColumns: columns.length,
  };
}

export function analyzeColumns(data: Record<string, any>[]): ColumnMeta[] {
  if (data.length === 0) return [];
  const keys = Object.keys(data[0] || {});
  const total = data.length;

  return keys.map((key) => {
    let numericCount = 0;
    let nonNullCount = 0;
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    const sampleValues: (string | number)[] = [];
    const uniqueVals = new Set<any>();

    data.forEach((row, idx) => {
      const val = row[key];
      if (val !== null && val !== undefined && val !== '') {
        nonNullCount++;
        uniqueVals.add(val);
        if (typeof val === 'number' && !isNaN(val)) {
          numericCount++;
          min = Math.min(min, val);
          max = Math.max(max, val);
          sum += val;
        } else if (typeof val === 'string' && !isNaN(Number(val))) {
          const num = Number(val);
          numericCount++;
          min = Math.min(min, num);
          max = Math.max(max, num);
          sum += num;
        }
      }
      if (idx < 5 && val !== undefined) {
        sampleValues.push(val);
      }
    });

    const isNumericHeavy = nonNullCount > 0 && numericCount / nonNullCount >= 0.85;
    const lowerKey = key.toLowerCase();
    const isIdCandidate =
      lowerKey.includes('id') ||
      lowerKey.includes('rut') ||
      lowerKey.includes('dni') ||
      lowerKey.includes('nit') ||
      lowerKey.includes('codigo') ||
      lowerKey.includes('cuenta') ||
      lowerKey.includes('abonado') ||
      (uniqueVals.size === total && !isNumericHeavy);

    let type: VariableType = 'categorical';
    if (isIdCandidate) {
      type = 'id';
    } else if (isNumericHeavy) {
      type = 'continuous';
    }

    // Default selection: select continuous numerical variables, exclude ID candidates
    const selected = type === 'continuous' && !isIdCandidate;

    return {
      name: key,
      type,
      selected,
      min: min === Infinity ? 0 : min,
      max: max === -Infinity ? 0 : max,
      mean: numericCount > 0 ? sum / numericCount : 0,
      nonNullCount,
      totalCount: total,
      sampleValues,
      isIdCandidate,
    };
  });
}

// Export dataset with clusters to CSV or XLSX
export function exportToCSV(data: Record<string, any>[], filename = 'segmentacion_clientes.csv') {
  const ws = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToExcel(data: Record<string, any>[], filename = 'segmentacion_clientes.xlsx') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Segmentacion');
  XLSX.writeFile(wb, filename);
}
