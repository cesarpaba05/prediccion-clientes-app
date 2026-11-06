export type VariableType = 'continuous' | 'discrete' | 'categorical' | 'id';

export interface ColumnMeta {
  name: string;
  type: VariableType;
  selected: boolean;
  min: number;
  max: number;
  mean: number;
  nonNullCount: number;
  totalCount: number;
  sampleValues: (string | number)[];
  isIdCandidate: boolean;
}

export type BusinessRuleAction = 'filter' | 'clamp';

export interface BusinessRule {
  min: number | null;
  max: number | null;
  action: BusinessRuleAction;
  enabled: boolean;
}

export interface DescriptiveStats {
  count: number;
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  kurtosis: number;
  histogram: { binStart: number; binEnd: number; count: number }[];
}

export type TransformationType = 'none' | 'log1p' | 'sqrt' | 'yeo_johnson';

export type ScalingType = 'minmax' | 'zscore' | 'robust';

export type IndustrySector =
  | 'retail'
  | 'banking'
  | 'saas'
  | 'telecom'
  | 'health'
  | 'b2b'
  | 'custom';

export interface SectorInfo {
  id: IndustrySector;
  name: string;
  tagline: string;
  commonMetrics: string[];
  archetypeNames: string[];
}

export interface ElbowPoint {
  k: number;
  inertia: number;
  deltaInertia?: number;
  isElbowSuggestion?: boolean;
}

export interface SilhouettePoint {
  k: number;
  score: number;
  isOptimal?: boolean;
}

export interface GapPoint {
  k: number;
  gap: number;
  sk: number;
  observedLogW: number;
  expectedLogW: number;
  isGapSuggestion?: boolean;
}

export interface ClusterProfile {
  id: number;
  name: string;
  archetype: string;
  color: string;
  size: number;
  percentage: number;
  description: string;
  centroidAbsolute: Record<string, number>;
  centroidNormalized: Record<string, number>;
  pricingStrategy: string;
  loyaltyStrategy: string;
  innovationStrategy: string;
  growthChannels: string;
  keyKpis: string[];
}

export interface ClusteringModel {
  k: number;
  variables: string[];
  assignments: number[];
  profiles: ClusterProfile[];
  wcss: number;
  silhouetteScore: number;
  scalingType: ScalingType;
  transformations: Record<string, TransformationType>;
}
