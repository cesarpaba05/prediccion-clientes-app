import React from 'react';
import { Download, RefreshCw, BarChart3, Database } from 'lucide-react';

interface HeaderProps {
  onLoadSample: (sampleKey: string) => void;
  onExport: () => void;
  hasData: boolean;
  hasModel: boolean;
  activeStep: number;
  setActiveStep: (step: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  onExport,
  hasData,
  hasModel,
  activeStep,
  setActiveStep,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            S
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-neutral-900 whitespace-nowrap">
              SegmentaStudio
            </span>
          </div>
        </div>

        {/* Zone 2: 4 single-line nav links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
          <button
            onClick={() => setActiveStep(1)}
            className={`transition-colors whitespace-nowrap hover:text-neutral-900 ${
              activeStep <= 3 ? 'text-neutral-900 font-semibold' : ''
            }`}
          >
            1. Ingesta & Datos
          </button>
          <button
            onClick={() => hasData && setActiveStep(4)}
            disabled={!hasData}
            className={`transition-colors whitespace-nowrap hover:text-neutral-900 disabled:opacity-40 disabled:hover:text-neutral-600 ${
              activeStep >= 4 && activeStep <= 8 ? 'text-neutral-900 font-semibold' : ''
            }`}
          >
            2. Diagnóstico & Sesgos
          </button>
          <button
            onClick={() => hasData && setActiveStep(10)}
            disabled={!hasData}
            className={`transition-colors whitespace-nowrap hover:text-neutral-900 disabled:opacity-40 disabled:hover:text-neutral-600 ${
              activeStep >= 10 && activeStep <= 11 ? 'text-neutral-900 font-semibold' : ''
            }`}
          >
            3. Métricas K (Codo/GAP)
          </button>
          <button
            onClick={() => hasModel && setActiveStep(14)}
            disabled={!hasModel}
            className={`transition-colors whitespace-nowrap hover:text-neutral-900 disabled:opacity-40 disabled:hover:text-neutral-600 ${
              activeStep >= 12 ? 'text-neutral-900 font-semibold' : ''
            }`}
          >
            4. Perfiles & Estrategias
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {hasModel ? (
            <button
              onClick={onExport}
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Segmentación (.xlsx)
            </button>
          ) : (
            <button
              onClick={() => onLoadSample('retail_rfm')}
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 shadow-sm"
            >
              <Database className="w-3.5 h-3.5" />
              Cargar Ejemplo Retail RFM
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
