// FFmpeg.wasm Interop Layer
// Handles loading FFmpeg from CDN and conversion operations

let ffmpeg = null;
let isFFmpegLoaded = false;

// Load FFmpeg from CDN
async function loadFFmpeg(progressCallback) {
    if (isFFmpegLoaded) {
        return true;
    }

    try {
        // Wait for FFmpegWASM to be available
        if (typeof FFmpegWASM === 'undefined') {
            throw new Error('FFmpegWASM library not loaded. Make sure the script tag is included.');
        }
        
        // Create FFmpeg instance from global FFmpegWASM
        const { FFmpeg } = FFmpegWASM;
        ffmpeg = new FFmpeg();
        
        // Set up logging
        ffmpeg.on('log', ({ message }) => {
            console.log('[FFmpeg]', message);
        });
        
        // Set up progress tracking
        ffmpeg.on('progress', ({ progress, time }) => {
            if (progressCallback) {
                progressCallback(Math.round(progress * 100), time);
            }
        });
        
        // Load multi-threaded core from local files
        const baseURL = window.location.origin;
        await ffmpeg.load({
            coreURL: `${baseURL}/lib/ffmpeg/ffmpeg-core.js`,
            wasmURL: `${baseURL}/lib/ffmpeg/ffmpeg-core.wasm`
        });
        
        isFFmpegLoaded = true;
        console.log('✅ FFmpeg.wasm loaded successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to load FFmpeg.wasm:', error);
        throw new Error(`Failed to load FFmpeg.wasm: ${error.message}`);
    }
}

// Check browser compatibility
function checkBrowserCompatibility() {
    const compatibility = {
        isCompatible: true,
        issues: []
    };
    
    // Check WebAssembly support
    if (typeof WebAssembly === 'undefined') {
        compatibility.isCompatible = false;
        compatibility.issues.push('WebAssembly is not supported');
    }
    
    // Check SharedArrayBuffer support (required for multi-threaded version)
    if (typeof SharedArrayBuffer === 'undefined') {
        compatibility.isCompatible = false;
        compatibility.issues.push('SharedArrayBuffer is not supported (COOP/COEP headers may be missing)');
    }
    
    // Check if cross-origin isolated
    if (!window.crossOriginIsolated) {
        compatibility.isCompatible = false;
        compatibility.issues.push('Browser is not cross-origin isolated (check COOP/COEP headers)');
    }
    
    return compatibility;
}

// Convert video file
async function convertVideo(inputFileName, inputFileData, outputFileName, progressCallback) {
    if (!isFFmpegLoaded) {
        throw new Error('FFmpeg is not loaded. Call loadFFmpeg() first.');
    }
    
    try {
        // Write input file to FFmpeg virtual filesystem
        await ffmpeg.writeFile(inputFileName, new Uint8Array(inputFileData));
        
        // Run FFmpeg conversion (VOB to MP4)
        // -i: input file
        // -c:v libx264: use H.264 video codec
        // -c:a aac: use AAC audio codec
        // -strict experimental: allow experimental codecs
        await ffmpeg.exec([
            '-i', inputFileName,
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-strict', 'experimental',
            outputFileName
        ]);
        
        // Read output file from virtual filesystem
        const data = await ffmpeg.readFile(outputFileName);
        
        // Clean up input file from memory
        await ffmpeg.deleteFile(inputFileName);
        await ffmpeg.deleteFile(outputFileName);
        
        return data.buffer;
    } catch (error) {
        console.error('❌ Conversion failed:', error);
        throw new Error(`Conversion failed: ${error.message}`);
    }
}

// Cleanup memory
async function cleanup() {
    if (ffmpeg) {
        try {
            // FFmpeg.wasm doesn't have explicit cleanup,
            // but we can help garbage collection
            ffmpeg = null;
            isFFmpegLoaded = false;
            console.log('✅ FFmpeg cleanup completed');
        } catch (error) {
            console.error('❌ Cleanup failed:', error);
        }
    }
}

// Export functions for Blazor interop
window.ffmpegInterop = {
    loadFFmpeg,
    checkBrowserCompatibility,
    convertVideo,
    cleanup
};

// Helper function to download file
window.downloadFile = function(fileName, byteArray) {
    const blob = new Blob([byteArray], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

