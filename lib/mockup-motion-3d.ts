/**
 * Motion presets for 3D mockups (Three.js / React Three Fiber).
 *
 * Unlike 2D motion (which produces CSS transforms applied to a DOM element),
 * 3D motion produces values intended to be applied directly to a THREE.Group
 * inside the scene graph: Euler rotation (radians), position offset (scene
 * units), uniform scale, and opacity. The consumers (Mockup3DStage) apply
 * these on top of the model's base transform every frame via useFrame.
 *
 * The preset vocabulary is intentionally separate from 2D motion because the
 * visual language differs: 3D models benefit from real orbital camera moves,
 * physical depth parallax, and tumbling reveals that CSS perspective cannot
 * reproduce faithfully.
 */

export type Mockup3DMotionPresetId =
  | "none"
  | "orbit-entrance"
  | "turntable-drift"
  | "flick-exit";

export const MOCKUP_3D_MOTION_PRESETS: {
  id: Mockup3DMotionPresetId;
  category: "Entrance" | "Continue" | "Exit";
}[] = [
  { id: "orbit-entrance", category: "Entrance" },
  { id: "turntable-drift", category: "Continue" },
  { id: "flick-exit", category: "Exit" },
];

export interface Mockup3DMotionConfig {
  presetId: Mockup3DMotionPresetId;
  intensity: number;
  speed: number;
}

export const DEFAULT_MOCKUP_3D_MOTION_CONFIG: Mockup3DMotionConfig = {
  presetId: "none",
  intensity: 50,
  speed: 50,
};

/**
 * Transform payload consumed by the 3D stage. All rotations are in RADIANS,
 * position offsets are in scene units (the model is scaled at scale=0.004 in
 * the iPhone viewer, so a position offset of ~0.2 roughly equals one body
 * width), and scale is a uniform multiplier on top of the base scale.
 */
export interface Mockup3DMotionTransform {
  /** Euler rotation applied additively to the root group (radians). */
  rotX: number;
  rotY: number;
  rotZ: number;
  /** Position offset added to the root group (scene units). */
  posX: number;
  posY: number;
  posZ: number;
  /** Uniform scale multiplier (1 = no change). */
  scale: number;
  /** Opacity [0..1] — applied to materials when < 1. */
  opacity: number;
}

export const REST_MOCKUP_3D_MOTION: Mockup3DMotionTransform = {
  rotX: 0,
  rotY: 0,
  rotZ: 0,
  posX: 0,
  posY: 0,
  posZ: 0,
  scale: 1,
  opacity: 1,
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const DEG = Math.PI / 180;

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

function easeOutQuint(t: number) {
  return 1 - (1 - t) ** 5;
}

function speedToDurationSec(speed: number): number {
  return lerp(1.6, 0.5, clamp01(speed / 100));
}

export function sampleMockup3DMotion(
  config: Mockup3DMotionConfig,
  currentTime: number,
  clipDurationSec: number
): Mockup3DMotionTransform {
  const { presetId, intensity, speed } = config;
  const i = clamp01(intensity / 100);

  if (presetId === "none" || clipDurationSec <= 0) return REST_MOCKUP_3D_MOTION;

  switch (presetId) {
    /**
     * ORBIT ENTRANCE — the model sweeps in from a dramatic three-quarter
     * angle while rising on the Y axis, then settles into its resting pose.
     * Feels like a hero product reveal on a turntable.
     */
    case "orbit-entrance": {
      const dur = Math.min(speedToDurationSec(speed) * 1.2, clipDurationSec);
      const t = clamp01(currentTime / dur);
      const eased = easeOutCubic(t);

      const startRotY = lerp(140, 220, i) * DEG;
      const startRotX = lerp(20, 40, i) * DEG;
      const startRotZ = lerp(-12, -24, i) * DEG;
      const startY = lerp(0.12, 0.28, i);
      const startScale = lerp(0.65, 0.4, i);

      const settleRot = easeOutBack(clamp01(t));
      const rotY = lerp(startRotY, 0, eased);
      const rotX = lerp(startRotX, 0, settleRot);
      const rotZ = lerp(startRotZ, 0, eased);
      const posY = lerp(startY, 0, eased);
      const scale = lerp(startScale, 1, settleRot);

      return {
        ...REST_MOCKUP_3D_MOTION,
        rotX,
        rotY,
        rotZ,
        posY,
        scale,
        opacity: easeOutCubic(clamp01(t * 2.2)),
      };
    }

    /**
     * TURNTABLE DRIFT — a continuous, slow orbital drift with subtle vertical
     * bob and a gentle scale breathing. Designed to run for the whole clip
     * duration so the model always feels alive without distracting from the
     * screen content.
     */
    case "turntable-drift": {
      const p = clamp01(currentTime / clipDurationSec);
      const speedT = clamp01(speed / 100);

      // Full revolution cadence: faster speed completes more turns.
      const turns = lerp(0.4, 1.1, speedT);
      const rotY = p * Math.PI * 2 * turns;

      // Vertical bob: 1.5 oscillations across the clip.
      const bobAmp = lerp(0.015, 0.045, i);
      const posY = Math.sin(p * Math.PI * 2 * 1.5) * bobAmp;

      // Subtle X-axis tilt sway synced to the bob for a floating feel.
      const tiltAmp = lerp(3, 8, i) * DEG;
      const rotX = Math.sin(p * Math.PI * 2 * 1.5 + Math.PI / 2) * tiltAmp;

      // Gentle breathing scale.
      const breathAmp = lerp(0.008, 0.02, i);
      const scale = 1 + Math.sin(p * Math.PI * 2 * 1.5) * breathAmp;

      // Soft entry fade-in over the first ~12% so it never pops.
      const entryFade = easeOutCubic(clamp01(p / 0.12));

      return {
        ...REST_MOCKUP_3D_MOTION,
        rotX,
        rotY,
        scale,
        posY,
        opacity: entryFade,
      };
    }

    /**
     * FLICK EXIT — the model quickly tilts, rotates, and accelerates away
     * while fading out. Mirrors the physical "swipe away" gesture.
     */
    case "flick-exit": {
      const dur = Math.min(speedToDurationSec(speed), clipDurationSec);
      const startAt = Math.max(0, clipDurationSec - dur);
      const t = clamp01((currentTime - startAt) / dur);
      const eased = easeOutQuint(t);

      const exitRotY = lerp(60, 140, i) * DEG;
      const exitRotX = lerp(-15, -35, i) * DEG;
      const exitRotZ = lerp(8, 20, i) * DEG;
      const exitX = lerp(0.15, 0.4, i);
      const exitY = lerp(0.05, 0.18, i);
      const exitScale = lerp(0.92, 0.75, i);

      return {
        ...REST_MOCKUP_3D_MOTION,
        rotX: lerp(0, exitRotX, eased),
        rotY: lerp(0, exitRotY, eased),
        rotZ: lerp(0, exitRotZ, eased),
        posX: lerp(0, exitX, eased),
        posY: lerp(0, exitY, eased),
        scale: lerp(1, exitScale, eased),
        opacity: lerp(1, 0, eased),
      };
    }

    default:
      return REST_MOCKUP_3D_MOTION;
  }
}

const ENTRANCE_EXIT_PADDING = 1.4;
const DEFAULT_CONTINUOUS_DURATION = 3;

const SMALL_DURATION_PRESETS_3D = new Set<Mockup3DMotionPresetId>(["orbit-entrance"]);

const LONG_DURATION_PRESETS_3D = new Set<Mockup3DMotionPresetId>(["turntable-drift"]);

export function getDefault3DFragmentDuration(
  presetId: Mockup3DMotionPresetId,
  speed: number
): number {
  if (LONG_DURATION_PRESETS_3D.has(presetId)) {
    return lerp(10, 6.0, clamp01(speed / 100));
  }

  if (SMALL_DURATION_PRESETS_3D.has(presetId)) {
    return lerp(6, 3.5, clamp01(speed / 100));
  }

  const category = get3DMotionPresetCategory(presetId);

  if (category === "Entrance" || category === "Exit") {
    return speedToDurationSec(speed) * ENTRANCE_EXIT_PADDING;
  }

  return DEFAULT_CONTINUOUS_DURATION;
}

export interface Mockup3DMotionCustomOffsets {
  positionX: number;
  positionY: number;
  zoomMultiplier: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  reverse: boolean;
}

export const DEFAULT_3D_MOTION_CUSTOM_OFFSETS: Mockup3DMotionCustomOffsets = {
  positionX: 0,
  positionY: 0,
  zoomMultiplier: 1,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  reverse: false,
};

export function get3DMotionPresetCategory(
  id: Mockup3DMotionPresetId
): (typeof MOCKUP_3D_MOTION_PRESETS)[number]["category"] {
  return MOCKUP_3D_MOTION_PRESETS.find((p) => p.id === id)?.category ?? "Continue";
}

function apply3DMotionCustomOffsets(
  base: Mockup3DMotionTransform,
  custom: Mockup3DMotionCustomOffsets | undefined
): Mockup3DMotionTransform {
  if (!custom) return base;

  const sign = custom.reverse ? -1 : 1;

  return {
    ...base,
    scale: base.scale * custom.zoomMultiplier,
    posX: base.posX * sign + custom.positionX,
    posY: base.posY * sign + custom.positionY,
    rotX: base.rotX * sign + custom.rotateX * DEG,
    rotY: base.rotY * sign + custom.rotateY * DEG,
    rotZ: base.rotZ * sign + custom.rotateZ * DEG,
  };
}

export interface Mockup3DMotionFragment extends Mockup3DMotionConfig {
  id: string;
  startTime: number;
  endTime: number;
  custom3D?: Mockup3DMotionCustomOffsets;
}

export function sample3DFragmentMotion(
  fragment: Mockup3DMotionFragment,
  currentTime: number
): Mockup3DMotionTransform {
  if (currentTime < fragment.startTime || currentTime > fragment.endTime) {
    return REST_MOCKUP_3D_MOTION;
  }

  const localTime = currentTime - fragment.startTime;
  const localDuration = fragment.endTime - fragment.startTime;

  const base = sampleMockup3DMotion(
    { presetId: fragment.presetId, intensity: fragment.intensity, speed: fragment.speed },
    localTime,
    localDuration
  );

  return apply3DMotionCustomOffsets(base, fragment.custom3D);
}

export function sampleCombined3DMotion(
  fragments: Mockup3DMotionFragment[],
  currentTime: number
): Mockup3DMotionTransform {
  const active = fragments.filter(
    (f) => currentTime >= f.startTime && currentTime <= f.endTime
  );

  if (active.length === 0) return REST_MOCKUP_3D_MOTION;

  return active.reduce<Mockup3DMotionTransform>(
    (acc, fragment) => {
      const t = sample3DFragmentMotion(fragment, currentTime);
      return {
        rotX: acc.rotX + t.rotX,
        rotY: acc.rotY + t.rotY,
        rotZ: acc.rotZ + t.rotZ,
        posX: acc.posX + t.posX,
        posY: acc.posY + t.posY,
        posZ: acc.posZ + t.posZ,
        scale: acc.scale * t.scale,
        opacity: acc.opacity * t.opacity,
      };
    },
    { ...REST_MOCKUP_3D_MOTION }
  );
}

export function findValid3DMotionPlacement(
  presetId: Mockup3DMotionPresetId,
  speed: number,
  hintTime: number,
  existingFragments: Mockup3DMotionFragment[],
  clipDurationSec: number
): { startTime: number; endTime: number } | null {
  const duration = Math.min(getDefault3DFragmentDuration(presetId, speed), clipDurationSec);
  if (duration <= 0 || clipDurationSec <= 0) return null;

  const category = get3DMotionPresetCategory(presetId);
  const sorted = [...existingFragments].sort((a, b) => a.startTime - b.startTime);

  const overlaps = (start: number, end: number) =>
    sorted.some((f) => start < f.endTime && end > f.startTime);

  const tryPlace = (start: number) => {
    const end = start + duration;
    if (start < 0 || end > clipDurationSec) return null;
    return overlaps(start, end) ? null : { startTime: start, endTime: end };
  };

  const preferredStart =
    category === "Entrance"
      ? 0
      : category === "Exit"
        ? Math.max(0, clipDurationSec - duration)
        : Math.max(0, Math.min(hintTime - duration / 2, clipDurationSec - duration));

  const direct = tryPlace(preferredStart);
  if (direct) return direct;

  const gaps: { start: number; end: number }[] = [];
  let cursor = 0;

  for (const f of sorted) {
    if (f.startTime > cursor) gaps.push({ start: cursor, end: f.startTime });
    cursor = Math.max(cursor, f.endTime);
  }

  if (cursor < clipDurationSec) gaps.push({ start: cursor, end: clipDurationSec });

  const fitting = gaps.filter((g) => g.end - g.start >= duration);
  if (fitting.length === 0) return null;

  fitting.sort((a, b) => {
    const da = Math.min(
      Math.abs(a.start - preferredStart),
      Math.abs(a.end - duration - preferredStart)
    );
    const db = Math.min(
      Math.abs(b.start - preferredStart),
      Math.abs(b.end - duration - preferredStart)
    );
    return da - db;
  });

  const gap = fitting[0];
  const start = Math.max(gap.start, Math.min(preferredStart, gap.end - duration));

  return { startTime: start, endTime: start + duration };
}
