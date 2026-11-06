import React from 'react';
import { BarChart2, TrendingUp, ArrowRight, ArrowLeft, Zap, Sparkles } from 'lucide-react';
import { DescriptiveStats, TransformationType } from '../types/segmentation';
import { calculateDescriptiveStats, transformValue } from '../utils/statistics';

interface Step4HistogramsTransformProps {
  variables: string[];
  data: Record<string, any>[];
  descriptiveStats: Record<string, DescriptiveStats>;
  transformations: Record<string, TransformationType>;
  onUpdateTransformation: (varName: string, type: TransformationType) => void;
  onApplyRecommendedTransformations: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step4HistogramsTransform: React.FC<Step4HistogramsTransformProps> = ({
  variables,
  data,
  descriptiveStats,
  transformations,
  onUpdateTransformation,
  onApplyRecommendedTransformations,
  onNext,
  onPrev,
}) => {
  return (
    <div className="space-y-8">
      {/* Step 7 & 8 Banner */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Paso 7 & 8 · Validación de Sesgos y Transformación Matemática
            </div>
            <h3 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-neutral-700" />
              Histogramas de Distribución y Corrección de Asimetría
            </h3>
            <p className="text-xs text-neutral-600 mt-1 max-w-3xl">
              Las variables de clientes (monto gastado, órdenes, visitas) suelen tener una distribución fuertemente <strong>sesgada a la derecha</strong> (muchos clientes pequeños y pocos grandes). K-Means asume esfericidad y compacidad. Aplicar transformaciones (como la logarítmica o raíz cuadrada) comprime las colas extremas y genera clusters equilibrados.
            </p>
          </div>

          <button
            onClick={onApplyRecommendedTransformations}
            className="px-4 py-2 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            Aplicar Transformaciones Sugeridas
          </button>
        </div>
      </div>

      {/* Histograms & Transformation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {variables.map((v) => {
          const rawStats = descriptiveStats[v];
          if (!rawStats) return null;

          const currentTransform = transformations[v] || 'none';
          const rawCol = data.map((d) => Number(d[v]) || 0);
          const colMin = Math.min(...rawCol);

          // Compute transformed stats
          const transformedCol = rawCol.map((val) =>
            transformValue(val, currentTransform, colMin)
          );
          const transformedStats = calculateDescriptiveStats(transformedCol);

          const isSkewed = Math.abs(rawStats.skewness) > 0.75;
          const skewDirection =
            rawStats.skewness > 0.75
              ? 'Sesgo a la derecha (+)'
              : rawStats.skewness < -0.75
              ? 'Sesgo a la izquierda (-)'
              : 'Simétrica (Aproximada)';

          // Max count for SVG histogram bar scaling
          const maxRawBin = Math.max(...rawStats.histogram.map((b) => b.count), 1);
          const maxTransBin = Math.max(...transformedStats.histogram.map((b) => b.count), 1);

          return (
            <div
              key={v}
              className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">{v}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500">
                    <span>{skewDirection}</span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">
                      Skew original: {rawStats.skewness > 0 ? `+${rawStats.skewness}` : rawStats.skewness}
                    </span>
                  </div>
                </div>

                {/* Transform Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-500 font-semibold">Transformación:</span>
                  <select
                    value={currentTransform}
                    onChange={(e) =>
                      onUpdateTransformation(v, e.target.value as TransformationType)
                    }
                    className="text-xs bg-neutral-50 border border-neutral-300 rounded px-2.5 py-1 text-neutral-900 font-medium focus:ring-1 focus:ring-neutral-900"
                  >
                    <option value="none">Sin transformación</option>
                    <option value="log1p">Logarítmica log(x + 1)</option>
                    <option value="sqrt">Raíz cuadrada √x</option>
                    <option value="yeo_johnson">Yeo-Johnson</option>
                  </select>
                </div>
              </div>

              {/* Histograms: Original vs Transformed */}
              <div className="grid grid-cols-2 gap-4">
                {/* Original Histogram */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="font-semibold text-neutral-700">Original (Paso 7)</span>
                    <span className="font-mono text-neutral-500 tabular-nums">
                      Skew: {rawStats.skewness}
                    </span>
                  </div>
                  <div className="h-28 bg-neutral-50 border border-neutral-200 rounded p-2 flex items-end gap-1">
                    {rawStats.histogram.map((bin, bIdx) => {
                      const heightPct = Math.round((bin.count / maxRawBin) * 100);
                      return (
                        <div
                          key={bIdx}
                          className="flex-1 bg-neutral-400/80 hover:bg-neutral-600 rounded-t transition-all relative group cursor-pointer"
                          style={{ height: `${Math.max(4, heightPct)}%` }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-neutral-900 text-white text-[9px] rounded whitespace-nowrap pointer-events-none z-10 font-mono">
                            {bin.count} obs [{bin.binStart.toFixed(1)} - {bin.binEnd.toFixed(1)}]
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[9px] text-neutral-400 font-mono mt-1">
                    <span>{rawStats.min.toFixed(0)}</span>
                    <span>{rawStats.max.toFixed(0)}</span>
                  </div>
                </div>

                {/* Transformed Histogram */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="font-semibold text-neutral-700">
                      {currentTransform === 'none' ? 'Sin Transformar' : 'Transformado (Paso 8)'}
                    </span>
                    <span
                      className={`font-mono tabular-nums font-semibold ${
                        Math.abs(transformedStats.skewness) < Math.abs(rawStats.skewness)
                          ? 'text-emerald-700'
                          : 'text-neutral-600'
                      }`}
                    >
                      Skew: {transformedStats.skewness}
                    </span>
                  </div>
                  <div className="h-28 bg-neutral-50 border border-neutral-200 rounded p-2 flex items-end gap-1">
                    {transformedStats.histogram.map((bin, bIdx) => {
                      const heightPct = Math.round((bin.count / maxTransBin) * 100);
                      return (
                        <div
                          key={bIdx}
                          className={`flex-1 rounded-t transition-all relative group cursor-pointer ${
                            currentTransform === 'none'
                              ? 'bg-neutral-300'
                              : 'bg-emerald-600 hover:bg-emerald-700'
                          }`}
                          style={{ height: `${Math.max(4, heightPct)}%` }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-neutral-900 text-white text-[9px] rounded whitespace-nowrap pointer-events-none z-10 font-mono">
                            {bin.count} obs [{bin.binStart.toFixed(2)} - {bin.binEnd.toFixed(2)}]
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[9px] text-neutral-400 font-mono mt-1">
                    <span>{transformedStats.min.toFixed(1)}</span>
                    <span>{transformedStats.max.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Diagnostic Recommendation */}
              <div className="p-2.5 bg-neutral-50 rounded text-[11px] text-neutral-600 border border-neutral-100 flex items-center justify-between">
                <div>
                  {isSkewed && currentTransform === 'none' ? (
                    <span className="text-amber-800">
                      💡 <strong>Recomendación:</strong> Se detectó cola larga (skew {rawStats.skewness}). Se sugiere aplicar transformación <strong>Logarítmica</strong> o <strong>Raíz Cuadrada</strong>.
                    </span>
                  ) : currentTransform !== 'none' ? (
                    <span className="text-emerald-800">
                      ✓ Asimetría reducida de <strong>{rawStats.skewness}</strong> a <strong>{transformedStats.skewness}</strong>. Distribución normalizada para clustering.
                    </span>
                  ) : (
                    <span className="text-neutral-600">
                      Distribución adecuadamente simétrica. Puede mantenerse sin transformación.
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onPrev}
          className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Regresar a Estadísticas & Reglas
        </button>

        <button
          onClick={onNext}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-sm"
        >
          Avanzar al Paso 9 (Estandarización 0 y 1) <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
