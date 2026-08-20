type EncodableImage = ImageData;

let jpegEncodeReady: Promise<typeof import("@jsquash/jpeg")["encode"]> | null = null;
function getJpegEncode() {
    if (!jpegEncodeReady) {
        jpegEncodeReady = import("@jsquash/jpeg").then((m) => m.encode);
    }
    return jpegEncodeReady;
}

export async function encodeJpeg(image: EncodableImage, quality: number): Promise<Blob> {
    const encode = await getJpegEncode();
    const buffer = await encode(image, { quality: Math.round(quality * 100) });
    return new Blob([buffer], { type: "image/jpeg" });
}

let pngEncodeReady: Promise<typeof import("@jsquash/png")["encode"]> | null = null;
function getPngEncode() {
    if (!pngEncodeReady) {
        pngEncodeReady = import("@jsquash/png").then((m) => m.encode);
    }
    return pngEncodeReady;
}

export async function encodePng(image: EncodableImage): Promise<Blob> {
    const encode = await getPngEncode();
    const buffer = await encode(image);
    return new Blob([buffer], { type: "image/png" });
}

let webpEncodeReady: Promise<typeof import("@jsquash/webp")["encode"]> | null = null;
function getWebpEncode() {
    if (!webpEncodeReady) {
        webpEncodeReady = import("@jsquash/webp").then((m) => m.encode);
    }
    return webpEncodeReady;
}

export async function encodeWebp(image: EncodableImage, quality: number): Promise<Blob> {
    const encode = await getWebpEncode();
    const buffer = await encode(image, { quality: Math.round(quality * 100) });
    return new Blob([buffer], { type: "image/webp" });
}

let avifEncodeReady: Promise<typeof import("@jsquash/avif")["encode"]> | null = null;
function getAvifEncode() {
    if (!avifEncodeReady) {
        avifEncodeReady = import("@jsquash/avif").then((m) => m.encode);
    }
    return avifEncodeReady;
}

export async function encodeAvif(image: EncodableImage, quality: number): Promise<Blob> {
    const encode = await getAvifEncode();
    const buffer = await encode(image, { quality: Math.round(quality * 100) });
    return new Blob([buffer], { type: "image/avif" });
}