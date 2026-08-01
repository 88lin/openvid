"use client";
import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { IPhone13ProMax3DApi, IPhone13ProMaxScene } from "./IPhone13ProMax3DViewer";
import { DoubleIPhone3DApi, DoubleIPhoneScene } from "./DoubleIPhone3DViewer";
import { Phone3DApi, Phone3DScene } from "./Phone3DViewer";
import { Laptop3DApi, LaptopScene } from "./Laptop3DViewer";
import { IPhone17ProMax3DApi, IPhone17ProMaxScene } from "./IPhone17ProMax3DViewer";
import { IPadMini63DApi, IPadMiniScene } from "./IPadMini63DViewer";
import { PHONE_W, PHONE_H, ImageMaskConfigLike } from "@/lib/phone3d.utils";
import type { ImageDeviceId } from "@/types/mockup.types";
import { EnvironmentPreset } from "@/lib/viewer-controls3d";

export type Mockup3DApi =
  | IPhone13ProMax3DApi
  | DoubleIPhone3DApi
  | Phone3DApi
  | Laptop3DApi
  | IPhone17ProMax3DApi
  | IPadMini63DApi;

export interface Mockup3DStageProps {
  imageUrl?: string | null;
  imageMaskConfig?: ImageMaskConfigLike | null;
  cropArea?: { x: number; y: number; width: number; height: number } | null;
  initialRotationX?: number;
  initialRotationY?: number;
  initialRotationZ?: number;
  openingProgress?: number;   // solo laptop
  modelUrl?: string;          // solo devices genéricos (phone/iphone)
  onRotationChange?: (rx: number, ry: number) => void;
  onMount?: (canvas: HTMLCanvasElement) => void;
  onApi?: (api: Mockup3DApi | null) => void;
  scale?: number;
  zoom?: number;
  shadowIntensity?: number;
  shadowColor?: string;
  videoElement?: HTMLVideoElement | null;
  autoRotate?: boolean;
  rotationSpeed?: number;
  glow?: number;
  environment?: EnvironmentPreset;
  isSelected?: boolean;
  isHovered?: boolean;
  onHoverChange?: (isHovered: boolean) => void;
  onSelectChange?: (isSelected: boolean) => void;
}

interface StageProps extends Mockup3DStageProps {
  device: ImageDeviceId;
  rootRef?: React.MutableRefObject<THREE.Group | null>;
  cameraRef?: React.MutableRefObject<THREE.PerspectiveCamera | null>;
  onLoadedChange?: (loaded: boolean) => void;
}

export function Mockup3DStage({ device, rootRef: externalRootRef, cameraRef: externalCameraRef, onLoadedChange, ...props }: StageProps) {
  const internalRootRef = useRef<THREE.Group | null>(null);
  const internalCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rootRef = externalRootRef ?? internalRootRef;
  const cameraRef = externalCameraRef ?? internalCameraRef;
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [prevDevice, setPrevDevice] = useState(device);
  if (device !== prevDevice) {
    setPrevDevice(device);
    setLoaded(false);
    onLoadedChange?.(false);
  }

  const markLoaded = () => {
    setLoaded(true);
    onLoadedChange?.(true);
  };

  const handleMount = (canvas: HTMLCanvasElement) => {
    canvasElRef.current = canvas;
    props.onMount?.(canvas);
  };

  return (
    <>
      <Canvas
        style={{ width: "100%", height: "100%", overflow: "visible" }}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={3}
        frameloop={props.videoElement ? "always" : "demand"}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
        onCreated={({ gl, scene }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.NeutralToneMapping;
          gl.toneMappingExposure = 1.0;
          scene.environmentIntensity = 1.6;
          handleMount(gl.domElement);
        }}
      >
        <Suspense fallback={null}>
          {device === "iphone-13-pro-max" && (
            <IPhone13ProMaxScene {...props} rootRef={rootRef} cameraRef={cameraRef} onLoaded={markLoaded} />
          )}
          {device === "double_iphone_13_pro" && (
            <DoubleIPhoneScene {...props} rootRef={rootRef} cameraRef={cameraRef} onLoaded={markLoaded} />
          )}
          {device === "iphone-17-pro-max" && (
            <IPhone17ProMaxScene {...props} rootRef={rootRef} cameraRef={cameraRef} onLoaded={markLoaded} />
          )}
          {device === "laptop" && (
            <LaptopScene {...props} rootRef={rootRef} cameraRef={cameraRef} onLoaded={markLoaded} />
          )}
          {device === "ipad_mini_6_2021" && (
            <IPadMiniScene {...props} rootRef={rootRef} cameraRef={cameraRef} onLoaded={markLoaded} />
          )}
          {(device === "iphone" || device === "phone") && (
            <Phone3DScene {...props} rootRef={rootRef} cameraRef={cameraRef} onLoaded={markLoaded} />
          )}
        </Suspense>
      </Canvas>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 4 }}>
          <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      )}
    </>
  );
}