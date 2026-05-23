# Guia de gobierno operativo

Este proyecto no debe pensarse solo como un dashboard. Debe funcionar como una plataforma de gestion: una forma ordenada de mirar un negocio, cargar informacion, validar datos, generar indicadores y decidir que hacer.

## Objetivo

Construir una base replicable para crear paneles de control por negocio sin depender de desarrollos artesanales cada vez.

El usuario de negocio debe poder gobernar:

- Que informacion importa.
- Quien es responsable de cada dato.
- Que indicadores son oficiales.
- Que reglas de validacion se aplican.
- Que modulos se activan para cada empresa.
- Que mejoras entran al roadmap.

## Principios

1. Primero gestion, despues pantalla.
2. Primero dato confiable, despues grafico bonito.
3. Primero modulo simple, despues automatizacion.
4. Primero maqueta validada, despues backend.
5. Primero plantilla replicable, despues personalizacion fina.

## Roles minimos

- Owner de negocio: define prioridades, KPIs y decisiones esperadas.
- Owner de datos: valida origen, frecuencia y calidad de cada dataset.
- Constructor de plataforma: implementa componentes, reglas y conexiones.
- Usuario final: usa el dashboard y reporta necesidades reales.

En un negocio chico, una persona puede cubrir varios roles. Lo importante es que el rol exista, aunque sea simple.

## Reglas de gobierno

- Ningun KPI entra al dashboard sin definicion escrita.
- Ningun dataset se usa sin responsable asignado.
- Ninguna carga queda como oficial sin estado de validacion.
- Ningun modulo nuevo se construye sin objetivo de decision.
- Ninguna mejora entra sin prioridad, impacto y esfuerzo estimado.

## Ciclo de trabajo recomendado

1. Relevar negocio.
2. Mapear datasets.
3. Definir KPIs.
4. Armar maqueta.
5. Validar con usuario.
6. Automatizar lo repetitivo.
7. Documentar la version.
8. Replicar el patron en otro negocio.
