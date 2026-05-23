# Parser Cash Flow Brasil

Este parser convierte el archivo de Cash Flow Brasil en formato ancho a registros normalizados.

## Problema que resuelve

El archivo real no viene como tabla transaccional. Viene asi:

- Meses en columnas.
- Cuentas en filas.
- Tipo, grupo y cuenta como columnas descriptivas.
- Saldos en otra hoja.

El parser transforma eso en registros:

```text
periodo / pais / moneda / tipo / grupo / cuenta / ingreso / egreso / neto / archivo fuente
```

## Archivo

Parser agregado en:

```text
lib/parsers/cashFlowBrasil.ts
```

## Entrada esperada

El parser no abre Excel directamente. Recibe filas ya leidas:

```ts
parseCashFlowBrasil({
  sourceFile: 'Fluxo de caixa Entradas e Saidas 2026 2027.xlsx',
  mapaCuentasRows,
  hoja1Rows,
});
```

Esto mantiene separadas dos responsabilidades:

- lectura del archivo Excel
- normalizacion de negocio

## Salida

Devuelve:

- registros normalizados
- resumen mensual
- controles de saldo
- advertencias

## Validacion central

El parser controla:

```text
Saldo anterior + Neto normalizado = Saldo final
```

Si la diferencia es menor o igual a 0,01, el mes queda en estado `ok`.

## Proximo paso tecnico

Conectar una libreria de lectura Excel para convertir el archivo subido en `mapaCuentasRows` y `hoja1Rows`.

Opciones posibles:

- SheetJS/xlsx en frontend o backend.
- ExcelJS en backend.
- API propia de ingestion.

La recomendacion es leer y procesar en backend cuando haya archivos reales, para guardar fuente, version, auditoria y resultado normalizado.
