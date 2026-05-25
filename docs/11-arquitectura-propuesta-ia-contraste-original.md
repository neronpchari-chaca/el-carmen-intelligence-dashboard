# Arquitectura de ingesta: propuesta IA y contraste contra original

## Objetivo

La ingesta no debe depender de parches por formato de Excel. El sistema debe leer el archivo como lo haria un analista: entender la estructura, proponer una tabla limpia y contrastarla contra el archivo original antes de publicar.

La regla central es:

```text
La IA propone. El sistema contrasta. El humano solo interviene si no cierra.
```

## Flujo objetivo

```text
Archivo original
-> Extraccion estructural
-> Propuesta IA de lectura
-> Contraste contra original
-> Resultado de publicacion
-> Dashboard / modulo destino
```

## 1. Archivo original

El archivo se conserva como fuente. Nada se publica directo desde el Excel.

Debe quedar trazabilidad de:

- archivo cargado;
- fecha de carga;
- usuario o cliente;
- modulo destino;
- version de lectura;
- propuesta generada;
- controles aplicados;
- resultado final.

## 2. Extraccion estructural

Esta capa no decide. Solo extrae evidencias del archivo:

- hojas;
- filas;
- columnas;
- textos visibles;
- importes;
- formulas si estan disponibles;
- posiciones de celdas;
- posibles meses;
- posibles totales;
- posibles saldos.

Su salida es una representacion neutral del archivo original.

## 3. Propuesta IA de lectura

La IA analiza la estructura y propone como interpretar el archivo.

Debe devolver una propuesta explicita:

```text
Formato detectado
Columnas usadas
Columnas excluidas
Filas usadas
Filas excluidas
Entradas detectadas
Salidas detectadas
Totales detectados
Saldos detectados
Resumen mensual propuesto
Confianza
Motivo de la propuesta
```

Ejemplo para Cash Flow:

```text
Formato detectado: Cash flow agrupado con cierre mensual
Usar: filas detalle de entradas y salidas
Excluir: agrupadores, TOTAL ENTRADAS, TOTAL SALIDAS, NETO DEL MES, SALDO ANTERIOR, SALDO FINAL, Total periodo
Resumen mensual: ingresos, egresos, neto, saldo anterior, saldo final
```

## 4. Contraste contra original

El sistema no acepta la propuesta por fe. La contrasta contra el Excel original.

Controles minimos para Cash Flow:

```text
Suma de entradas propuestas = TOTAL ENTRADAS, si existe
Suma de salidas propuestas = TOTAL SALIDAS, si existe
Entradas - salidas = NETO DEL MES, si existe
Saldo anterior + neto = SALDO FINAL, si existen ambos
Suma de meses = Total periodo, si existe columna total
Filas publicadas no incluyen totales, netos ni saldos
Columnas publicadas no incluyen columnas de subtotal/acumulado
```

## 5. Resultado de publicacion

El contraste devuelve uno de tres estados:

### Publicable

La propuesta cierra contra el original.

```text
Se publica sin pedir correccion al usuario.
```

### Revisar

La propuesta entiende el archivo, pero hay diferencias.

```text
No se publica todavia.
Se muestra diferencia, mes, concepto y posible causa.
```

### No interpretable

La IA no puede distinguir entradas, salidas o meses con confianza razonable.

```text
No se publica.
Se pide subir una version mas clara o marcar manualmente secciones.
```

## 6. Contrato entre capas

El dashboard no debe conocer el Excel. Solo consume datos ya publicados.

```text
Dashboard Global
  recibe indicadores publicados

Finanzas > Cash Flow
  recibe cash flow mensual publicado

Ingesta Inteligente
  conserva archivo, propuesta, contraste y decision
```

## Componentes sugeridos

```text
lib/ingestion/originalWorkbookExtractor.ts
  Extrae estructura neutral del Excel.

lib/ingestion/cashFlowProposalEngine.ts
  Genera propuesta IA o heuristica asistida.

lib/ingestion/cashFlowOriginalVerifier.ts
  Contrasta propuesta contra original.

lib/ingestion/cashFlowPublicationGate.ts
  Decide publicable, revisar o no interpretable.

lib/ingestion/publishedCashFlowStore.ts
  Guarda solo datos aprobados/publicados.
```

## Regla anti-Frankenstein

No mezclar responsabilidades:

- El parser no decide negocio.
- La IA no publica.
- El dashboard no corrige datos.
- La validacion no inventa movimientos.
- La publicacion solo acepta datos contrastados.

## Experiencia usuario

Si todo cierra, el usuario ve algo simple:

```text
Lectura validada.
Ingresos, egresos, neto y saldos coinciden con el archivo original.
Listo para publicar.
```

Si no cierra:

```text
No pude validar la lectura.
Abr-26: salidas propuestas difieren del total original por 12.500.
Revisar archivo o ajustar lectura sugerida.
```

Si no se entiende:

```text
No pude identificar entradas y salidas con confianza.
Subi una version con secciones claras o totales mensuales.
```

## Criterio de avance

Antes de seguir con graficos o nuevos modulos, Cash Flow debe publicar solo desde este flujo:

```text
Propuesta IA -> Contraste -> Publicacion
```

Ese mismo patron se replica despues para RRHH, ventas, stock, bancos y conciliaciones.
