import React, { useState } from 'react';
import { Sliders, AlertCircle, ArrowRight, ArrowLeft, RefreshCw, CheckCircle, ShieldAlert } from 'lucide-react';
import { BusinessRule, DescriptiveStats } from '../types/segmentation';

interface Step3DescriptiveRulesProps {
  variables: string[];
  descriptiveStats: Record<string, DescriptiveStats>;
  businessRules: Record<string, BusinessRule>;
  onUpdateRule: (varName: string, rule: BusinessRule) => void;
  onResetRules: () => void;
  affectedRowCount: number;
  totalBefore: number;
  totalAfter: number;
  onNext: () => void;
  onPrev: () => void;
}

export const Step3DescriptiveRules: React.FC<Step3DescriptiveRulesProps> = ({
  variables,
  descriptiveStats,
  businessRules,
  onUpdateRule,
  onResetRules,
  affectedRowCount,
  totalBefore,
  totalAfter,
  onNext,
  onPrev,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'rules'>('stats');

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Paso 6 & 6a · Diagnóstico Descriptivo & Reglas de Negocio
            </div>
            <h3 className="text-xl font-bold tracking-tight text-neutral-900">
              Análisis Exploratorio y Control de Calidad
            </h3>
            <p className="text-xs text-neutral-600 mt-1 max-w-3xl">
              Antes de agrupar, examinamos la dispersión real de cada variable y aplicamos reglas de negocio (mínimos y máximos lógicos) para evitar que clientes anómalos o transacciones de prueba distorsionen la formación de clusters.
            </p>
          </div>

          {/* Toggle between stats and rules */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg shrink-0">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'stats'
                  ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Tabla de Estadísticas
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'rules'
                  ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              6a. Reglas Mín/Máx
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Descriptive Statistics Table (Step 6) */}
      {activeTab === 'stats' && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-neutral-900">
                Paso 6 · Resumen Estadístico Paramétrico y No Paramétrico
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                Cálculo de tendencia central, dispersión y medidas de forma sobre {totalAfter.toLocaleString('es-ES')} observaciones válidas.
              </p>
            </div>
          </div>

          <div className="border border-neutral-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs font-mono tabular-nums">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 uppercase text-[10px] tracking-wider font-semibold font-sans">
                <tr>
                  <th className="py-2.5 px-3 border-r border-neutral-200">Variable</th>
                  <th className="py-2.5 px-3 border-r border-neutral-200 text-right">N Válido</th>
                  <th className="py-2.5 px-3 border-r border-neutral-200 text-right">Media</th>
                  <th className="py-2.5 px-3 border-r border-neutral-200 text-right">Mediana</th>
                  <th className="py-2.5 px-3 border-r border-neutral-200 text-right">Desv. Est.</th>
                  <th className="py-2.5 px-3 border-r border-neutral-200 text-right">Mínimo</th>
                  <th className="py-2.5 px-3 border-r border-neutral-200 text-right">Q1 (25%)</th>
                  <th className="py-2.5 px-3 border-r border-neutral-200 text-right">Q3 (75%)</th>
                  <th className="py-2.5 px-3 border-r border-neutral-200 text-right">Máximo</th>
                  <th className="py-2.5 px-3 border-r border-neutral-200 text-right">IQR</th>
                  <th className="py-2.5 px-3 text-right">Asimetría (Skew)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white text-[11px]">
                {variables.map((v) => {
                  const s = descriptiveStats[v];
                  if (!s) return null;
                  const isHighSkew = Math.abs(s.skewness) > 0.75;

                  return (
                    <tr key={v} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-2.5 px-3 border-r border-neutral-200 font-sans font-semibold text-neutral-900">
                        {v}
                      </td>
                      <td className="py-2.5 px-3 border-r border-neutral-200 text-right text-neutral-600">
                        {s.count.toLocaleString('es-ES')}
                      </td>
                      <td className="py-2.5 px-3 border-r border-neutral-200 text-right font-medium text-neutral-900">
                        {s.mean.toLocaleString('es-ES')}
                      </td>
                      <td className="py-2.5 px-3 border-r border-neutral-200 text-right text-neutral-800">
                        {s.median.toLocaleString('es-ES')}
                      </td>
                      <td className="py-2.5 px-3 border-r border-neutral-200 text-right text-neutral-600">
                        {s.stdDev.toLocaleString('es-ES')}
                      </td>
                      <td className="py-2.5 px-3 border-r border-neutral-200 text-right text-neutral-600">
                        {s.min.toLocaleString('es-ES')}
                      </td>
                      <td className="py-2.5 px-3 border-r border-neutral-200 text-right text-neutral-600">
                        {s.q1.toLocaleString('es-ES')}
                      </td>
                      <td className="py-2.5 px-3 border-r border-neutral-200 text-right text-neutral-600">
                        {s.q3.toLocaleString('es-ES')}
                      </td>
                      <td className="py-2.5 px-3 border-r border-neutral-200 text-right text-neutral-900 font-semibold">
                        {s.max.toLocaleString('es-ES')}
                      </td>
                      <td className="py-2.5 px-3 border-r border-neutral-200 text-right text-neutral-600">
                        {s.iqr.toLocaleString('es-ES')}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`font-semibold ${
                            isHighSkew ? 'text-amber-700' : 'text-emerald-700'
                          }`}
                        >
                          {s.skewness > 0 ? `+${s.skewness}` : s.skewness}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
            <span>
              * Una asimetría (skewness) con valor absoluto superior a 0.75 señala sesgo distributivo pronunciado que se corregirá en los Pasos 7 y 8.
            </span>
            <button
              onClick={() => setActiveTab('rules')}
              className="font-semibold text-neutral-900 underline hover:text-black flex items-center gap-1"
            >
              Configurar Reglas de Negocio (Mín/Máx) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Step 6a Business Rules (Max and Min bounds) */}
      {activeTab === 'rules' && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h4 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-neutral-700" />
                Paso 6a · Límites Máximos y Mínimos por Reglas de Negocio
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                Define umbrales de negocio para cada variable. Puedes elegir <strong>Filtrar</strong> (eliminar filas anómalas) o <strong>Acotar/Winsorizar</strong> (ajustar al valor límite sin perder el cliente).
              </p>
            </div>

            <button
              onClick={onResetRules}
              className="px-3 py-1.5 text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Restablecer Límites
            </button>
          </div>

          {/* Impact Alert */}
          <div className="mb-6 p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-neutral-700 shrink-0" />
              <div>
                <span className="font-semibold text-neutral-900">
                  Impacto de las Reglas de Negocio:
                </span>{' '}
                <span className="text-neutral-600">
                  {affectedRowCount > 0
                    ? `${affectedRowCount} registros intervenidos (${totalBefore} iniciales → ${totalAfter} vigentes).`
                    : 'Todas las observaciones cumplen actualmente los umbrales configurados.'}
                </span>
              </div>
            </div>
          </div>

          {/* Rules editor grid */}
          <div className="space-y-4">
            {variables.map((v) => {
              const rule = businessRules[v] || {
                min: null,
                max: null,
                action: 'clamp',
                enabled: false,
              };
              const stats = descriptiveStats[v];
              if (!stats) return null;

              return (
                <div
                  key={v}
                  className="p-4 rounded-lg border border-neutral-200 bg-neutral-50/40 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) =>
                          onUpdateRule(v, { ...rule, enabled: e.target.checked })
                        }
                        className="rounded text-neutral-900 focus:ring-neutral-900 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm font-bold text-neutral-900">{v}</span>
                      <span className="text-xs text-neutral-500 font-mono tabular-nums">
                        [Rango actual: {stats.min.toLocaleString('es-ES')} a {stats.max.toLocaleString('es-ES')}]
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500">Acción:</span>
                      <select
                        disabled={!rule.enabled}
                        value={rule.action}
                        onChange={(e) =>
                          onUpdateRule(v, {
                            ...rule,
                            action: e.target.value as 'filter' | 'clamp',
                          })
                        }
                        className="text-xs bg-white border border-neutral-300 rounded px-2.5 py-1 text-neutral-800 disabled:opacity-40"
                      >
                        <option value="clamp">Acotar / Winsorizar al límite</option>
                        <option value="filter">Filtrar (Excluir filas fuera de rango)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                        Mínimo Permitido por Regla de Negocio
                      </label>
                      <input
                        type="number"
                        disabled={!rule.enabled}
                        placeholder={`Mínimo sugerido: ${stats.min}`}
                        value={rule.min !== null ? rule.min : ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : Number(e.target.value);
                          onUpdateRule(v, { ...rule, min: val });
                        }}
                        className="w-full text-xs font-mono bg-white border border-neutral-300 rounded-lg px-3 py-1.5 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-40"
                      />
                      <span className="text-[10px] text-neutral-500">
                        Ej: Montos de venta mayores a $0 o días de atraso no negativos.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                        Máximo Permitido por Regla de Negocio
                      </label>
                      <input
                        type="number"
                        disabled={!rule.enabled}
                        placeholder={`Máximo sugerido: ${stats.max}`}
                        value={rule.max !== null ? rule.max : ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : Number(e.target.value);
                          onUpdateRule(v, { ...rule, max: val });
                        }}
                        className="w-full text-xs font-mono bg-white border border-neutral-300 rounded-lg px-3 py-1.5 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-40"
                      />
                      <span className="text-[10px] text-neutral-500">
                        Ej: Tope a transacciones mayoristas o exclusión de compras atípicas/fraude.
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onPrev}
          className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Regresar a Variables y Sector
        </button>

        <button
          onClick={onNext}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-sm"
        >
          Avanzar al Paso 7 (Histogramas para Validar Sesgos) <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
