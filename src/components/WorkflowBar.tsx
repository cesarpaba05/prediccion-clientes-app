import React from 'react';
import { Check } from 'lucide-react';

export interface StepDef {
  number: number;
  label: string;
  short: string;
  category: string;
}

export const STEPS: StepDef[] = [
  { number: 1, label: 'App Segmentación', short: 'Inicio', category: 'Ingesta' },
  { number: 2, label: 'Subir Archivo', short: 'Carga', category: 'Ingesta' },
  { number: 3, label: 'Filas 3-5', short: 'Vista Previa', category: 'Ingesta' },
  { number: 4, label: 'Variables Continuas', short: 'Variables', category: 'Configuración' },
  { number: 5, label: 'Sector de Negocio', short: 'Sector', category: 'Configuración' },
  { number: 6, label: 'Análisis Descriptivo & Reglas', short: 'Descriptivos', category: 'Diagnóstico' },
  { number: 7, label: 'Histogramas de Sesgo', short: 'Sesgos', category: 'Diagnóstico' },
  { number: 8, label: 'Transformación', short: 'Transformar', category: 'Procesamiento' },
  { number: 9, label: 'Estandarización 0-1', short: 'Escala [0,1]', category: 'Procesamiento' },
  { number: 10, label: 'Codo, Silueta & GAP', short: 'Métricas K', category: 'Clustering' },
  { number: 11, label: 'Seleccionar K (Regla Negocio)', short: 'Elegir K', category: 'Clustering' },
  { number: 12, label: 'Centroides Escala Real', short: 'Centroides', category: 'Resultados' },
  { number: 13, label: 'Definir Perfiles', short: 'Perfiles', category: 'Resultados' },
  { number: 14, label: 'Estrategias de Negocio', short: 'Estrategias', category: 'Acción' },
];

interface WorkflowBarProps {
  currentStep: number;
  maxStepReached: number;
  onSelectStep: (step: number) => void;
}

export const WorkflowBar: React.FC<WorkflowBarProps> = ({
  currentStep,
  maxStepReached,
  onSelectStep,
}) => {
  return (
    <div className="bg-white border-b border-neutral-200 overflow-x-auto scrollbar-none py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[960px] gap-1">
        {STEPS.map((s) => {
          const isActive = currentStep === s.number;
          const isPassed = currentStep > s.number;
          const isAvailable = s.number <= maxStepReached;

          return (
            <button
              key={s.number}
              onClick={() => isAvailable && onSelectStep(s.number)}
              disabled={!isAvailable}
              className={`flex-1 flex flex-col items-center group relative px-1 py-1 rounded transition-colors text-center disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {/* Connector line behind */}
              <div className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold mb-1 transition-all">
                {isPassed ? (
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                ) : isActive ? (
                  <span className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-sm ring-2 ring-neutral-900/20">
                    {s.number}
                  </span>
                ) : (
                  <span className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200 flex items-center justify-center group-hover:bg-neutral-200">
                    {s.number}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] font-medium leading-tight truncate max-w-[85px] ${
                  isActive
                    ? 'text-neutral-900 font-semibold'
                    : isPassed
                    ? 'text-neutral-700'
                    : 'text-neutral-500'
                }`}
              >
                {s.short}
              </span>

              {isActive && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-neutral-900" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
