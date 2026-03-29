export interface AudioTrack {
    id: string;
    audioId: string; // Reference to uploaded audio file
    name: string;
    startTime: number; // Start position in video timeline (seconds)
    duration: number; // Duration of the audio clip (seconds)
    volume: number; // 0 to 1
    loop: boolean; // Whether to loop if audio is shorter than video
    trimStart?: number;  // ← ¿existe este campo?
}

/**
 * Uploaded Audio File
 * Represents an audio file available in the library
 */
export interface UploadedAudio {
    id: string;
    name: string;
    url: string; // Blob URL or uploaded URL
    duration: number;
    fileSize: number; // In bytes
    mimeType: string; // e.g., "audio/mp3", "audio/wav"
}

export interface AudioConfig {
    muteOriginalAudio: boolean;
    tracks: AudioTrack[];
    masterVolume: number;
}

export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
    muteOriginalAudio: false,
    tracks: [],
    masterVolume: 1,
};

export const SUPPORTED_AUDIO_FORMATS = [
    'audio/mpeg', // MP3
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/ogg',
    'audio/aac',
    'audio/m4a',
    'audio/x-m4a',
] as const;

export const SUPPORTED_AUDIO_EXTENSIONS = [
    '.mp3',
    '.wav',
    '.ogg',
    '.aac',
    '.m4a',
] as const;

export const MAX_AUDIO_FILE_SIZE = 50 * 1024 * 1024;

export const MAX_AUDIO_TRACKS = 5;
