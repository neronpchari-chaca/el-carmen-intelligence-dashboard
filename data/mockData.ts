export type CountryCode = 'argentina' | 'brasil';

export type NavSection = {
  title: string;
  items: { id: string; label: string }[];
};

export const sidebarSections: NavSection[] = [
  {
    title: 'GLOBAL',
    items: [
      { id: 'global-dashboard', label: 'Dashboard Global' },
      { id: 'global-kpis', label: 'KPIs Consolidados' },
      { id: 'global-alerts', label: 'Alertas Ejecutivas' },
    ],
  },
  {
    title: 'REGIONES',
    items: [
      { id: 'region-argentina', label: 'Argentina' },
      { id: 'region-brasil', label: 'Brasil' },
      { id: 'region-compare', label: 'Comparativo AR-BR' },
    ],
  },
  {
    title: 'FUNCIONES',
    items: [
      { id: 'func-genetica', label: 'Genética' },
      { id: 'func-royalties', label: 'Royalties' },
      { id: 'func-produccion', label: 'Producción' },
      { id: 'func-multiplicadores', label: 'Multiplicadores' },
      { id: 'func-finanzas', label: 'Finanzas' },
    ],
  },
  {
    title: 'INTELIGENCIA',
    items: [
      { id: 'intel-forecast', label: 'Forecast' },
      { id: 'intel-escenarios', label: 'Escenarios' },
      { id: 'intel-ia', label: 'IA Analítica' },
      { id: 'intel-oportunidades', label: 'Oportunidades' },
    ],
  },
  {
    title: 'DATOS',
    items: [
      { id: 'data-center', label: 'Centro de Datos' },
      { id: 'data-governance', label: 'Gobierno de Datos' },
      { id: 'system-status', label: 'Estado del Sistema' },
    ],
  },
  {
    title: 'DOCUMENTOS',
    items: [
      { id: 'docs-main', label: 'Documentos' },
      { id: 'docs-wp', label: 'WPs Estratégicos' },
      { id: 'docs-room', label: 'Data Room' },
    ],
  },
];

export const countryKpis: Record<CountryCode, { label: string; value: string; delta: string }[]> = {
  argentina: [
    { label: 'Hectáreas bajo genética', value: '132.000 ha', delta: '+9,1% YoY' },
    { label: 'Captura de royalties', value: '74,2%', delta: '+3,7 pp' },
    { label: 'Market share', value: '39,8%', delta: '+1,9 pp' },
    { label: 'Producción semilla', value: '16.400 t', delta: '+5,2% campaña' },
  ],
  brasil: [
    { label: 'Hectáreas bajo genética', value: '101.000 ha', delta: '+16,4% YoY' },
    { label: 'Captura de royalties', value: '68,4%', delta: '+6,9 pp' },
    { label: 'Market share', value: '34,7%', delta: '+3,1 pp' },
    { label: 'Producción semilla', value: '7.900 t', delta: '+7,4% campaña' },
  ],
};

export const kpisConsolidated = [
  { label: 'Hectáreas bajo genética', value: '233.000 ha', delta: '+12,1% YoY' },
  { label: 'Royalties proyectados', value: 'USD 18,4 M', delta: '+9,2% vs plan' },
  { label: 'Toneladas semilla original', value: '24.300 t', delta: '+4,8% campaña' },
  { label: 'Market share regional', value: '37,5%', delta: '+2,4 pp' },
];

export const royaltiesEvolution = [
  { year: '2021', argentina: 6.1, brasil: 1.3 },
  { year: '2022', argentina: 7.4, brasil: 2.1 },
  { year: '2023', argentina: 8.9, brasil: 3.4 },
  { year: '2024', argentina: 10.2, brasil: 4.8 },
  { year: '2025', argentina: 11.5, brasil: 6.2 },
  { year: '2026', argentina: 12.4, brasil: 7.5 },
];

export const surfaceComparison = [
  { name: '2023', argentina: 98, brasil: 52 },
  { name: '2024', argentina: 110, brasil: 67 },
  { name: '2025', argentina: 121, brasil: 83 },
  { name: '2026', argentina: 132, brasil: 101 },
];

export const compareMetrics = [
  { metric: 'Hectáreas bajo genética', argentina: 132, brasil: 101, unit: 'kha' },
  { metric: 'Captura de royalties', argentina: 74.2, brasil: 68.4, unit: '%' },
  { metric: 'Market share', argentina: 39.8, brasil: 34.7, unit: '%' },
  { metric: 'Crecimiento anual', argentina: 9.1, brasil: 16.4, unit: '%' },
  { metric: 'Multiplicadores activos', argentina: 47, brasil: 39, unit: 'n°' },
  { metric: 'Producción de semilla', argentina: 16.4, brasil: 7.9, unit: 'kt' },
];

export const projectedGrowth = [
  { quarter: 'Q3-2026', conservative: 4.1, target: 5.8, upside: 7.4 },
  { quarter: 'Q4-2026', conservative: 4.4, target: 6.2, upside: 8.3 },
  { quarter: 'Q1-2027', conservative: 4.8, target: 6.9, upside: 9.1 },
  { quarter: 'Q2-2027', conservative: 5.2, target: 7.3, upside: 9.8 },
];

export const placeholdersByModule: Record<string, { title: string; description: string }[]> = {
  default: [
    { title: 'Capa de datos desacoplada por país', description: 'Estructura lista para conectar datasets separados para Argentina y Brasil sin alterar visualizaciones.' },
    { title: 'Gobierno de datos', description: 'Definición de permisos, trazabilidad y versionado para entornos de inteligencia operacional enterprise.' },
    { title: 'Roadmap funcional', description: 'Backlog modular para escalar analítica, workflows y automatización por función.' },
  ],
};


export type DataCenterDatasetStatus = 'ok' | 'incomplete' | 'error';

export type DataCenterDataset = {
  id: string;
  name: string;
  description: string;
  requiredFields: string[];
  supportsProjectedMonths?: number;
  conversionConfig?: {
    enabled: boolean;
    method: 'divide_by_tc_usd';
    supportedCountries: CountryCode[];
    preserveFields: ['originalAmount', 'originalCurrency', 'appliedExchangeRate', 'usdAmount'];
    futureAutomationReady: boolean;
    sourceMode: 'manual_file_upload';
  };
  lastUpdated: string;
  status: DataCenterDatasetStatus;
  validationMessage: string;
  dashboardMetrics?: {
    totalIngresos: number;
    totalEgresos: number;
    resultadoNeto: number;
    cajaAcumulada: number;
    resultadoUsd: number;
    fxDataset: 'Tipos de Cambio';
    supportedCurrencies: Array<'BRL' | 'ARS' | 'USD'>;
    multiCountryReady: boolean;
  };
  cashFlowMonthlyEvolution?: Array<{
    mes: string;
    saldoInicial: number;
    ingresos: number;
    egresos: number;
    netoMensual: number;
    saldoFinal: number;
    saldoFinalUsd: number;
  }>;
};

export const dataCenterDatasets: DataCenterDataset[] = [
  {
    id: 'tipos-cambio',
    name: 'Tipos de Cambio',
    description:
      'Tabla mensual de tipos de cambio por país para convertir datasets operativos a USD sin alterar dashboards existentes.',
    requiredFields: ['Mes', 'País', 'Moneda', 'TC USD', 'Fuente', 'Tipo'],
    supportsProjectedMonths: 12,
    conversionConfig: {
      enabled: true,
      method: 'divide_by_tc_usd',
      supportedCountries: ['argentina', 'brasil'],
      preserveFields: ['originalAmount', 'originalCurrency', 'appliedExchangeRate', 'usdAmount'],
      futureAutomationReady: true,
      sourceMode: 'manual_file_upload',
    },
    lastUpdated: '21 may 2026, 10:30',
    status: 'incomplete',
    validationMessage: 'Pendiente de carga mensual (admite 12 meses proyectados).',
  },
  {
    id: 'cashflow-operativo',
    name: 'Cash Flow Operativo',
    description:
      'Carga mensual estructurada desde Excel para flujo operativo multi-país con consolidación en USD.',
    requiredFields: [
      'Fecha',
      'País',
      'Moneda',
      'Centro',
      'Categoría',
      'Subcategoría',
      'Concepto',
      'Ingreso',
      'Egreso',
      'Observaciones',
    ],
    conversionConfig: {
      enabled: true,
      method: 'divide_by_tc_usd',
      supportedCountries: ['argentina', 'brasil'],
      preserveFields: ['originalAmount', 'originalCurrency', 'appliedExchangeRate', 'usdAmount'],
      futureAutomationReady: true,
      sourceMode: 'manual_file_upload',
    },
    dashboardMetrics: {
      totalIngresos: 2245000,
      totalEgresos: 1732000,
      resultadoNeto: 513000,
      cajaAcumulada: 513000,
      resultadoUsd: 412300,
      fxDataset: 'Tipos de Cambio',
      supportedCurrencies: ['BRL', 'ARS', 'USD'],
      multiCountryReady: true,
    },
    lastUpdated: '22 may 2026, 18:35',
    status: 'incomplete',
    validationMessage: 'Pendiente de carga mensual. Validación de campos, fecha y moneda habilitada.',
  },
  {
    id: 'cashflow-brasil',
    name: 'Cash Flow Brasil',
    description: 'Carga mensual de caja Brasil con saldo inicial/final, neto y acumulado para seguimiento operativo.',
    requiredFields: ['Fecha', 'Moneda', 'Saldo inicial', 'Ingresos', 'Egresos', 'Neto mensual', 'Saldo final/acumulado'],
    conversionConfig: {
      enabled: true,
      method: 'divide_by_tc_usd',
      supportedCountries: ['brasil'],
      preserveFields: ['originalAmount', 'originalCurrency', 'appliedExchangeRate', 'usdAmount'],
      futureAutomationReady: true,
      sourceMode: 'manual_file_upload',
    },
    dashboardMetrics: {
      totalIngresos: 2810000,
      totalEgresos: 2195000,
      resultadoNeto: 615000,
      cajaAcumulada: 1645000,
      resultadoUsd: 118900,
      fxDataset: 'Tipos de Cambio',
      supportedCurrencies: ['BRL', 'USD'],
      multiCountryReady: true,
    },
    cashFlowMonthlyEvolution: [
      { mes: 'ene-2026', saldoInicial: 980000, ingresos: 410000, egresos: 365000, netoMensual: 45000, saldoFinal: 1025000, saldoFinalUsd: 183000 },
      { mes: 'feb-2026', saldoInicial: 1025000, ingresos: 430000, egresos: 372000, netoMensual: 58000, saldoFinal: 1083000, saldoFinalUsd: 190300 },
      { mes: 'mar-2026', saldoInicial: 1083000, ingresos: 465000, egresos: 389000, netoMensual: 76000, saldoFinal: 1159000, saldoFinalUsd: 200100 },
      { mes: 'abr-2026', saldoInicial: 1159000, ingresos: 492000, egresos: 401000, netoMensual: 91000, saldoFinal: 1250000, saldoFinalUsd: 214700 },
      { mes: 'may-2026', saldoInicial: 1250000, ingresos: 538000, egresos: 428000, netoMensual: 110000, saldoFinal: 1360000, saldoFinalUsd: 230500 },
      { mes: 'jun-2026', saldoInicial: 1360000, ingresos: 475000, egresos: 430000, netoMensual: 45000, saldoFinal: 1405000, saldoFinalUsd: 239800 },
      { mes: 'jul-2026', saldoInicial: 1405000, ingresos: 0, egresos: 0, netoMensual: 0, saldoFinal: 1405000, saldoFinalUsd: 246200 },
      { mes: 'ago-2026', saldoInicial: 1405000, ingresos: 0, egresos: 0, netoMensual: 0, saldoFinal: 1405000, saldoFinalUsd: 251000 },
      { mes: 'sep-2026', saldoInicial: 1405000, ingresos: 0, egresos: 0, netoMensual: 0, saldoFinal: 1405000, saldoFinalUsd: 255400 },
      { mes: 'oct-2026', saldoInicial: 1405000, ingresos: 0, egresos: 0, netoMensual: 0, saldoFinal: 1405000, saldoFinalUsd: 258900 },
      { mes: 'nov-2026', saldoInicial: 1405000, ingresos: 0, egresos: 0, netoMensual: 0, saldoFinal: 1405000, saldoFinalUsd: 261500 },
      { mes: 'dic-2026', saldoInicial: 1405000, ingresos: 0, egresos: 0, netoMensual: 0, saldoFinal: 1405000, saldoFinalUsd: 264300 },
    ],
    lastUpdated: '23 may 2026, 09:42',
    status: 'ok',
    validationMessage: 'Validación completada correctamente.',
  },
  {
    id: 'royalties-brasil',
    name: 'Royalties Brasil',
    description: 'Detalle de contratos, cobros y estado de captura de royalties.',
    requiredFields: ['Fecha', 'Variedad', 'Moneda', 'Monto'],
    lastUpdated: '15 may 2026, 16:11',
    status: 'incomplete',
    validationMessage: 'Campo obligatorio vacío',
  },
  {
    id: 'hectareas-pais',
    name: 'Hectáreas por País',
    description: 'Superficie sembrada por país y campaña para tablero regional.',
    requiredFields: ['Fecha', 'País', 'Hectáreas'],
    lastUpdated: '20 may 2026, 12:08',
    status: 'ok',
    validationMessage: 'Validación completada correctamente.',
  },
  {
    id: 'pipeline-genetico',
    name: 'Pipeline Genético',
    description: 'Seguimiento de materiales, etapa de desarrollo y prioridad comercial.',
    requiredFields: ['Fecha', 'Línea', 'Etapa', 'Responsable'],
    lastUpdated: '14 may 2026, 08:25',
    status: 'error',
    validationMessage: 'Moneda inválida',
  },
];

export type DataGovernanceDataset = {
  id: string;
  dataset: string;
  responsable: string;
  frecuenciaActualizacion: string;
  monedaBase: 'USD' | 'ARS' | 'BRL';
  version: string;
  fechaUltimaCarga: string;
  estadoValidacion: 'Validado' | 'En revisión' | 'Observado';
};

export const governanceDatasets: DataGovernanceDataset[] = [
  {
    id: 'gov-1',
    dataset: 'Tipos de Cambio',
    responsable: 'Finanzas Corporativas',
    frecuenciaActualizacion: 'Mensual',
    monedaBase: 'USD',
    version: 'v2.3',
    fechaUltimaCarga: '21 may 2026',
    estadoValidacion: 'Validado',
  },
  {
    id: 'gov-2',
    dataset: 'Cash Flow Operativo',
    responsable: 'Control de Gestión AR-BR',
    frecuenciaActualizacion: 'Mensual',
    monedaBase: 'USD',
    version: 'v1.9',
    fechaUltimaCarga: '22 may 2026',
    estadoValidacion: 'En revisión',
  },
  {
    id: 'gov-3',
    dataset: 'Royalties Brasil',
    responsable: 'Revenue Assurance Brasil',
    frecuenciaActualizacion: 'Quincenal',
    monedaBase: 'BRL',
    version: 'v1.4',
    fechaUltimaCarga: '15 may 2026',
    estadoValidacion: 'Observado',
  },
  {
    id: 'gov-4',
    dataset: 'Hectáreas por País',
    responsable: 'Planeamiento Regional',
    frecuenciaActualizacion: 'Mensual',
    monedaBase: 'USD',
    version: 'v3.1',
    fechaUltimaCarga: '20 may 2026',
    estadoValidacion: 'Validado',
  },
];

export const governanceRoadmap = [
  { trimestre: 'Q3 2026', hito: 'Catálogo centralizado con trazabilidad por versión', estado: 'En curso' },
  { trimestre: 'Q4 2026', hito: 'Workflow de aprobación de cargas y evidencias', estado: 'Planificado' },
  { trimestre: 'Q1 2027', hito: 'Integración API con fuentes oficiales por país', estado: 'Planificado' },
];

export const governanceFutureDatasets = [
  'Cobranza detallada por canal y distribuidor',
  'Inventario de semilla por planta y lote',
  'Proyección de márgenes por unidad de negocio',
];

export const governanceOfficialKpis = [
  'Tasa de validación en primer intento',
  'Tiempo promedio de disponibilidad post-carga',
  'Cobertura de datasets críticos con owner asignado',
  'Cumplimiento de periodicidad de actualización',
];

export const governanceNamingRules = [
  'Formato obligatorio: dominio_pais_granularidad_periodo_version (ej. finanzas_ar_mensual_2026m05_v1).',
  'Nombres en minúsculas, sin espacios, usando guion bajo como separador.',
  'Moneda y país deben explicitarse en columnas metadata_currency y metadata_country.',
];
