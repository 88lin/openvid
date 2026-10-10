import { useControls } from "leva";
import { useEffect } from "react";
import { MOUSE, TOUCH } from "three";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";

export type EnvironmentPreset = "sunset" | "dawn" | "night" | "warehouse" | "forest" | "apartment" | "studio" | "city" | "park" | "lobby";
export type CameraNavigationMode = "orbit" | "trackXY" | "trackZ";

export interface MockupCameraConfig {
    target: [number, number, number];
    distance: number;
    fov: number | null;
}

export const DEFAULT_MOCKUP_CAMERA: MockupCameraConfig = {
    target: [0, 0, 0],
    distance: 1,
    fov: null,
};

export function normalizeMockupCameraConfig(
    value?: Partial<MockupCameraConfig> | null,
): MockupCameraConfig {
    const target = value?.target;
    const coordinateAt = (index: number) => {
        const coordinate = target?.[index];
        return typeof coordinate === "number" && Number.isFinite(coordinate)
            ? Math.max(-1000, Math.min(1000, coordinate))
            : 0;
    };
    const normalizedTarget: [number, number, number] = [
        coordinateAt(0),
        coordinateAt(1),
        coordinateAt(2),
    ];
    const distance = value?.distance;
    const fov = value?.fov;
    return {
        target: normalizedTarget,
        distance: typeof distance === "number" && Number.isFinite(distance)
            ? Math.max(0.25, Math.min(4, distance))
            : 1,
        fov: typeof fov === "number" && Number.isFinite(fov)
            ? Math.max(20, Math.min(80, fov))
            : null,
    };
}

export function getCameraNavigationOptions(mode: CameraNavigationMode = "orbit") {
    return {
        enableRotate: mode === "orbit",
        enablePan: mode === "trackXY",
        enableZoom: mode === "trackZ",
        mouseButtons: {
            LEFT: mode === "orbit" ? MOUSE.ROTATE : mode === "trackXY" ? MOUSE.PAN : MOUSE.DOLLY,
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.PAN,
        },
        touches: {
            ONE: mode === "orbit" ? TOUCH.ROTATE : TOUCH.PAN,
            TWO: mode === "trackZ" ? TOUCH.DOLLY_PAN : TOUCH.PAN,
        },
    };
}

export function getMockupCameraPosition(
    rotX: number,
    rotY: number,
    distance: number,
    target: [number, number, number],
    baseRadius = 1.5,
): [number, number, number] {
    const camera = normalizeMockupCameraConfig({ target, distance });
    const safeRotX = Number.isFinite(rotX) ? rotX : 0;
    const safeRotY = Number.isFinite(rotY) ? rotY : 0;
    const safeBaseRadius = Number.isFinite(baseRadius) && baseRadius > 0 ? baseRadius : 1.5;
    const [x, y, z] = sphericalCameraPos(safeRotX, safeRotY, safeBaseRadius * camera.distance);
    return [x + camera.target[0], y + camera.target[1], z + camera.target[2]];
}

export function reportMockupCameraChange(
    controls: OrbitControlsType | null,
    baseRadius: number,
    onCameraChange?: (camera: MockupCameraConfig) => void,
    onRotationChange?: (rotX: number, rotY: number) => void,
    configuredFov: number | null = null,
): void {
    if (!controls || !Number.isFinite(baseRadius) || baseRadius <= 0) return;
    const distance = controls.object.position.distanceTo(controls.target) / baseRadius;
    if (!Number.isFinite(distance) || ![controls.target.x, controls.target.y, controls.target.z].every(Number.isFinite)) return;

    onCameraChange?.({
        target: normalizeMockupCameraConfig({ target: [controls.target.x, controls.target.y, controls.target.z] }).target,
        distance: Math.max(0.25, Math.min(4, distance)),
        fov: typeof configuredFov === "number" && Number.isFinite(configuredFov)
            ? Math.max(20, Math.min(80, configuredFov))
            : null,
    });
    onRotationChange?.(
        90 - controls.getPolarAngle() * (180 / Math.PI),
        controls.getAzimuthalAngle() * (180 / Math.PI),
    );
}

interface ViewerControlsOptions {
    defaultEnvironment?: EnvironmentPreset;
    defaultGlow?: number;
}

export const HDRI_FILES: Record<EnvironmentPreset, string> = {
    apartment: "/hdri/lebombo_1k.hdr",
    city: "/hdri/potsdamer_platz_1k.hdr",
    dawn: "/hdri/kiara_1_dawn_1k.hdr",
    forest: "/hdri/forest_slope_1k.hdr",
    lobby: "/hdri/st_fagans_interior_1k.hdr",
    night: "/hdri/dikhololo_night_1k.hdr",
    park: "/hdri/rooitou_park_1k.hdr",
    studio: "/hdri/studio_small_03_1k.hdr",
    sunset: "/hdri/venice_sunset_1k.hdr",
    warehouse: "/hdri/empty_warehouse_01_1k.hdr",
};

export const ENVIRONMENT_OPTIONS = [
  "sunset", "dawn", "night", "warehouse", "forest",
  "apartment", "studio", "city", "park", "lobby",
] as const;

export function sphericalCameraPos(
  rotX: number,
  rotY: number,
  radius = 1.5
): [number, number, number] {
  const DEG = Math.PI / 180;
  const phi = Math.PI / 2 - rotX * DEG;
  const theta = rotY * DEG;
  const x = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.cos(theta);
  return [x, y, z];
}

export interface Viewer3DControls {
    autoRotate: boolean;
    rotationSpeed: number;
    glow: number;
    environment: EnvironmentPreset;
}

export function ViewerControls3D({ defaultEnvironment = "studio", defaultGlow = 1.0 }: ViewerControlsOptions = {}): Viewer3DControls {
  const [controls, set] = useControls("Configuration 3D", () => ({
    autoRotate: false,
    rotationSpeed: { value: 3.5, min: 0.1, max: 10, step: 0.1 },
    glow: { value: defaultGlow, min: 0.0, max: 5.0, step: 0.1 },
    environment: { options: ENVIRONMENT_OPTIONS, value: defaultEnvironment }
  }));
  useEffect(() => {
    set({ environment: defaultEnvironment, glow: defaultGlow });
  }, [defaultEnvironment, defaultGlow, set]);
  return controls as Viewer3DControls;
}