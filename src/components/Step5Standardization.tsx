import React from 'react';
import { Scale, CheckCircle2, ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { ScalingType } from '../types/segmentation';

interface Step5StandardizationProps {
  variables: string[];
  scalingType: ScalingType;
  onChangeScalingType: (type: ScalingType) => void;
  scaledPreview: number[][];
  rawPreview: Record<string, any>[];
  scalers: Record<
    string,
    { min: number; max: number; mean: number; stdDev: number; median: number; iqr: number }
  >;
  onNext: () => void;
  onPrev: () => void;
}

export const Step5Standardization: React.FC<Step5StandardizationProps> = ({
  variables,
  scalingType,
  onChangeScalingType,
  scaledPreview,
  rawPreview,
  scalers,
  onNext,
  onPrev,
}) => {
  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Paso 9 · Normalización de Escalas Multidimensionales
            </div>
            <h3 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-neutral-700" />
              Estandarización 0 y 1 (Min-Max Scaling)
            </h3>
            <p className="text-xs text-neutral-600 mt-1 max-w-3xl">
              Si una variable mide montos anuales ($5,000 USD) y otra mide frecuencia (4 visitas), la diferencia monetaria dominaría el 99.9% de la distancia euclídea. La estandarización al rango acotado <strong>[0, 1]</strong> garantiza que cada dimensión aporte el mismo peso relativo en la segmentación.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-lg shrink-0">
            <button
              onClick={() => onChangeScalingType('minmax')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                scalingType === 'minmax'
                  ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Min-Max [0, 1] (Requerido)
            </button>
            <button
              onClick={() => onChangeScalingType('zscore')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                scalingType === 'zscore'
                  ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Z-Score (Media 0, Std 1)
            </button>
          </div>
        </div>
      </div>

      {/* Math Formula Card & Scaler Bounds */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            Fórmula Matemática Aplicada
          </h4>
          <div className="p-3 bg-neutral-50 rounded-lg font-mono text-xs text-neutral-900 text-center border border-neutral-200">
            {scalingType === 'minmax'
              ? "x' = (x - x_min) / (x_max - x_min)"
              : "z = (x - μ) / σ"}
          </div>
          <p className="text-[11px] text-neutral-600 mt-3 leading-relaxed">
            {scalingType === 'minmax'
              ? 'Todos los valores se proyectan linealmente en el intervalo cerrado [0.000, 1.000]. El valor mínimo histórico se convierte en 0 y el valor máximo en 1.'
              : 'Estandarización gaussiana estándar centrada en cero con desviación típica unitaria.'}
          </p>
        </div>

        <div className="md:col-span-2 bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            Parámetros de Re-escalado por Variable
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {variables.map((v) => {
              const s = scalers[v];
              if (!s) return null;
              return (
                <div key={v} className="p-2.5 bg-neutral-50 rounded border border-neutral-100">
                  <div className="text-xs font-bold text-neutral-900 truncate">{v}</div>
                  <div className="text-[10px] text-neutral-500 font-mono tabular-nums mt-1 space-y-0.5">
                    <div>Min: {s.min.toFixed(2)} → 0.000</div>
                    <div>Max: {s.max.toFixed(2)} → 1.000</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scaled Matrix Inspection Table */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-base font-bold text-neutral-900">
              Matriz Estandarizada Lista para el Algoritmo (Primeras 5 Filas)
            </h4>
            <p className="text-xs text-neutral-500 mt-0.5">
              Valores normalizados exactos que alimentarán la función de pérdida de K-Means.
            </p>
          </div>
          <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Escalas Homogéneas
          </span>
        </div>

        <div className="border border-neutral-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs font-mono tabular-nums">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 uppercase text-[10px] tracking-wider font-semibold font-sans">
              <tr>
                <th className="py-2.5 px-3 border-r border-neutral-200 w-12 text-center">Fila</th>
                {variables.map((v) => (
                  <th key={v} className="py-2.5 px-3 border-r border-neutral-200 last:border-r-0">
                    {v} <span className="text-[9px] text-neutral-400 font-normal">([0,1])</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white text-[11px]">
              {scaledPreview.slice(0, 5).map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-2.5 px-3 text-center border-r border-neutral-200 text-neutral-400 font-sans">
                    {rIdx + 1}
                  </td>
                  {row.map((val, cIdx) => (
                    <td key={cIdx} className="py-2.5 px-3 border-r border-neutral-200 last:border-r-0 text-neutral-800">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{val.toFixed(3)}</span>
                        {/* Mini bar gauge */}
                        <div className="w-12 h-1.5 bg-neutral-100 rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full bg-neutral-800 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, val * 100))}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onPrev}
          className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Regresar a Histogramas & Transformación
        </button>

        <button
          onClick={onNext}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-sm"
        >
          Avanzar al Paso 10 (Diagnóstico de K: Codo, Silueta & GAP) <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
