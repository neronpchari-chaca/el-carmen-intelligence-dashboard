import type { ModuleStage } from './moduleCatalog';

export type BusinessProfile = {
  id: string;
  name: string;
  industry: string;
  regions: string[];
  activeModules: string[];
  futureModules: string[];
  dataMaturity: ModuleStage;
  primaryUsers: string[];
  managementQuestions: string[];
};

export const businessProfiles: BusinessProfile[] = [
  {
    id: 'el-carmen',
    name: 'El Carmen Intelligence',
    industry: 'Agro, genetica y gestion regional',
    regions: ['Argentina', 'Brasil'],
    activeModules: ['dashboard-global', 'centro-datos', 'gobierno-datos', 'finanzas'],
    futureModules: ['produccion', 'ia-analitica'],
    dataMaturity: 'manual-data',
    primaryUsers: ['Direccion', 'Finanzas', 'Operaciones', 'Control de Gestion'],
    managementQuestions: [
      'Como evoluciona el negocio por pais?',
      'Que datasets estan listos para tomar decisiones?',
      'Donde hay desvios de cash flow, royalties o produccion?',
      'Que informacion conviene automatizar primero?',
    ],
  },
  {
    id: 'empresa-rrhh-demo',
    name: 'Empresa Demo RRHH',
    industry: 'Gestion de personal',
    regions: ['Operacion principal'],
    activeModules: ['dashboard-global', 'rrhh', 'centro-datos', 'gobierno-datos'],
    futureModules: ['finanzas', 'ia-analitica', 'documents'],
    dataMaturity: 'mock',
    primaryUsers: ['Direccion', 'RRHH', 'Finanzas', 'Jefes de Area'],
    managementQuestions: [
      'Cual es la dotacion activa?',
      'Donde sube el ausentismo?',
      'Que vencimientos requieren accion?',
      'Como evoluciona el costo laboral?',
    ],
  },
];

export const getBusinessProfile = (id: string) => businessProfiles.find((profile) => profile.id === id);
