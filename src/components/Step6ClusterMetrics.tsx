import React from 'react';
import { LineChart, BarChart3, HelpCircle, Check, ArrowRight, ArrowLeft, Lightbulb, Compass } from 'lucide-react';
import { ElbowPoint, GapPoint, SilhouettePoint } from '../types/segmentation';

interface Step6ClusterMetricsProps {
  elbowCurve: ElbowPoint[];
  silhouettes: SilhouettePoint[];
  gaps: GapPoint[];
  suggestedK: {
    elbow: number;
    silhouette: number;
    gap: number;
    combined: number;
  };
  selectedK: number;
  onSelectK: (k: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step6ClusterMetrics: React.FC<Step6ClusterMetricsProps> = ({
  elbowCurve,
  silhouettes,
  gaps,
  suggestedK,
  selectedK,
  onSelectK,
  onNext,
  onPrev,
}) => {
  // Max inertia for SVG scaling
  const maxInertia = Math.max(...elbowCurve.map((p) => p.inertia), 1);
  const minInertia = Math.min(...elbowCurve.map((p) => p.inertia), 0);
  const rangeInertia = maxInertia - minInertia || 1;

  // Max and min GAP for SVG scaling
  const maxGap = Math.max(...gaps.map((p) => p.gap + p.sk), 1);
  const minGap = Math.min(...gaps.map((p) => p.gap - p.sk), 0);
  const rangeGap = maxGap - minGap || 1;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div>
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            Paso 10 & 11 · Diagnóstico Estadístico y Regla de Negocio para $K$
          </div>
          <h3 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-neutral-700" />
            Determinación del Número Óptimo de Segmentos ($K$)
          </h3>
          <p className="text-xs text-neutral-600 mt-1 max-w-3xl">
            Combinamos tres metodologías matemáticas independientes: el <strong>Método del Codo (WCSS)</strong>, el <strong>Coeficiente de Silueta</strong> y la <strong>Estadística GAP</strong> (simulación Monte Carlo vs distribución nula uniforme). Finalmente, como exige la buena práctica analítica, aplicamos la <strong>Regla del Negocio</strong> para validar la viabilidad operativa comercial.
          </p>
        </div>
      </div>

      {/* Step 10: 3 Statistical Diagnostics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Elbow Diagram */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-neutral-900">
                1. Diagrama de Codo (Elbow)
              </h4>
              <span className="text-[10px] font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                WCSS / Inercia
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mb-3">
              Busca el punto de curvatura máxima donde la ganancia marginal de compacidad decrece.
            </p>

            {/* SVG Line Chart for Elbow */}
            <div className="h-44 w-full bg-neutral-50 border border-neutral-200 rounded-lg p-3 relative flex flex-col justify-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 240 120">
                {/* Horizontal grid lines */}
                <line x1="20" y1="20" x2="230" y2="20" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="20" y1="60" x2="230" y2="60" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="20" y1="100" x2="230" y2="100" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />

                {/* Polyline */}
                {elbowCurve.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth="2.5"
                    points={elbowCurve
                      .map((p, idx) => {
                        const x = 30 + (idx / (elbowCurve.length - 1)) * 190;
                        const y = 105 - ((p.inertia - minInertia) / rangeInertia) * 90;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                )}

                {/* Dots */}
                {elbowCurve.map((p, idx) => {
                  const x = 30 + (idx / (elbowCurve.length - 1)) * 190;
                  const y = 105 - ((p.inertia - minInertia) / rangeInertia) * 90;
                  const isSug = p.k === suggestedK.elbow;
                  return (
                    <g key={p.k} className="cursor-pointer" onClick={() => onSelectK(p.k)}>
                      <circle
                        cx={x}
                        cy={y}
                        r={isSug ? 5 : 3.5}
                        fill={isSug ? '#2563EB' : '#0F172A'}
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                      {isSug && (
                        <text
                          x={x}
                          y={y - 8}
                          textAnchor="middle"
                          className="text-[9px] font-bold fill-blue-600 font-mono"
                        >
                          Codo: K={p.k}
                        </text>
                      )}
                      <text
                        x={x}
                        y="118"
                        textAnchor="middle"
                        className="text-[9px] fill-neutral-500 font-mono"
                      >
                        {p.k}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Sugerencia Codo:</span>
            <span className="font-bold text-neutral-900 font-mono">K = {suggestedK.elbow}</span>
          </div>
        </div>

        {/* 2. Silhouette Score */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-neutral-900">
                2. Coeficiente de Silueta
              </h4>
              <span className="text-[10px] font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                Separación & Cohesión
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mb-3">
              Mide la distancia intra-cluster vs distancia al cluster más cercano (rango -1 a +1; mayor es mejor).
            </p>

            {/* Silhouette Bar Chart */}
            <div className="h-44 w-full bg-neutral-50 border border-neutral-200 rounded-lg p-3 flex items-end gap-2">
              {silhouettes.map((s) => {
                const maxSilScore = Math.max(...silhouettes.map((p) => p.score), 0.5);
                const heightPct = Math.round((Math.max(0, s.score) / maxSilScore) * 100);
                const isOpt = s.k === suggestedK.silhouette;

                return (
                  <div
                    key={s.k}
                    onClick={() => onSelectK(s.k)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    <span className="text-[9px] font-mono font-medium text-neutral-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {s.score.toFixed(2)}
                    </span>
                    <div
                      className={`w-full rounded-t transition-all ${
                        isOpt
                          ? 'bg-emerald-600 group-hover:bg-emerald-700 ring-2 ring-emerald-500/30'
                          : 'bg-neutral-300 group-hover:bg-neutral-400'
                      }`}
                      style={{ height: `${Math.max(10, heightPct)}%` }}
                    />
                    <span
                      className={`text-[10px] font-mono mt-1 ${
                        isOpt ? 'font-bold text-emerald-800' : 'text-neutral-500'
                      }`}
                    >
                      K={s.k}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Máxima Silueta:</span>
            <span className="font-bold text-emerald-700 font-mono">K = {suggestedK.silhouette}</span>
          </div>
        </div>

        {/* 3. GAP Statistic */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-neutral-900">
                3. Estadística GAP (Tibshirani)
              </h4>
              <span className="text-[10px] font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                Monte Carlo vs Nula
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mb-3">
              Compara la dispersión observada con muestras de distribución uniforme nula (Regla 1-SE).
            </p>

            {/* SVG GAP Chart with error bars */}
            <div className="h-44 w-full bg-neutral-50 border border-neutral-200 rounded-lg p-3 relative flex flex-col justify-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 240 120">
                <line x1="20" y1="20" x2="230" y2="20" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="20" y1="60" x2="230" y2="60" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="20" y1="100" x2="230" y2="100" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />

                {/* Line */}
                {gaps.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="2.5"
                    points={gaps
                      .map((p, idx) => {
                        const x = 30 + (idx / (gaps.length - 1)) * 190;
                        const y = 105 - ((p.gap - minGap) / rangeGap) * 85;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                )}

                {/* Points & Error Bars */}
                {gaps.map((p, idx) => {
                  const x = 30 + (idx / (gaps.length - 1)) * 190;
                  const y = 105 - ((p.gap - minGap) / rangeGap) * 85;
                  const isSug = p.k === suggestedK.gap;
                  const errHeight = (p.sk / rangeGap) * 85;

                  return (
                    <g key={p.k} className="cursor-pointer" onClick={() => onSelectK(p.k)}>
                      {/* Error bar line */}
                      <line
                        x1={x}
                        y1={Math.max(10, y - errHeight)}
                        x2={x}
                        y2={Math.min(105, y + errHeight)}
                        stroke="#C4B5FD"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r={isSug ? 5 : 3.5}
                        fill={isSug ? '#7C3AED' : '#8B5CF6'}
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                      {isSug && (
                        <text
                          x={x}
                          y={y - 10}
                          textAnchor="middle"
                          className="text-[9px] font-bold fill-violet-700 font-mono"
                        >
                          GAP: K={p.k}
                        </text>
                      )}
                      <text
                        x={x}
                        y="118"
                        textAnchor="middle"
                        className="text-[9px] fill-neutral-500 font-mono"
                      >
                        {p.k}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Sugerencia GAP:</span>
            <span className="font-bold text-violet-700 font-mono">K = {suggestedK.gap}</span>
          </div>
        </div>
      </div>

      {/* Step 11: Business Rule Cluster Selector */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Paso 11 · Selección de Clusters por Regla del Negocio
            </div>
            <h4 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              Decisión Final de K según Capacidad Operativa y Negocio
            </h4>
            <p className="text-xs text-neutral-600 mt-1 max-w-3xl">
              Las matemáticas proponen (Consenso sugerido: <strong>K = {suggestedK.combined}</strong>), pero la <strong>Regla del Negocio</strong> dispone. Un número muy alto de clusters ($K \ge 6$) pulveriza las campañas y satura al equipo comercial. Un número muy bajo ($K = 2$) pierde matices cruciales de comportamiento.
            </p>
          </div>

          <div className="px-4 py-2 bg-neutral-900 text-white rounded-xl flex items-center gap-3 shrink-0 shadow-sm">
            <span className="text-xs font-medium text-neutral-300">Cluster K Seleccionado:</span>
            <span className="text-2xl font-black font-mono">{selectedK}</span>
          </div>
        </div>

        {/* Interactive Buttons for K */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-6">
          {[2, 3, 4, 5, 6, 7, 8].map((kVal) => {
            const isSelected = selectedK === kVal;
            const isConsensus = suggestedK.combined === kVal;

            return (
              <button
                key={kVal}
                onClick={() => onSelectK(kVal)}
                className={`p-3 rounded-xl border text-center transition-all relative ${
                  isSelected
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                    : 'border-neutral-200 hover:border-neutral-400 bg-white text-neutral-800'
                }`}
              >
                {isConsensus && (
                  <span
                    className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm ${
                      isSelected ? 'bg-amber-400 text-neutral-900' : 'bg-neutral-900 text-white'
                    }`}
                  >
                    Sugerido
                  </span>
                )}
                <div className="text-xl font-black font-mono">{kVal}</div>
                <div className={`text-[10px] mt-0.5 font-medium ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  {kVal === 2
                    ? 'Alto/Bajo'
                    : kVal === 3
                    ? 'Tiers Clásicos'
                    : kVal === 4
                    ? 'Equilibrio'
                    : kVal === 5
                    ? 'Profundidad'
                    : 'Micro-segmentos'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Business Trade-off Explanation Banner */}
        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-xs leading-relaxed text-neutral-700">
          <span className="font-bold text-neutral-900">Justificación Operativa para K = {selectedK}: </span>
          {selectedK === 3 && (
            <span>
              Estructura tripartita clásica (ej. Clientes Premium, Regulares y Ocasionales). Muy fácil de ejecutar por equipos comerciales pequeños; campañas claras con cero riesgo de sobresegmentación.
            </span>
          )}
          {selectedK === 4 && (
            <span>
              Configuración recomendada estándar para empresas con catálogo diversificado (ej. Champions VIP, Clientes en Crecimiento, Cazadores de Ofertas y Clientes en Riesgo de Fuga). Permite crear 4 embudos de fidelización y pricing altamente diferenciados sin saturar la operación.
            </span>
          )}
          {selectedK === 5 && (
            <span>
              Segmentación granular para organizaciones maduras con automatización de marketing (CRM omnicanal), separando clientes nuevos prometedores de aquellos en deserción activa.
            </span>
          )}
          {selectedK === 2 && (
            <span>
              Bipartición elemental (ej. Clientes de Alto Valor vs Bajo Valor). Ideal únicamente para priorización de llamadas directas o filtrado binario.
            </span>
          )}
          {selectedK >= 6 && (
            <span>
              Alta fragmentación. Requiere sistemas de personalización algorítmica en tiempo real para justificar la administración de {selectedK} micro-campañas independientes.
            </span>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onPrev}
          className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Regresar a Estandarización
        </button>

        <button
          onClick={onNext}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-sm"
        >
          Avanzar al Paso 12 (Centroides en Escala Real de Negocio) <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
