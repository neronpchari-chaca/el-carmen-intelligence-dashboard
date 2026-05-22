# El Carmen Intelligence Dashboard

Dashboard ejecutivo de inteligencia para genética/agro (modo dark premium, datos mock, sin backend por ahora).

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

## Build de producción
```bash
npm run build
npm run start
```

## Deploy simple en Vercel
1. Subí este repo a GitHub/GitLab/Bitbucket.
2. En Vercel: **Add New Project** → importá el repo.
3. Framework detectado: **Next.js** (auto).
4. Build command: `npm run build`.
5. Output: `.next` (auto en Next.js).
6. Deploy.

No requiere variables de entorno para el estado actual (mock data).

## Scripts
- `npm run dev` → entorno local
- `npm run build` → build optimizado para producción
- `npm run start` → servidor de producción local
- `npm run lint` → lint de Next.js
