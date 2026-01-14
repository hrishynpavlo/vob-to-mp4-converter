// FFmpeg.wasm Interop Layer
// Handles FFmpeg initialization and conversion operations

window.ffmpegInterop = {
    ffmpeg: null,

    checkBrowserCompatibility() {
        const compatibility = {
            isCompatible: true,
            issues: []
        };
        
        // Check WebAssembly support
        if (typeof WebAssembly === 'undefined') {
            compatibility.isCompatible = false;
            compatibility.issues.push('WebAssembly is not supported');
        }
        
        // Check SharedArrayBuffer support
        if (typeof SharedArrayBuffer === 'undefined') {
            compatibility.isCompatible = false;
            compatibility.issues.push('SharedArrayBuffer is not supported (COOP/COEP headers may be missing)');
        }
        
        // Check if cross-origin isolated
        if (!window.crossOriginIsolated) {
            compatibility.isCompatible = false;
            compatibility.issues.push('Browser is not cross-origin isolated (check COOP/COEP headers)');
        }
        
        console.log('🔍 Browser compatibility check:', compatibility);
        return compatibility;
    },

    async loadFFmpeg(dotNetRef) {
        if (this.ffmpeg !== null) {
            console.log('✅ FFmpeg already loaded');
            return;
        }

        try {
            console.log('📦 Creating FFmpeg instance...');

            // ✅ Используем класс из window.FFmpegClass (установлен WasmConverter.razor.js)
            const FFmpeg = window.FFmpegClass;

            if (!FFmpeg) {
                console.error('❌ window.FFmpegClass not found. Make sure WasmConverter.razor.js initialized first.');
                throw new Error('FFmpeg class not available. Call initialize() first.');
            }

            console.log('✅ FFmpeg constructor found:', FFmpeg.name);

            this.ffmpeg = new FFmpeg();
            console.log('✅ FFmpeg instance created');

            this.ffmpeg.on('progress', ({ progress, time }) => {
                const percent = Math.round(progress * 100);
                console.log(`⏳ Progress: ${percent}% (${time}s)`);
                if (dotNetRef) {
                    dotNetRef.invokeMethodAsync('UpdateProgress', percent, 0);
                }
            });

            this.ffmpeg.on('log', ({ message }) => {
                console.log('🎬 FFmpeg:', message);
            });

            console.log('⏳ Loading FFmpeg core...');
            await this.ffmpeg.load({
                coreURL: '/lib/ffmpeg/ffmpeg-core.js',
                wasmURL: '/lib/ffmpeg/ffmpeg-core.wasm'
            });

            console.log('✅ FFmpeg loaded successfully');
        } catch (error) {
            console.error('❌ FFmpeg load error:', error);
            throw error;
        }
    },

    async convertVideoFromInput(fileInputId, fileIndex, outputFileName, dotNetRef) {
        if (this.ffmpeg === null) {
            throw new Error('FFmpeg is not loaded. Call loadFFmpeg() first.');
        }

        try {
            console.log(`🎬 Starting conversion for file index ${fileIndex}`);

            const fileInput = document.getElementById(fileInputId);
            if (!fileInput) {
                throw new Error(`File input #${fileInputId} not found`);
            }

            const file = fileInput.files[fileIndex];
            if (!file) {
                throw new Error(`File at index ${fileIndex} not found`);
            }

            console.log(`📁 Processing file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

            // Читаем файл в браузере (НЕ отправляем на сервер!)
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            console.log('📝 Writing input file to FFmpeg virtual filesystem...');
            await this.ffmpeg.writeFile('input.vob', uint8Array);

            console.log('🎬 Starting FFmpeg conversion...');
            await this.ffmpeg.exec([
                '-i', 'input.vob',
                '-c:v', 'libx264',
                '-preset', 'ultrafast',
                '-crf', '23',
                '-c:a', 'aac',
                '-b:a', '128k',
                '-movflags', '+faststart',
                outputFileName
            ]);

            console.log('📝 Reading converted file...');
            const data = await this.ffmpeg.readFile(outputFileName);

            // Сохраняем результат для скачивания (только в браузере)
            const blob = new Blob([data.buffer], { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);

            window.convertedFiles = window.convertedFiles || {};
            window.convertedFiles[outputFileName] = url;

            console.log(`✅ Conversion complete: ${outputFileName} (${(data.length / 1024 / 1024).toFixed(2)} MB)`);

            // Очистка временных файлов
            await this.ffmpeg.deleteFile('input.vob');
            await this.ffmpeg.deleteFile(outputFileName);

            return true;
        } catch (error) {
            console.error('❌ Conversion error:', error);
            return false;
        }
    },

    downloadConvertedFile(fileName) {
        console.log(`⬇️ Downloading: ${fileName}`);

        const url = window.convertedFiles?.[fileName];
        if (!url) {
            console.error('❌ File not found in cache:', fileName);
            return;
        }

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(() => {
            URL.revokeObjectURL(url);
            delete window.convertedFiles[fileName];
            console.log('🗑️ Cleaned up:', fileName);
        }, 1000);
    }
};

// Helper для серверных файлов (Home page)
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

console.log('✅ ffmpegInterop initialized');
