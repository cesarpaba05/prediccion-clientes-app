import {
  BusinessRule,
  DescriptiveStats,
  ScalingType,
  TransformationType,
} from '../types/segmentation';

// Calculate percentile with linear interpolation
export function getPercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

// Compute comprehensive descriptive statistics
export function calculateDescriptiveStats(
  values: number[],
  numBins = 10
): DescriptiveStats {
  const valid = values.filter((v) => typeof v === 'number' && !isNaN(v) && isFinite(v));
  if (valid.length === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      q1: 0,
      q3: 0,
      iqr: 0,
      skewness: 0,
      kurtosis: 0,
      histogram: [],
    };
  }

  const n = valid.length;
  const sorted = [...valid].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const sum = valid.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;

  const median = getPercentile(sorted, 0.5);
  const q1 = getPercentile(sorted, 0.25);
  const q3 = getPercentile(sorted, 0.75);
  const iqr = q3 - q1;

  // Variance and StdDev
  const variance = valid.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n > 1 ? n - 1 : 1);
  const stdDev = Math.sqrt(variance);

  // Skewness (Fisher-Pearson coefficient of skewness)
  let skewness = 0;
  let kurtosis = 0;
  if (stdDev > 0 && n > 2) {
    const m3 = valid.reduce((acc, v) => acc + Math.pow((v - mean) / stdDev, 3), 0) / n;
    skewness = (Math.sqrt(n * (n - 1)) / (n - 2)) * m3;

    const m4 = valid.reduce((acc, v) => acc + Math.pow((v - mean) / stdDev, 4), 0) / n;
    kurtosis = m4 - 3; // excess kurtosis
  }

  // Histogram calculation
  const histogram: { binStart: number; binEnd: number; count: number }[] = [];
  const range = max - min;
  const binWidth = range === 0 ? 1 : range / numBins;

  for (let i = 0; i < numBins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = i === numBins - 1 ? max : min + (i + 1) * binWidth;
    histogram.push({ binStart, binEnd, count: 0 });
  }

  for (const v of valid) {
    if (range === 0) {
      histogram[0].count++;
      continue;
    }
    let binIdx = Math.floor((v - min) / binWidth);
    if (binIdx >= numBins) binIdx = numBins - 1;
    if (binIdx < 0) binIdx = 0;
    histogram[binIdx].count++;
  }

  return {
    count: n,
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    min: Number(min.toFixed(2)),
    max: Number(max.toFixed(2)),
    q1: Number(q1.toFixed(2)),
    q3: Number(q3.toFixed(2)),
    iqr: Number(iqr.toFixed(2)),
    skewness: Number(skewness.toFixed(3)),
    kurtosis: Number(kurtosis.toFixed(3)),
    histogram,
  };
}

// Apply Min/Max Business Rules to dataset rows
export function applyBusinessRules(
  data: Record<string, any>[],
  rules: Record<string, BusinessRule>
): {
  processedData: Record<string, any>[];
  affectedRowCount: number;
  totalBefore: number;
  totalAfter: number;
} {
  const totalBefore = data.length;
  let affectedRowCount = 0;

  // Check if any rule requires row exclusion
  const filteredRows: Record<string, any>[] = [];

  for (const row of data) {
    let keepRow = true;
    const modifiedRow = { ...row };
    let rowChanged = false;

    for (const [col, rule] of Object.entries(rules)) {
      if (!rule.enabled) continue;
      const val = row[col];
      if (typeof val !== 'number' || isNaN(val)) continue;

      if (rule.action === 'filter') {
        if (rule.min !== null && val < rule.min) {
          keepRow = false;
          break;
        }
        if (rule.max !== null && val > rule.max) {
          keepRow = false;
          break;
        }
      } else if (rule.action === 'clamp') {
        let clamped = val;
        if (rule.min !== null && clamped < rule.min) {
          clamped = rule.min;
          rowChanged = true;
        }
        if (rule.max !== null && clamped > rule.max) {
          clamped = rule.max;
          rowChanged = true;
        }
        modifiedRow[col] = clamped;
      }
    }

    if (!keepRow) {
      affectedRowCount++;
    } else {
      if (rowChanged) affectedRowCount++;
      filteredRows.push(modifiedRow);
    }
  }

  return {
    processedData: filteredRows,
    affectedRowCount,
    totalBefore,
    totalAfter: filteredRows.length,
  };
}

// Mathematical variable transformations (Step 8)
export function transformValue(
  val: number,
  type: TransformationType,
  colMin = 0
): number {
  if (typeof val !== 'number' || isNaN(val)) return 0;
  switch (type) {
    case 'log1p': {
      // Shift so minimum argument is 0 before taking ln(x + 1)
      const shift = colMin < 0 ? Math.abs(colMin) : 0;
      return Math.log(val + shift + 1);
    }
    case 'sqrt': {
      const shift = colMin < 0 ? Math.abs(colMin) : 0;
      return Math.sqrt(Math.max(0, val + shift));
    }
    case 'yeo_johnson': {
      // Yeo-Johnson power transform with lambda = 0.5 (concave variance stabilizing)
      const lambda = 0.5;
      if (val >= 0) {
        return (Math.pow(val + 1, lambda) - 1) / lambda;
      } else {
        return -(Math.pow(-val + 1, 2 - lambda) - 1) / (2 - lambda);
      }
    }
    case 'none':
    default:
      return val;
  }
}

// Standardization (Step 9) - MinMax [0, 1], Z-score, or Robust
export function scaleDataset(
  data: Record<string, any>[],
  variables: string[],
  transformations: Record<string, TransformationType>,
  scalingType: ScalingType = 'minmax'
): {
  scaledMatrix: number[][];
  scalers: Record<
    string,
    { min: number; max: number; mean: number; stdDev: number; median: number; iqr: number }
  >;
  transformedValues: Record<string, number[]>;
} {
  const transformedValues: Record<string, number[]> = {};
  const scalers: Record<
    string,
    { min: number; max: number; mean: number; stdDev: number; median: number; iqr: number }
  > = {};

  // First pass: transform values
  for (const v of variables) {
    const rawCol = data.map((d) => Number(d[v]) || 0);
    const colMin = Math.min(...rawCol);
    const transformType = transformations[v] || 'none';
    const transformed = rawCol.map((val) => transformValue(val, transformType, colMin));
    transformedValues[v] = transformed;

    const stats = calculateDescriptiveStats(transformed);
    scalers[v] = {
      min: stats.min,
      max: stats.max,
      mean: stats.mean,
      stdDev: stats.stdDev,
      median: stats.median,
      iqr: stats.iqr === 0 ? 1 : stats.iqr,
    };
  }

  // Second pass: scale to matrix
  const scaledMatrix: number[][] = [];
  const rowCount = data.length;

  for (let i = 0; i < rowCount; i++) {
    const rowVector: number[] = [];
    for (const v of variables) {
      const val = transformedValues[v][i];
      const s = scalers[v];
      let scaled = 0;

      if (scalingType === 'minmax') {
        // Strict [0, 1] scaling
        const range = s.max - s.min;
        scaled = range === 0 ? 0.5 : (val - s.min) / range;
        // Clamp to [0, 1] for safety
        scaled = Math.max(0, Math.min(1, scaled));
      } else if (scalingType === 'zscore') {
        scaled = s.stdDev === 0 ? 0 : (val - s.mean) / s.stdDev;
      } else if (scalingType === 'robust') {
        scaled = (val - s.median) / s.iqr;
      }

      rowVector.push(scaled);
    }
    scaledMatrix.push(rowVector);
  }

  return {
    scaledMatrix,
    scalers,
    transformedValues,
  };
}
