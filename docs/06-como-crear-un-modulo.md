# Como crear un modulo nuevo

Esta guia sirve para convertir una necesidad de gestion en una herramienta dentro de la plataforma.

## Ejemplo

Una empresa pide: necesito administrar RRHH.

La respuesta no deberia ser empezar a programar de inmediato. Primero se ordena la necesidad.

## Paso 1: Definir el problema

Preguntas:

- Que quiere administrar?
- Que decision quiere mejorar?
- Quien lo va a usar?
- Con que frecuencia?
- Que informacion existe hoy?

Salida esperada:

```text
Modulo: RRHH
Objetivo: administrar dotacion, ausencias, costos y vencimientos.
Usuarios: Direccion, RRHH, Finanzas, jefes de area.
Decision principal: anticipar problemas de personal y costo laboral.
```

## Paso 2: Definir datos minimos

Ejemplo RRHH:

- Empleados.
- Ausencias.
- Novedades.
- Costos laborales.
- Vencimientos.

Cada dato debe tener responsable y frecuencia.

## Paso 3: Definir indicadores

Ejemplo RRHH:

- Dotacion activa.
- Ausentismo.
- Costo laboral.
- Vencimientos criticos.
- Rotacion.

Un indicador debe responder una pregunta de gestion. Si no ayuda a decidir, no entra.

## Paso 4: Crear primera maqueta

La primera version puede usar datos ficticios o Excel.

Objetivo: ver si la pantalla tiene sentido para el usuario.

## Paso 5: Facilitar carga de informacion

Orden recomendado:

1. Plantilla Excel clara.
2. Subida manual de archivo.
3. Validaciones automaticas.
4. Guardado en base de datos.
5. Conexion automatica a sistemas.

## Paso 6: Agregar IA

Cuando los datos ya estan ordenados, la IA puede ayudar a:

- Leer documentos.
- Detectar errores.
- Explicar variaciones.
- Generar alertas.
- Preparar resumenes ejecutivos.
- Responder preguntas del usuario.

## Regla practica

Todo modulo debe poder explicarse en una frase:

```text
Este modulo ayuda a [usuario] a decidir [decision] usando [datos].
```

Ejemplo:

```text
Este modulo ayuda a Direccion y RRHH a controlar dotacion, ausentismo y vencimientos usando legajos, novedades y costos laborales.
```
