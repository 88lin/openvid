import type { MutableRefObject } from "react";
import { drawMaskedImage } from "@/lib/masked-image-draw.utils";
import { PHONE_H, PHONE_W, DEVICE_3D_DIMENSIONS, type ImageMaskConfigLike } from "@/lib/phone3d.utils";

export interface Phone3DApi {
  renderAt: (w: number, h: number) => void;
  restorePreview: () => void;
  hasBuiltInShadow?: boolean;
  getVisualSize?: () => { width: number; height: number; offsetY?: number } | null;
}

export interface Phone3DCompositeContext {
  imagePhoneCanvasRef: MutableRefObject<HTMLCanvasElement | null>;
  imagePhoneApiRef: MutableRefObject<Phone3DApi | null>;
  canvasDimensions: { width: number; height: number } | null;
  imagePhoneDevice: string;
  imagePhoneScale: number;
  imagePhoneX: number;
  imagePhoneY: number;
  imagePhoneShadow: number;
  imagePhoneShadowColor: string;
  effectivePhoneMaskConfig: ImageMaskConfigLike | null | undefined;
  maskCompositeCanvasRef: MutableRefObject<HTMLCanvasElement | null>;
}

export function drawPhone3DCompositeWithZoom(
  c: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  _frameTime: number,
  zs: { scale: number; focusX: number; focusY: number },
  highQuality: boolean,
  pivotX: number,
  pivotY: number,
  ctx2: Phone3DCompositeContext,
): void {
  const {
    imagePhoneCanvasRef, imagePhoneApiRef, canvasDimensions, imagePhoneDevice,
    imagePhoneScale, imagePhoneX, imagePhoneY, imagePhoneShadow, imagePhoneShadowColor,
    effectivePhoneMaskConfig, maskCompositeCanvasRef,
  } = ctx2;

  const phoneGL = imagePhoneCanvasRef.current!;
  const domW = canvasDimensions?.width ?? canvasWidth;
  const pxScale = canvasWidth / domW;
  const zScale = zs.scale;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const measuredDims = imagePhoneApiRef.current?.getVisualSize?.();
  const deviceDims = measuredDims ?? DEVICE_3D_DIMENSIONS[imagePhoneDevice] ?? { width: PHONE_W, height: PHONE_H };
  const visualOffsetY = (measuredDims?.offsetY ?? 0) * imagePhoneScale * pxScale;
  const baseCx = centerX + imagePhoneX * pxScale;
  const baseCy = centerY + imagePhoneY * pxScale + visualOffsetY;
  const baseW = deviceDims.width * imagePhoneScale * pxScale;
  const baseH = deviceDims.height * imagePhoneScale * pxScale;

  if (highQuality) {
    imagePhoneApiRef.current?.renderAt(baseW, baseH);
  }

  c.save();
  if (zScale !== 1) {
    c.translate(pivotX, pivotY);
    c.scale(zScale, zScale);
    c.translate(-pivotX, -pivotY);
  }

  const hasBuiltInShadow = imagePhoneApiRef.current?.hasBuiltInShadow ?? false;
  if (imagePhoneShadow > 0.01 && !hasBuiltInShadow) {
    const sT = imagePhoneShadow * imagePhoneShadow;
    const sBlur = sT * 60;
    const sOpacity = sT * 0.7;
    c.save();
    c.globalAlpha = sOpacity;
    c.filter = `blur(${Math.max(2, sBlur * 0.6) * pxScale}px)`;
    c.beginPath();
    c.ellipse(
      baseCx,
      baseCy + baseH / 2 + sBlur * 0.2 * pxScale,
      baseW * (0.6 - sT * 0.1) / 2,
      Math.max(4, sBlur * 0.55) * pxScale / 2,
      0, 0, Math.PI * 2
    );
    c.fillStyle = imagePhoneShadowColor;
    c.fill();
    c.restore();
  }

  if (imagePhoneShadow > 0.01) {
    c.shadowColor = imagePhoneShadowColor;
    c.shadowBlur = 28 * imagePhoneShadow * pxScale;
    c.shadowOffsetX = 0;
    c.shadowOffsetY = 18 * imagePhoneShadow * pxScale;
  }

  drawMaskedImage(c, phoneGL, baseCx - baseW / 2, baseCy - baseH / 2, baseW, baseH, effectivePhoneMaskConfig, maskCompositeCanvasRef);

  if (imagePhoneShadow > 0.01) {
    c.shadowColor = "transparent";
    c.shadowBlur = 0;
    c.shadowOffsetY = 0;
  }

  c.restore();

  if (highQuality) {
    imagePhoneApiRef.current?.restorePreview();
  }
}