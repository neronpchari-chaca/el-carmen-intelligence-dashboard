export type ModuleStage = 'mock' | 'manual-data' | 'validated-data' | 'automated-data' | 'ai-assisted';

export type ModuleCategory = 'core' | 'business' | 'data' | 'intelligence' | 'documents';

export type DataInputMode = 'mock' | 'excel-upload' | 'manual-form' | 'integration' | 'ai-reading';

export type ManagementModule = {
  id: string;
  name: string;
  category: ModuleCategory;
  purpose: string;
  decisions: string[];
  expectedDatasets: string[];
  defaultKpis: string[];
  inputModes: DataInputMode[];
  stage: ModuleStage;
  canBeReplicated: boolean;
};

export const moduleCatalog: ManagementModule[] = [
  {
    id: 'dashboard-global',
    name: 'Dashboard Global',
    category: 'core',
    purpose: 'Mostrar una vision ejecutiva del negocio y sus indicadores principales.',
    decisions: ['Priorizar focos de gestion', 'Detectar desvios', 'Comparar periodos o unidades'],
    expectedDatasets: ['KPIs oficiales', 'Plan o presupuesto', 'Datos operativos consolidados'],
    defaultKpis: ['Resultado general', 'Cumplimiento de plan', 'Alertas criticas'],
    inputModes: ['mock', 'excel-upload', 'integration'],
    stage: 'mock',
    canBeReplicated: true,
  },
  {
    id: 'centro-datos',
    name: 'Centro de Datos',
    category: 'data',
    purpose: 'Centralizar cargas, plantillas, validaciones y estado de datasets.',
    decisions: ['Saber que datos estan listos', 'Detectar errores de carga', 'Priorizar automatizaciones'],
    expectedDatasets: ['Catalogo de datasets', 'Historial de cargas', 'Reglas de validacion'],
    defaultKpis: ['Datasets validados', 'Cargas pendientes', 'Errores de validacion'],
    inputModes: ['excel-upload', 'manual-form', 'integration'],
    stage: 'manual-data',
    canBeReplicated: true,
  },
  {
    id: 'gobierno-datos',
    name: 'Gobierno de Datos',
    category: 'data',
    purpose: 'Definir responsables, frecuencia, version y confiabilidad de cada fuente de informacion.',
    decisions: ['Asignar responsables', 'Ordenar fuentes oficiales', 'Evitar indicadores sin definicion'],
    expectedDatasets: ['Responsables', 'Frecuencias', 'Estados de validacion', 'Versiones'],
    defaultKpis: ['Cobertura de datasets con owner', 'Cumplimiento de actualizacion', 'Datasets observados'],
    inputModes: ['manual-form', 'excel-upload'],
    stage: 'manual-data',
    canBeReplicated: true,
  },
  {
    id: 'rrhh',
    name: 'Recursos Humanos',
    category: 'business',
    purpose: 'Administrar dotacion, ausencias, costos laborales, vencimientos y alertas de personal.',
    decisions: ['Gestionar dotacion', 'Controlar ausentismo', 'Anticipar vencimientos', 'Analizar costo laboral'],
    expectedDatasets: ['Empleados', 'Ausencias', 'Novedades', 'Costos laborales', 'Vencimientos'],
    defaultKpis: ['Dotacion activa', 'Ausentismo', 'Costo laboral', 'Vencimientos criticos', 'Rotacion'],
    inputModes: ['mock', 'excel-upload', 'integration', 'ai-reading'],
    stage: 'mock',
    canBeReplicated: true,
  },
  {
    id: 'finanzas',
    name: 'Finanzas',
    category: 'business',
    purpose: 'Gestionar cash flow, resultados, presupuestos, cobranzas, pagos y conversiones de moneda.',
    decisions: ['Prever caja', 'Controlar desvios', 'Priorizar pagos', 'Analizar rentabilidad'],
    expectedDatasets: ['Cash Flow', 'Tipos de Cambio', 'Presupuesto', 'Cobranzas', 'Pagos'],
    defaultKpis: ['Caja proyectada', 'Resultado neto', 'Desvio vs presupuesto', 'Resultado USD'],
    inputModes: ['mock', 'excel-upload', 'integration'],
    stage: 'manual-data',
    canBeReplicated: true,
  },
  {
    id: 'produccion',
    name: 'Produccion',
    category: 'business',
    purpose: 'Monitorear avance operativo, volumen, eficiencia, calidad y restricciones productivas.',
    decisions: ['Detectar cuellos de botella', 'Medir cumplimiento de plan', 'Anticipar faltantes'],
    expectedDatasets: ['Plan de produccion', 'Partes diarios', 'Inventario', 'Calidad'],
    defaultKpis: ['Avance vs plan', 'Eficiencia', 'Volumen producido', 'Desvios de calidad'],
    inputModes: ['mock', 'excel-upload', 'integration'],
    stage: 'mock',
    canBeReplicated: true,
  },
  {
    id: 'ia-analitica',
    name: 'IA Analitica',
    category: 'intelligence',
    purpose: 'Leer datos, detectar inconsistencias, explicar variaciones y generar informacion oportuna.',
    decisions: ['Entender causas', 'Priorizar acciones', 'Detectar riesgos', 'Preparar resumenes ejecutivos'],
    expectedDatasets: ['Datasets validados', 'Historico de KPIs', 'Documentos relevantes'],
    defaultKpis: ['Alertas explicadas', 'Inconsistencias detectadas', 'Resumenes generados'],
    inputModes: ['ai-reading', 'integration'],
    stage: 'ai-assisted',
    canBeReplicated: true,
  },
];
