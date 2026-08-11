import { ImageSource } from '@nativescript/core';

/**
 * Configuration for image compression.
 */
export interface ImageCompressionOptions {
    /** Maximum file size in bytes. Default: 524288 (512 KB). */
    maxSizeBytes?: number;

    /** Maximum width/height in pixels. Image is scaled down preserving aspect ratio. Default: 1024. */
    maxDimension?: number;

    /** Initial JPEG quality (0–100). Default: 85. */
    initialQuality?: number;

    /** Minimum JPEG quality before giving up. Default: 20. */
    minQuality?: number;

    /** Quality reduction step per compression iteration. Default: 10. */
    qualityStep?: number;

    /** Output format. Default: 'jpg'. */
    outputFormat?: 'jpg' | 'png';
}

/**
 * Result returned by the compression utility.
 */
export interface CompressionResult {
    /** Base64-encoded image string (without data URI prefix). */
    base64: string;

    /** Approximate size of the base64 payload in bytes. */
    sizeBytes: number;

    /** MIME type of the output image. */
    mimeType: string;

    /** File extension for the output image. */
    extension: string;

    /** The JPEG quality that was used (only relevant for JPG output). */
    qualityUsed: number;

    /** Width of the final image. */
    width: number;

    /** Height of the final image. */
    height: number;
}

/** Allowed image file extensions for upload. */
const ALLOWED_EXTENSIONS: string[] = ['jpg', 'jpeg', 'jfif', 'jpe', 'png', 'ico', 'svg'];

/** Default max file size: 512 KB */
const DEFAULT_MAX_SIZE_BYTES = 512 * 1024;

/**
 * Utility class for image validation, resizing, and compression.
 *
 * Usage:
 * ```
 * const result = await ImageCompressionUtil.compressFromAsset(imageAsset);
 * if (result) {
 *   const payload = {
 *     fileName: Date.now() + '.' + result.extension,
 *     image: `data:${result.mimeType};base64,${result.base64}`,
 *     path: 'profile/' + userId
 *   };
 * }
 * ```
 */
export class ImageCompressionUtil {

    /**
     * Check whether a filename has an allowed image extension.
     * @param fileName - The file name or path to validate.
     * @returns true if the extension is allowed.
     */
    static isAllowedType(fileName: string): boolean {
        if (!fileName) return false;
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        return ALLOWED_EXTENSIONS.includes(ext);
    }

    /**
     * Returns the list of allowed extensions.
     */
    static getAllowedExtensions(): string[] {
        return [...ALLOWED_EXTENSIONS];
    }

    /**
     * Estimates the byte size of a base64 string.
     */
    static estimateBase64Size(base64: string): number {
        if (!base64) return 0;
        // Base64 encodes 3 bytes into 4 chars; padding is negligible
        return Math.ceil((base64.length * 3) / 4);
    }

    /**
     * Compress an ImageSource to fit within the specified constraints.
     *
     * Strategy:
     * 1. Resize the image if it exceeds maxDimension (preserving aspect ratio).
     * 2. Encode as JPEG at the initial quality.
     * 3. If the result exceeds maxSizeBytes, progressively lower quality and retry.
     * 4. If minQuality is reached and still too large, halve dimensions and restart.
     *
     * @param source - The ImageSource to compress.
     * @param options - Compression options.
     * @returns CompressionResult or null if compression fails.
     */
    static compress(source: ImageSource, options?: ImageCompressionOptions): CompressionResult | null {
        if (!source) return null;

        const maxSize = options?.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;
        const maxDim = options?.maxDimension ?? 1024;
        const initialQuality = options?.initialQuality ?? 85;
        const minQuality = options?.minQuality ?? 20;
        const qualityStep = options?.qualityStep ?? 10;
        const outputFormat = options?.outputFormat ?? 'jpg';

        let currentSource = source;

        // --- Step 1: Resize if larger than maxDimension ---
        currentSource = ImageCompressionUtil.resizeIfNeeded(currentSource, maxDim);

        // --- Step 2: For PNG output, encode once (no quality parameter) ---
        if (outputFormat === 'png') {
            const base64 = currentSource.toBase64String('png');
            const sizeBytes = ImageCompressionUtil.estimateBase64Size(base64);
            return {
                base64,
                sizeBytes,
                mimeType: 'image/png',
                extension: 'png',
                qualityUsed: 100,
                width: currentSource.width,
                height: currentSource.height,
            };
        }

        // --- Step 3: JPEG progressive compression ---
        let quality = initialQuality;
        let base64 = currentSource.toBase64String('jpg', quality);
        let sizeBytes = ImageCompressionUtil.estimateBase64Size(base64);

        // If already under limit, return immediately
        if (sizeBytes <= maxSize) {
            return ImageCompressionUtil.buildResult(base64, sizeBytes, quality, currentSource);
        }

        // Lower quality progressively
        while (quality > minQuality && sizeBytes > maxSize) {
            quality -= qualityStep;
            if (quality < minQuality) quality = minQuality;
            base64 = currentSource.toBase64String('jpg', quality);
            sizeBytes = ImageCompressionUtil.estimateBase64Size(base64);
        }

        if (sizeBytes <= maxSize) {
            return ImageCompressionUtil.buildResult(base64, sizeBytes, quality, currentSource);
        }

        // --- Step 4: Still too large — reduce dimensions and retry ---
        const halfDim = Math.max(Math.floor(maxDim / 2), 200);
        currentSource = ImageCompressionUtil.resizeIfNeeded(currentSource, halfDim);

        quality = initialQuality;
        base64 = currentSource.toBase64String('jpg', quality);
        sizeBytes = ImageCompressionUtil.estimateBase64Size(base64);

        while (quality > minQuality && sizeBytes > maxSize) {
            quality -= qualityStep;
            if (quality < minQuality) quality = minQuality;
            base64 = currentSource.toBase64String('jpg', quality);
            sizeBytes = ImageCompressionUtil.estimateBase64Size(base64);
        }

        return ImageCompressionUtil.buildResult(base64, sizeBytes, quality, currentSource);
    }

    /**
     * Convenience method: compress from an ImageAsset (e.g. from the image picker).
     *
     * @param asset - The ImageAsset from the picker.
     * @param options - Compression options.
     * @returns Promise resolving to CompressionResult or null.
     */
    static async compressFromAsset(asset: any, options?: ImageCompressionOptions): Promise<CompressionResult | null> {
        if (!asset) return null;
        try {
            const source = await ImageSource.fromAsset(asset);
            return ImageCompressionUtil.compress(source, options);
        } catch (err) {
            console.error('ImageCompressionUtil: Failed to load image from asset', err);
            return null;
        }
    }

    /**
     * Format a byte count as a human-readable string (e.g. "412 KB").
     */
    static formatSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // ---------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------

    private static resizeIfNeeded(source: ImageSource, maxDim: number): ImageSource {
        const w = source.width;
        const h = source.height;

        if (w <= maxDim && h <= maxDim) {
            return source;
        }

        let newW: number;
        let newH: number;

        if (w >= h) {
            newW = maxDim;
            newH = Math.round((h / w) * maxDim);
        } else {
            newH = maxDim;
            newW = Math.round((w / h) * maxDim);
        }

        // NativeScript ImageSource.resize is available on iOS/Android
        const resized = source.resize(newW, newH);
        return resized || source;
    }

    private static buildResult(
        base64: string,
        sizeBytes: number,
        quality: number,
        source: ImageSource,
    ): CompressionResult {
        return {
            base64,
            sizeBytes,
            mimeType: 'image/jpeg',
            extension: 'jpg',
            qualityUsed: quality,
            width: source.width,
            height: source.height,
        };
    }
}
