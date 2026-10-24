import { getCameraLayout, normalizeCamera3DConfig, normalizeCameraZoom } from "@/types/camera.types";
import type { CameraConfig } from "@/types/camera.types";
import { drawRoundedRect } from "@/lib/canvas.utils";
import { applyPerspective3D } from "@/lib/perspective3d";

let cameraOverlayCanvas: HTMLCanvasElement | null = null;
const CAMERA_3D_BLEED_FACTOR = 1.5;

export async function drawCameraOverlayToCtx(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    camVideo: HTMLVideoElement | null,
    mainVideo: HTMLVideoElement | null,
    cameraConfig: CameraConfig | null,
) {
    if (!camVideo || !cameraConfig || !cameraConfig.enabled) return;
    if (!camVideo.videoWidth || !camVideo.videoHeight) return;

    if (mainVideo && camVideo.paused) {
        const targetTime = Math.min(mainVideo.currentTime, Math.max(0, camVideo.duration - 0.1));
        if (Math.abs(camVideo.currentTime - targetTime) > 0.05) {
            try {
                camVideo.currentTime = targetTime;
                await new Promise<void>((resolve) => {
                    const timeoutId = setTimeout(() => {
                        camVideo.removeEventListener("seeked", onSeeked);
                        resolve();
                    }, 2000);
                    const onSeeked = () => {
                        camVideo.removeEventListener("seeked", onSeeked);
                        const checkReady = setInterval(() => {
                            if (camVideo.readyState >= 2) {
                                clearInterval(checkReady);
                                clearTimeout(timeoutId);
                                resolve();
                            }
                        }, 10);
                    };
                    camVideo.addEventListener("seeked", onSeeked);
                });
            } catch (e) {
                console.warn("Error en seek de la cámara:", e);
            }
        }
    }

    const { size, left: drawX, top: drawY } = getCameraLayout(cameraConfig, canvasWidth, canvasHeight);
    if (size <= 0) return;

    const shortSide = Math.min(canvasWidth, canvasHeight);
    const sizePercent = cameraConfig.size * 100;
    const sizeMultiplier = 0.5 + (sizePercent - 20) / 40;
    const camera3D = normalizeCamera3DConfig(cameraConfig.threeD);

    const srcShort = Math.min(camVideo.videoWidth, camVideo.videoHeight);
    const sourceCropSize = srcShort / normalizeCameraZoom(cameraConfig.zoom);
    const sx = (camVideo.videoWidth - sourceCropSize) / 2;
    const sy = (camVideo.videoHeight - sourceCropSize) / 2;

    if (camera3D.enabled) {
        if (!cameraOverlayCanvas) cameraOverlayCanvas = document.createElement("canvas");
        const overlayCanvas = cameraOverlayCanvas;
        const overlaySize = Math.max(1, Math.ceil(size));
        const renderSize = Math.ceil(overlaySize * CAMERA_3D_BLEED_FACTOR);
        const bleed = (renderSize - overlaySize) / 2;
        if (overlayCanvas.width !== renderSize || overlayCanvas.height !== renderSize) {
            overlayCanvas.width = renderSize;
            overlayCanvas.height = renderSize;
        }
        const overlayCtx = overlayCanvas.getContext("2d");
        if (!overlayCtx) throw new Error("Unable to create the 3D camera overlay canvas context.");

        overlayCtx.clearRect(0, 0, renderSize, renderSize);
        overlayCtx.save();
        if (cameraConfig.shape === "circle") {
            overlayCtx.beginPath();
            overlayCtx.arc(bleed + overlaySize / 2, bleed + overlaySize / 2, overlaySize / 2, 0, Math.PI * 2);
        } else {
            const radius = cameraConfig.shape === "squircle"
                ? Math.round(65 * sizeMultiplier)
                : Math.round(6 * sizeMultiplier);
            drawRoundedRect(overlayCtx, bleed, bleed, overlaySize, overlaySize, radius);
        }
        overlayCtx.clip();
        if (camVideo.readyState >= 2) {
            if (cameraConfig.mirror) {
                overlayCtx.translate(bleed + overlaySize, bleed);
                overlayCtx.scale(-1, 1);
                overlayCtx.drawImage(camVideo, sx, sy, sourceCropSize, sourceCropSize, 0, 0, overlaySize, overlaySize);
            } else {
                overlayCtx.drawImage(camVideo, sx, sy, sourceCropSize, sourceCropSize, bleed, bleed, overlaySize, overlaySize);
            }
        }
        overlayCtx.restore();

        applyPerspective3D(
            overlayCanvas,
            camera3D.rotationX,
            camera3D.rotationY,
            camera3D.perspective * CAMERA_3D_BLEED_FACTOR,
        );
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
        ctx.shadowBlur = shortSide * 0.02;
        ctx.shadowOffsetY = shortSide * 0.008;
        if (camera3D.rotationX === 0 && camera3D.rotationY === 0) {
            ctx.drawImage(
                overlayCanvas,
                bleed,
                bleed,
                overlaySize,
                overlaySize,
                drawX,
                drawY,
                size,
                size,
            );
        } else {
            ctx.drawImage(overlayCanvas, drawX - bleed, drawY - bleed, renderSize, renderSize);
        }
        ctx.restore();
        return;
    }

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
    ctx.shadowBlur = shortSide * 0.02;
    ctx.shadowOffsetY = shortSide * 0.008;

    if (cameraConfig.shape === "circle") {
        const centerX = drawX + size / 2;
        const centerY = drawY + size / 2;
        const radius = size / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();
    } else {
        const radius = cameraConfig.shape === "squircle"
            ? Math.round(65 * sizeMultiplier)
            : Math.round(6 * sizeMultiplier);
        drawRoundedRect(ctx, drawX, drawY, size, size, radius);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        drawRoundedRect(ctx, drawX, drawY, size, size, radius);
        ctx.clip();
    }

    if (camVideo.readyState >= 2) {
        if (cameraConfig.mirror) {
            ctx.translate(drawX + size, drawY);
            ctx.scale(-1, 1);
            ctx.drawImage(camVideo, sx, sy, sourceCropSize, sourceCropSize, 0, 0, size, size);
        } else {
            ctx.drawImage(camVideo, sx, sy, sourceCropSize, sourceCropSize, drawX, drawY, size, size);
        }
    }
    ctx.restore();
}