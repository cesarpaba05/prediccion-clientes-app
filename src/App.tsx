import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { WorkflowBar } from './components/WorkflowBar';
import { Step1DataIngestion } from './components/Step1DataIngestion';
import { Step2VariablesSector } from './components/Step2VariablesSector';
import { Step3DescriptiveRules } from './components/Step3DescriptiveRules';
import { Step4HistogramsTransform } from './components/Step4HistogramsTransform';
import { Step5Standardization } from './components/Step5Standardization';
import { Step6ClusterMetrics } from './components/Step6ClusterMetrics';
import { Step7CentroidsProfiles } from './components/Step7CentroidsProfiles';
import { Step8BusinessStrategies } from './components/Step8BusinessStrategies';
import {
  BusinessRule,
  ClusterProfile,
  ColumnMeta,
  ElbowPoint,
  GapPoint,
  IndustrySector,
  ScalingType,
  SilhouettePoint,
  TransformationType,
} from './types/segmentation';
import { SAMPLE_DATASETS } from './utils/sampleDatasets';
import { analyzeColumns, exportToCSV, exportToExcel } from './utils/dataParser';
import {
  applyBusinessRules,
  calculateDescriptiveStats,
  scaleDataset,
} from './utils/statistics';
import {
  computeClusterDiagnostics,
  generateProfilesAndStrategies,
  invertCentroidToAbsolute,
  runBestKMeans,
} from './utils/clustering';

export default function App() {
  // Load initial Retail RFM sample dataset by default for instant delight
  const initialSample = SAMPLE_DATASETS.retail_rfm;
  const initialCols = useMemo(() => analyzeColumns(initialSample.data), []);

  const [rawFileContent, setRawFileContent] = useState<Record<string, any>[]>(initialSample.data);
  const [fileName, setFileName] = useState<string>('Dataset_Retail_RFM.xlsx');
  const [columns, setColumns] = useState<ColumnMeta[]>(initialCols);
  const [sector, setSector] = useState<IndustrySector>(initialSample.sector);

  const [activeStep, setActiveStep] = useState<number>(1);
  const [maxStepReached, setMaxStepReached] = useState<number>(14);

  // Step 6a Business Rules
  const [businessRules, setBusinessRules] = useState<Record<string, BusinessRule>>({});

  // Step 8 Transformations
  const [transformations, setTransformations] = useState<Record<string, TransformationType>>({
    Monto_Total_USD: 'log1p',
    Recencia_Dias: 'log1p',
  });

  // Step 9 Scaling type
  const [scalingType, setScalingType] = useState<ScalingType>('minmax');

  // Step 11 Selected K
  const [selectedK, setSelectedK] = useState<number>(4);

  // Custom profile names override
  const [customProfileNames, setCustomProfileNames] = useState<Record<number, string>>({});

  // Active continuous variables selected for clustering
  const selectedVariables = useMemo(() => {
    return columns.filter((c) => c.selected && c.type === 'continuous').map((c) => c.name);
  }, [columns]);

  // Apply business rules (Step 6a)
  const {
    processedData,
    affectedRowCount,
    totalBefore,
    totalAfter,
  } = useMemo(() => {
    return applyBusinessRules(rawFileContent, businessRules);
  }, [rawFileContent, businessRules]);

  // Descriptive statistics for all selected variables
  const descriptiveStats = useMemo(() => {
    const stats: Record<string, any> = {};
    for (const v of selectedVariables) {
      const colValues = processedData.map((d) => Number(d[v]) || 0);
      stats[v] = calculateDescriptiveStats(colValues);
    }
    return stats;
  }, [processedData, selectedVariables]);

  // Min-Max raw mins for inverting transformations
  const rawMins = useMemo(() => {
    const mins: Record<string, number> = {};
    for (const v of selectedVariables) {
      mins[v] = descriptiveStats[v]?.min || 0;
    }
    return mins;
  }, [selectedVariables, descriptiveStats]);

  // Scaled dataset matrix (Step 9)
  const { scaledMatrix, scalers } = useMemo(() => {
    if (selectedVariables.length === 0 || processedData.length === 0) {
      return { scaledMatrix: [], scalers: {}, transformedValues: {} };
    }
    return scaleDataset(processedData, selectedVariables, transformations, scalingType);
  }, [processedData, selectedVariables, transformations, scalingType]);

  // Multi-K diagnostics (Step 10: Elbow, Silhouette, GAP)
  const diagnostics = useMemo(() => {
    if (scaledMatrix.length < 10 || selectedVariables.length < 2) {
      return {
        elbowCurve: [],
        silhouettes: [],
        gaps: [],
        suggestedK: { elbow: 3, silhouette: 4, gap: 4, combined: 4 },
      };
    }
    return computeClusterDiagnostics(scaledMatrix, 2, Math.min(8, scaledMatrix.length - 1));
  }, [scaledMatrix, selectedVariables]);

  // Execute K-Means for selected K (Step 11 & 12)
  const clusteringResult = useMemo(() => {
    if (scaledMatrix.length < selectedK || selectedVariables.length < 2) {
      return null;
    }
    const kRes = runBestKMeans(scaledMatrix, selectedK, 5);

    // Invert centroids to absolute units (Step 12)
    const centroidsAbsolute = kRes.centroids.map((cVector) => {
      return invertCentroidToAbsolute(
        cVector,
        selectedVariables,
        scalers,
        transformations,
        rawMins
      );
    });

    // Generate profiles and strategies (Step 13 & 14)
    const baseProfiles = generateProfilesAndStrategies(
      selectedK,
      centroidsAbsolute,
      kRes.centroids,
      kRes.assignments,
      selectedVariables,
      sector
    );

    // Apply custom profile names if edited by user
    const finalProfiles = baseProfiles.map((p) => {
      if (customProfileNames[p.id]) {
        return { ...p, name: customProfileNames[p.id] };
      }
      return p;
    });

    return {
      kRes,
      centroidsAbsolute,
      profiles: finalProfiles,
    };
  }, [
    scaledMatrix,
    selectedK,
    selectedVariables,
    scalers,
    transformations,
    rawMins,
    sector,
    customProfileNames,
  ]);

  // Handler for loading a sample dataset
  const handleLoadSample = (key: string) => {
    const sample = SAMPLE_DATASETS[key];
    if (!sample) return;
    const cols = analyzeColumns(sample.data);
    setRawFileContent(sample.data);
    setFileName(`${sample.name}.xlsx`);
    setColumns(cols);
    setSector(sample.sector);
    setBusinessRules({});
    setCustomProfileNames({});
    setActiveStep(1);
    setMaxStepReached(14);
  };

  // Handler for loaded uploaded file
  const handleDataLoaded = (result: {
    fileName: string;
    data: Record<string, any>[];
    columns: ColumnMeta[];
    previewRows: Record<string, any>[];
    totalRows: number;
    totalColumns: number;
  }) => {
    setRawFileContent(result.data);
    setFileName(result.fileName);
    setColumns(result.columns);
    setBusinessRules({});
    setCustomProfileNames({});
    setActiveStep(3); // Show preview
    setMaxStepReached(14);
  };

  const handleToggleColumn = (colName: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.name === colName ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleUpdateRule = (varName: string, rule: BusinessRule) => {
    setBusinessRules((prev) => ({ ...prev, [varName]: rule }));
  };

  const handleResetRules = () => {
    setBusinessRules({});
  };

  const handleUpdateTransformation = (varName: string, type: TransformationType) => {
    setTransformations((prev) => ({ ...prev, [varName]: type }));
  };

  // Automatically apply log/sqrt transformations to skewed variables (Skew > 0.75)
  const handleApplyRecommendedTransformations = () => {
    const updated: Record<string, TransformationType> = { ...transformations };
    for (const v of selectedVariables) {
      const stats = descriptiveStats[v];
      if (stats && Math.abs(stats.skewness) > 0.75) {
        updated[v] = 'log1p';
      }
    }
    setTransformations(updated);
  };

  const handleUpdateProfileName = (clusterId: number, newName: string) => {
    setCustomProfileNames((prev) => ({ ...prev, [clusterId]: newName }));
  };

  // Export dataset with clusters to CSV or XLSX
  const enrichedData = useMemo(() => {
    if (!clusteringResult) return processedData;
    const profileMap = new Map(clusteringResult.profiles.map((p) => [p.id, p.name]));
    return processedData.map((row, idx) => {
      const cId = (clusteringResult.kRes.assignments[idx] ?? 0) + 1;
      return {
        ...row,
        Cluster_Asignado: `Cluster ${cId}`,
        Nombre_Perfil: profileMap.get(cId) || `Cluster ${cId}`,
      };
    });
  }, [processedData, clusteringResult]);

  const handleExportCSV = () => {
    exportToCSV(enrichedData, `segmentacion_${fileName.replace(/\.[^/.]+$/, '')}.csv`);
  };

  const handleExportExcel = () => {
    exportToExcel(enrichedData, `segmentacion_${fileName.replace(/\.[^/.]+$/, '')}.xlsx`);
  };

  const advanceToStep = (target: number) => {
    setActiveStep(target);
    if (target > maxStepReached) setMaxStepReached(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans antialiased text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* 3-Zone Top Bar */}
      <Header
        onLoadSample={handleLoadSample}
        onExport={handleExportExcel}
        hasData={rawFileContent.length > 0}
        hasModel={clusteringResult !== null}
        activeStep={activeStep}
        setActiveStep={advanceToStep}
      />

      {/* 14-Step Interactive Workflow Progress Bar */}
      <WorkflowBar
        currentStep={activeStep}
        maxStepReached={maxStepReached}
        onSelectStep={advanceToStep}
      />

      {/* Main Analytical Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Steps 1, 2, 3: Ingestion & Preview */}
        {(activeStep === 1 || activeStep === 2 || activeStep === 3) && (
          <Step1DataIngestion
            onDataLoaded={handleDataLoaded}
            data={rawFileContent}
            fileName={fileName}
            previewRows={rawFileContent.slice(0, 5)}
            totalRows={rawFileContent.length}
            totalColumns={columns.length}
            onNext={() => advanceToStep(4)}
          />
        )}

        {/* Steps 4, 5: Continuous Variables & Sector */}
        {(activeStep === 4 || activeStep === 5) && (
          <Step2VariablesSector
            columns={columns}
            onToggleColumn={handleToggleColumn}
            sector={sector}
            onSelectSector={setSector}
            onNext={() => advanceToStep(6)}
            onPrev={() => advanceToStep(3)}
          />
        )}

        {/* Step 6, 6a: Descriptive Statistics & Min/Max Business Rules */}
        {activeStep === 6 && (
          <Step3DescriptiveRules
            variables={selectedVariables}
            descriptiveStats={descriptiveStats}
            businessRules={businessRules}
            onUpdateRule={handleUpdateRule}
            onResetRules={handleResetRules}
            affectedRowCount={affectedRowCount}
            totalBefore={totalBefore}
            totalAfter={totalAfter}
            onNext={() => advanceToStep(7)}
            onPrev={() => advanceToStep(4)}
          />
        )}

        {/* Steps 7, 8: Histograms for Skewness & Mathematical Transformations */}
        {(activeStep === 7 || activeStep === 8) && (
          <Step4HistogramsTransform
            variables={selectedVariables}
            data={processedData}
            descriptiveStats={descriptiveStats}
            transformations={transformations}
            onUpdateTransformation={handleUpdateTransformation}
            onApplyRecommendedTransformations={handleApplyRecommendedTransformations}
            onNext={() => advanceToStep(9)}
            onPrev={() => advanceToStep(6)}
          />
        )}

        {/* Step 9: Standardization [0, 1] */}
        {activeStep === 9 && (
          <Step5Standardization
            variables={selectedVariables}
            scalingType={scalingType}
            onChangeScalingType={setScalingType}
            scaledPreview={scaledMatrix}
            rawPreview={processedData.slice(0, 5)}
            scalers={scalers}
            onNext={() => advanceToStep(10)}
            onPrev={() => advanceToStep(7)}
          />
        )}

        {/* Steps 10, 11: Cluster Diagnostics (Elbow, Silhouette, GAP) & K Business Rule */}
        {(activeStep === 10 || activeStep === 11) && (
          <Step6ClusterMetrics
            elbowCurve={diagnostics.elbowCurve}
            silhouettes={diagnostics.silhouettes}
            gaps={diagnostics.gaps}
            suggestedK={diagnostics.suggestedK}
            selectedK={selectedK}
            onSelectK={setSelectedK}
            onNext={() => advanceToStep(12)}
            onPrev={() => advanceToStep(9)}
          />
        )}

        {/* Steps 12, 13: Absolute Centroids & Profile Definition */}
        {(activeStep === 12 || activeStep === 13) && clusteringResult && (
          <Step7CentroidsProfiles
            profiles={clusteringResult.profiles}
            variables={selectedVariables}
            descriptiveStats={descriptiveStats}
            onUpdateProfileName={handleUpdateProfileName}
            onUpdateArchetype={handleUpdateProfileName}
            scaledData={scaledMatrix}
            assignments={clusteringResult.kRes.assignments}
            onNext={() => advanceToStep(14)}
            onPrev={() => advanceToStep(10)}
          />
        )}

        {/* Step 14: Business Strategies (Pricing, Innovation, Loyalty, Growth) & Gemini AI */}
        {activeStep === 14 && clusteringResult && (
          <Step8BusinessStrategies
            profiles={clusteringResult.profiles}
            sector={sector}
            sampleSize={processedData.length}
            variables={selectedVariables}
            onExportExcel={handleExportExcel}
            onExportCSV={handleExportCSV}
            onPrev={() => advanceToStep(12)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">SegmentaStudio</span>
            <span>·</span>
            <span>Metodología Analítica de Segmentación K-Means</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-500">
            <span>Diagnóstico de Sesgo</span>
            <span>·</span>
            <span>Codo & Silueta & GAP</span>
            <span>·</span>
            <span>Centroides en Escala Real</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
