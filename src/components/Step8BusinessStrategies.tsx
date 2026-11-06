import React, { useState } from 'react';
import {
  DollarSign,
  HeartHandshake,
  Lightbulb,
  Send,
  Download,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  TrendingUp,
  Target,
  RefreshCw,
} from 'lucide-react';
import { ClusterProfile, IndustrySector } from '../types/segmentation';

interface Step8BusinessStrategiesProps {
  profiles: ClusterProfile[];
  sector: IndustrySector;
  sampleSize: number;
  variables: string[];
  onExportExcel: () => void;
  onExportCSV: () => void;
  onPrev: () => void;
}

export const Step8BusinessStrategies: React.FC<Step8BusinessStrategiesProps> = ({
  profiles,
  sector,
  sampleSize,
  variables,
  onExportExcel,
  onExportCSV,
  onPrev,
}) => {
  const [selectedClusterId, setSelectedClusterId] = useState<number>(profiles[0]?.id || 1);
  const [activeStrategyPillar, setActiveStrategyPillar] = useState<'all' | 'pricing' | 'loyalty' | 'innovation' | 'growth'>('all');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const currentProfile = profiles.find((p) => p.id === selectedClusterId) || profiles[0];

  const handleGenerateAIInsights = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector,
          clusters: profiles,
          variables: variables.map((v) => ({ name: v })),
          sampleSize,
        }),
      });

      const data = await res.json();
      if (data.success && data.insights) {
        setAiInsights(data.insights);
      } else if (data.fallback) {
        setAiError(data.message || 'Se utilizó el motor analítico nativo.');
      } else {
        setAiError(data.error || 'No fue posible generar el informe con IA.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Error de conexión con el servicio de IA.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Paso 14 · Estrategias de Crecimiento del Negocio
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-neutral-900" />
              Estrategias de Precios, Innovación, Fidelización y Canales
            </h3>
            <p className="text-xs text-neutral-600 mt-1 max-w-3xl">
              La segmentación sólo genera rentabilidad cuando se traduce en tácticas comerciales diferenciadas. Aquí articulamos las directrices operativas específicas para cada segmento: política de precios y descuentos, retención y fidelización, innovaciones de producto/servicio y canales de contacto para maximizar el crecimiento empresarial.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleGenerateAIInsights}
              disabled={aiLoading}
              className="px-4 py-2 text-xs font-semibold text-neutral-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              {aiLoading ? 'Generando con Gemini AI...' : 'Profundizar Estrategia con Gemini AI'}
            </button>
          </div>
        </div>

        {aiError && (
          <div className="mt-4 p-3 bg-neutral-100 text-neutral-700 text-xs rounded-lg border border-neutral-200">
            {aiError}
          </div>
        )}
      </div>

      {/* AI Executive Insights Card (if generated) */}
      {aiInsights && (
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-700 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Dictamen Ejecutivo Gemini AI · Sector: {sector.toUpperCase()}
              </h4>
            </div>
            <span className="text-[11px] text-neutral-300 font-mono">
              Análisis multi-segmento contextualizado
            </span>
          </div>

          <p className="text-xs text-neutral-200 leading-relaxed">
            {aiInsights.sectorOverview || 'Diagnóstico de alto nivel para la base de clientes.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-neutral-800/80 rounded-lg p-3.5 border border-neutral-700">
              <div className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Sinergias de Cross-Selling & Migración
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                {aiInsights.crossSellingSynergies || 'Oportunidades de elevar el ticket de compra entre segmentos.'}
              </p>
            </div>

            <div className="bg-neutral-800/80 rounded-lg p-3.5 border border-neutral-700">
              <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Acción Táctica Inmediata (Primeros 30 Días)
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                {aiInsights.urgentAction || 'Priorizar contacto con clientes en riesgo y oferta exclusiva para VIPs.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Segment Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {profiles.map((p) => {
          const isSelected = p.id === selectedClusterId;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedClusterId(p.id)}
              className={`px-4 py-2.5 rounded-xl border text-left shrink-0 transition-all flex items-center gap-3 ${
                isSelected
                  ? 'border-neutral-900 bg-white shadow-sm ring-1 ring-neutral-900'
                  : 'border-neutral-200 hover:border-neutral-300 bg-white/70'
              }`}
            >
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <div>
                <div className="text-xs font-bold text-neutral-900 whitespace-nowrap">
                  Cluster {p.id}: {p.name}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">
                  {p.size} clientes ({p.percentage}%)
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Segment Strategic Playbook */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: currentProfile.color }}
            />
            <div>
              <h4 className="text-lg font-bold text-neutral-900">
                Plan de Crecimiento · {currentProfile.name}
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                {currentProfile.size} clientes representando el {currentProfile.percentage}% del universo analizado.
              </p>
            </div>
          </div>

          {/* Strategy Pillar Filter Tabs */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
            {(
              [
                { id: 'all', label: 'Todos los Pilares' },
                { id: 'pricing', label: 'Precios' },
                { id: 'loyalty', label: 'Fidelización' },
                { id: 'innovation', label: 'Innovación' },
                { id: 'growth', label: 'Canales' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStrategyPillar(tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeStrategyPillar === tab.id
                    ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Pricing Strategy */}
          {(activeStrategyPillar === 'all' || activeStrategyPillar === 'pricing') && (
            <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <span>1. Estrategia de Precios & Descuentos (Pricing)</span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed mt-2">
                  {currentProfile.pricingStrategy}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200 text-[11px] text-neutral-500">
                Sensibilidad de precio estimada: <strong>{currentProfile.percentage > 35 ? 'Alta elasticidad' : 'Baja elasticidad (Enfoque en valor)'}</strong>
              </div>
            </div>
          )}

          {/* 2. Loyalty & Retention Strategy */}
          {(activeStrategyPillar === 'all' || activeStrategyPillar === 'loyalty') && (
            <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <span>2. Estrategia de Fidelización & Retención</span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed mt-2">
                  {currentProfile.loyaltyStrategy}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200 text-[11px] text-neutral-500">
                Objetivo central: <strong>Reducir tasa de deserción y maximizar LTV (Lifetime Value)</strong>
              </div>
            </div>
          )}

          {/* 3. Innovation & Product Strategy */}
          {(activeStrategyPillar === 'all' || activeStrategyPillar === 'innovation') && (
            <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <span>3. Estrategia de Innovación & Experiencia</span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed mt-2">
                  {currentProfile.innovationStrategy}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200 text-[11px] text-neutral-500">
                Foco de producto: <strong>Eliminación de fricción y catálogo adaptativo</strong>
              </div>
            </div>
          )}

          {/* 4. Growth Channels & Campaigns */}
          {(activeStrategyPillar === 'all' || activeStrategyPillar === 'growth') && (
            <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                  <span>4. Canales de Comunicación y Campañas</span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed mt-2">
                  {currentProfile.growthChannels}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200 text-[11px] text-neutral-500">
                KPIs Clave a Monitorear: <strong className="text-neutral-800">{currentProfile.keyKpis.join(' · ')}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-neutral-900 text-white rounded-xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-neutral-300" />
            Descargar Base de Datos Segmentada
          </h4>
          <p className="text-xs text-neutral-300 mt-1 max-w-xl">
            Exporta tus {sampleSize.toLocaleString('es-ES')} registros enriquecidos con las nuevas columnas <code>Cluster_ID</code> y <code>Nombre_Perfil</code> para integrarlos inmediatamente en tu CRM, ERP o plataforma de marketing omnicanal.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onExportCSV}
            className="px-4 py-2.5 text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Descargar CSV
          </button>
          <button
            onClick={onExportExcel}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Descargar Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onPrev}
          className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Regresar a Centroides & Perfiles
        </button>

        <span className="text-xs text-neutral-500 font-medium">
          ✓ Proceso de segmentación completo en 14 pasos
        </span>
      </div>
    </div>
  );
};
