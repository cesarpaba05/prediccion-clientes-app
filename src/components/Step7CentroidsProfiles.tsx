import React, { useState } from 'react';
import { Target, Users, Edit3, ArrowRight, ArrowLeft, PieChart, Sparkles, ScatterChart } from 'lucide-react';
import { ClusterProfile, DescriptiveStats } from '../types/segmentation';

interface Step7CentroidsProfilesProps {
  profiles: ClusterProfile[];
  variables: string[];
  descriptiveStats: Record<string, DescriptiveStats>;
  onUpdateProfileName: (clusterId: number, newName: string) => void;
  onUpdateArchetype: (clusterId: number, newArchetype: string) => void;
  scaledData: number[][];
  assignments: number[];
  onNext: () => void;
  onPrev: () => void;
}

export const Step7CentroidsProfiles: React.FC<Step7CentroidsProfilesProps> = ({
  profiles,
  variables,
  descriptiveStats,
  onUpdateProfileName,
  onUpdateArchetype,
  scaledData,
  assignments,
  onNext,
  onPrev,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempName, setTempName] = useState('');

  // 2D Projection: use first two variables for scatter visualization
  const xVar = variables[0] || '';
  const yVar = variables[1] || variables[0] || '';

  // Max 300 points for crisp fast scatter rendering
  const maxPlotPoints = 350;
  const step = Math.max(1, Math.floor(scaledData.length / maxPlotPoints));
  const scatterPoints: { x: number; y: number; cluster: number }[] = [];
  for (let i = 0; i < scaledData.length; i += step) {
    scatterPoints.push({
      x: scaledData[i][0] || 0,
      y: scaledData[i][1] || 0,
      cluster: assignments[i],
    });
  }

  return (
    <div className="space-y-8">
      {/* Step 12 Banner */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Paso 12 & 13 · Centroides Reales y Arquetipos Ejecutivos
            </div>
            <h3 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-neutral-700" />
              Centroides en Valores Absolutos y Perfiles de Clientes
            </h3>
            <p className="text-xs text-neutral-600 mt-1 max-w-3xl">
              Para bautizar y gobernar los segmentos, des-estandarizamos los centroides matemáticos transformándolos a sus <strong>unidades físicas y monetarias reales</strong> (dólares, transacciones, días de permanencia). A partir de estos valores absolutos, definimos los <strong>perfiles y arquetipos</strong> que el comité directivo y el equipo de ventas pueden accionar de inmediato.
            </p>
          </div>
        </div>
      </div>

      {/* Step 12: Absolute Centroids Table */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-base font-bold text-neutral-900">
              Paso 12 · Tabla de Centroides en Escala Absoluta Real
            </h4>
            <p className="text-xs text-neutral-500 mt-0.5">
              Valores promedio reales del centro de masa de cada cluster comparados con la media general de la empresa.
            </p>
          </div>
          <span className="text-xs text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full font-medium">
            Unidades originales de negocio
          </span>
        </div>

        <div className="border border-neutral-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs font-mono tabular-nums">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 uppercase text-[10px] tracking-wider font-semibold font-sans">
              <tr>
                <th className="py-2.5 px-3 border-r border-neutral-200">Segmento / Arquetipo</th>
                <th className="py-2.5 px-3 border-r border-neutral-200 text-right">Tamaño (% Base)</th>
                {variables.map((v) => (
                  <th key={v} className="py-2.5 px-3 border-r border-neutral-200 last:border-r-0 text-right">
                    {v} <span className="text-[9px] text-neutral-400 font-normal">(Media: {descriptiveStats[v]?.mean})</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white text-[11px]">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-2.5 px-3 border-r border-neutral-200 font-sans font-semibold text-neutral-900">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <span>Cluster {p.id}: {p.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 border-r border-neutral-200 text-right font-sans text-neutral-600">
                    {p.size} clientes (<strong>{p.percentage}%</strong>)
                  </td>
                  {variables.map((v) => {
                    const absVal = p.centroidAbsolute[v] ?? 0;
                    const overallMean = descriptiveStats[v]?.mean || 1;
                    const diffPct = ((absVal - overallMean) / overallMean) * 100;

                    return (
                      <td key={v} className="py-2.5 px-3 border-r border-neutral-200 last:border-r-0 text-right">
                        <div className="font-semibold text-neutral-900">
                          {absVal.toLocaleString('es-ES')}
                        </div>
                        <div
                          className={`text-[9px] font-sans ${
                            diffPct > 5
                              ? 'text-emerald-700 font-medium'
                              : diffPct < -5
                              ? 'text-amber-700 font-medium'
                              : 'text-neutral-500'
                          }`}
                        >
                          {diffPct > 0 ? `+${diffPct.toFixed(0)}%` : `${diffPct.toFixed(0)}%`} vs media
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Step 13: Profiles Cards & 2D Projection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2D Cluster Space Scatter Chart */}
        <div className="lg:col-span-1 bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <ScatterChart className="w-4 h-4 text-neutral-700" />
                Mapa 2D de Agrupamiento
              </h4>
              <span className="text-[10px] text-neutral-500 font-mono">
                {xVar} vs {yVar}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mb-3">
              Proyección en el plano normalizado con centroides representados por rombos.
            </p>

            {/* Scatter SVG */}
            <div className="h-64 w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                {/* Axes */}
                <line x1="20" y1="180" x2="190" y2="180" stroke="#CBD5E1" strokeWidth="1" />
                <line x1="20" y1="10" x2="20" y2="180" stroke="#CBD5E1" strokeWidth="1" />

                {/* Points */}
                {scatterPoints.map((pt, idx) => {
                  const cx = 25 + pt.x * 160;
                  const cy = 175 - pt.y * 160;
                  const profile = profiles[pt.cluster];
                  return (
                    <circle
                      key={idx}
                      cx={cx}
                      cy={cy}
                      r="2.5"
                      fill={profile?.color || '#000'}
                      opacity="0.65"
                    />
                  );
                })}

                {/* Centroids */}
                {profiles.map((p, cIdx) => {
                  const cNormX = p.centroidNormalized[xVar] ?? 0.5;
                  const cNormY = p.centroidNormalized[yVar] ?? 0.5;
                  const cx = 25 + cNormX * 160;
                  const cy = 175 - cNormY * 160;

                  return (
                    <g key={p.id}>
                      <polygon
                        points={`${cx},${cy - 6} ${cx + 6},${cy} ${cx},${cy + 6} ${cx - 6},${cy}`}
                        fill={p.color}
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                      <text
                        x={cx + 8}
                        y={cy + 3}
                        className="text-[9px] font-bold fill-neutral-900 font-mono"
                      >
                        C{p.id}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap gap-2">
            {profiles.map((p) => (
              <div key={p.id} className="flex items-center gap-1.5 text-[10px] text-neutral-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                <span>C{p.id}: {p.name.slice(0, 15)}...</span>
              </div>
            ))}
          </div>
        </div>

        {/* Profiles Cards List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-neutral-700" />
              Paso 13 · Definición de Perfiles y Arquetipos
            </h4>
            <span className="text-xs text-neutral-500">
              Haz clic en el lápiz para personalizar el nombre del segmento
            </span>
          </div>

          <div className="space-y-3">
            {profiles.map((p) => {
              const isEditing = editingId === p.id;

              return (
                <div
                  key={p.id}
                  className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm hover:border-neutral-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-2.5 mb-2.5">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="text-xs font-bold px-2 py-1 border border-neutral-400 rounded focus:ring-1 focus:ring-neutral-900"
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              onUpdateProfileName(p.id, tempName);
                              setEditingId(null);
                            }}
                            className="text-xs font-semibold px-2 py-1 bg-neutral-900 text-white rounded"
                          >
                            Guardar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-neutral-900">
                            Cluster {p.id}: {p.name}
                          </span>
                          <button
                            onClick={() => {
                              setEditingId(p.id);
                              setTempName(p.name);
                            }}
                            className="text-neutral-400 hover:text-neutral-700"
                            title="Editar nombre"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-neutral-600">
                      <span>{p.size} clientes</span>
                      <span>·</span>
                      <span className="font-bold text-neutral-900">{p.percentage}% de la base</span>
                    </div>
                  </div>

                  {/* Summary & Feature footprint */}
                  <p className="text-xs text-neutral-600 leading-relaxed mb-3">
                    {p.description}
                  </p>

                  {/* Absolute Centroid metrics preview strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-neutral-50 rounded-lg p-2.5 border border-neutral-100">
                    {variables.map((v) => (
                      <div key={v}>
                        <span className="text-neutral-500 block truncate">{v}:</span>
                        <span className="font-bold text-neutral-900 font-mono tabular-nums">
                          {p.centroidAbsolute[v]?.toLocaleString('es-ES')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onPrev}
          className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Regresar a Diagnóstico de K
        </button>

        <button
          onClick={onNext}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-sm"
        >
          Avanzar al Paso 14 (Estrategias de Precios, Innovación & Fidelización) <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
