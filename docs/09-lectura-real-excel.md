# Lectura real de Excel en ingesta

La pantalla `/data-ingestion` ahora puede leer archivos Excel desde el navegador.

## Dependencia agregada

Se agrego:

```text
xlsx
```

## Flujo implementado

Cuando el usuario selecciona un archivo:

1. Se lee el archivo en el navegador.
2. Se buscan las hojas `Mapa cuentas` y `Hoja1`.
3. Si existen, se convierten las hojas a filas.
4. Se llama a `parseCashFlowBrasil`.
5. Se muestra preview real, totales, advertencias y control de saldos.
6. La publicacion sigue bloqueada hasta aprobacion humana.

## Alcance actual

Esto es una primera funcionalidad real de lectura y normalizacion.

Todavia no guarda datos en base de datos ni conserva archivos en almacenamiento permanente.

## Proximo paso recomendado

Mover este flujo a backend cuando se agregue persistencia real:

```text
archivo subido
-> almacenamiento seguro
-> parser backend
-> validaciones
-> historial de carga
-> aprobacion
-> publicacion
```

Por ahora, la lectura en navegador sirve para validar experiencia, formato y controles con archivos reales.
