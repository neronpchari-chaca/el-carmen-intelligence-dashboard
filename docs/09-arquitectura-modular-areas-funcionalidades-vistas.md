# Arquitectura modular: Areas, funcionalidades y vistas

## Regla madre

La plataforma se organiza como:

**Area > Funcionalidad > Vistas**

Esta regla evita que la plataforma se vuelva pesada y permite activar capacidades por cliente, por negocio o por etapa de madurez.

## Dashboard Global

El Dashboard Global no es el lugar para mostrar todo el analisis. Su objetivo es mostrar focos ejecutivos:

- Alertas criticas.
- Maxima exposicion.
- Indicadores de salud.
- Riesgos proximos.
- Desvios relevantes.
- Oportunidades detectadas.

Ejemplo para Cash Flow:

- Caja acumulada cargada.
- Maxima exposicion de caja.
- Primer mes critico o caja negativa.

## Areas funcionales

Las areas agrupan funcionalidades de negocio.

Ejemplos:

- Finanzas.
- RRHH.
- Produccion.
- Comercial.
- Inventario.
- Datos.
- Documentos.
- Inteligencia.

## Funcionalidades

Cada funcionalidad tiene su propia logica, datos, validaciones, alertas y vistas.

Ejemplo dentro de Finanzas:

- Cash Flow.
- Conciliaciones Bancarias.
- Cuentas por Cobrar.
- Cuentas por Pagar.
- Bancos / Deuda.
- Resultado Economico.
- Presupuesto.
- Impuestos.

## Vistas

Cada funcionalidad puede tener vistas internas.

Ejemplo para Finanzas > Cash Flow:

- Resumen Ejecutivo.
- KPIs superiores.
- Evolucion mensual de caja acumulada.
- Ingresos vs egresos.
- Pareto de gastos.
- Alertas de caja.
- Detalle mensual.
- Control de carga.
- Comparativos.
- Publicacion al Dashboard Global.

Ejemplo para Finanzas > Conciliaciones Bancarias:

- Carga de extractos.
- Carga de movimientos contables o ERP.
- Matching automatico.
- Diferencias.
- Pendientes.
- Reporte de partidas abiertas.

## Inteligencia y Forecast

Forecast no reemplaza a Cash Flow. Son capas distintas.

Cash Flow responde:

- Que paso.
- Como esta la caja.
- Donde estan los ingresos, egresos y alertas.

Forecast responde:

- Que podria pasar.
- Que pasa si sube o baja el dolar.
- Que pasa si suben o bajan ventas.
- Que pasa si cambia el precio.
- Que pasa si se atrasa una cobranza.
- Que pasa si entra financiacion.

Por eso Forecast vive en Inteligencia, mientras que Cash Flow vive en Finanzas.

## Activacion por cliente

El modelo permite activar solo lo necesario:

- Cliente A: Finanzas > Cash Flow.
- Cliente B: Finanzas > Cash Flow + Conciliaciones Bancarias.
- Cliente C: Finanzas + RRHH.
- Cliente D: Plataforma completa.

## Premisa de diseno

La plataforma debe crecer sin convertirse en un sistema pesado.

Cada modulo nuevo debe cumplir:

- Tener un objetivo claro.
- Leer datos desde la capa comun de ingesta o integraciones.
- Publicar solo focos ejecutivos al Dashboard Global.
- Mantener el analisis completo dentro de su funcionalidad.
- Prepararse para IA y forecast sin mezclar datos reales con simulaciones.
