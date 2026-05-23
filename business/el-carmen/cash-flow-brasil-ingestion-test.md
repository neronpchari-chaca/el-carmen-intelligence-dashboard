# Prueba real de ingesta: Cash Flow Brasil

Archivo probado: `Fluxo de caixa Entradas e Saídas 2026 2027.xlsx`

Ubicacion local analizada: `Documents/Consultoria/Criadero El Carmen/Cash Flow`.

## Objetivo

Probar si el motor de ingesta y normalizacion puede interpretar un cash flow real de Brasil, aunque no venga como tabla normal.

## Estructura detectada

El archivo tiene cuatro hojas:

| Hoja | Uso detectado | Rango usado |
| --- | --- | --- |
| Hoja1 | Flujo proyectado con saldos, entradas y salidas | B1:Q56 |
| Mapa cuentas | Tabla mas util para normalizar por tipo, grupo, cuenta y mes | A1:R43 |
| Agrupado por cuentas | Vista agrupada por grupo/cuenta | A1:P98 |
| Hoja2 | Sin informacion relevante | A1 |

## Hallazgo principal

El archivo no viene en formato transaccional clasico. Viene en formato ancho:

- Meses en columnas: `mar-26`, `abr-26`, `may-26`, etc.
- Conceptos/cuentas en filas.
- Tipo de movimiento en columna: `Salida` o `Entrada`.
- Grupo de gestion en columna: por ejemplo `Financiero / prestamos`, `Estructura`, `Impuestos y cargas`.

Esto confirma que la plataforma necesita una capa de normalizacion. No alcanza con esperar que todos los clientes usen la misma plantilla.

## Mapeo propuesto

| Origen | Campo estandar |
| --- | --- |
| Mapa cuentas!Tipo | category / tipo de movimiento |
| Mapa cuentas!Grupo | subcategory / grupo de gestion |
| Mapa cuentas!Cuenta | concept |
| Encabezados de meses | date / periodo |
| Valores positivos | income |
| Valores negativos | expense |
| Hoja1!SALDO ANTERIOR | openingBalance |
| Hoja1!SALDO FINAL | closingBalance |

## Resultado de normalizacion

Se convirtio la matriz de meses-columnas en registros normalizados por:

- mes
- tipo
- grupo
- cuenta
- ingreso
- egreso
- neto

Ejemplo de resumen mensual:

| Mes | Registros | Ingresos | Egresos | Neto |
| --- | ---: | ---: | ---: | ---: |
| mar-26 | 22 | 503.718,15 | 200.274,37 | 303.443,78 |
| abr-26 | 15 | 294.161,72 | 121.445,46 | 172.716,26 |
| may-26 | 16 | 18.165,00 | 124.451,28 | -106.286,28 |
| jun-26 | 17 | 138.165,00 | 124.457,16 | 13.707,84 |
| jul-26 | 16 | 0,00 | 139.463,10 | -139.463,10 |
| ago-26 | 16 | 0,00 | 148.518,90 | -148.518,90 |

## Control de saldos

Se valido la ecuacion:

```text
Saldo anterior + Neto normalizado = Saldo final
```

Resultado: diferencia cero en los meses revisados.

| Mes | Saldo anterior | Neto normalizado | Saldo final Excel | Diferencia |
| --- | ---: | ---: | ---: | ---: |
| mar-26 | -401.395,82 | 303.443,78 | -97.952,04 | 0,00 |
| abr-26 | -97.952,04 | 172.716,26 | 74.764,22 | 0,00 |
| may-26 | 74.764,22 | -106.286,28 | -31.522,06 | 0,00 |
| jun-26 | -31.522,06 | 13.707,84 | -17.814,22 | 0,00 |
| jul-26 | -17.814,22 | -139.463,10 | -157.277,32 | 0,00 |
| ago-26 | -157.277,32 | -148.518,90 | -305.796,22 | 0,00 |

## Validaciones aplicables

- El archivo tiene estructura reconocible.
- La hoja `Mapa cuentas` es la fuente mas apta para normalizar.
- Los meses deben convertirse de columnas a registros.
- Los valores negativos deben guardarse como egresos positivos en el modelo estandar.
- Los saldos de `Hoja1` permiten validar consistencia mensual.
- La moneda base es BRL/R$.
- La publicacion debe requerir aprobacion humana.

## Conclusion

La prueba es positiva.

El archivo real de Brasil puede ingresar a la plataforma si se aplica una regla de transformacion de formato ancho a formato normalizado. El control de saldos cierra con diferencia cero, lo cual indica que el modelo de ingesta es adecuado para este caso.

## Proximo paso recomendado

Construir un parser funcional para este tipo de archivo:

```text
Excel Brasil ancho
-> leer hoja Mapa cuentas
-> convertir meses en registros
-> separar ingresos y egresos
-> leer saldos desde Hoja1
-> validar saldo anterior + neto = saldo final
-> mostrar preview
-> permitir aprobacion
```
