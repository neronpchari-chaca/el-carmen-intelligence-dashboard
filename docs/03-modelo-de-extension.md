# Modelo de extension modular

El objetivo es que la plataforma pueda agregar capacidades nuevas sin romper lo existente.

## Tipos de extension

### Nuevo negocio

Ejemplo: copiar el modelo de El Carmen para otra empresa.

Requiere:

- Blueprint del negocio.
- Datasets propios.
- KPIs propios.
- Modulos activos.
- Branding minimo.

### Nuevo modulo

Ejemplo: agregar Inventario, Compras, Ventas, Produccion o Documentos.

Requiere:

- Objetivo de gestion.
- Usuarios esperados.
- Datasets necesarios.
- KPIs o vistas.
- Acciones disponibles.
- Estado inicial mock.

### Nuevo dataset

Ejemplo: agregar Cash Flow, Inventario, Cobranzas o Produccion.

Requiere:

- Campos obligatorios.
- Responsable.
- Frecuencia.
- Validaciones.
- Uso esperado en KPIs.

### Nueva regla

Ejemplo: conversion a USD, semaforo de atraso, alerta de margen negativo.

Requiere:

- Definicion escrita.
- Formula.
- Ejemplo correcto.
- Caso de error.

## Ficha minima para pedir un modulo nuevo

```text
Nombre del modulo:
Objetivo de gestion:
Usuario principal:
Decisiones que habilita:
Datasets necesarios:
KPIs principales:
Filtros necesarios:
Acciones esperadas:
Estados de alerta:
Version inicial aceptable:
```

## Criterios de prioridad

Un modulo se prioriza si cumple al menos dos condiciones:

- Mejora una decision frecuente.
- Reduce trabajo manual.
- Ordena datos criticos.
- Evita errores costosos.
- Sirve como patron para otros negocios.

## Orden tecnico recomendado

1. Crear maqueta con datos mock.
2. Validar nombres, filtros y KPIs.
3. Separar configuracion del modulo.
4. Conectar dataset real.
5. Agregar validaciones.
6. Agregar permisos o aprobaciones si corresponde.

## Regla de oro

Cada extension debe dejar la plataforma mas clara, no mas confusa.
