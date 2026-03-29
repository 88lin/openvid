import { env } from "@/app/config/env";

export interface UnifiedPhoto {
    id: string;
    urls: {
        regular: string;
        small: string;
    };
    alt: string;
    photographer: string;
    color: string;
    width: number;
    height: number;
}

export type PhotoProvider = "unsplash" | "pexels" | "pixabay";

let providerIndex = 0;
const providers: PhotoProvider[] = ["unsplash", "pexels", "pixabay"];

function getNextProvider(): PhotoProvider {
    const provider = providers[providerIndex];
    providerIndex = (providerIndex + 1) % providers.length;
    return provider;
}

interface UnsplashPhoto {
    id: string;
    urls: { regular: string; small: string };
    alt_description: string | null;
    user: { name: string };
    color: string;
    width: number;
    height: number;
}

async function fetchUnsplash(query: string, page = 1, perPage = 20): Promise<UnifiedPhoto[]> {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`;
    try {
        const res = await fetch(url, {
            headers: { Authorization: `Client-ID ${env.unsplash.accessKey}` },
        });
        if (!res.ok) return [];
        const data = await res.json();
        const results: UnsplashPhoto[] = data.results ?? [];
        return results.map((photo) => ({
            id: `unsplash-${photo.id}`,
            urls: {
                regular: photo.urls.regular,
                small: photo.urls.small,
            },
            alt: photo.alt_description ?? "",
            photographer: photo.user.name,
            color: photo.color,
            width: photo.width,
            height: photo.height,
        }));
    } catch {
        return [];
    }
}

interface PexelsPhoto {
    id: number;
    width: number;
    height: number;
    photographer: string;
    avg_color: string;
    src: {
        large: string;
        medium: string;
    };
    alt: string;
}

async function fetchPexels(query: string, page = 1, perPage = 20): Promise<UnifiedPhoto[]> {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`;
    try {
        const res = await fetch(url, {
            headers: { Authorization: env.pexels.apiKey },
        });
        if (!res.ok) return [];
        const data = await res.json();
        const results: PexelsPhoto[] = data.photos ?? [];
        return results.map((photo) => ({
            id: `pexels-${photo.id}`,
            urls: {
                regular: photo.src.large,
                small: photo.src.medium,
            },
            alt: photo.alt || "",
            photographer: photo.photographer,
            color: photo.avg_color,
            width: photo.width,
            height: photo.height,
        }));
    } catch {
        return [];
    }
}

interface PixabayPhoto {
    id: number;
    imageWidth: number;
    imageHeight: number;
    user: string;
    tags: string;
    webformatURL: string;
    largeImageURL: string;
}

async function fetchPixabay(query: string, page = 1, perPage = 20): Promise<UnifiedPhoto[]> {
    const url = `https://pixabay.com/api/?key=${env.pixabay.apiKey}&q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=horizontal&image_type=photo`;
    try {
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        const results: PixabayPhoto[] = data.hits ?? [];
        return results.map((photo) => ({
            id: `pixabay-${photo.id}`,
            urls: {
                regular: photo.largeImageURL,
                small: photo.webformatURL,
            },
            alt: photo.tags,
            photographer: photo.user,
            color: "#1a1a1a",
            width: photo.imageWidth,
            height: photo.imageHeight,
        }));
    } catch {
        return [];
    }
}

// Discovery mode - curated/random photos
async function fetchUnsplashCurated(page = 1, perPage = 20): Promise<UnifiedPhoto[]> {
    const queries = [
        "blur gradient", "mesh gradient", "dark minimal wallpaper", "neon city night",
        "abstract wave dark", "geometric dark background",
        "deep space stars",
        "aurora sky", "minimal texture dark",
    ];
    const query = queries[Math.floor(Math.random() * queries.length)];
    return fetchUnsplash(query, page, perPage);
}

async function fetchPexelsCurated(page = 1, perPage = 20): Promise<UnifiedPhoto[]> {
    const url = `https://api.pexels.com/v1/curated?page=${page}&per_page=${perPage}`;
    try {
        const res = await fetch(url, {
            headers: { Authorization: env.pexels.apiKey },
        });
        if (!res.ok) return [];
        const data = await res.json();
        const results: PexelsPhoto[] = data.photos ?? [];
        return results
            .filter((photo) => photo.width >= photo.height)
            .map((photo) => ({
                id: `pexels-${photo.id}`,
                urls: {
                    regular: photo.src.large,
                    small: photo.src.medium,
                },
                alt: photo.alt || "",
                photographer: photo.photographer,
                color: photo.avg_color,
                width: photo.width,
                height: photo.height,
            }));
    } catch {
        return [];
    }
}

async function fetchPixabayCurated(page = 1, perPage = 20): Promise<UnifiedPhoto[]> {
    const queries = ["blur gradient", "dark minimal", "city dark", "blurred", "night sky", "minimalist background", "wallpaper sky"];
    const query = queries[Math.floor(Math.random() * queries.length)];
    return fetchPixabay(query, page, perPage);
}

const discoveryCache: { photos: UnifiedPhoto[]; timestamp: number } = {
    photos: [],
    timestamp: 0,
};
const DISCOVERY_TTL = 5 * 60 * 1000;

export async function fetchPhotos(
    query: string,
    page = 1,
    perPage = 20
): Promise<UnifiedPhoto[]> {
    const provider = getNextProvider();
    
    switch (provider) {
        case "unsplash":
            return fetchUnsplash(query, page, perPage);
        case "pexels":
            return fetchPexels(query, page, perPage);
        case "pixabay":
            return fetchPixabay(query, page, perPage);
        default:
            return [];
    }
}

export async function fetchDiscoveryPhotos(): Promise<UnifiedPhoto[]> {
    if (
        discoveryCache.photos.length > 0 &&
        Date.now() - discoveryCache.timestamp < DISCOVERY_TTL
    ) {
        return [...discoveryCache.photos].sort(() => Math.random() - 0.5);
    }

    const [unsplashPhotos, pexelsPhotos, pixabayPhotos] = await Promise.all([
        fetchUnsplashCurated(1, 7).catch(() => []),
        fetchPexelsCurated(1, 7).catch(() => []),
        fetchPixabayCurated(1, 6).catch(() => []),
    ]);

    const allPhotos = [...unsplashPhotos, ...pexelsPhotos, ...pixabayPhotos];
    const shuffled = allPhotos.sort(() => Math.random() - 0.5);

    discoveryCache.photos = shuffled;
    discoveryCache.timestamp = Date.now();

    return shuffled;
}

const searchCache = new Map<string, { photos: UnifiedPhoto[]; timestamp: number }>();
const SEARCH_TTL = 10 * 60 * 1000;

export async function fetchPhotosWithCache(
    query: string,
    page = 1,
    perPage = 20
): Promise<UnifiedPhoto[]> {
    const cacheKey = `${query}::${page}::${perPage}`;
    const cached = searchCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < SEARCH_TTL) {
        return cached.photos;
    }

    const photos = await fetchPhotos(query, page, perPage);
    searchCache.set(cacheKey, { photos, timestamp: Date.now() });

    return photos;
}
