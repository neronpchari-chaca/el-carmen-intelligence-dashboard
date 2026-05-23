export type StandardDatasetType = 'cash-flow' | 'employees' | 'inventory' | 'sales' | 'production';

export type IngestionStage =
  | 'received'
  | 'ai-mapping-suggested'
  | 'mapped'
  | 'validation-errors'
  | 'pending-approval'
  | 'approved'
  | 'published';

export type StandardField = {
  key: string;
  label: string;
  required: boolean;
  dataType: 'text' | 'number' | 'date' | 'currency' | 'country' | 'category';
  description: string;
};

export type StandardDatasetSchema = {
  id: StandardDatasetType;
  name: string;
  purpose: string;
  fields: StandardField[];
  validationRules: string[];
};

export type ClientColumnMapping = {
  clientColumn: string;
  standardField: string;
  confidence: number;
  approved: boolean;
  notes?: string;
};

export type ClientIngestionProfile = {
  id: string;
  businessId: string;
  datasetType: StandardDatasetType;
  sourceName: string;
  acceptedFormats: Array<'xlsx' | 'csv' | 'google-sheet' | 'api'>;
  mappings: ClientColumnMapping[];
  requiresHumanApproval: boolean;
  lastReviewedAt?: string;
};

export const standardDatasetSchemas: StandardDatasetSchema[] = [
  {
    id: 'cash-flow',
    name: 'Cash Flow Estandar',
    purpose: 'Normalizar flujos de fondos de distintos clientes a un formato comun para analisis, validacion y dashboards.',
    fields: [
      { key: 'date', label: 'Fecha', required: true, dataType: 'date', description: 'Fecha del movimiento o periodo informado.' },
      { key: 'businessUnit', label: 'Unidad de negocio', required: false, dataType: 'text', description: 'Empresa, area, sucursal o unidad operativa.' },
      { key: 'country', label: 'Pais', required: false, dataType: 'country', description: 'Pais asociado al movimiento.' },
      { key: 'currency', label: 'Moneda', required: true, dataType: 'currency', description: 'Moneda original del movimiento.' },
      { key: 'account', label: 'Cuenta', required: false, dataType: 'text', description: 'Banco, caja, cuenta contable o fuente financiera.' },
      { key: 'category', label: 'Categoria', required: true, dataType: 'category', description: 'Categoria principal del ingreso o egreso.' },
      { key: 'subcategory', label: 'Subcategoria', required: false, dataType: 'category', description: 'Apertura adicional para analisis de gestion.' },
      { key: 'concept', label: 'Concepto', required: true, dataType: 'text', description: 'Descripcion original o normalizada del movimiento.' },
      { key: 'income', label: 'Ingreso', required: false, dataType: 'number', description: 'Importe positivo de entrada de fondos.' },
      { key: 'expense', label: 'Egreso', required: false, dataType: 'number', description: 'Importe positivo de salida de fondos.' },
      { key: 'openingBalance', label: 'Saldo inicial', required: false, dataType: 'number', description: 'Saldo inicial del periodo o cuenta.' },
      { key: 'closingBalance', label: 'Saldo final', required: false, dataType: 'number', description: 'Saldo final del periodo o cuenta.' },
      { key: 'exchangeRateUsd', label: 'Tipo de cambio USD', required: false, dataType: 'number', description: 'Tipo de cambio aplicado para convertir a USD.' },
      { key: 'amountUsd', label: 'Monto USD', required: false, dataType: 'number', description: 'Monto convertido a USD.' },
      { key: 'sourceFile', label: 'Archivo fuente', required: true, dataType: 'text', description: 'Nombre o identificador del archivo original.' },
    ],
    validationRules: [
      'La fecha debe ser valida.',
      'La moneda debe estar dentro de las monedas permitidas.',
      'Debe existir ingreso, egreso o saldo informado.',
      'Ingreso y egreso deben ser numericos y no negativos.',
      'La categoria debe estar reconocida o quedar pendiente de clasificacion.',
      'Si se informa monto USD debe existir tipo de cambio o moneda USD.',
      'Los totales normalizados deben poder compararse contra los totales del archivo original.',
    ],
  },
];

export const ingestionStages: Record<IngestionStage, string> = {
  received: 'Archivo recibido, sin publicar.',
  'ai-mapping-suggested': 'La IA sugirio un mapeo de columnas.',
  mapped: 'El mapeo fue revisado y aplicado.',
  'validation-errors': 'Hay errores que deben corregirse antes de aprobar.',
  'pending-approval': 'La carga esta lista para aprobacion humana.',
  approved: 'La carga fue aprobada como informacion oficial.',
  published: 'La informacion fue publicada en dashboards e indicadores.',
};

export const exampleCashFlowIngestionProfiles: ClientIngestionProfile[] = [
  {
    id: 'el-carmen-cashflow-operativo',
    businessId: 'el-carmen',
    datasetType: 'cash-flow',
    sourceName: 'Cash Flow Operativo El Carmen',
    acceptedFormats: ['xlsx', 'csv'],
    requiresHumanApproval: true,
    lastReviewedAt: '2026-05-23',
    mappings: [
      { clientColumn: 'Fecha', standardField: 'date', confidence: 0.98, approved: true },
      { clientColumn: 'Pais', standardField: 'country', confidence: 0.97, approved: true },
      { clientColumn: 'Moneda', standardField: 'currency', confidence: 0.99, approved: true },
      { clientColumn: 'Centro', standardField: 'businessUnit', confidence: 0.82, approved: true },
      { clientColumn: 'Categoria', standardField: 'category', confidence: 0.96, approved: true },
      { clientColumn: 'Subcategoria', standardField: 'subcategory', confidence: 0.94, approved: true },
      { clientColumn: 'Concepto', standardField: 'concept', confidence: 0.97, approved: true },
      { clientColumn: 'Ingreso', standardField: 'income', confidence: 0.99, approved: true },
      { clientColumn: 'Egreso', standardField: 'expense', confidence: 0.99, approved: true },
    ],
  },
  {
    id: 'cliente-demo-cashflow-bancos',
    businessId: 'cliente-demo',
    datasetType: 'cash-flow',
    sourceName: 'Cash Flow Bancos Cliente Demo',
    acceptedFormats: ['xlsx'],
    requiresHumanApproval: true,
    mappings: [
      { clientColumn: 'Fecha Mov.', standardField: 'date', confidence: 0.91, approved: false, notes: 'Sugerido por IA: revisar formato de fecha.' },
      { clientColumn: 'Banco', standardField: 'account', confidence: 0.88, approved: false },
      { clientColumn: 'Detalle', standardField: 'concept', confidence: 0.79, approved: false, notes: 'Puede requerir clasificacion por categoria.' },
      { clientColumn: 'Entradas', standardField: 'income', confidence: 0.94, approved: false },
      { clientColumn: 'Salidas', standardField: 'expense', confidence: 0.94, approved: false },
    ],
  },
];
