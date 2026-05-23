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
