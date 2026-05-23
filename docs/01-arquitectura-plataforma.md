# Arquitectura de plataforma

La plataforma se organiza en capas. Esta separacion permite que el modelo sea replicable y que cada negocio tenga su configuracion sin reescribir toda la aplicacion.

## Capas

### 1. Capa de negocio

Define el contexto: empresa, unidades, paises, areas, objetivos, usuarios y decisiones clave.

Ejemplos:

- El Carmen.
- Brasil.
- Finanzas.
- Produccion.
- Royalties.
- Genetica.

### 2. Capa de datos

Define las fuentes de informacion que alimentan la plataforma.

Cada dataset debe tener:

- Nombre.
- Descripcion.
- Responsable.
- Frecuencia.
- Campos obligatorios.
- Moneda.
- Pais o unidad.
- Estado de validacion.
- Version.

### 3. Capa de reglas

Transforma datos en informacion confiable.

Incluye:

- Validaciones.
- Formulas de KPIs.
- Conversion de monedas.
- Semaforos.
- Alertas.
- Reglas de negocio.

### 4. Capa de modulos

Agrupa pantallas por necesidad de gestion.

Modulos actuales o previstos:

- Dashboard global.
- Dashboard por region.
- Centro de datos.
- Gobierno de datos.
- Estado del sistema.
- Finanzas.
- Produccion.
- Documentos.
- Inteligencia analitica.

### 5. Capa de experiencia

Es la interfaz: tablas, graficos, filtros, tarjetas, alertas y acciones.

La pantalla no debe mandar sobre el modelo. La pantalla debe representar las decisiones que el negocio necesita tomar.

## Estructura objetivo

```text
business/
  _template/
    business-blueprint.md
  el-carmen/
    business-blueprint.md

data/
  navigation
  datasets
  kpis
  governance
  charts

docs/
  arquitectura
  metodologia
  roadmap
  decisiones

components/
  layout
  modules
  charts
  data-center
  governance
```

La estructura actual ya tiene una base funcional, pero todavia concentra demasiado en `mockData.ts` y `DashboardContent.tsx`. La evolucion recomendada es separar datos, reglas y modulos de manera gradual.

## Decision de arquitectura

Para avanzar sin trabarse, se recomienda este orden:

1. Mantener la maqueta actual funcionando.
2. Documentar el modelo replicable.
3. Separar configuraciones por negocio.
4. Separar datasets y KPIs por dominio.
5. Crear componentes reutilizables.
6. Reemplazar datos mock por persistencia real.
7. Agregar permisos, usuarios y auditoria.
