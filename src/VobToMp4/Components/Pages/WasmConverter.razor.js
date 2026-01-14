// WasmConverter page-specific JavaScript module
// Loads FFmpeg.wasm only when this page is accessed

export async function initialize() {
    console.log('🔧 Initializing FFmpeg.wasm for WasmConverter page...');

    if (window.ffmpegInterop && window.FFmpegClass) {
        console.log('✅ FFmpeg.wasm already loaded');
        return true;
    }

    try {
        // ✅ Загружаем UMD библиотеку через <script>
        await loadScript('/lib/ffmpeg/ffmpeg.js');
        console.log('✅ FFmpeg.wasm library loaded');

        // ✅ Ждем, пока глобальный объект инициализируется
        await waitForGlobal('FFmpegWASM', 5000);

        // ✅ Извлекаем FFmpeg из глобального объекта
        const FFmpegModule = window.FFmpegWASM;
        console.log('🔍 FFmpegWASM type:', typeof FFmpegModule);
        console.log('🔍 FFmpegWASM object:', FFmpegModule);

        let FFmpegClass;

        // Вариант 1: FFmpegWASM = { FFmpeg: class, fetchFile: fn }
        if (FFmpegModule && typeof FFmpegModule === 'object' && FFmpegModule.FFmpeg) {
            FFmpegClass = FFmpegModule.FFmpeg;
            console.log('✅ Found FFmpeg in FFmpegWASM.FFmpeg');
        }
        // Вариант 2: FFmpegWASM это сам конструктор
        else if (typeof FFmpegModule === 'function') {
            FFmpegClass = FFmpegModule;
            console.log('✅ FFmpegWASM is the constructor itself');
        }
        // Вариант 3: Асинхронная инициализация через createFFmpeg()
        else if (FFmpegModule && typeof FFmpegModule.createFFmpeg === 'function') {
            FFmpegClass = FFmpegModule.createFFmpeg;
            console.log('✅ Using createFFmpeg() factory');
        }

        if (!FFmpegClass) {
            throw new Error('FFmpeg class not found. Check console output above.');
        }

        // Сохраняем в window для ffmpeg-interop.js
        window.FFmpegClass = FFmpegClass;
        window.fetchFile = FFmpegModule.fetchFile;

        // Загружаем worker
        await loadScript('/lib/ffmpeg/814.ffmpeg.js');
        console.log('✅ FFmpeg worker loaded');

        // Загружаем ffmpeg-interop.js
        await loadScript('/js/ffmpeg-interop.js');
        console.log('✅ FFmpeg interop loaded');

        if (!window.ffmpegInterop) {
            throw new Error('ffmpegInterop not initialized');
        }

        console.log('✅ FFmpeg.wasm initialization complete');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize FFmpeg.wasm:', error);
        return false;
    }
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            console.log(`⏭️ Script already loaded: ${src}`);
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => {
            console.log(`✅ Loaded: ${src}`);
            resolve();
        };
        script.onerror = () => {
            console.error(`❌ Failed to load: ${src}`);
            reject(new Error(`Failed to load script: ${src}`));
        };
        document.head.appendChild(script);
    });
}

function waitForGlobal(globalName, timeout = 5000) {
    return new Promise((resolve, reject) => {
        if (window[globalName]) {
            resolve(window[globalName]);
            return;
        }

        const startTime = Date.now();
        const interval = setInterval(() => {
            if (window[globalName]) {
                clearInterval(interval);
                console.log(`✅ Global ${globalName} became available`);
                resolve(window[globalName]);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(interval);
                reject(new Error(`Timeout waiting for ${globalName}`));
            }
        }, 50);
    });
}

export function checkCompatibility() {
    if (!window.ffmpegInterop) {
        return {
            isCompatible: false,
            issues: ['FFmpeg not loaded']
        };
    }

    return window.ffmpegInterop.checkBrowserCompatibility();
}

export async function loadFFmpeg(dotNetRef) {
    if (!window.ffmpegInterop) {
        throw new Error('FFmpeg not loaded. Call initialize() first.');
    }

    return await window.ffmpegInterop.loadFFmpeg(dotNetRef);
}

export async function convertVideoFromInput(fileInputId, fileIndex, outputFileName, dotNetRef) {
    if (!window.ffmpegInterop) {
        throw new Error('FFmpeg not loaded. Call initialize() first.');
    }

    return await window.ffmpegInterop.convertVideoFromInput(fileInputId, fileIndex, outputFileName, dotNetRef);
}

export function downloadConvertedFile(fileName) {
    if (window.ffmpegInterop) {
        window.ffmpegInterop.downloadConvertedFile(fileName);
    } else {
        console.error('❌ ffmpegInterop not available');
    }
}
