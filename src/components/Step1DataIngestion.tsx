import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, ArrowRight, Table, Sparkles, CheckCircle2 } from 'lucide-react';
import { parseFile } from '../utils/dataParser';
import { SAMPLE_DATASETS } from '../utils/sampleDatasets';
import { ColumnMeta } from '../types/segmentation';

interface Step1DataIngestionProps {
  onDataLoaded: (result: {
    fileName: string;
    data: Record<string, any>[];
    columns: ColumnMeta[];
    previewRows: Record<string, any>[];
    totalRows: number;
    totalColumns: number;
  }) => void;
  data: Record<string, any>[];
  fileName: string;
  previewRows: Record<string, any>[];
  totalRows: number;
  totalColumns: number;
  onNext: () => void;
}

export const Step1DataIngestion: React.FC<Step1DataIngestionProps> = ({
  onDataLoaded,
  data,
  fileName,
  previewRows,
  totalRows,
  totalColumns,
  onNext,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewLimit, setPreviewLimit] = useState<number>(5);

  const handleFile = async (file: File) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await parseFile(file);
      onDataLoaded(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar el archivo. Verifique el formato.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSampleSelect = (key: string) => {
    const sample = SAMPLE_DATASETS[key];
    if (!sample) return;
    setIsLoading(true);
    setErrorMsg(null);
    setTimeout(() => {
      // Analyze sample data
      import('../utils/dataParser').then(({ analyzeColumns }) => {
        const columns = analyzeColumns(sample.data);
        onDataLoaded({
          fileName: `${sample.name}.xlsx`,
          data: sample.data,
          columns,
          previewRows: sample.data.slice(0, 5),
          totalRows: sample.data.length,
          totalColumns: columns.length,
        });
        setIsLoading(false);
      });
    }, 150);
  };

  const currentPreview = data.slice(0, previewLimit);
  const colKeys = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="space-y-8">
      {/* Step 1 Introduction Banner */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Paso 1 · Suite de Segmentación Científica y de Negocios
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              SegmentaStudio: De los Datos a la Estrategia Comercial
            </h2>
            <p className="text-sm text-neutral-600 mt-1 max-w-3xl">
              Plataforma analítica rigurosa en 14 pasos que valida la idoneidad matemática de tus datos, corrige sesgos de distribución, calcula métricas objetivas de agrupamiento (Codo, Silueta y GAP Statistic), rescata los centroides en valores reales de negocio y genera planes estratégicos de precios, innovación y retención.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-neutral-500">Formatos soportados:</span>
            <span className="text-xs font-semibold px-2 py-1 bg-neutral-100 rounded text-neutral-800">.xlsx</span>
            <span className="text-xs font-semibold px-2 py-1 bg-neutral-100 rounded text-neutral-800">.xls</span>
            <span className="text-xs font-semibold px-2 py-1 bg-neutral-100 rounded text-neutral-800">.csv</span>
            <span className="text-xs font-semibold px-2 py-1 bg-neutral-100 rounded text-neutral-800">.txt</span>
          </div>
        </div>
      </div>

      {/* Step 2 File Upload & Sample Datasets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Dropzone */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-neutral-700" />
              Paso 2 · Cargar Archivo de Datos
            </h3>
            <span className="text-xs text-neutral-500">Delimitadores autodetectados (coma, punto y coma, tabulación)</span>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-neutral-900 bg-neutral-50'
                : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50/50 hover:bg-neutral-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.txt,.tsv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFile(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 rounded-full bg-white border border-neutral-200 shadow-sm mx-auto flex items-center justify-center text-neutral-700 mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-neutral-900">
              Arrastra tu archivo aquí o haz clic para explorar
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Soporta hojas de Excel (.xlsx, .xls), archivos CSV con separadores automáticos y archivos de texto (.txt).
            </p>

            {isLoading && (
              <div className="mt-4 text-xs font-medium text-neutral-600 animate-pulse">
                Procesando estructura y examinando variables...
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {data.length > 0 && !isLoading && (
            <div className="mt-4 flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  Archivo cargado con éxito: <strong>{fileName}</strong> ({totalRows.toLocaleString('es-ES')} filas, {totalColumns} columnas)
                </span>
              </div>
              <button
                onClick={onNext}
                className="font-semibold underline hover:text-emerald-950 flex items-center gap-1"
              >
                Continuar a Selección de Variables <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 1-Click Sample Datasets */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-amber-600" />
              Datasets de Prueba Inmediata
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              ¿No tienes un archivo a mano? Haz clic en uno de nuestros conjuntos preconfigurados con patrones reales del mercado:
            </p>

            <div className="space-y-3">
              {Object.entries(SAMPLE_DATASETS).map(([key, s]) => (
                <button
                  key={key}
                  onClick={() => handleSampleSelect(key)}
                  className="w-full text-left p-3 rounded-lg border border-neutral-200 hover:border-neutral-900 bg-white hover:bg-neutral-50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900 group-hover:text-black">
                      {s.name}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                      {s.sector}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 mt-1 leading-snug">
                    {s.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500">
            Tip: Cada dataset incluye variables continuas con sesgos típicos de negocio (moneda, frecuencia, uso) listos para transformar.
          </div>
        </div>
      </div>

      {/* Step 3: First 3-5 Rows Preview */}
      {data.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                <Table className="w-5 h-5 text-neutral-700" />
                Paso 3 · Vista Previa de Primeras Filas
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Mostrando las primeras {previewLimit} filas del total de {totalRows.toLocaleString('es-ES')} registros detectados ({totalColumns} variables).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-500">Filas a mostrar:</span>
              <div className="flex items-center bg-neutral-100 rounded-lg p-0.5">
                {[3, 5, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setPreviewLimit(num)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      previewLimit === num
                        ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="border border-neutral-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3 border-r border-neutral-200 w-12 text-center">#</th>
                  {colKeys.map((col) => (
                    <th key={col} className="py-2.5 px-3 border-r border-neutral-200 last:border-r-0 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white font-mono text-[11px] tabular-nums">
                {currentPreview.map((row, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-2.5 px-3 text-center border-r border-neutral-200 text-neutral-400 font-sans">
                      {idx + 1}
                    </td>
                    {colKeys.map((col) => (
                      <td key={col} className="py-2.5 px-3 border-r border-neutral-200 last:border-r-0 whitespace-nowrap text-neutral-800">
                        {typeof row[col] === 'number'
                          ? row[col].toLocaleString('es-ES')
                          : String(row[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Action */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onNext}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-sm"
            >
              Continuar al Paso 4 & 5 (Revisión de Variables y Sector) <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
