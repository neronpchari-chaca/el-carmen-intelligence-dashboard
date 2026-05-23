# Metodologia replicable

Esta metodologia esta pensada para una persona de gestion que quiere construir dashboards de negocio con ayuda de IA y desarrollo asistido, sin perder control conceptual.

## Fase 0: Definir el negocio

Preguntas clave:

- Que negocio estoy mirando?
- Que unidades o paises existen?
- Que decisiones quiero mejorar?
- Quienes usan el tablero?
- Que informacion ya existe?
- Que informacion falta?

Salida esperada: `business/<negocio>/business-blueprint.md`.

## Fase 1: Inventario de datos

Por cada fuente de informacion, registrar:

- Nombre del dataset.
- Responsable.
- Frecuencia.
- Formato actual.
- Campos obligatorios.
- Errores frecuentes.
- Nivel de confianza.

Salida esperada: catalogo de datasets.

## Fase 2: KPIs oficiales

Cada KPI debe tener una ficha simple:

- Nombre.
- Pregunta que responde.
- Formula.
- Fuente de datos.
- Frecuencia.
- Responsable.
- Interpretacion.
- Semaforo.

Un KPI sin formula no es oficial.

## Fase 3: Maqueta funcional

Construir primero una version visual con datos mock o Excel.

Objetivo: validar si el usuario entiende, usa y necesita la pantalla.

No automatizar antes de validar.

## Fase 4: Flujo operativo

Definir como se mantiene vivo el tablero:

- Quien carga datos.
- Cuando se carga.
- Como se valida.
- Quien aprueba.
- Como se corrige.
- Que pasa si falta informacion.

## Fase 5: Automatizacion

Recien cuando el flujo manual funciona, automatizar:

- Importacion de Excel.
- Conexion a base de datos.
- APIs externas.
- Alertas.
- Generacion de reportes.
- Analisis con IA.

## Fase 6: Replicacion

Para crear un nuevo negocio:

1. Copiar `business/_template`.
2. Completar el blueprint.
3. Definir datasets.
4. Definir KPIs.
5. Elegir modulos activos.
6. Crear maqueta.
7. Validar con usuarios.
8. Activar integraciones.

## Ritmo recomendado

Trabajar en ciclos cortos de una semana:

- Lunes: definir objetivo de la semana.
- Martes/Miercoles: construir o ajustar.
- Jueves: revisar con datos reales o ejemplo real.
- Viernes: documentar decision y proximo paso.

La documentacion no es burocracia: es la memoria del sistema.
