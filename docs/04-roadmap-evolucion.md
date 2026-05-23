# Roadmap de evolucion

Este roadmap ordena el paso de maqueta a plataforma replicable.

## Etapa 1: Orden conceptual

Estado: ahora.

Objetivo: que la plataforma tenga gobierno y metodo.

Entregables:

- Guia de gobierno operativo.
- Arquitectura de plataforma.
- Metodologia replicable.
- Blueprint de El Carmen.
- Template para nuevos negocios.

## Etapa 2: Orden tecnico minimo

Objetivo: separar la app en piezas mas gobernables.

Entregables:

- Separar navegacion, datasets, KPIs y gobierno en archivos propios.
- Crear estructura `business/el-carmen` como primera configuracion real.
- Crear `business/_template` para nuevos negocios.
- Reducir el tamano de `DashboardContent.tsx` dividiendo modulos.

## Etapa 3: Maqueta replicable

Objetivo: poder crear un segundo negocio sin empezar de cero.

Entregables:

- Configuracion por negocio.
- Selector o parametro de negocio.
- Modulos activables por blueprint.
- Datos mock por negocio.
- Checklist de validacion funcional.

## Etapa 4: Datos reales

Objetivo: pasar de mock a operacion controlada.

Entregables:

- Carga real de archivos Excel/CSV.
- Validaciones reales por dataset.
- Persistencia en base de datos.
- Historial de cargas.
- Estado de aprobacion.

## Etapa 5: Usuarios y permisos

Objetivo: que el sistema pueda operar con seguridad.

Entregables:

- Login.
- Roles.
- Permisos por modulo.
- Auditoria de cambios.
- Trazabilidad de cargas.

## Etapa 6: Inteligencia aumentada

Objetivo: que la plataforma no solo muestre datos, sino que ayude a pensar.

Entregables:

- Alertas automaticas.
- Explicacion de variaciones.
- Resumen ejecutivo mensual.
- Preguntas en lenguaje natural sobre datasets.
- Recomendaciones de gestion.

## Proxima decision recomendada

Antes de agregar mas funcionalidades, conviene completar la Etapa 2: ordenar la estructura tecnica minima. Ese paso convierte la maqueta en una base realmente escalable.
