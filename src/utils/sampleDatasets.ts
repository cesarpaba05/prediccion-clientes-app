import { IndustrySector, SectorInfo } from '../types/segmentation';

export const SECTORS: SectorInfo[] = [
  {
    id: 'retail',
    name: 'Retail & E-commerce',
    tagline: 'Comercio omnicanal, supermercados, moda y tiendas online',
    commonMetrics: ['Recencia (días)', 'Frecuencia (órdenes)', 'Monto Total ($)', 'Ticket Promedio ($)', 'Devoluciones (%)'],
    archetypeNames: ['Compradores VIP / Alto Ticket', 'Frecuentes de Ticket Medio', 'Cazadores de Promociones', 'Compradores Ocasionales', 'Clientes en Riesgo de Fuga'],
  },
  {
    id: 'banking',
    name: 'Banca & FinTech',
    tagline: 'Servicios financieros, billeteras digitales, microcréditos y tarjetas',
    commonMetrics: ['Saldo Promedio ($)', 'Uso Línea Crédito (%)', 'Transacciones / Mes', 'Días Atraso Pago', 'Ingreso Estimado ($)'],
    archetypeNames: ['Premium / Alta Riqueza', 'Usuarios Intensivos de Débito', 'Revolving / Financiamiento Alto', 'Bajo Riesgo Conservadores', 'Alerta de Morosidad'],
  },
  {
    id: 'saas',
    name: 'SaaS & B2B Software',
    tagline: 'Plataformas de software por suscripción, apps empresariales y cloud',
    commonMetrics: ['MRR ($ Mensual)', 'Horas de Uso Semanal', 'Usuarios Activos', 'Tickets de Soporte', 'NPS Score'],
    archetypeNames: ['Enterprise Champions / Power Users', 'Equipos en Crecimiento', 'Clientes Pasivos / Riesgo de Churn', 'High-Touch / Soporte Elevado', 'Nuevos en Onboarding'],
  },
  {
    id: 'telecom',
    name: 'Telecomunicaciones & Hogar',
    tagline: 'Operadores móviles, fibra óptica, conectividad y streaming',
    commonMetrics: ['Consumo Datos (GB)', 'Facturación Mensual ($)', 'Minutos de Voz', 'Antigüedad (Meses)', 'Recargas Prepago ($)'],
    archetypeNames: ['Data Heavy Streamers', 'Familias Multi-Línea Alta Factura', 'Prepago Ocasional', 'Tradicionales de Voz', 'En Riesgo de Portabilidad'],
  },
  {
    id: 'health',
    name: 'Salud, Farmacia & Bienestar',
    tagline: 'Cadenas farmacéuticas, clínicas y centros de acondicionamiento',
    commonMetrics: ['Gasto Mensual ($)', 'Frecuencia Visitas', 'Productos Tratamiento', 'Tasa Adherencia (%)', 'Antigüedad (Años)'],
    archetypeNames: ['Pacientes Crónicos / Recurrentes', 'Wellness & Preventivo', 'Compradores de Emergencia', 'Familiares Cuidadores'],
  },
  {
    id: 'b2b',
    name: 'Distribución Mayorista B2B',
    tagline: 'Venta industrial, suministros, distribuidores y hostelería',
    commonMetrics: ['Volumen Compra Mensual ($)', 'Frecuencia de Pedidos', 'Plazo Medio Pago (Días)', 'SKUs Comprados', 'Margen Contribución (%)'],
    archetypeNames: ['Grandes Cuentas Clave', 'Distribuidores Regionales', 'Compradores de Temporada', 'Cuentas Pequeñas Alto Margen'],
  },
  {
    id: 'custom',
    name: 'Sector Personalizado',
    tagline: 'Cualquier industria o modelo de negocio con datos propios',
    commonMetrics: ['Métrica 1', 'Métrica 2', 'Métrica 3'],
    archetypeNames: ['Segmento 1', 'Segmento 2', 'Segmento 3', 'Segmento 4'],
  },
];

// Helper to generate realistic data rows with synthetic skewness and cluster structure
function generateRetailDataset(): Record<string, any>[] {
  const data: Record<string, any>[] = [];
  
  // 4 latent groups for realistic segmentation
  // Group 1: VIP Champions (15%)
  for (let i = 1; i <= 45; i++) {
    data.push({
      Cliente_ID: `CLI-VIP-${1000 + i}`,
      Recencia_Dias: Math.round(5 + Math.random() * 20),
      Frecuencia_Anual: Math.round(18 + Math.random() * 22),
      Monto_Total_USD: Math.round(2400 + Math.random() * 3800),
      Ticket_Promedio_USD: Math.round(95 + Math.random() * 70),
      Devoluciones_Pct: +(1.2 + Math.random() * 3.5).toFixed(1),
    });
  }

  // Group 2: Frequent Medium Value (35%)
  for (let i = 1; i <= 100; i++) {
    data.push({
      Cliente_ID: `CLI-MED-${2000 + i}`,
      Recencia_Dias: Math.round(25 + Math.random() * 55),
      Frecuencia_Anual: Math.round(8 + Math.random() * 9),
      Monto_Total_USD: Math.round(650 + Math.random() * 900),
      Ticket_Promedio_USD: Math.round(60 + Math.random() * 35),
      Devoluciones_Pct: +(2.0 + Math.random() * 5.0).toFixed(1),
    });
  }

  // Group 3: Bargain Hunters / Low Frequency (30%)
  for (let i = 1; i <= 85; i++) {
    data.push({
      Cliente_ID: `CLI-OCAS-${3000 + i}`,
      Recencia_Dias: Math.round(60 + Math.random() * 110),
      Frecuencia_Anual: Math.round(2 + Math.random() * 3),
      Monto_Total_USD: Math.round(110 + Math.random() * 240),
      Ticket_Promedio_USD: Math.round(35 + Math.random() * 25),
      Devoluciones_Pct: +(4.0 + Math.random() * 9.0).toFixed(1),
    });
  }

  // Group 4: Churn Risk / Hibernating (20%)
  for (let i = 1; i <= 60; i++) {
    data.push({
      Cliente_ID: `CLI-FUGA-${4000 + i}`,
      Recencia_Dias: Math.round(150 + Math.random() * 210),
      Frecuencia_Anual: Math.round(1 + Math.random() * 2),
      Monto_Total_USD: Math.round(70 + Math.random() * 180),
      Ticket_Promedio_USD: Math.round(45 + Math.random() * 30),
      Devoluciones_Pct: +(5.5 + Math.random() * 10.0).toFixed(1),
    });
  }

  return data;
}

function generateBankingDataset(): Record<string, any>[] {
  const data: Record<string, any>[] = [];

  // Group 1: High Wealth / Private Banking
  for (let i = 1; i <= 40; i++) {
    data.push({
      ID_Cuenta: `CTA-PRV-${5000 + i}`,
      Saldo_Promedio_USD: Math.round(12000 + Math.random() * 28000),
      Uso_Linea_Credito_Pct: +(5 + Math.random() * 20).toFixed(1),
      Transacciones_Mensuales: Math.round(35 + Math.random() * 35),
      Dias_Atraso_Historico: Math.round(Math.random() * 2),
      Ingreso_Mensual_Est_USD: Math.round(4500 + Math.random() * 6000),
    });
  }

  // Group 2: Middle Class Active Revolvers
  for (let i = 1; i <= 90; i++) {
    data.push({
      ID_Cuenta: `CTA-REV-${6000 + i}`,
      Saldo_Promedio_USD: Math.round(1800 + Math.random() * 3500),
      Uso_Linea_Credito_Pct: +(60 + Math.random() * 35).toFixed(1),
      Transacciones_Mensuales: Math.round(20 + Math.random() * 25),
      Dias_Atraso_Historico: Math.round(3 + Math.random() * 15),
      Ingreso_Mensual_Est_USD: Math.round(1600 + Math.random() * 1800),
    });
  }

  // Group 3: Conservative Low Debt
  for (let i = 1; i <= 80; i++) {
    data.push({
      ID_Cuenta: `CTA-CON-${7000 + i}`,
      Saldo_Promedio_USD: Math.round(3200 + Math.random() * 5500),
      Uso_Linea_Credito_Pct: +(5 + Math.random() * 15).toFixed(1),
      Transacciones_Mensuales: Math.round(8 + Math.random() * 12),
      Dias_Atraso_Historico: 0,
      Ingreso_Mensual_Est_USD: Math.round(1900 + Math.random() * 1500),
    });
  }

  // Group 4: At Risk / High Delay
  for (let i = 1; i <= 40; i++) {
    data.push({
      ID_Cuenta: `CTA-RSK-${8000 + i}`,
      Saldo_Promedio_USD: Math.round(250 + Math.random() * 800),
      Uso_Linea_Credito_Pct: +(85 + Math.random() * 14).toFixed(1),
      Transacciones_Mensuales: Math.round(12 + Math.random() * 15),
      Dias_Atraso_Historico: Math.round(25 + Math.random() * 45),
      Ingreso_Mensual_Est_USD: Math.round(850 + Math.random() * 700),
    });
  }

  return data;
}

function generateSaaSDataset(): Record<string, any>[] {
  const data: Record<string, any>[] = [];

  // Enterprise Tier
  for (let i = 1; i <= 35; i++) {
    data.push({
      Empresa_ID: `CORP-ENT-${100 + i}`,
      MRR_USD: Math.round(1200 + Math.random() * 2500),
      Horas_Uso_Semanal: Math.round(45 + Math.random() * 40),
      Usuarios_Activos: Math.round(40 + Math.random() * 80),
      Tickets_Soporte_Ano: Math.round(4 + Math.random() * 8),
      NPS_Score: Math.round(8 + Math.random() * 2),
    });
  }

  // Growth / Mid-market
  for (let i = 1; i <= 85; i++) {
    data.push({
      Empresa_ID: `CORP-MID-${200 + i}`,
      MRR_USD: Math.round(250 + Math.random() * 450),
      Horas_Uso_Semanal: Math.round(22 + Math.random() * 20),
      Usuarios_Activos: Math.round(12 + Math.random() * 18),
      Tickets_Soporte_Ano: Math.round(2 + Math.random() * 6),
      NPS_Score: Math.round(7 + Math.random() * 3),
    });
  }

  // Startups / Small teams
  for (let i = 1; i <= 70; i++) {
    data.push({
      Empresa_ID: `CORP-STR-${300 + i}`,
      MRR_USD: Math.round(49 + Math.random() * 120),
      Horas_Uso_Semanal: Math.round(8 + Math.random() * 14),
      Usuarios_Activos: Math.round(2 + Math.random() * 5),
      Tickets_Soporte_Ano: Math.round(1 + Math.random() * 3),
      NPS_Score: Math.round(6 + Math.random() * 4),
    });
  }

  // Disengaged / Churn Risk
  for (let i = 1; i <= 40; i++) {
    data.push({
      Empresa_ID: `CORP-DSG-${400 + i}`,
      MRR_USD: Math.round(89 + Math.random() * 200),
      Horas_Uso_Semanal: Math.round(1 + Math.random() * 4),
      Usuarios_Activos: Math.round(1 + Math.random() * 2),
      Tickets_Soporte_Ano: Math.round(8 + Math.random() * 15),
      NPS_Score: Math.round(2 + Math.random() * 4),
    });
  }

  return data;
}

export const SAMPLE_DATASETS: Record<
  string,
  { name: string; sector: IndustrySector; description: string; data: Record<string, any>[] }
> = {
  retail_rfm: {
    name: 'Retail & E-commerce (RFM)',
    sector: 'retail',
    description: '290 clientes con Recencia, Frecuencia, Gasto Monetario total, Ticket Promedio y Tasa de Devolución.',
    data: generateRetailDataset(),
  },
  banking_fintech: {
    name: 'FinTech & Banca de Consumo',
    sector: 'banking',
    description: '250 cuentas bancarias con Saldos, Uso de Crédito, Transacciones, Morosidad e Ingresos estimados.',
    data: generateBankingDataset(),
  },
  saas_b2b: {
    name: 'SaaS & Suscripciones B2B',
    sector: 'saas',
    description: '230 empresas con MRR mensual, Horas de uso en plataforma, Usuarios activos, Soporte y NPS.',
    data: generateSaaSDataset(),
  },
};
