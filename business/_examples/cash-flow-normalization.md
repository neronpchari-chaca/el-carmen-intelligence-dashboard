# Ejemplo: normalizacion de cash flow

Este ejemplo muestra como la plataforma puede recibir cash flows distintos y llevarlos a un formato comun.

## Problema

Empresa A envia:

| Fecha | Categoria | Concepto | Ingreso | Egreso | Moneda |
| --- | --- | --- | --- | --- | --- |
| 2026-05-01 | Ventas | Cobro cliente X | 100000 | 0 | ARS |

Empresa B envia:

| Fecha Mov. | Banco | Detalle | Entradas | Salidas |
| --- | --- | --- | --- | --- |
| 01/05/2026 | Banco 1 | Cobranza cliente X | 100000 | 0 |

Empresa C envia:

| Concepto | Enero | Febrero | Marzo | Tipo |
| --- | --- | --- | --- | --- |
| Sueldos | -50000 | -52000 | -53000 | Egreso |

Los tres formatos son distintos, pero pueden representar informacion equivalente.

## Solucion

La plataforma define un formato interno estandar:

| Campo estandar | Significado |
| --- | --- |
| date | Fecha o periodo |
| account | Banco, caja o cuenta |
| category | Categoria principal |
| concept | Concepto del movimiento |
| income | Ingreso |
| expense | Egreso |
| currency | Moneda |
| sourceFile | Archivo fuente |

## Mapeo asistido

La IA puede sugerir:

| Columna cliente | Campo estandar | Confianza | Estado |
| --- | --- | --- | --- |
| Fecha Mov. | date | 91% | Pendiente de aprobar |
| Banco | account | 88% | Pendiente de aprobar |
| Detalle | concept | 79% | Pendiente de aprobar |
| Entradas | income | 94% | Pendiente de aprobar |
| Salidas | expense | 94% | Pendiente de aprobar |

El usuario revisa y aprueba.

## Validacion

Antes de publicar, la plataforma controla:

- Fechas validas.
- Importes numericos.
- Moneda informada o definida por defecto.
- Totales comparables con el archivo original.
- Categorias reconocidas.
- Duplicados.
- Saldos coherentes si el archivo los incluye.

## Resultado

Despues del proceso, todos los cash flows quedan en el mismo idioma.

Esto permite:

- Comparar empresas.
- Consolidar monedas.
- Crear dashboards comunes.
- Detectar errores.
- Usar IA para explicar variaciones.
- Replicar la solucion en nuevos clientes.
