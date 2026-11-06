import {
  ClusterProfile,
  ElbowPoint,
  GapPoint,
  IndustrySector,
  SilhouettePoint,
  TransformationType,
} from '../types/segmentation';
import { SECTORS } from './sampleDatasets';

// Euclidean distance between two vectors
export function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// K-Means++ initialization
function initCentroidsKMeansPlusPlus(data: number[][], k: number): number[][] {
  const n = data.length;
  const centroids: number[][] = [];
  
  // Pick first centroid uniformly at random
  const firstIdx = Math.floor(Math.random() * n);
  centroids.push([...data[firstIdx]]);

  // Pick remaining k-1 centroids with probability proportional to D(x)^2
  for (let c = 1; c < k; c++) {
    const distancesSq: number[] = new Array(n).fill(0);
    let totalDistSq = 0;

    for (let i = 0; i < n; i++) {
      let minDistSq = Infinity;
      for (const centroid of centroids) {
        let distSq = 0;
        for (let d = 0; d < data[i].length; d++) {
          const diff = data[i][d] - centroid[d];
          distSq += diff * diff;
        }
        if (distSq < minDistSq) minDistSq = distSq;
      }
      distancesSq[i] = minDistSq;
      totalDistSq += minDistSq;
    }

    // Roulette wheel selection
    const threshold = Math.random() * totalDistSq;
    let cumSum = 0;
    let selectedIdx = 0;
    for (let i = 0; i < n; i++) {
      cumSum += distancesSq[i];
      if (cumSum >= threshold) {
        selectedIdx = i;
        break;
      }
    }
    centroids.push([...data[selectedIdx]]);
  }

  return centroids;
}

export interface KMeansResult {
  centroids: number[][];
  assignments: number[];
  inertia: number; // WCSS
  iterations: number;
}

// Run single K-Means execution
export function runKMeans(
  data: number[][],
  k: number,
  maxIterations = 100,
  tol = 1e-4
): KMeansResult {
  const n = data.length;
  const dimensions = data[0].length;

  if (k <= 0 || n < k) {
    throw new Error('Número de clusters K debe ser menor o igual al número de filas.');
  }

  let centroids = initCentroidsKMeansPlusPlus(data, k);
  let assignments = new Array(n).fill(0);
  let iterations = 0;

  for (let iter = 0; iter < maxIterations; iter++) {
    iterations = iter + 1;
    let changed = false;

    // Assignment step
    for (let i = 0; i < n; i++) {
      const point = data[i];
      let minDist = Infinity;
      let bestCluster = 0;

      for (let c = 0; c < k; c++) {
        const d = euclideanDistance(point, centroids[c]);
        if (d < minDist) {
          minDist = d;
          bestCluster = c;
        }
      }

      if (assignments[i] !== bestCluster) {
        assignments[i] = bestCluster;
        changed = true;
      }
    }

    // Update step
    const newCentroids: number[][] = Array.from({ length: k }, () => new Array(dimensions).fill(0));
    const counts = new Array(k).fill(0);

    for (let i = 0; i < n; i++) {
      const cluster = assignments[i];
      counts[cluster]++;
      for (let d = 0; d < dimensions; d++) {
        newCentroids[cluster][d] += data[i][d];
      }
    }

    let maxShift = 0;
    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) {
        for (let d = 0; d < dimensions; d++) {
          newCentroids[c][d] /= counts[c];
        }
      } else {
        // Handle empty cluster by reassigning to a random point
        newCentroids[c] = [...data[Math.floor(Math.random() * n)]];
      }
      const shift = euclideanDistance(centroids[c], newCentroids[c]);
      if (shift > maxShift) maxShift = shift;
    }

    centroids = newCentroids;

    if (!changed || maxShift < tol) break;
  }

  // Calculate WCSS (Inertia)
  let inertia = 0;
  for (let i = 0; i < n; i++) {
    const cluster = assignments[i];
    const d = euclideanDistance(data[i], centroids[cluster]);
    inertia += d * d;
  }

  return { centroids, assignments, inertia, iterations };
}

// Run K-Means with multiple restarts to find global best
export function runBestKMeans(data: number[][], k: number, restarts = 5): KMeansResult {
  let bestResult: KMeansResult | null = null;
  for (let r = 0; r < restarts; r++) {
    const res = runKMeans(data, k);
    if (!bestResult || res.inertia < bestResult.inertia) {
      bestResult = res;
    }
  }
  return bestResult!;
}

// Compute Silhouette Score for a clustering solution
export function calculateSilhouetteScore(data: number[][], assignments: number[], k: number): number {
  const n = data.length;
  if (k < 2 || n <= k) return 0;

  // Subsample if dataset is large to maintain instant sub-second interactivity
  const maxSamples = 500;
  const indices: number[] = [];
  if (n > maxSamples) {
    const step = Math.floor(n / maxSamples);
    for (let i = 0; i < n; i += step) indices.push(i);
  } else {
    for (let i = 0; i < n; i++) indices.push(i);
  }

  let totalSilhouette = 0;
  const sampleSize = indices.length;

  for (const i of indices) {
    const currentPoint = data[i];
    const currentCluster = assignments[i];

    // Compute a(i): average distance to points in same cluster
    let sameClusterDistSum = 0;
    let sameClusterCount = 0;

    // Distances to points in other clusters
    const otherClustersDistSum = new Array(k).fill(0);
    const otherClustersCount = new Array(k).fill(0);

    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const targetCluster = assignments[j];
      const d = euclideanDistance(currentPoint, data[j]);

      if (targetCluster === currentCluster) {
        sameClusterDistSum += d;
        sameClusterCount++;
      } else {
        otherClustersDistSum[targetCluster] += d;
        otherClustersCount[targetCluster]++;
      }
    }

    const a_i = sameClusterCount > 0 ? sameClusterDistSum / sameClusterCount : 0;

    // Compute b(i): minimum mean distance to points in other clusters
    let b_i = Infinity;
    for (let c = 0; c < k; c++) {
      if (c === currentCluster) continue;
      if (otherClustersCount[c] > 0) {
        const meanOtherDist = otherClustersDistSum[c] / otherClustersCount[c];
        if (meanOtherDist < b_i) b_i = meanOtherDist;
      }
    }
    if (b_i === Infinity) b_i = 0;

    const maxDenom = Math.max(a_i, b_i);
    const s_i = maxDenom === 0 ? 0 : (b_i - a_i) / maxDenom;
    totalSilhouette += s_i;
  }

  return Number((totalSilhouette / sampleSize).toFixed(4));
}

// Compute GAP Statistic (Tibshirani et al. 2001)
export function calculateGapStatistic(
  data: number[][],
  kMin = 2,
  kMax = 7,
  B = 5
): GapPoint[] {
  const n = data.length;
  const d = data[0].length;

  // Find min and max for each dimension bounding box
  const mins = new Array(d).fill(Infinity);
  const maxs = new Array(d).fill(-Infinity);
  for (let i = 0; i < n; i++) {
    for (let dim = 0; dim < d; dim++) {
      if (data[i][dim] < mins[dim]) mins[dim] = data[i][dim];
      if (data[i][dim] > maxs[dim]) maxs[dim] = data[i][dim];
    }
  }

  // Pre-generate B null uniform reference datasets
  const referenceDatasets: number[][][] = [];
  for (let b = 0; b < B; b++) {
    const refData: number[][] = [];
    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      for (let dim = 0; dim < d; dim++) {
        row.push(mins[dim] + Math.random() * (maxs[dim] - mins[dim]));
      }
      refData.push(row);
    }
    referenceDatasets.push(refData);
  }

  const results: GapPoint[] = [];

  for (let k = kMin; k <= kMax; k++) {
    // 1. Observed inertia W_k
    const obsKMeans = runBestKMeans(data, k, 3);
    const observedLogW = Math.log(Math.max(1e-9, obsKMeans.inertia));

    // 2. Expected inertia from null datasets
    const nullLogWs: number[] = [];
    for (let b = 0; b < B; b++) {
      const nullKMeans = runBestKMeans(referenceDatasets[b], k, 2);
      nullLogWs.push(Math.log(Math.max(1e-9, nullKMeans.inertia)));
    }

    const expectedLogW = nullLogWs.reduce((a, b) => a + b, 0) / B;
    const gap = expectedLogW - observedLogW;

    // Standard deviation of null log W_k
    const varianceNull =
      nullLogWs.reduce((acc, val) => acc + Math.pow(val - expectedLogW, 2), 0) / (B - 1 || 1);
    const sdNull = Math.sqrt(varianceNull);
    const sk = sdNull * Math.sqrt(1 + 1 / B);

    results.push({
      k,
      gap: Number(gap.toFixed(4)),
      sk: Number(sk.toFixed(4)),
      observedLogW: Number(observedLogW.toFixed(4)),
      expectedLogW: Number(expectedLogW.toFixed(4)),
    });
  }

  // Determine optimal k using 1-SE rule: Gap(k) >= Gap(k+1) - s_{k+1}
  let gapSuggestionK = kMin;
  for (let i = 0; i < results.length - 1; i++) {
    if (results[i].gap >= results[i + 1].gap - results[i + 1].sk) {
      gapSuggestionK = results[i].k;
      break;
    }
  }
  // If rule never fired, take maximum gap
  if (gapSuggestionK === kMin) {
    let maxGap = -Infinity;
    for (const r of results) {
      if (r.gap > maxGap) {
        maxGap = r.gap;
        gapSuggestionK = r.k;
      }
    }
  }

  results.forEach((r) => {
    r.isGapSuggestion = r.k === gapSuggestionK;
  });

  return results;
}

// Compute multi-k diagnostics: Elbow, Silhouette, and GAP
export function computeClusterDiagnostics(
  data: number[][],
  kMin = 2,
  kMax = 8
): {
  elbowCurve: ElbowPoint[];
  silhouettes: SilhouettePoint[];
  gaps: GapPoint[];
  suggestedK: {
    elbow: number;
    silhouette: number;
    gap: number;
    combined: number;
  };
} {
  const elbowCurve: ElbowPoint[] = [];
  const silhouettes: SilhouettePoint[] = [];

  for (let k = kMin; k <= kMax; k++) {
    const kRes = runBestKMeans(data, k, 4);
    elbowCurve.push({ k, inertia: Number(kRes.inertia.toFixed(2)) });

    const sil = calculateSilhouetteScore(data, kRes.assignments, k);
    silhouettes.push({ k, score: sil });
  }

  // Calculate elbow knee using maximum perpendicular distance to secant line between kMin and kMax
  const p1 = { x: elbowCurve[0].k, y: elbowCurve[0].inertia };
  const p2 = { x: elbowCurve[elbowCurve.length - 1].k, y: elbowCurve[elbowCurve.length - 1].inertia };
  let maxDistance = -1;
  let elbowK = kMin + 1;

  for (let i = 0; i < elbowCurve.length; i++) {
    const pt = { x: elbowCurve[i].k, y: elbowCurve[i].inertia };
    // Distance from pt to line p1-p2
    const numerator = Math.abs((p2.y - p1.y) * pt.x - (p2.x - p1.x) * pt.y + p2.x * p1.y - p2.y * p1.x);
    const denominator = Math.sqrt(Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2));
    const dist = denominator === 0 ? 0 : numerator / denominator;
    if (dist > maxDistance && pt.x > kMin && pt.x < kMax) {
      maxDistance = dist;
      elbowK = pt.x;
    }
  }

  elbowCurve.forEach((p) => {
    p.isElbowSuggestion = p.k === elbowK;
  });

  // Best Silhouette
  let maxSil = -1;
  let silK = kMin;
  for (const s of silhouettes) {
    if (s.score > maxSil) {
      maxSil = s.score;
      silK = s.k;
    }
  }
  silhouettes.forEach((s) => {
    s.isOptimal = s.k === silK;
  });

  // Calculate GAP statistic for k=2..7
  const gaps = calculateGapStatistic(data, kMin, Math.min(7, kMax), 5);
  const gapK = gaps.find((g) => g.isGapSuggestion)?.k || silK;

  // Combined suggestion: consensus or weighted preference (Silhouette & Elbow)
  const votes = [elbowK, silK, gapK];
  const counts: Record<number, number> = {};
  votes.forEach((v) => (counts[v] = (counts[v] || 0) + 1));
  let combinedK = silK;
  let maxVote = 0;
  for (const [kStr, vCount] of Object.entries(counts)) {
    if (vCount > maxVote) {
      maxVote = vCount;
      combinedK = Number(kStr);
    }
  }

  return {
    elbowCurve,
    silhouettes,
    gaps,
    suggestedK: {
      elbow: elbowK,
      silhouette: silK,
      gap: gapK,
      combined: combinedK,
    },
  };
}

// Back-transform normalized centroids into absolute original business units (Step 12)
export function invertCentroidToAbsolute(
  normalizedVector: number[],
  variables: string[],
  scalers: Record<
    string,
    { min: number; max: number; mean: number; stdDev: number; median: number; iqr: number }
  >,
  transformations: Record<string, TransformationType>,
  rawMins: Record<string, number>
): Record<string, number> {
  const result: Record<string, number> = {};

  variables.forEach((v, idx) => {
    const normVal = normalizedVector[idx];
    const s = scalers[v];
    const transform = transformations[v] || 'none';
    const rawMin = rawMins[v] || 0;

    // 1. Invert Min-Max scaling [0, 1] -> transformed space
    const transformedVal = s.min + normVal * (s.max - s.min);

    // 2. Invert transformation -> original absolute units
    let absoluteVal = transformedVal;
    if (transform === 'log1p') {
      const shift = rawMin < 0 ? Math.abs(rawMin) : 0;
      absoluteVal = Math.exp(transformedVal) - 1 - shift;
    } else if (transform === 'sqrt') {
      const shift = rawMin < 0 ? Math.abs(rawMin) : 0;
      absoluteVal = Math.pow(transformedVal, 2) - shift;
    } else if (transform === 'yeo_johnson') {
      const lambda = 0.5;
      if (transformedVal >= 0) {
        absoluteVal = Math.pow(transformedVal * lambda + 1, 1 / lambda) - 1;
      } else {
        absoluteVal = -(Math.pow(-transformedVal * (2 - lambda) + 1, 1 / (2 - lambda)) - 1);
      }
    }

    result[v] = Number(absoluteVal.toFixed(2));
  });

  return result;
}

// Color palette for clusters
const CLUSTER_COLORS = [
  '#2563EB', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#6366F1', // Indigo
];

// Generate executive archetypes, descriptions and sector-tailored strategies (Step 13 & 14)
export function generateProfilesAndStrategies(
  k: number,
  centroidsAbsolute: Record<string, number>[],
  centroidsNormalized: number[][],
  assignments: number[],
  variables: string[],
  sectorId: IndustrySector
): ClusterProfile[] {
  const n = assignments.length;
  const sectorInfo = SECTORS.find((s) => s.id === sectorId) || SECTORS[0];

  // Calculate cluster size and percentages
  const sizes = new Array(k).fill(0);
  assignments.forEach((c) => sizes[c]++);

  // Rank clusters by sum of normalized centroid values (overall value score)
  const clusterRanks = centroidsNormalized.map((cVector, cIdx) => {
    const sumScore = cVector.reduce((a, b) => a + b, 0);
    return { clusterIdx: cIdx, sumScore };
  });
  clusterRanks.sort((a, b) => b.sumScore - a.sumScore);

  const profiles: ClusterProfile[] = [];

  for (let c = 0; c < k; c++) {
    const rankIndex = clusterRanks.findIndex((r) => r.clusterIdx === c);
    const size = sizes[c];
    const percentage = Number(((size / n) * 100).toFixed(1));

    // Name assignment based on relative rank and sector
    let archetype = sectorInfo.archetypeNames[rankIndex] || `Segmento Estratégico ${c + 1}`;
    let name = archetype;

    // Build human-friendly description
    const absCentroid = centroidsAbsolute[c];
    const topFeatures = variables
      .map((v) => `${v}: ${absCentroid[v]?.toLocaleString('es-ES')}`)
      .join(' · ');

    const description = `Segmento de ${size} clientes (${percentage}% de la base). Perfil representativo con valores promedio: ${topFeatures}.`;

    // Dynamic sector-grounded strategies (Step 14)
    let pricingStrategy = '';
    let loyaltyStrategy = '';
    let innovationStrategy = '';
    let growthChannels = '';
    let keyKpis: string[] = [];

    if (rankIndex === 0) {
      // Top Tier / High Value
      pricingStrategy = 'Precios Premium por valor añadido. Cero descuentos agresivos; empaquetamiento exclusivo (bundling) con servicios prioritarios y facturación unificada.';
      loyaltyStrategy = 'Programa de fidelización de trato preferencial (White-Glove / Concierge), asignación de Account Manager dedicado y acceso a eventos exclusivos.';
      innovationStrategy = 'Acceso prioritario (Beta testers) a nuevas funcionalidades, co-creación de productos y personalización de módulos a la medida.';
      growthChannels = 'Reuniones ejecutivas directas, canal prioritario WhatsApp VIP, invitaciones personalizadas y cross-selling de líneas premium.';
      keyKpis = ['Customer Lifetime Value (LTV)', 'Net Retention Rate (NRR)', 'Tasa de Satisfacción NPS'];
    } else if (rankIndex === 1) {
      // Middle-high / Growth
      pricingStrategy = 'Estrategia de escalamiento y Up-selling: incentivos de precios por volumen o contratos multianuales con descuentos escalonados.';
      loyaltyStrategy = 'Campañas de fidelización por hitos de compra (milestones), acumulación de puntos canjeables por productos de alto margen.';
      innovationStrategy = 'Recomendaciones inteligentes de productos complementarios basadas en su patrón de consumo recurrente.';
      growthChannels = 'Email marketing segmentado automatizado, notificaciones push in-app y llamadas de asesoría para adopción de nuevas funciones.';
      keyKpis = ['Ticket Promedio', 'Frecuencia de Recompra', 'Tasa de Conversión a Up-selling'];
    } else if (rankIndex === k - 1) {
      // Lowest tier / At risk or low engagement
      pricingStrategy = 'Precios de entrada accesibles (Starter / Freemium / Descuentos puntuales de reactivación) con barreras mínimas de desembolso.';
      loyaltyStrategy = 'Triggers automáticos de reactivación tras días de inactividad, encuestas cortas de satisfacción y cupones de bienvenida de regreso.';
      innovationStrategy = 'Simplificación drástica de la experiencia de compra/onboarding, guías de autoservicio y eliminación de puntos de fricción.';
      growthChannels = 'Retargeting digital, SMS o WhatsApp automatizado con promociones de rescate de tiempo limitado.';
      keyKpis = ['Tasa de Reactivación', 'Tasa de Abandono (Churn)', 'Costo de Adquisición (CAC)'];
    } else {
      // Intermediate / Core
      pricingStrategy = 'Precios estándar de mercado con promociones cruzadas estratégicas (Compre X y reciba Y al 50%).';
      loyaltyStrategy = 'Suscripciones con recompensas periódicas y bonificaciones de cashback para afianzar el hábito de compra.';
      innovationStrategy = 'Lanzamiento de kits prediseñados y paquetes estándar que faciliten la decisión rápida de compra.';
      growthChannels = 'Redes sociales, newsletters temáticas semanales y banners personalizados en plataforma web.';
      keyKpis = ['Frecuencia de Compra', 'Margen de Contribución', 'Margen Bruto'];
    }

    // Specific sector touches
    if (sectorId === 'banking') {
      keyKpis.push('Índice de Morosidad');
    } else if (sectorId === 'saas') {
      keyKpis.push('Product Adoption Rate');
    } else if (sectorId === 'retail') {
      keyKpis.push('Margen sobre Ventas');
    }

    const normCentroidRecord: Record<string, number> = {};
    variables.forEach((v, idx) => {
      normCentroidRecord[v] = Number(centroidsNormalized[c][idx].toFixed(3));
    });

    profiles.push({
      id: c + 1,
      name,
      archetype,
      color: CLUSTER_COLORS[c % CLUSTER_COLORS.length],
      size,
      percentage,
      description,
      centroidAbsolute: absCentroid,
      centroidNormalized: normCentroidRecord,
      pricingStrategy,
      loyaltyStrategy,
      innovationStrategy,
      growthChannels,
      keyKpis,
    });
  }

  return profiles;
}
