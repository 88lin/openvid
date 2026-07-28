export type MockupMotionPresetId =
  | "none"
  | "rise-settle"
  | "flip-reveal"
  | "focus-in"
  | "cinematic-showcase"
  | "isometric-lift"
  | "panoramic-sweep"
  | "macro-track"
  | "depth-emerge"
  | "dolly-vertigo"
  | "rim-light-reveal"
  | "surface-orbit"
  | "low-dolly-reveal"
  | "exit-fade-down"
  | "exit-scale-blur"
  | "z-spin-reveal";

export const MOCKUP_MOTION_PRESETS: {
  id: MockupMotionPresetId;
  category: "Entrance" | "Continue" | "Exit";
}[] = [
    { id: "focus-in", category: "Entrance" },
    { id: "rise-settle", category: "Entrance" },
    { id: "flip-reveal", category: "Entrance" },
    { id: "depth-emerge", category: "Entrance" },
    { id: "z-spin-reveal", category: "Entrance" },
    { id: "isometric-lift", category: "Entrance" },
    { id: "cinematic-showcase", category: "Continue" },
    { id: "panoramic-sweep", category: "Continue" },
    { id: "macro-track", category: "Continue" },
    { id: "rim-light-reveal", category: "Continue" },
    { id: "surface-orbit", category: "Continue" },
    { id: "low-dolly-reveal", category: "Continue" },
    { id: "exit-fade-down", category: "Exit" },
    { id: "exit-scale-blur", category: "Exit" },
  ];

export interface MockupMotionConfig {
  presetId: MockupMotionPresetId;
  intensity: number;
  speed: number;
}

export const DEFAULT_MOCKUP_MOTION_CONFIG: MockupMotionConfig = {
  presetId: "none",
  intensity: 50,
  speed: 50,
};

export interface MockupMotionTransform {
  scale: number;
  translateXPct: number;
  translateYPct: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  opacity: number;
  blurPx: number;
  perspectivePx: number;
}

export const REST_MOCKUP_MOTION: MockupMotionTransform = {
  scale: 1,
  translateXPct: 0,
  translateYPct: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  opacity: 1,
  blurPx: 0,
  perspectivePx: 0,
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}
function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

function easeOutQuint(t: number) {
  return 1 - (1 - t) ** 5;
}

function speedToDurationSec(speed: number): number {
  return lerp(1.4, 0.35, clamp01(speed / 100));
}

export function sampleMockupMotion(
  config: MockupMotionConfig,
  currentTime: number,
  clipDurationSec: number
): MockupMotionTransform {
  const { presetId, intensity, speed } = config;
  const i = clamp01(intensity / 100);
  if (presetId === "none" || clipDurationSec <= 0) return REST_MOCKUP_MOTION;

  switch (presetId) {
    case "rise-settle": {
      const dur = Math.min(speedToDurationSec(speed), clipDurationSec);
      const t = clamp01(currentTime / dur);
      const eased = easeOutBack(t);
      const riseDistance = lerp(8, 28, i);
      return {
        ...REST_MOCKUP_MOTION,
        translateYPct: lerp(riseDistance, 0, eased),
        opacity: lerp(0, 1, easeOutCubic(clamp01(t * 1.6))),
      };
    }
    case "flip-reveal": {
      const dur = Math.min(speedToDurationSec(speed) * 1.2, clipDurationSec);
      const t = clamp01(currentTime / dur);
      const eased = easeOutCubic(t);
      const startAngle = lerp(35, 65, i);
      return {
        ...REST_MOCKUP_MOTION,
        rotateY: lerp(-startAngle, 0, eased),
        opacity: lerp(0.2, 1, easeOutCubic(clamp01(t * 1.8))),
        perspectivePx: 900,
      };
    }
    case "focus-in": {
      const dur = Math.min(speedToDurationSec(speed), clipDurationSec);
      const t = clamp01(currentTime / dur);
      const eased = easeOutCubic(t);
      const startBlur = lerp(6, 22, i);
      return {
        ...REST_MOCKUP_MOTION,
        scale: lerp(1.06, 1, eased),
        blurPx: lerp(startBlur, 0, eased),
        opacity: lerp(0.3, 1, easeOutCubic(clamp01(t * 2))),
      };
    }

    case "z-spin-reveal": {
      const speedT = clamp01(speed / 100);
      const animationEnd = lerp(0.95, 0.85, speedT);
      const p = clamp01(currentTime / clipDurationSec);

      const xRot0 = lerp(45, 60, i);
      const yRot0 = lerp(10, 20, i);
      const zRot0 = lerp(-85, -95, i);
      const zoomStart = lerp(0.7, 0.8, i);

      let scale = 1, tiltX = 0, tiltY = 0, tiltZ = 0;

      if (p <= animationEnd) {
        const lp = easeInOutCubic(clamp01(p / animationEnd));

        scale = lerp(zoomStart, 1, lp);
        tiltX = lerp(xRot0, 0, lp);
        tiltY = lerp(yRot0, 0, lp);
        tiltZ = lerp(zRot0, 0, lp);
      } else {
        scale = 1;
        tiltX = 0;
        tiltY = 0;
        tiltZ = 0;
      }

      const tiltRatio = clamp01(Math.abs(tiltX) / (xRot0 || 1));
      const perspective = lerp(2000, 1000, tiltRatio);

      return {
        ...REST_MOCKUP_MOTION,
        scale,
        translateXPct: 0,
        translateYPct: 0,
        rotateX: tiltX,
        rotateY: tiltY,
        rotateZ: tiltZ,
        perspectivePx: perspective,
      };
    }
    case "cinematic-showcase": {
      const speedT = clamp01(speed / 100);
      const impactEnd = lerp(0.12, 0.05, speedT);
      const panEnd = lerp(0.68, 0.55, speedT);
      const p = clamp01(currentTime / clipDurationSec);
      const zoomStart = lerp(1.5, 2.4, i);
      const zoomPan = lerp(1.15, 1.35, i);
      const tiltX0 = lerp(2, 6, i);
      const tiltY0 = lerp(4, 10, i);
      const anchorX0 = lerp(0.25, 0.4, i);
      const anchorY0 = lerp(0.20, 0.35, i);
      const anchorX1 = lerp(0.05, 0.15, i);
      const anchorY1 = lerp(0.04, 0.12, i);
      let scale: number, anchorX: number, anchorY: number, tiltX: number, tiltY: number;
      let blur = 0;

      if (p <= impactEnd) {
        const lp = easeOutCubic(clamp01(p / Math.max(impactEnd, 0.0001)));
        scale = lerp(zoomStart * 1.04, zoomStart, lp);
        anchorX = anchorX0;
        anchorY = anchorY0;
        tiltX = lerp(tiltX0 * 1.1, tiltX0, lp);
        tiltY = lerp(tiltY0 * 1.1, tiltY0, lp);


      } else if (p <= panEnd) {
        const lp = easeInOutCubic(clamp01((p - impactEnd) / (panEnd - impactEnd)));
        scale = lerp(zoomStart, zoomPan, lp);
        anchorX = lerp(anchorX0, anchorX1, lp);
        anchorY = lerp(anchorY0, anchorY1, lp);
        tiltX = lerp(tiltX0, tiltX0 * 0.4, lp);
        tiltY = lerp(tiltY0, tiltY0 * 0.4, lp);

        blur = Math.sin(Math.PI * lp) * lerp(1.5, 4, i);

      } else {
        const lp = easeOutQuint(clamp01((p - panEnd) / (1 - panEnd)));
        scale = lerp(zoomPan, 1, lp);
        anchorX = lerp(anchorX1, 0, lp);
        anchorY = lerp(anchorY1, 0, lp);
        tiltX = lerp(tiltX0 * 0.4, 0, lp);
        tiltY = lerp(tiltY0 * 0.4, 0, lp);

        blur = 0;
      }

      const translateXPct = scale * anchorX * 100;
      const translateYPct = scale * anchorY * 100;

      const tiltRatio = clamp01((Math.abs(tiltX) + Math.abs(tiltY)) / (tiltX0 + tiltY0 || 1));
      const perspective = lerp(2500, 1500, tiltRatio);

      return {
        ...REST_MOCKUP_MOTION,
        scale,
        translateXPct,
        translateYPct,
        rotateX: tiltX,
        rotateY: tiltY,
        blurPx: blur,
        perspectivePx: perspective,
      };
    }

    case "depth-emerge": {
      const dur = Math.min(speedToDurationSec(speed) * 1.3, clipDurationSec);
      const t = clamp01(currentTime / dur);
      const emergeEnd = 0.45;
      const blurFadeEnd = 0.55;

      const startScale = lerp(0.35, 0.15, i);
      const startBlur = lerp(12, 28, i);
      const startRotateX = lerp(25, 55, i);
      const startRotateY = lerp(-20, -45, i);
      const startOpacity = 0;

      let scale: number, blur: number, rotX: number, rotY: number, opacity: number;

      if (t <= emergeEnd) {
        const lp = easeOutCubic(clamp01(t / emergeEnd));
        scale = lerp(startScale, 1.08, lp);
        blur = lerp(startBlur, 0, easeOutCubic(clamp01(t / blurFadeEnd)));
        rotX = lerp(startRotateX, 8, lp);
        rotY = lerp(startRotateY, -8, lp);
        opacity = lerp(startOpacity, 1, easeOutCubic(clamp01(t * 2.2)));
      } else {
        const lp = easeOutBack(clamp01((t - emergeEnd) / (1 - emergeEnd)));
        scale = lerp(1.08, 1, lp);
        blur = 0;
        rotX = lerp(8, 0, lp);
        rotY = lerp(-8, 0, lp);
        opacity = 1;
      }

      const tiltRatio = clamp01((Math.abs(rotX) + Math.abs(rotY)) / (startRotateX + Math.abs(startRotateY) || 1));
      const perspective = lerp(1800, 900, tiltRatio);

      return {
        ...REST_MOCKUP_MOTION,
        scale,
        rotateX: rotX,
        rotateY: rotY,
        blurPx: blur,
        opacity,
        perspectivePx: perspective,
      };
    }

    case "dolly-vertigo": {
      const speedT = clamp01(speed / 100);
      const dollyEnd = lerp(0.72, 0.58, speedT);
      const p = clamp01(currentTime / clipDurationSec);
      const zoomStart = lerp(2.8, 4.0, i);
      const zoomDolly = lerp(0.85, 0.65, i);
      const zPush = lerp(120, 220, i);
      const tiltX0 = lerp(4, 10, i);
      const tiltY0 = lerp(-8, -18, i);
      const rollZ0 = lerp(-3, -8, i);
      const anchorX0 = lerp(0.2, 0.35, i);
      const anchorY0 = lerp(0.15, 0.3, i);
      let scale: number, anchorX: number, anchorY: number;
      let tiltX: number, tiltY: number, tiltZ: number;
      let blur = 0;

      if (p <= dollyEnd) {
        const lp = easeInOutCubic(clamp01(p / dollyEnd));

        scale = lerp(zoomStart, zoomDolly, lp);
        anchorX = lerp(anchorX0, 0, lp);
        anchorY = lerp(anchorY0, 0, lp);
        tiltX = lerp(tiltX0, tiltX0 * 0.3, lp);
        tiltY = lerp(tiltY0, tiltY0 * 0.2, lp);
        tiltZ = lerp(rollZ0, rollZ0 * 0.3, lp);

        const motionPeak = Math.sin(Math.PI * lp);
        blur = motionPeak * lerp(1.5, 4, i);
      } else {
        const lp = easeOutQuint(clamp01((p - dollyEnd) / (1 - dollyEnd)));
        scale = lerp(zoomDolly, 1, lp);
        anchorX = 0;
        anchorY = 0;
        tiltX = lerp(tiltX0 * 0.3, 0, lp);
        tiltY = lerp(tiltY0 * 0.2, 0, lp);
        tiltZ = lerp(rollZ0 * 0.3, 0, lp);
        blur = 0;
      }

      const translateYPct = lerp(zPush * 0.05, 0, easeOutCubic(p));
      const translateXPct = scale * anchorX * 100;
      const finalTranslateYPct = scale * anchorY * 100 + translateYPct;
      const tiltRatio = clamp01((Math.abs(tiltX) + Math.abs(tiltY)) / (tiltX0 + Math.abs(tiltY0) || 1));
      const perspective = lerp(3000, 1400, tiltRatio);

      return {
        ...REST_MOCKUP_MOTION,
        scale,
        translateXPct,
        translateYPct: finalTranslateYPct,
        rotateX: tiltX,
        rotateY: tiltY,
        rotateZ: tiltZ,
        blurPx: blur,
        perspectivePx: perspective,
      };
    }

    case "rim-light-reveal": {
      const speedT = clamp01(speed / 100);
      const darknessEnd = lerp(0.22, 0.15, speedT);
      const flashEnd = lerp(0.55, 0.42, speedT);
      const p = clamp01(currentTime / clipDurationSec);
      const zoomDark = lerp(3.5, 5.0, i);
      const xRotDark = lerp(60, 85, i);
      const yRotDark = lerp(40, 65, i);
      const zRotDark = lerp(-15, -30, i);
      const anchorXDark = lerp(0.2, 0.35, i);
      const anchorYDark = lerp(0.15, 0.3, i);
      const zoomFlash = lerp(1.4, 1.8, i);
      const xRotFlash = lerp(15, 25, i);
      const yRotFlash = lerp(10, 18, i);
      const zRotFlash = lerp(-4, -8, i);

      let scale: number, anchorX: number, anchorY: number;
      let tiltX: number, tiltY: number, tiltZ: number;
      let blur = 0;
      let opacity = 1;

      if (p <= darknessEnd) {

        const lp = easeOutCubic(clamp01(p / Math.max(darknessEnd, 0.0001)));
        scale = lerp(zoomDark * 1.05, zoomDark, lp);
        anchorX = anchorXDark;
        anchorY = anchorYDark;
        tiltX = xRotDark;
        tiltY = yRotDark;
        tiltZ = zRotDark;
        blur = lerp(10, 18, i);
        opacity = lerp(0.15, 0.35, lp);
      } else if (p <= flashEnd) {

        const segment = flashEnd - darknessEnd;
        const lp = clamp01((p - darknessEnd) / Math.max(segment, 0.0001));
        const motionLinearProgress = easeOutQuint(lp);
        scale = lerp(zoomDark, zoomFlash, motionLinearProgress);
        anchorX = lerp(anchorXDark, 0, motionLinearProgress);
        anchorY = lerp(anchorYDark, 0, motionLinearProgress);
        tiltX = lerp(xRotDark, xRotFlash, motionLinearProgress);
        tiltY = lerp(yRotDark, yRotFlash, motionLinearProgress);
        tiltZ = lerp(zRotDark, zRotFlash, motionLinearProgress);
        blur = lerp(lerp(10, 18, i), 0, motionLinearProgress);

        opacity = lp < 0.2
          ? lerp(0.35, 1.08, easeOutCubic(lp / 0.2))
          : lerp(1.08, 1, easeOutCubic(clamp01((lp - 0.2) / 0.8)));
      } else {

        const lp = easeOutQuint(clamp01((p - flashEnd) / (1 - flashEnd)));
        scale = lerp(zoomFlash, 1, lp);
        anchorX = 0;
        anchorY = 0;
        tiltX = lerp(xRotFlash, 0, lp);
        tiltY = lerp(yRotFlash, 0, lp);
        tiltZ = lerp(zRotFlash, 0, lp);
        blur = 0;
        opacity = 1;
      }

      const translateXPct = scale * anchorX * 100;
      const translateYPct = scale * anchorY * 100;
      const tiltRatio = clamp01((Math.abs(tiltX) + Math.abs(tiltY)) / (xRotDark + yRotDark || 1));
      const perspective = lerp(3200, 2000, tiltRatio);

      return {
        ...REST_MOCKUP_MOTION,
        scale,
        translateXPct,
        translateYPct,
        rotateX: tiltX,
        rotateY: tiltY,
        rotateZ: tiltZ,
        blurPx: blur,
        opacity,
        perspectivePx: perspective,
      };
    }
    case "isometric-lift": {
      const speedT = clamp01(speed / 100);
      const liftEnd = lerp(0.75, 0.6, speedT);
      const p = clamp01(currentTime / clipDurationSec);
      const xRot0 = lerp(35, 60, i);
      const zRot0 = lerp(-15, -40, i);
      const yRot0 = lerp(10, 25, i);
      const zoomStart = lerp(1.1, 1.45, i);
      let scale = 1, tiltX = 0, tiltY = 0, tiltZ = 0, translateYPct = 0;

      if (p <= liftEnd) {
        const lp = easeInOutCubic(clamp01(p / liftEnd));

        scale = lerp(zoomStart, 1.05, lp);
        tiltX = lerp(xRot0, xRot0 * 0.15, lp);
        tiltY = lerp(yRot0, yRot0 * 0.15, lp);
        tiltZ = lerp(zRot0, 0, lp);

        translateYPct = lerp(lerp(0, 0, i), 0, lp);
      } else {
        const lp = easeOutQuint(clamp01((p - liftEnd) / (1 - liftEnd)));

        scale = lerp(1.05, 1, lp);
        tiltX = lerp(xRot0 * 0.15, 0, lp);
        tiltY = lerp(yRot0 * 0.15, 0, lp);
        tiltZ = 0;
        translateYPct = 0;
      }

      const tiltRatio = clamp01(Math.abs(tiltX) / (xRot0 || 1));
      const perspective = lerp(2000, 1100, tiltRatio);

      return {
        ...REST_MOCKUP_MOTION,
        scale,
        translateXPct: 0,
        translateYPct,
        rotateX: tiltX,
        rotateY: tiltY,
        rotateZ: tiltZ,
        perspectivePx: perspective,
      };
    }

    case "panoramic-sweep": {
      const speedT = clamp01(speed / 100);
      const sweepEnd = lerp(0.7, 0.55, speedT);
      const p = clamp01(currentTime / clipDurationSec);
      const zoomSweep = lerp(1.2, 1.6, i);
      const tiltYStart = lerp(-35, -55, i);
      const tiltYEnd = lerp(15, 25, i);
      const tiltZRoll = lerp(-4, -12, i);
      const anchorXStart = lerp(-0.35, -0.5, i);
      const anchorXEnd = lerp(0.15, 0.25, i);
      let scale = 1, anchorX = 0, tiltX = 0, tiltY = 0, tiltZ = 0, blur = 0;

      if (p <= sweepEnd) {
        const lp = easeInOutCubic(clamp01(p / sweepEnd));

        const arc = Math.sin(Math.PI * lp);
        scale = lerp(zoomSweep, zoomSweep * 0.92, arc);
        anchorX = lerp(anchorXStart, anchorXEnd, lp);
        tiltY = lerp(tiltYStart, tiltYEnd, lp);
        tiltZ = lerp(tiltZRoll, -tiltZRoll * 0.4, lp);
        tiltX = lerp(lerp(5, 12, i), lerp(2, 6, i), lp);
        blur = arc * lerp(2, 6, i);

      } else {
        const lp = easeOutQuint(clamp01((p - sweepEnd) / (1 - sweepEnd)));

        scale = lerp(zoomSweep * (1 - 0.08 * Math.sin(Math.PI)), 1, lp);
        anchorX = lerp(anchorXEnd, 0, lp);
        tiltY = lerp(tiltYEnd, 0, lp);
        tiltZ = lerp(-tiltZRoll * 0.4, 0, lp);
        tiltX = lerp(lerp(2, 6, i), 0, lp);
        blur = 0;
      }

      const perspective = 2200;

      return {
        ...REST_MOCKUP_MOTION,
        scale,
        translateXPct: scale * anchorX * 100,
        translateYPct: 0,
        rotateX: tiltX,
        rotateY: tiltY,
        rotateZ: tiltZ,
        blurPx: blur,
        perspectivePx: perspective,
      };
    }

    case "macro-track": {
      const speedT = clamp01(speed / 100);
      const trackEnd = lerp(0.75, 0.6, speedT);
      const p = clamp01(currentTime / clipDurationSec);
      const zoom0 = lerp(2.2, 3.2, i);
      const xRot0 = lerp(45, 65, i);
      const zRot0 = lerp(8, 22, i);
      const anchorX0 = lerp(0.3, 0.45, i);
      const anchorY0 = lerp(0.35, 0.48, i);
      const anchorX1 = lerp(-0.05, -0.1, i);
      const anchorY1 = lerp(-0.05, -0.1, i);
      let scale = 1, anchorX = 0, anchorY = 0, tiltX = 0, tiltZ = 0;

      if (p <= trackEnd) {
        const lp = easeInOutCubic(clamp01(p / trackEnd));

        scale = lerp(zoom0, zoom0 * 0.6, lp);
        anchorX = lerp(anchorX0, anchorX1, lp);
        anchorY = lerp(anchorY0, anchorY1, lp);
        tiltX = lerp(xRot0, xRot0 * 0.3, lp);
        tiltZ = lerp(zRot0, zRot0 * 0.2, lp);
      } else {
        const lp = easeOutQuint(clamp01((p - trackEnd) / (1 - trackEnd)));

        scale = lerp(zoom0 * 0.6, 1, lp);
        anchorX = lerp(anchorX1, 0, lp);
        anchorY = lerp(anchorY1, 0, lp);
        tiltX = lerp(xRot0 * 0.3, 0, lp);
        tiltZ = lerp(zRot0 * 0.2, 0, lp);
      }

      const perspective = 2500;

      return {
        ...REST_MOCKUP_MOTION,
        scale,
        translateXPct: scale * anchorX * 100,
        translateYPct: scale * anchorY * 100,
        rotateX: tiltX,
        rotateY: 0,
        rotateZ: tiltZ,
        blurPx: 0,
        perspectivePx: perspective,
      };
    }

    case "surface-orbit": {
      const speedT = clamp01(speed / 100);
      const orbitEnd = lerp(0.8, 0.65, speedT);
      const p = clamp01(currentTime / clipDurationSec);
      const xRot0 = lerp(50, 70, i);
      const yRot0 = 0;
      const zRot0 = 0;
      const zoom0 = lerp(1.3, 1.65, i);
      const anchorX0 = 0;
      const anchorY0 = lerp(0.08, 0.18, i);
      const xRotMid = lerp(20, 30, i);
      const yRotMid = 0;
      const zRotMid = 0;
      const zoomMid = lerp(1.12, 1.38, i);
      const anchorXMid = 0;
      const anchorYMid = lerp(0.02, 0.05, i);

      let scale: number, tiltX: number, tiltY: number, tiltZ: number;
      let anchorX: number, anchorY: number;

      if (p <= orbitEnd) {
        const lp = easeInOutCubic(clamp01(p / orbitEnd));
        const orbitT = easeInOutCubic(lp);

        scale = lerp(zoom0, zoomMid, orbitT);
        anchorX = lerp(anchorX0, anchorXMid, orbitT);
        anchorY = lerp(anchorY0, anchorYMid, orbitT);
        tiltX = lerp(xRot0, xRotMid, orbitT);
        tiltY = lerp(yRot0, yRotMid, orbitT);
        tiltZ = lerp(zRot0, zRotMid, orbitT);
      } else {
        const lp = easeOutQuint(clamp01((p - orbitEnd) / (1 - orbitEnd)));

        scale = lerp(zoomMid, 1, lp);
        anchorX = lerp(anchorXMid, 0, lp);
        anchorY = lerp(anchorYMid, 0, lp);
        tiltX = lerp(xRotMid, 0, lp);
        tiltY = lerp(yRotMid, 0, lp);
        tiltZ = lerp(zRotMid, 0, lp);
      }

      const translateXPct = scale * anchorX * 100;
      const translateYPct = scale * anchorY * 100;
      const tiltRatio = clamp01((Math.abs(tiltX) + Math.abs(tiltY)) / (xRot0 + yRot0 || 1));
      const perspective = lerp(3000, 1800, tiltRatio);

      return {
        ...REST_MOCKUP_MOTION,
        scale,
        translateXPct,
        translateYPct,
        rotateX: tiltX,
        rotateY: tiltY,
        rotateZ: tiltZ,
        blurPx: 0,
        perspectivePx: perspective,
      };
    }

    case "low-dolly-reveal": {
      const speedT = clamp01(speed / 100);
      const dollyEnd = lerp(0.76, 0.62, speedT);
      const p = clamp01(currentTime / clipDurationSec);
      const xRot0 = lerp(35, 48, i);
      const yRot0 = lerp(-6, -12, i);
      const zRot0 = lerp(2, 6, i);
      const zoom0 = lerp(1.4, 1.8, i);
      const anchorX0 = lerp(0.04, 0.1, i);
      const anchorY0 = lerp(-0.1, -0.2, i);
      const xRotMid = lerp(12, 18, i);
      const yRotMid = lerp(-2, -5, i);
      const zRotMid = lerp(1, 2, i);
      const zoomMid = lerp(1.08, 1.2, i);
      const anchorXMid = lerp(0.01, 0.03, i);
      const anchorYMid = lerp(-0.02, -0.04, i);

      let scale: number, tiltX: number, tiltY: number, tiltZ: number;
      let anchorX: number, anchorY: number;

      if (p <= dollyEnd) {
        const lp = clamp01(p / dollyEnd);
        const dollyT = easeInOutCubic(lp);
        scale = lerp(zoom0, zoomMid, dollyT);
        anchorX = lerp(anchorX0, anchorXMid, dollyT);
        anchorY = lerp(anchorY0, anchorYMid, dollyT);
        tiltX = lerp(xRot0, xRotMid, dollyT);
        tiltY = lerp(yRot0, yRotMid, dollyT);
        tiltZ = lerp(zRot0, zRotMid, dollyT);
      } else {
        const lp = easeOutQuint(clamp01((p - dollyEnd) / (1 - dollyEnd)));

        scale = lerp(zoomMid, 1, lp);
        anchorX = lerp(anchorXMid, 0, lp);
        anchorY = lerp(anchorYMid, 0, lp);
        tiltX = lerp(xRotMid, 0, lp);
        tiltY = lerp(yRotMid, 0, lp);
        tiltZ = lerp(zRotMid, 0, lp);
      }

      const translateXPct = scale * anchorX * 100;
      const translateYPct = scale * anchorY * 100;
      const tiltRatio = clamp01((Math.abs(tiltX) + Math.abs(tiltY)) / (xRot0 + Math.abs(yRot0) || 1));
      const perspective = lerp(2800, 1800, tiltRatio);

      return {
        ...REST_MOCKUP_MOTION,
        scale,
        translateXPct,
        translateYPct,
        rotateX: tiltX,
        rotateY: tiltY,
        rotateZ: tiltZ,
        blurPx: 0,
        perspectivePx: perspective,
      };
    }

    case "exit-fade-down": {
      const dur = Math.min(speedToDurationSec(speed), clipDurationSec);
      const startAt = Math.max(0, clipDurationSec - dur);
      const t = clamp01((currentTime - startAt) / dur);
      const eased = easeOutCubic(t);
      const distance = lerp(6, 24, i);
      return {
        ...REST_MOCKUP_MOTION,
        translateYPct: lerp(0, distance, eased),
        opacity: lerp(1, 0, eased),
      };
    }
    case "exit-scale-blur": {
      const dur = Math.min(speedToDurationSec(speed), clipDurationSec);
      const startAt = Math.max(0, clipDurationSec - dur);
      const t = clamp01((currentTime - startAt) / dur);
      const eased = easeOutCubic(t);
      return {
        ...REST_MOCKUP_MOTION,
        scale: lerp(1, lerp(1.02, 1.25, i), eased),
        blurPx: lerp(0, lerp(4, 16, i), eased),
        opacity: lerp(1, 0, eased),
      };
    }
    default:
      return REST_MOCKUP_MOTION;
  }
}

const ENTRANCE_EXIT_PADDING = 1.4;
const DEFAULT_CONTINUOUS_DURATION = 3;

export function getDefaultFragmentDuration(
  presetId: MockupMotionPresetId,
  speed: number
): number {

  if (
    presetId === "cinematic-showcase" ||
    presetId === "isometric-lift" ||
    presetId === "panoramic-sweep" ||
    presetId === "macro-track" ||
    presetId === "dolly-vertigo" ||
    presetId === "rim-light-reveal" ||
    presetId === "surface-orbit" ||
    presetId === "low-dolly-reveal" ||
    presetId === "z-spin-reveal"

  ) {
    return lerp(7, 4.5, clamp01(speed / 100));
  }

  const category = getMotionPresetCategory(presetId);
  if (category === "Entrance" || category === "Exit") {
    return speedToDurationSec(speed) * ENTRANCE_EXIT_PADDING;
  }
  return DEFAULT_CONTINUOUS_DURATION;
}

export function buildMockupMotionCss(m: MockupMotionTransform): string {
  return [
    `translate(${m.translateXPct}%, ${m.translateYPct}%)`,
    `scale(${m.scale})`,
    m.rotateX !== 0 ? `rotateX(${m.rotateX}deg)` : "",
    m.rotateY !== 0 ? `rotateY(${m.rotateY}deg)` : "",
    m.rotateZ !== 0 ? `rotateZ(${m.rotateZ}deg)` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export interface MockupMotionFragment extends MockupMotionConfig {
  id: string;
  startTime: number;
  endTime: number;
}

export function getMotionPresetCategory(
  id: MockupMotionPresetId
): (typeof MOCKUP_MOTION_PRESETS)[number]["category"] {
  return MOCKUP_MOTION_PRESETS.find((p) => p.id === id)?.category ?? "Continue";
}

export function sampleFragmentMotion(
  fragment: MockupMotionFragment,
  currentTime: number
): MockupMotionTransform {
  if (currentTime < fragment.startTime || currentTime > fragment.endTime) {
    return REST_MOCKUP_MOTION;
  }
  const localTime = currentTime - fragment.startTime;
  const localDuration = fragment.endTime - fragment.startTime;
  return sampleMockupMotion(
    { presetId: fragment.presetId, intensity: fragment.intensity, speed: fragment.speed },
    localTime,
    localDuration
  );
}

export function sampleCombinedMockupMotion(
  fragments: MockupMotionFragment[],
  currentTime: number
): MockupMotionTransform {
  const active = fragments.filter(
    (f) => currentTime >= f.startTime && currentTime <= f.endTime
  );
  if (active.length === 0) return REST_MOCKUP_MOTION;

  return active.reduce<MockupMotionTransform>(
    (acc, fragment) => {
      const t = sampleFragmentMotion(fragment, currentTime);
      return {
        scale: acc.scale * t.scale,
        translateXPct: acc.translateXPct + t.translateXPct,
        translateYPct: acc.translateYPct + t.translateYPct,
        rotateX: acc.rotateX + t.rotateX,
        rotateY: acc.rotateY + t.rotateY,
        rotateZ: acc.rotateZ + t.rotateZ,
        opacity: acc.opacity * t.opacity,
        blurPx: Math.max(acc.blurPx, t.blurPx),
        perspectivePx: Math.max(acc.perspectivePx, t.perspectivePx),
      };
    },
    { ...REST_MOCKUP_MOTION }
  );
}

export function findValidMotionPlacement(
  presetId: MockupMotionPresetId,
  speed: number,
  hintTime: number,
  existingFragments: MockupMotionFragment[],
  clipDurationSec: number
): { startTime: number; endTime: number } | null {
  const duration = Math.min(getDefaultFragmentDuration(presetId, speed), clipDurationSec);
  if (duration <= 0 || clipDurationSec <= 0) return null;

  const category = getMotionPresetCategory(presetId);
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
    const da = Math.min(Math.abs(a.start - preferredStart), Math.abs(a.end - duration - preferredStart));
    const db = Math.min(Math.abs(b.start - preferredStart), Math.abs(b.end - duration - preferredStart));
    return da - db;
  });

  const gap = fitting[0];
  const start = Math.max(gap.start, Math.min(preferredStart, gap.end - duration));
  return { startTime: start, endTime: start + duration };
}