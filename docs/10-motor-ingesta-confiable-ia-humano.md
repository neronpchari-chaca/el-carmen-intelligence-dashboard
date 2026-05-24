# Motor de ingesta confiable con IA y aprobacion humana

## Principio central

La plataforma no debe publicar datos que no pueda explicar y validar.

La IA no decide sola. La IA interpreta, propone y explica. El humano aprueba, rechaza o corrige.

## Flujo operativo

1. Detectar
   - Leer hojas del archivo.
   - Detectar meses, conceptos, importes, secciones, saldos y totales.
   - Elegir una hoja candidata con criterio, no solo por cantidad de datos.

2. Validar
   - Separar movimientos de saldos.
   - Excluir totales, acumulados y encabezados.
   - Controlar que los datos tengan estructura suficiente.
   - Marcar confianza alta, media o baja.

3. Proponer
   - Explicar que hoja eligio.
   - Explicar que filas uso.
   - Explicar que filas excluyo.
   - Proponer ajustes cuando algo no cierra o queda dudoso.

4. Aprobar o rechazar
   - El usuario puede aprobar la lectura sugerida.
   - Si la confianza es baja, no se publica.
   - Si hay observaciones, se revisan antes de publicar.

5. Recalcular
   - Si el usuario acepta un ajuste, el sistema recalcula.
   - Si lo rechaza, vuelve a revision o pide corregir/subir archivo.

6. Publicar
   - Solo se publica una lectura explicada, validada y aprobada.
   - Se guarda archivo origen, fecha, diagnostico, movimientos, saldos y version.

## Aplicacion en Cash Flow

La lectura de Cash Flow debe distinguir:

- Entradas.
- Salidas.
- Saldos iniciales.
- Saldos finales.
- Totales.
- Filas de resumen.
- Filas dudosas.

Reglas minimas:

- Los saldos no se suman como ingresos o egresos.
- Los totales no se duplican contra el detalle.
- Si existe `SALDO FINAL`, se usa para caja/exposicion.
- Si no existe saldo final, caja acumulada se calcula desde movimientos y se aclara.
- Si la confianza es baja, se bloquea la publicacion.

## Evolucion futura

La siguiente etapa puede incorporar propuestas asistidas por IA:

- Sugerir que una fila sea marcada como saldo.
- Sugerir excluir una hoja auxiliar.
- Sugerir revisar un mes que no cierra.
- Sugerir corregir un saldo final o volver a subir archivo.

Cada propuesta debe mostrar:

- Problema detectado.
- Posible causa.
- Ajuste propuesto.
- Impacto en los datos.
- Decision humana requerida.

## Criterio de producto

Primero confiabilidad. Despues visualizacion.

Un dashboard lindo con datos mal leidos no sirve. El valor esta en transformar informacion desordenada en datos explicados, validados y trazables.
