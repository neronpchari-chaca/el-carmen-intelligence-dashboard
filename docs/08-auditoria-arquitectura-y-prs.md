# Auditoria arquitectonica y control de PRs

Este documento resume el estado actual de la plataforma despues de los PRs de ingesta de cash flow y define reglas simples para evitar que el sistema se vuelva pesado o fragil al sumar nuevos modulos.

## Diagnostico ejecutivo

La direccion del producto es correcta: una plataforma replicable donde el usuario sube informacion en formatos reales y el sistema ayuda a leer, normalizar, validar y publicar con control humano.

El riesgo principal no es funcional. El riesgo principal es arquitectonico: que las pantallas empiecen a acumular demasiada logica, validaciones, reglas y estados. Cuando eso pasa, cada mejora chica puede romper el build o trabar Vercel.

La decision recomendada es mantener la plataforma liviana y modular: piezas chicas, reglas separadas y PRs acotados.

## Que quedo bien

- Hay una vision clara de plataforma replicable, no solo dashboard.
- Existe documentacion base de gobierno, arquitectura, metodologia e ingesta.
- El flujo de carga ya incorpora una idea importante: leer primero, mostrar preview, validar y recien despues publicar.
- El normalizador generico de cash flow empieza a resolver el problema real: cada cliente trae un Excel distinto.
- La aprobacion humana queda como principio: la IA ayuda, pero no publica sola.
- Vercel ya funciona como control de calidad minimo antes de fusionar.

## Que quedo fragil

- La pantalla `app/data-ingestion/page.tsx` concentra demasiadas responsabilidades: UI, lectura de archivo, seleccion de hoja, validaciones, estados y resumen.
- Hubo varios PRs consecutivos tocando la misma pantalla. Eso aumenta el riesgo de conflictos y errores de compilacion.
- Algunos conceptos cambiaron rapido: primero `Mapa cuentas`, despues `Mapa temporal`, luego carga generica. El producto mejoro, pero el codigo necesita acompañar esa simplificacion.
- Faltan pruebas automaticas para parsers y normalizadores. Hoy Vercel detecta errores tarde, cuando ya se abrio o aprobo un PR.
- Los modulos futuros todavia no tienen una plantilla tecnica obligatoria. RRHH, ventas, inventario o ERP podrian crecer de formas distintas si no fijamos una regla.

## Regla de arquitectura

Cada modulo debe separar cuatro capas:

1. Pantalla
   - Muestra informacion y acciones.
   - No deberia tener reglas complejas de negocio.

2. Motor de lectura o adaptador
   - Lee archivos, APIs o ERP.
   - Convierte formatos externos a un modelo interno.

3. Modelo estandar
   - Define el idioma oficial del dato.
   - Ejemplo: cash flow estandar, empleado estandar, venta estandar.

4. Validaciones y publicacion
   - Decide si la informacion esta lista, observada o bloqueada.
   - Requiere aprobacion humana para publicar datos oficiales.

Si una funcion mezcla mas de dos capas, conviene dividirla antes de seguir.

## Regla para futuros PRs

Un PR debe tener un objetivo principal.

Tipos recomendados de PR:

- Documento: define metodologia, reglas o arquitectura.
- Modelo: agrega tipos, esquemas o estructura de datos.
- Motor: agrega parser, normalizador, validador o conector.
- Pantalla: muestra o usa algo que ya existe.
- Integracion: conecta pantalla con motor ya creado.
- Correccion: arregla un error especifico.

Evitar PRs que hagan todo junto: modelo + parser + pantalla + reglas + estilos. Funcionan rapido al principio, pero vuelven fragil la plataforma.

## Checklist antes de aprobar un PR

Antes de aprobar, revisar:

- El PR explica el problema en lenguaje de negocio.
- El alcance es chico y entendible.
- No mete reglas complejas directamente en una pantalla grande.
- Si agrega un parser o normalizador, tiene tipos claros.
- Si cambia una pantalla, no rompe el flujo anterior.
- Vercel esta verde.
- El README o docs se actualizan si cambia una regla de arquitectura.
- El usuario final no ve palabras tecnicas innecesarias.

## Criterio de producto para cargas de datos

El usuario no deberia tener que conocer nombres internos de hojas, columnas o estructuras tecnicas.

El flujo correcto es:

```text
Subir archivo
-> El sistema detecta estructura probable
-> Muestra preview entendible
-> Muestra observaciones accionables
-> Usuario aprueba lectura
-> Sistema valida datos
-> Usuario aprueba carga
-> Sistema publica
```

Si el sistema no puede interpretar algo, debe explicar:

- Que detecto.
- Que falta.
- Que puede hacer el usuario.
- Si se puede continuar o queda bloqueado.

## Premisa anti transatlantico

La plataforma no debe intentar resolver todos los casos posibles desde el primer dia.

Debe crecer con este criterio:

1. Caso real.
2. Normalizador chico.
3. Preview claro.
4. Validacion minima.
5. Aprobacion humana.
6. Aprendizaje reusable.

Cuando aparezca otro formato de Excel, no se debe reescribir la app. Se agrega o ajusta un adaptador, se prueba con ese caso y se documenta el aprendizaje.

## Proxima estructura recomendada

Para evitar que `data-ingestion/page.tsx` siga creciendo, el siguiente paso tecnico deberia ser separar:

```text
lib/ingestion/
  detectCashFlowWorkbook.ts
  buildIngestionReview.ts
  publicationRules.ts

lib/parsers/
  genericWideCashFlow.ts
  cashFlowBrasil.ts

components/ingestion/
  UploadPanel.tsx
  IngestionValidationPanel.tsx
  NormalizedPreviewTable.tsx
  IngestionIssuesPanel.tsx
```

No hace falta hacerlo todo junto. Conviene hacerlo por PRs chicos.

## Orden sugerido de proximos PRs

1. Separar deteccion de Excel de la pantalla de carga.
2. Crear panel reusable de observaciones.
3. Crear tabla reusable de preview normalizado.
4. Agregar tests del normalizador generico de cash flow.
5. Definir plantilla tecnica para nuevos modulos.
6. Recien despues empezar un nuevo modulo, por ejemplo RRHH.

## Decision final

Antes de avanzar con muchos modulos, conviene aprobar esta regla de trabajo:

- Menos pantalla gigante.
- Mas motores chicos.
- Mas modelos estandar.
- Mas validaciones claras.
- Menos automatizacion sin control.
- PRs chicos y verificables.

Esto permite avanzar mas rapido a mediano plazo porque reduce retrabajo, errores de deploy y decisiones improvisadas.
