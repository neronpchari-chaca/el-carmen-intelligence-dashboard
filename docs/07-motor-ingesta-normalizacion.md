# Motor de ingesta y normalizacion de datos

Este motor resuelve uno de los problemas mas importantes de una plataforma generica: cada empresa trae la informacion en formatos distintos.

Ejemplo: cash flow.

Una empresa puede tener columnas llamadas `Ingresos` y `Egresos`. Otra puede usar `Entradas` y `Salidas`. Otra puede traer meses como columnas. Otra puede mezclar bancos, monedas y conceptos en una sola hoja.

La plataforma no debe depender de que todos usen el mismo Excel desde el primer dia. Debe tener una capa que traduzca formatos distintos a un modelo interno estandar.

## Objetivo

Convertir informacion heterogenea en informacion confiable, uniforme y lista para dashboard.

## Flujo recomendado

```text
Archivo del cliente
-> Lectura inicial
-> IA sugiere mapeo de columnas
-> Usuario revisa y aprueba mapeo
-> Conversion a formato estandar interno
-> Validaciones duras
-> Correcciones si hace falta
-> Aprobacion humana
-> Publicacion en dashboard
```

## Formato interno estandar

Cada tipo de dato importante debe tener un modelo oficial.

Para cash flow, el modelo puede incluir:

- Fecha.
- Empresa o unidad de negocio.
- Pais.
- Moneda.
- Cuenta.
- Categoria.
- Subcategoria.
- Concepto.
- Ingreso.
- Egreso.
- Saldo inicial.
- Saldo final.
- Tipo de cambio.
- Monto USD.
- Archivo fuente.
- Estado de validacion.

Ese modelo es el idioma oficial de la plataforma.

## Mapeo por empresa

Cada cliente puede tener su propio formato.

La plataforma guarda un mapa como este:

```text
Columna del cliente "Fecha Mov." -> Fecha
Columna del cliente "Entradas" -> Ingreso
Columna del cliente "Salidas" -> Egreso
Columna del cliente "Detalle" -> Concepto
Columna del cliente "Banco" -> Cuenta
```

Cuando el cliente repite el formato, la plataforma reutiliza el mapeo.

## Rol de la IA

La IA debe ayudar, no decidir sola.

Puede:

- Leer nombres de columnas.
- Detectar estructura probable.
- Sugerir mapeos.
- Identificar columnas raras.
- Proponer categorias.
- Explicar errores.
- Resumir cambios.

No debe:

- Publicar datos sin aprobacion.
- Reemplazar validaciones duras.
- Inventar informacion faltante.
- Cambiar reglas oficiales sin control.

## Estados de una carga

- Recibido: el archivo entro, pero no se usa.
- Mapeo sugerido por IA: la IA propuso una interpretacion.
- Mapeado: el usuario aprobo o ajusto el mapeo.
- Con errores: hay problemas que corregir.
- Pendiente de aprobacion: listo para revision final.
- Aprobado: ya es informacion oficial.
- Publicado: impacta dashboards e indicadores.

## Validaciones duras

Ejemplos para cash flow:

- Fecha valida.
- Moneda permitida.
- Ingresos y egresos numericos.
- No duplicados.
- Categoria reconocida o pendiente de clasificacion.
- Tipo de cambio disponible si se convierte a USD.
- Totales normalizados comparables contra el archivo original.
- Saldo final coherente con saldo inicial, ingresos y egresos cuando aplique.

## Control humano

La aprobacion humana es obligatoria para publicar informacion.

La IA acelera el trabajo, pero el sistema debe dejar trazabilidad:

- Quien aprobo.
- Cuando aprobo.
- Que archivo se uso.
- Que mapeo se aplico.
- Que errores se corrigieron.
- Que version quedo publicada.

## Por que esto importa

Sin este motor, cada modulo carga datos a su manera y la plataforma se vuelve dificil de escalar.

Con este motor, cualquier negocio puede traer informacion en su formato habitual y la plataforma la transforma en informacion comparable, valida y gobernada.
