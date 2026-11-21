import type { Language } from './logistics';

export interface RoutePoint {
  x: number;
  y: number;
}

export type RouteVehicleStage = 'trunk_truck' | 'rural_4x4' | 'last_mile_unit';

export interface RouteStopConfig {
  id: string;
  progress: number;
  altitudeMeters: number;
  point: RoutePoint;
  stage: RouteVehicleStage;
  es: {
    time: string;
    place: string;
    elapsed: string;
    vehicleLabel: string;
    zoneTag: string;
  };
  en: {
    time: string;
    place: string;
    elapsed: string;
    vehicleLabel: string;
    zoneTag: string;
  };
}

export const TRANSFER_PROGRESS = 0.36;
export const GRANADA_PROGRESS = 0.68;
export const LAST_MILE_PROGRESS = 0.72;
export const DESTINATION_PROGRESS = 0.96;

/**
 * 3-segment elevation & route path across ViewBox 960x210:
 * 1) Bogotá (2.600m, y=98) -> climbs Cordillera pass (y=46) -> descends Piedemonte to Villavicencio (y=138)
 * 2) Villavicencio (y=138) -> foothill climb (y=88) -> descends river valley to Granada / Fuente de Oro (y=144)
 * 3) Granada (y=144) -> rural ridge climb (y=102) -> descends/arrives San José del Guaviare (y=124)
 */
export const ROUTE_SEGMENTS: [RoutePoint, RoutePoint, RoutePoint, RoutePoint][] = [
  [
    { x: 76, y: 98 },
    { x: 165, y: 34 },
    { x: 258, y: 148 },
    { x: 356, y: 138 },
  ],
  [
    { x: 356, y: 138 },
    { x: 446, y: 76 },
    { x: 548, y: 158 },
    { x: 642, y: 144 },
  ],
  [
    { x: 642, y: 144 },
    { x: 726, y: 92 },
    { x: 806, y: 136 },
    { x: 884, y: 122 },
  ],
];

export const ROUTE_SVG_PATH =
  'M 76 98 C 165 34, 258 148, 356 138 C 446 76, 548 158, 642 144 C 726 92, 806 136, 884 122';

export const ROUTE_AREA_PATH = `${ROUTE_SVG_PATH} L 884 210 L 76 210 Z`;

export const ROUTE_STOPS: RouteStopConfig[] = [
  {
    id: 'bogota',
    progress: 0,
    altitudeMeters: 2600,
    point: { x: 76, y: 98 },
    stage: 'trunk_truck',
    es: {
      time: 'Ayer · 07:15',
      place: 'Bogotá D.C.',
      elapsed: '0 h · Despacho',
      vehicleLabel: 'Camión Troncal NPR',
      zoneTag: 'Centro de Acopio',
    },
    en: {
      time: 'Yesterday · 07:15',
      place: 'Bogotá D.C.',
      elapsed: '0 h · Dispatch',
      vehicleLabel: 'Trunk Truck NPR',
      zoneTag: 'Distribution Hub',
    },
  },
  {
    id: 'villavicencio',
    progress: TRANSFER_PROGRESS,
    altitudeMeters: 467,
    point: { x: 356, y: 138 },
    stage: 'rural_4x4',
    es: {
      time: 'Ayer · 16:40',
      place: 'Villavicencio',
      elapsed: '9 h 25 min',
      vehicleLabel: 'Relevo a Campero 4x4',
      zoneTag: 'Cross-Docking',
    },
    en: {
      time: 'Yesterday · 16:40',
      place: 'Villavicencio',
      elapsed: '9 h 25 min',
      vehicleLabel: 'Transfer to 4x4 Utility',
      zoneTag: 'Cross-Docking',
    },
  },
  {
    id: 'granada',
    progress: GRANADA_PROGRESS,
    altitudeMeters: 332,
    point: { x: 642, y: 144 },
    stage: 'last_mile_unit',
    es: {
      time: 'Hoy · 09:20',
      place: 'Granada / Fuente de Oro',
      elapsed: '26 h 05 min',
      vehicleLabel: 'Cambio a Última Milla',
      zoneTag: 'Ruta Rural',
    },
    en: {
      time: 'Today · 09:20',
      place: 'Granada / Fuente de Oro',
      elapsed: '26 h 05 min',
      vehicleLabel: 'Switch to Last-Mile Unit',
      zoneTag: 'Rural Trail',
    },
  },
  {
    id: 'guaviare',
    progress: DESTINATION_PROGRESS,
    altitudeMeters: 175,
    point: { x: 884, y: 122 },
    stage: 'last_mile_unit',
    es: {
      time: 'Est. hoy · 16:30',
      place: 'San José del Guaviare',
      elapsed: '33 h 15 min',
      vehicleLabel: 'Entrega Asistida Final',
      zoneTag: 'Destino Final',
    },
    en: {
      time: 'Est. today · 16:30',
      place: 'San José del Guaviare',
      elapsed: '33 h 15 min',
      vehicleLabel: 'Final Assisted Delivery',
      zoneTag: 'Final Destination',
    },
  },
];

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function cubicPoint(
  [start, c1, c2, end]: [RoutePoint, RoutePoint, RoutePoint, RoutePoint],
  t: number
): RoutePoint {
  const inv = 1 - t;
  return {
    x:
      inv ** 3 * start.x +
      3 * inv ** 2 * t * c1.x +
      3 * inv * t ** 2 * c2.x +
      t ** 3 * end.x,
    y:
      inv ** 3 * start.y +
      3 * inv ** 2 * t * c1.y +
      3 * inv * t ** 2 * c2.y +
      t ** 3 * end.y,
  };
}

function cubicDerivative(
  [start, c1, c2, end]: [RoutePoint, RoutePoint, RoutePoint, RoutePoint],
  t: number
): RoutePoint {
  const inv = 1 - t;
  return {
    x:
      3 * inv ** 2 * (c1.x - start.x) +
      6 * inv * t * (c2.x - c1.x) +
      3 * t ** 2 * (end.x - c2.x),
    y:
      3 * inv ** 2 * (c1.y - start.y) +
      6 * inv * t * (c2.y - c1.y) +
      3 * t ** 2 * (end.y - c2.y),
  };
}

function getSegmentAndLocalT(progress: number): {
  segment: [RoutePoint, RoutePoint, RoutePoint, RoutePoint];
  localT: number;
} {
  const p = clamp(progress, 0, 1);
  if (p <= TRANSFER_PROGRESS) {
    return {
      segment: ROUTE_SEGMENTS[0],
      localT: clamp(p / TRANSFER_PROGRESS, 0, 1),
    };
  }
  if (p <= GRANADA_PROGRESS) {
    return {
      segment: ROUTE_SEGMENTS[1],
      localT: clamp(
        (p - TRANSFER_PROGRESS) / (GRANADA_PROGRESS - TRANSFER_PROGRESS),
        0,
        1
      ),
    };
  }
  return {
    segment: ROUTE_SEGMENTS[2],
    localT: clamp((p - GRANADA_PROGRESS) / (1 - GRANADA_PROGRESS), 0, 1),
  };
}

export function pointOnRoute(progress: number): RoutePoint {
  const { segment, localT } = getSegmentAndLocalT(progress);
  return cubicPoint(segment, localT);
}

export function angleOnRouteDeg(progress: number): number {
  const { segment, localT } = getSegmentAndLocalT(progress);
  const d = cubicDerivative(segment, localT);
  const rawDeg = (Math.atan2(d.y, d.x) * 180) / Math.PI;
  return clamp(rawDeg, -26, 26);
}

export function getVehicleStageAtProgress(progress: number): RouteVehicleStage {
  const p = clamp(progress, 0, 1);
  if (p < TRANSFER_PROGRESS) return 'trunk_truck';
  if (p < LAST_MILE_PROGRESS) return 'rural_4x4';
  return 'last_mile_unit';
}

export interface RouteTelemetrySnapshot {
  progress: number;
  point: RoutePoint;
  angleDeg: number;
  stage: RouteVehicleStage;
  trunkOpacity: number;
  rural4x4Opacity: number;
  lastMileOpacity: number;
  activeStopIndex: number;
  altitudeMeters: number;
  elapsedMinutes: number;
  elapsedLabel: string;
  stageBadge: string;
  terrainNotice: string;
  isTransferringTo4x4: boolean;
  isSwitchingToLastMile: boolean;
}

export function computeRouteTelemetry(
  rawProgress: number,
  lang: Language = 'es'
): RouteTelemetrySnapshot {
  const progress = clamp(rawProgress, 0, 1);
  const point = pointOnRoute(progress);
  const angleDeg = angleOnRouteDeg(progress);
  const stage = getVehicleStageAtProgress(progress);

  // Smooth crossfade envelopes for each vehicle class along the journey
  const trunkOut = clamp((progress - 0.32) / 0.08, 0, 1);
  const trunkOpacity = 1 - trunkOut;

  const ruralIn = clamp((progress - 0.32) / 0.08, 0, 1);
  const ruralOut = clamp((progress - 0.68) / 0.08, 0, 1);
  const rural4x4Opacity = Math.min(ruralIn, 1 - ruralOut);

  const lastMileOpacity = clamp((progress - 0.68) / 0.08, 0, 1);

  const activeStopIndex =
    progress < TRANSFER_PROGRESS
      ? 0
      : progress < GRANADA_PROGRESS
        ? 1
        : progress < DESTINATION_PROGRESS
          ? 2
          : 3;

  // Interpolate altitude between stops cleanly
  let altitudeMeters = ROUTE_STOPS[0].altitudeMeters;
  if (progress <= TRANSFER_PROGRESS) {
    const t = progress / TRANSFER_PROGRESS;
    altitudeMeters = Math.round(
      ROUTE_STOPS[0].altitudeMeters +
        (ROUTE_STOPS[1].altitudeMeters - ROUTE_STOPS[0].altitudeMeters) * t
    );
  } else if (progress <= GRANADA_PROGRESS) {
    const t =
      (progress - TRANSFER_PROGRESS) / (GRANADA_PROGRESS - TRANSFER_PROGRESS);
    altitudeMeters = Math.round(
      ROUTE_STOPS[1].altitudeMeters +
        (ROUTE_STOPS[2].altitudeMeters - ROUTE_STOPS[1].altitudeMeters) * t
    );
  } else {
    const t = clamp(
      (progress - GRANADA_PROGRESS) / (1 - GRANADA_PROGRESS),
      0,
      1
    );
    altitudeMeters = Math.round(
      ROUTE_STOPS[2].altitudeMeters +
        (ROUTE_STOPS[3].altitudeMeters - ROUTE_STOPS[2].altitudeMeters) * t
    );
  }

  const totalMinutes = 33 * 60 + 15;
  const elapsedMinutes = Math.round(progress * totalMinutes);
  const hrs = Math.floor(elapsedMinutes / 60);
  const mins = elapsedMinutes % 60;
  const elapsedLabel = `${String(hrs).padStart(2, '0')} h ${String(mins).padStart(2, '0')} min`;

  const stageBadge =
    stage === 'trunk_truck'
      ? lang === 'en'
        ? 'Trunk Freight · NPR / Turbo'
        : 'Carga Troncal · Camión NPR'
      : stage === 'rural_4x4'
        ? lang === 'en'
          ? 'Rural Reexpedition · 4x4 Unit'
          : 'Reexpedición Rural · Campero 4x4'
        : lang === 'en'
          ? 'Last Mile · Specialized Delivery Unit'
          : 'Última Milla · Unidad de Entrega Final';

  const terrainNotice =
    progress < 0.16
      ? lang === 'en'
        ? 'Highland dispatch (2,600 m)'
        : 'Salida de cordillera (2.600 m)'
      : progress < TRANSFER_PROGRESS
        ? lang === 'en'
          ? 'Cordillera descent & viaducts'
          : 'Descenso cordillera y viaductos'
        : progress < GRANADA_PROGRESS
          ? lang === 'en'
            ? 'Cross-docking relay to 4x4 traction'
            : 'Relevo cross-docking a tracción 4x4'
          : progress < DESTINATION_PROGRESS
            ? lang === 'en'
              ? 'Last-mile switch · Rural unpaved access'
              : 'Cambio a Última Milla · Vía rural destapada'
            : lang === 'en'
              ? 'Delivered with geotagged photo POD'
              : 'Entrega final con cumplido digitalizado';

  return {
    progress,
    point,
    angleDeg,
    stage,
    trunkOpacity,
    rural4x4Opacity,
    lastMileOpacity,
    activeStopIndex,
    altitudeMeters,
    elapsedMinutes,
    elapsedLabel,
    stageBadge,
    terrainNotice,
    isTransferringTo4x4: progress >= 0.31 && progress <= 0.43,
    isSwitchingToLastMile: progress >= 0.65 && progress <= 0.78,
  };
}
