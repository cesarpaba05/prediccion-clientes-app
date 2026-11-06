import React from 'react';
import { CheckSquare, Square, Building2, AlertTriangle, ArrowRight, ArrowLeft, Info, HelpCircle } from 'lucide-react';
import { ColumnMeta, IndustrySector } from '../types/segmentation';
import { SECTORS } from '../utils/sampleDatasets';

interface Step2VariablesSectorProps {
  columns: ColumnMeta[];
  onToggleColumn: (colName: string) => void;
  sector: IndustrySector;
  onSelectSector: (sector: IndustrySector) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step2VariablesSector: React.FC<Step2VariablesSectorProps> = ({
  columns,
  onToggleColumn,
  sector,
  onSelectSector,
  onNext,
  onPrev,
}) => {
  const selectedCount = columns.filter((c) => c.selected).length;
  const hasEnoughVariables = selectedCount >= 2;

  const currentSectorObj = SECTORS.find((s) => s.id === sector) || SECTORS[0];

  return (
    <div className="space-y-8">
      {/* Step 4: Variable Continuous & Numeric Audit */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Paso 4 · Auditoría de Tipos de Variables
            </div>
            <h3 className="text-xl font-bold tracking-tight text-neutral-900">
              Validación de Variables Continuas y Numéricas
            </h3>
            <p className="text-xs text-neutral-600 mt-1 max-w-3xl">
              El algoritmo de segmentación K-Means utiliza distancias euclidianas directas en el espacio $N$-dimensional. Por regla matemática, sólo deben participar <strong>variables numéricas continuas</strong> (montos, recencias, frecuencias, volúmenes). Las variables cualitativas, códigos y claves únicas (IDs) deben ser excluidas del cálculo de distancia para no distorsionar los centroides.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-lg text-xs font-medium text-neutral-700 shrink-0">
            <span>Variables Seleccionadas:</span>
            <span className="font-bold font-mono tabular-nums text-neutral-950">{selectedCount}</span>
            <span className="text-neutral-400">/ {columns.length}</span>
          </div>
        </div>

        {/* Column audit grid */}
        <div className="border border-neutral-200 rounded-lg overflow-hidden divide-y divide-neutral-200">
          <div className="bg-neutral-50 px-4 py-2.5 grid grid-cols-12 text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
            <div className="col-span-1 text-center">Incluir</div>
            <div className="col-span-4">Nombre de Columna</div>
            <div className="col-span-2">Tipo Detectado</div>
            <div className="col-span-3">Rango de Valores / Muestra</div>
            <div className="col-span-2 text-right">Diagnóstico</div>
          </div>

          {columns.map((col) => {
            const isContinuous = col.type === 'continuous';
            const isId = col.isIdCandidate;

            return (
              <div
                key={col.name}
                onClick={() => isContinuous && onToggleColumn(col.name)}
                className={`px-4 py-3 grid grid-cols-12 items-center text-xs transition-colors ${
                  !isContinuous
                    ? 'bg-neutral-50/50 opacity-70 cursor-not-allowed'
                    : col.selected
                    ? 'bg-neutral-50/80 hover:bg-neutral-100/80 cursor-pointer'
                    : 'bg-white hover:bg-neutral-50 cursor-pointer'
                }`}
              >
                {/* Checkbox */}
                <div className="col-span-1 flex justify-center">
                  {col.selected ? (
                    <CheckSquare className="w-4 h-4 text-neutral-900" />
                  ) : (
                    <Square className={`w-4 h-4 ${!isContinuous ? 'text-neutral-300' : 'text-neutral-400'}`} />
                  )}
                </div>

                {/* Name */}
                <div className="col-span-4 font-semibold text-neutral-900 truncate pr-2">
                  {col.name}
                </div>

                {/* Type Badge */}
                <div className="col-span-2">
                  {col.type === 'continuous' ? (
                    <span className="inline-flex items-center text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Numérica Continua
                    </span>
                  ) : col.type === 'id' ? (
                    <span className="inline-flex items-center text-[10px] font-medium text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                      Clave / ID de Cliente
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Categórica / Texto
                    </span>
                  )}
                </div>

                {/* Range or Samples */}
                <div className="col-span-3 text-[11px] text-neutral-600 font-mono tabular-nums truncate pr-2">
                  {isContinuous ? (
                    <span>
                      Min: {col.min.toLocaleString('es-ES')} · Max: {col.max.toLocaleString('es-ES')}
                    </span>
                  ) : (
                    <span className="text-neutral-500 font-sans">
                      Ej: {col.sampleValues.slice(0, 2).join(', ')}...
                    </span>
                  )}
                </div>

                {/* Diagnostic tag */}
                <div className="col-span-2 text-right">
                  {isContinuous ? (
                    col.selected ? (
                      <span className="text-[11px] font-semibold text-emerald-700">Apta para clustering</span>
                    ) : (
                      <span className="text-[11px] text-neutral-500">Omitida voluntariamente</span>
                    )
                  ) : isId ? (
                    <span className="text-[11px] text-neutral-500">Excluida (Identificador)</span>
                  ) : (
                    <span className="text-[11px] text-amber-700">No continua</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!hasEnoughVariables && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Por favor selecciona al menos <strong>2 variables numéricas continuas</strong> para poder construir una segmentación multidimensional.
            </span>
          </div>
        )}
      </div>

      {/* Step 5: Industry Sector Selection */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="mb-4">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            Paso 5 · Sector de Negocio e Industria
          </div>
          <h3 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-neutral-700" />
            Sector al que Pertenece la Organización
          </h3>
          <p className="text-xs text-neutral-600 mt-1 max-w-3xl">
            La industria define el vocabulario del cliente, las reglas lógicas de mínimos y máximos tolerables, los arquetipos de perfiles esperados y el plan de acción estratégico (políticas de precios, retención y fidelización).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECTORS.map((s) => {
            const isSelected = s.id === sector;
            return (
              <button
                key={s.id}
                onClick={() => onSelectSector(s.id)}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'border-neutral-900 bg-neutral-50/70 shadow-sm ring-1 ring-neutral-900'
                    : 'border-neutral-200 hover:border-neutral-400 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-neutral-900">{s.name}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-neutral-900" />
                  )}
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed mb-3">
                  {s.tagline}
                </p>
                <div className="text-[11px] text-neutral-500">
                  <span className="font-semibold text-neutral-700">Métricas típicas: </span>
                  {s.commonMetrics.join(' · ')}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-neutral-50 rounded-lg text-xs text-neutral-600 border border-neutral-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-neutral-500 shrink-0" />
          <span>
            Sector activo: <strong>{currentSectorObj.name}</strong>. Las estrategias finales de pricing, innovación y retención se personalizarán para este mercado.
          </span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onPrev}
          className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Regresar a Vista Previa
        </button>

        <button
          onClick={onNext}
          disabled={!hasEnoughVariables}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Avanzar al Paso 6 (Análisis Descriptivo & Reglas de Negocio) <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
