# Blueprint de negocio: El Carmen

## Identidad

- Nombre del negocio: El Carmen Intelligence.
- Industria: agro, genetica, produccion y gestion regional.
- Pais o region: Argentina y Brasil.
- Unidades de negocio: genetica, royalties, produccion, multiplicadores, finanzas, documentos.
- Responsable principal: direccion / control de gestion.

## Objetivo de gestion

Crear una plataforma ejecutiva para centralizar informacion critica, comparar Argentina y Brasil, validar datasets y convertir informacion dispersa en decisiones de gestion.

Decisiones principales:

- Donde crece o cae el negocio por pais.
- Como evolucionan royalties, hectareas, produccion y cash flow.
- Que datasets estan completos, pendientes u observados.
- Que informacion necesita automatizarse primero.

## Usuarios

| Usuario | Necesidad | Frecuencia de uso |
| --- | --- | --- |
| Direccion | Ver estado global, alertas y evolucion regional | Semanal |
| Finanzas | Cargar cash flow, tipos de cambio y conversion USD | Mensual |
| Operaciones | Seguir produccion, lotes, multiplicadores y pendientes | Semanal |
| Control de gestion | Validar datasets, KPIs y consistencia | Semanal |

## Modulos activos

- [x] Dashboard global
- [x] Regiones Argentina/Brasil
- [x] Comparativo AR-BR
- [x] Centro de datos
- [x] Gobierno de datos
- [x] Estado del sistema
- [ ] Finanzas completo
- [ ] Produccion completo
- [ ] Documentos
- [ ] Inteligencia analitica

## Datasets iniciales

| Dataset | Responsable | Frecuencia | Formato actual | Estado |
| --- | --- | --- | --- | --- |
| Tipos de Cambio | Finanzas Corporativas | Mensual | Excel/manual | Validado / pendiente segun mes |
| Cash Flow Operativo | Control de Gestion AR-BR | Mensual | Excel/manual | En revision |
| Cash Flow Brasil | Finanzas Brasil | Mensual | Excel/manual | Validado mock |
| Royalties Brasil | Revenue Assurance Brasil | Quincenal | Excel/manual | Observado |
| Hectareas por Pais | Planeamiento Regional | Mensual | Excel/manual | Validado |
| Pipeline Genetico | Genetica | Mensual | Excel/manual | Observado |

## KPIs oficiales iniciales

| KPI | Formula | Fuente | Responsable | Semaforo |
| --- | --- | --- | --- | --- |
| Hectareas bajo genetica | Suma hectareas por pais y campana | Hectareas por Pais | Planeamiento | Variacion vs plan |
| Royalties proyectados | Cobros y contratos esperados convertidos a USD | Royalties + TC | Finanzas | Desvio vs plan |
| Produccion semilla original | Toneladas por campana | Produccion | Operaciones | Cumplimiento plan |
| Market share regional | Participacion estimada por pais | Comercial/mercado | Direccion | Tendencia trimestral |
| Resultado cash flow USD | Ingresos - egresos convertido a USD | Cash Flow + TC | Finanzas | Positivo/negativo |

## Reglas de negocio

- Toda conversion a USD debe conservar monto original, moneda original, tipo de cambio aplicado y monto convertido.
- Argentina y Brasil se miran por separado y tambien consolidados.
- Ningun dataset observado debe alimentar indicadores oficiales sin advertencia visible.
- La carga manual via Excel es aceptable para maqueta; la automatizacion viene despues de validar uso.

## Version inicial aceptable

La primera version aceptable debe permitir:

- Entrar al dashboard.
- Ver KPIs globales y comparativos AR-BR.
- Ver estado de datasets.
- Simular carga y validacion de datos.
- Ver gobierno de datos y roadmap.
- Explicar claramente que falta para pasar de maqueta a sistema operativo real.

## Roadmap

| Fase | Objetivo | Estado |
| --- | --- | --- |
| 1 | Maqueta visual y navegacion enterprise | En curso |
| 2 | Gobierno de datos y estado del sistema | En curso |
| 3 | Separacion de configuracion por negocio | Proximo |
| 4 | Carga real de Excel y persistencia | Pendiente |
| 5 | Usuarios, permisos y auditoria | Pendiente |
| 6 | IA analitica, alertas y reportes automaticos | Pendiente |
