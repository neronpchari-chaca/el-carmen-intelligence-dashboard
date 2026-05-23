import type { TemporaryMapReviewResult } from '@/lib/ingestion/temporaryMapWorkflow';

export type PublicationGateStatus = 'blocked' | 'ready';

export type PublicationGateCheck = {
  label: string;
  status: 'ok' | 'pending' | 'blocked';
  detail: string;
};

export type PublicationGateResult = {
  status: PublicationGateStatus;
  title: string;
  checks: PublicationGateCheck[];
  nextAction: string;
};

type BuildPublicationGateInput = {
  hasAccountMap: boolean;
  temporaryMapReview?: TemporaryMapReviewResult | null;
  currencyConfirmed?: boolean;
  accountsClassified?: boolean;
  balancesValidated?: boolean;
  humanApproved?: boolean;
};

export function buildPublicationGate(input: BuildPublicationGateInput): PublicationGateResult {
  if (!input.temporaryMapReview) {
    return {
      status: input.humanApproved ? 'ready' : 'blocked',
      title: input.humanApproved ? 'Listo para publicar' : 'Pendiente de aprobacion',
      checks: [
        {
          label: 'Aprobacion humana',
          status: input.humanApproved ? 'ok' : 'pending',
          detail: input.humanApproved ? 'La carga fue aprobada por un responsable.' : 'Falta aprobacion humana antes de publicar.',
        },
      ],
      nextAction: input.humanApproved ? 'Publicar en dashboard.' : 'Revisar y aprobar la carga.',
    };
  }

  const checks: PublicationGateCheck[] = [
    {
      label: 'Mapa temporal revisado',
      status: input.temporaryMapReview.status === 'ready-for-validation' ? 'ok' : 'blocked',
      detail:
        input.temporaryMapReview.status === 'ready-for-validation'
          ? 'La hoja fue normalizada y tiene registros revisables.'
          : 'El mapa temporal todavia tiene observaciones que resolver.',
    },
    {
      label: 'Moneda confirmada',
      status: input.currencyConfirmed ? 'ok' : 'pending',
      detail: input.currencyConfirmed ? 'La moneda fue confirmada por el perfil o por el usuario.' : 'Falta confirmar la moneda antes de publicar.',
    },
    {
      label: 'Cuentas clasificadas',
      status: input.accountsClassified ? 'ok' : 'pending',
      detail: input.accountsClassified ? 'Los conceptos ya tienen clasificacion de gestion.' : 'Falta clasificar conceptos/cuentas detectadas.',
    },
    {
      label: 'Validacion de saldos',
      status: input.balancesValidated ? 'ok' : 'pending',
      detail: input.balancesValidated ? 'Los saldos fueron validados.' : 'Falta validar saldos o dejar observacion aprobada.',
    },
    {
      label: 'Aprobacion humana',
      status: input.humanApproved ? 'ok' : 'pending',
      detail: input.humanApproved ? 'La carga fue aprobada por un responsable.' : 'Falta aprobacion humana final.',
    },
  ];

  const status = checks.every((check) => check.status === 'ok') ? 'ready' : 'blocked';

  return {
    status,
    title: status === 'ready' ? 'Listo para publicar' : 'Publicacion bloqueada',
    checks,
    nextAction:
      status === 'ready'
        ? 'Publicar en dashboard.'
        : 'Completar los puntos pendientes antes de publicar el archivo normalizado.',
  };
}
