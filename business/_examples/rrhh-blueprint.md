# Ejemplo de blueprint: herramienta de RRHH

Este ejemplo muestra como usar la metodologia para una empresa que necesita administrar Recursos Humanos.

## Objetivo de gestion

Crear una herramienta simple para ordenar informacion de personal, ausencias, costos laborales, vencimientos, desempeno y alertas relevantes para la toma de decisiones.

## Usuarios

| Usuario | Necesidad | Frecuencia |
| --- | --- | --- |
| Direccion | Ver dotacion, costos, alertas y riesgos | Semanal |
| RRHH | Administrar legajos, novedades y vencimientos | Diario |
| Finanzas | Ver costo laboral y provision de obligaciones | Mensual |
| Jefes de area | Ver asistencia, ausencias y necesidades de equipo | Semanal |

## Modulos posibles

- Dashboard RRHH.
- Legajos.
- Ausencias y licencias.
- Costos laborales.
- Vencimientos.
- Evaluaciones.
- Capacitaciones.
- Alertas.
- Documentos.

## Datasets iniciales

| Dataset | Responsable | Frecuencia | Campos minimos |
| --- | --- | --- | --- |
| Empleados | RRHH | Mensual / alta-baja | ID, nombre, area, puesto, fecha ingreso, estado |
| Novedades | RRHH | Mensual | empleado, fecha, concepto, tipo, importe/horas |
| Ausencias | RRHH | Semanal | empleado, fecha desde, fecha hasta, motivo, estado |
| Costos laborales | Finanzas | Mensual | empleado/area, sueldo, cargas, beneficios, costo total |
| Vencimientos | RRHH | Semanal | empleado, documento, fecha vencimiento, estado |

## KPIs iniciales

| KPI | Pregunta que responde |
| --- | --- |
| Dotacion activa | Cuanta gente trabaja hoy en la empresa? |
| Altas y bajas | Como cambia el equipo en el tiempo? |
| Ausentismo | Que porcentaje de tiempo se pierde por ausencias? |
| Costo laboral mensual | Cuanto cuesta el equipo por area? |
| Vencimientos criticos | Que documentos o contratos requieren accion? |
| Rotacion | Que tan estable es la dotacion? |

## Validaciones utiles

- Empleado sin area asignada.
- Fecha de ingreso posterior a fecha actual.
- Documento vencido.
- Ausencia sin motivo.
- Novedad duplicada.
- Costo laboral sin periodo.
- Baja sin fecha de egreso.

## Alertas estrategicas

- Vencimientos en los proximos 30 dias.
- Aumento de ausentismo por area.
- Costo laboral fuera de presupuesto.
- Puestos criticos sin cobertura.
- Rotacion elevada.

## Evolucion con IA

La IA podria:

- Leer novedades y resumir cambios del mes.
- Detectar inconsistencias en legajos.
- Explicar variaciones de costo laboral.
- Identificar areas con riesgo de rotacion.
- Preparar un resumen ejecutivo para direccion.

## Primera version aceptable

Una primera maqueta util deberia permitir:

- Cargar empleados desde Excel.
- Ver dotacion por area.
- Ver ausencias y vencimientos.
- Ver costo laboral mensual.
- Mostrar alertas basicas.
- Exportar o consultar un resumen ejecutivo.
