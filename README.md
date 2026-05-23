# El Carmen Intelligence Dashboard

Dashboard ejecutivo de inteligencia para genetica/agro (modo dark premium, datos mock, sin backend por ahora).

## Vision

Este repositorio evoluciona hacia una plataforma replicable de gestion: un modelo para crear dashboards por negocio con arquitectura, gobierno de datos, KPIs oficiales, modulos activables y roadmap de automatizacion.

La meta es que funcione como una fabrica de herramientas de gestion: RRHH, finanzas, produccion, ventas, inventario, documentos o cualquier modulo que una empresa necesite. Cada modulo debe poder empezar simple, nutrirse de datos faciles de cargar y crecer hacia validaciones automaticas, actualizacion automatica e IA analitica.

La documentacion principal esta en:

- `docs/00-guia-de-gobierno.md`
- `docs/01-arquitectura-plataforma.md`
- `docs/02-metodologia-replicable.md`
- `docs/03-modelo-de-extension.md`
- `docs/04-roadmap-evolucion.md`
- `docs/05-fabrica-de-herramientas-de-gestion.md`
- `business/_template/business-blueprint.md`
- `business/_examples/rrhh-blueprint.md`
- `business/el-carmen/business-blueprint.md`

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts + Framer Motion

## Desarrollo local
```bash
npm install
npm run dev
```

## Build de produccion
```bash
npm run build
npm run start
```

## Deploy simple en Vercel
1. Subi este repo a GitHub/GitLab/Bitbucket.
2. En Vercel: **Add New Project** -> importa el repo.
3. Framework detectado: **Next.js** (auto).
4. Build command: `npm run build`.
5. Output: `.next` (auto en Next.js).
6. Deploy.

No requiere variables de entorno para el estado actual (mock data).

## Scripts
- `npm run dev` -> entorno local
- `npm run build` -> build optimizado para produccion
- `npm run start` -> servidor de produccion local
- `npm run lint` -> lint de Next.js
