import { useControls } from "leva";
import { useEffect } from "react";
import { MOUSE, TOUCH } from "three";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";
import type { PerspectiveCamera, Vector3Tuple } from "three";
import type { ImageDeviceId } from "@/types/mockup.types";

export type EnvironmentPreset = "sunset" | "dawn" | "night" | "warehouse" | "forest" | "apartment" | "studio" | "city" | "park" | "lobby";
export type CameraNavigationMode = "orbit" | "trackXY" | "trackZ";

export interface MockupCameraConfig {
    target: [number, number, number];
    distance: number;
    fov: number | null;
}

export interface MockupCameraPose {
    camera: MockupCameraConfig;
    rotationX: number;
    rotationY: number;
}

export interface MockupCameraKeyframe extends MockupCameraPose {
    id: string;
    time: number;
}

export interface MockupCameraPreset extends MockupCameraPose {
    id: "front" | "threeQuarter" | "top" | "detail";
    icon: string;
}

type MockupCameraTourId = "orbitShowcase" | "pushIn" | "topSweep";

const MOCKUP_CAMERA_TOURS: Array<{
    id: MockupCameraTourId;
    keyframes: Array<Pick<MockupCameraPose, "rotationX" | "rotationY"> & {
        progress: number;
        distance: number;
    }>;
}> = [
    {
        id: "orbitShowcase",
        keyframes: [
            { progress: 0, distance: 1.12, rotationX: 6, rotationY: -42 },
            { progress: 0.34, distance: 0.96, rotationX: 10, rotationY: -14 },
            { progress: 0.68, distance: 0.96, rotationX: 10, rotationY: 16 },
            { progress: 1, distance: 1.12, rotationX: 6, rotationY: 44 },
        ],
    },
    {
        id: "pushIn",
        keyframes: [
            { progress: 0, distance: 1.6, rotationX: 5, rotationY: -24 },
            { progress: 0.38, distance: 1.12, rotationX: 6, rotationY: -10 },
            { progress: 0.72, distance: 0.78, rotationX: 5, rotationY: 9 },
            { progress: 1, distance: 1.08, rotationX: 4, rotationY: 22 },
        ],
    },
    {
        id: "topSweep",
        keyframes: [
            { progress: 0, distance: 1.24, rotationX: 18, rotationY: -32 },
            { progress: 0.36, distance: 1.08, rotationX: 62, rotationY: -15 },
            { progress: 0.7, distance: 1.08, rotationX: 62, rotationY: 18 },
            { progress: 1, distance: 1.24, rotationX: 18, rotationY: 34 },
        ],
    },
];

export const MOCKUP_CAMERA_PRESETS: MockupCameraPreset[] = [
    { id: "front", icon: "mdi:camera", camera: { target: [0, 0, 0], distance: 1, fov: null }, rotationX: 0, rotationY: 0 },
    { id: "threeQuarter", icon: "mdi:camera-metering-center", camera: { target: [0, 0, 0], distance: 1, fov: null }, rotationX: 22, rotationY: 35 },
    { id: "top", icon: "lucide:arrow-up", camera: { target: [0, 0, 0], distance: 1.15, fov: null }, rotationX: 68, rotationY: 0 },
    { id: "detail", icon: "lucide:zoom-in", camera: { target: [0, 0, 0], distance: 0.68, fov: null }, rotationX: 8, rotationY: 18 },
];

const MIN_CAMERA_TOUR_DURATION = 0.8;

function findCameraTourWindow(
    duration: number,
    keyframes: MockupCameraKeyframe[] = [],
): { start: number; end: number } | null {
    if (!Number.isFinite(duration) || duration < MIN_CAMERA_TOUR_DURATION) return null;
    const sortedKeyframes = keyframes
        .filter((keyframe) => Number.isFinite(keyframe.time) && keyframe.time >= 0 && keyframe.time <= duration)
        .sort((a, b) => a.time - b.time);
    const boundaries = [
        { time: 0, isKeyframe: false },
        ...sortedKeyframes.map((keyframe) => ({ time: keyframe.time, isKeyframe: true })),
        { time: duration, isKeyframe: false },
    ];
    const padding = Math.min(0.12, duration / 6);
    let bestWindow: { start: number; end: number } | null = null;

    for (let index = 0; index < boundaries.length - 1; index += 1) {
        const left = boundaries[index];
        const right = boundaries[index + 1];
        const start = left.time + (left.isKeyframe ? padding : 0);
        const end = right.time - (right.isKeyframe ? padding : 0);
        if (end - start < MIN_CAMERA_TOUR_DURATION) continue;
        if (!bestWindow || end - start > bestWindow.end - bestWindow.start) {
            bestWindow = { start, end };
        }
    }

    return bestWindow;
}

export function hasMockupCameraTourSpace(
    duration: number,
    keyframes: MockupCameraKeyframe[] = [],
): boolean {
    return findCameraTourWindow(duration, keyframes) !== null;
}

function createMockupCameraTour(
    tourId: MockupCameraTourId,
    duration: number,
    existingKeyframes: MockupCameraKeyframe[] = [],
): MockupCameraKeyframe[] {
    const window = findCameraTourWindow(duration, existingKeyframes);
    if (!window) return [];
    const tour = MOCKUP_CAMERA_TOURS.find((item) => item.id === tourId);
    if (!tour) return [];
    const createdAt = Date.now();

    return tour.keyframes.map((frame, index) => ({
        id: `camera_tour_${createdAt}_${index}_${Math.random().toString(36).slice(2, 7)}`,
        time: window.start + (window.end - window.start) * frame.progress,
        camera: {
            target: [0, 0, 0],
            distance: frame.distance,
            fov: null,
        },
        rotationX: frame.rotationX,
        rotationY: frame.rotationY,
    }));
}

export function createAutomaticMockupCameraTour(
    device: ImageDeviceId,
    duration: number,
    existingKeyframes: MockupCameraKeyframe[] = [],
): MockupCameraKeyframe[] {
    const tourId: MockupCameraTourId = device === "laptop"
        ? "topSweep"
        : device === "ipad_mini_6_2021"
            ? "pushIn"
            : "orbitShowcase";
    return createMockupCameraTour(tourId, duration, existingKeyframes);
}

export function getAutomaticMockupCameraPreset(device: ImageDeviceId): MockupCameraPreset {
    return device === "laptop"
        ? MOCKUP_CAMERA_PRESETS[2]
        : MOCKUP_CAMERA_PRESETS[1];
}

export const DEFAULT_MOCKUP_CAMERA_FOV: Readonly<Record<ImageDeviceId, number>> = {
    phone: 40,
    iphone: 40,
    "iphone-13-pro-max": 40,
    "iphone-17-pro-max": 40,
    "iphone-duo": 30,
    double_iphone_13_pro: 40,
    ipad_mini_6_2021: 40,
    laptop: 40,
};

export const DEFAULT_MOCKUP_CAMERA: MockupCameraConfig = {
    target: [0, 0, 0],
    distance: 1,
    fov: null,
};

export function sampleMockupCameraKeyframes(
    keyframes: MockupCameraKeyframe[],
    time: number,
    defaultFov = 40,
): MockupCameraPose | null {
    const sorted = keyframes
        .filter((keyframe) => Number.isFinite(keyframe.time))
        .sort((a, b) => a.time - b.time);
    if (sorted.length === 0 || !Number.isFinite(time)) return null;
    if (time <= sorted[0].time) return poseFromKeyframe(sorted[0]);
    const last = sorted[sorted.length - 1];
    if (time >= last.time) return poseFromKeyframe(last);

    const nextIndex = sorted.findIndex((keyframe) => keyframe.time >= time);
    const from = sorted[nextIndex - 1];
    const to = sorted[nextIndex];
    if (time === to.time) return poseFromKeyframe(to);

    const duration = to.time - from.time;
    if (duration <= 0) return poseFromKeyframe(to);
    const linearProgress = Math.max(0, Math.min(1, (time - from.time) / duration));
    const progress = linearProgress * linearProgress * (3 - 2 * linearProgress);
    const fromPose = poseFromKeyframe(from);
    const toPose = poseFromKeyframe(to);
    const fromFov = fromPose.camera.fov ?? defaultFov;
    const toFov = toPose.camera.fov ?? defaultFov;
    const fov = fromPose.camera.fov === null && toPose.camera.fov === null
        ? null
        : fromFov + (toFov - fromFov) * progress;

    return {
        camera: {
            target: [
                lerp(fromPose.camera.target[0], toPose.camera.target[0], progress),
                lerp(fromPose.camera.target[1], toPose.camera.target[1], progress),
                lerp(fromPose.camera.target[2], toPose.camera.target[2], progress),
            ],
            distance: lerp(fromPose.camera.distance, toPose.camera.distance, progress),
            fov,
        },
        rotationX: lerp(fromPose.rotationX, toPose.rotationX, progress),
        rotationY: lerpAngle(fromPose.rotationY, toPose.rotationY, progress),
    };
}

function poseFromKeyframe(keyframe: MockupCameraKeyframe): MockupCameraPose {
    return {
        camera: normalizeMockupCameraConfig(keyframe.camera),
        rotationX: Number.isFinite(keyframe.rotationX) ? keyframe.rotationX : 0,
        rotationY: Number.isFinite(keyframe.rotationY) ? keyframe.rotationY : 0,
    };
}

function lerp(from: number, to: number, progress: number): number {
    return from + (to - from) * progress;
}

function lerpAngle(from: number, to: number, progress: number): number {
    const difference = ((to - from + 540) % 360) - 180;
    return from + difference * progress;
}

export function applyMockupCameraPoseForRender(
    camera: PerspectiveCamera,
    pose: MockupCameraPose,
    device: ImageDeviceId,
    zoom: number,
): () => void {
    const position: Vector3Tuple = getMockupCameraPosition(
        pose.rotationX,
        pose.rotationY,
        pose.camera.distance / (device === "laptop" || device === "iphone-duo" ? Math.max(zoom, 0.001) : 1),
        pose.camera.target,
        device === "laptop" ? 90 : device === "iphone-duo" ? 1.7 : 1.5,
    );
    const previousPosition = camera.position.clone();
    const previousQuaternion = camera.quaternion.clone();
    const previousFov = camera.fov;

    camera.position.set(...position);
    camera.lookAt(...pose.camera.target);
    camera.fov = pose.camera.fov ?? DEFAULT_MOCKUP_CAMERA_FOV[device];
    camera.updateProjectionMatrix();

    return () => {
        camera.position.copy(previousPosition);
        camera.quaternion.copy(previousQuaternion);
        camera.fov = previousFov;
        camera.updateProjectionMatrix();
    };
}

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