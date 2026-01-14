## Context
This change introduces a client-side video conversion capability using FFmpeg.wasm, allowing users to convert video files entirely in their browser without server involvement. This is a significant architectural addition that runs parallel to the existing server-side conversion system.

### Background
- Current system uses server-side FFmpeg with ASP.NET Core/Blazor Server
- Server-side conversion has limitations: SignalR file size (1.1GB), server resources, privacy concerns
- FFmpeg.wasm brings native FFmpeg to the browser via WebAssembly
- Client-side processing eliminates file uploads/downloads and reduces infrastructure costs

### Constraints
- Requires modern browser with WebAssembly and SharedArrayBuffer support
- FFmpeg.wasm library is ~30MB (one-time download, can be cached)
- Processing speed depends on user's device CPU
- Browser memory limits constrain maximum file size (typically 2-4GB depending on available RAM)
- Must configure proper HTTP headers for SharedArrayBuffer (COOP/COEP)

### Stakeholders
- **End Users**: Benefit from faster processing, privacy, and no file size limits
- **Development Team**: Maintains two conversion systems (server + client)
- **Infrastructure**: Reduced server load and bandwidth costs

## Goals / Non-Goals

### Goals
- Enable client-side video conversion with FFmpeg.wasm
- Support multiple input formats (VOB, AVI, MKV, MOV, etc.) to MP4
- Provide real-time progress tracking and statistics
- Maintain responsive UI during conversion using Web Workers
- Support conversion queue for batch processing
- Offer intuitive navigation between server-side and client-side converters

### Non-Goals
- Replacing the existing server-side converter (both will coexist)
- Supporting every FFmpeg feature (focus on common video conversion use cases)
- Mobile app implementation (browser-only for now)
- Cloud storage integration (local files only)
- User accounts or conversion history tracking
- Real-time video editing features beyond format conversion

## Decisions

### Decision 1: Use FFmpeg.wasm Library
**Rationale**: FFmpeg.wasm is the de facto standard for browser-based video processing, actively maintained, and provides comprehensive FFmpeg functionality in WebAssembly.

**Alternatives Considered**:
- Build custom WASM from FFmpeg source → Rejected (too complex, reinventing wheel)
- Use native browser MediaRecorder API → Rejected (limited format support)
- Use cloud-based API services → Rejected (defeats purpose of client-side processing)

### Decision 2: Web Worker Architecture
**Rationale**: Running FFmpeg in a Web Worker prevents blocking the main UI thread, keeping the browser responsive during intensive processing.

**Implementation**:
- Main thread handles UI and user interactions
- Web Worker thread runs FFmpeg.wasm conversion
- PostMessage API for progress updates and completion notifications

### Decision 3: Sequential Processing Only
**Rationale**: Processing files one at a time prevents browser memory exhaustion and system freezing. This is the only mode for the WASM converter.

**Alternatives Considered**:
- Parallel processing → Rejected (high risk of browser crash, added complexity)
- Optional parallel mode → Rejected (not needed for MVP, keep it simple)

### Decision 4: CDN-Based FFmpeg.wasm Loading
**Rationale**: Load FFmpeg.wasm from CDN to minimize bundle size and leverage browser caching. No need for npm integration since we're loading directly from CDN.

**Implementation**:
- Load FFmpeg.wasm from CDN (unpkg.com/@ffmpeg/ffmpeg or jsdelivr)
- Reference directly in JavaScript without npm/build process
- Show loading progress while library downloads
- Display error message if CDN is unreachable

### Decision 5: Dual Converter Strategy
**Rationale**: Keep both server-side and client-side converters available, letting users choose based on their needs.

**Use Cases**:
- **Server-side**: Users with older browsers, small files, or preference for server processing
- **Client-side**: Users with modern browsers, large files, privacy concerns, or slow internet

### Decision 6: COOP/COEP Headers for SharedArrayBuffer
**Rationale**: FFmpeg.wasm requires SharedArrayBuffer for optimal performance, which requires specific HTTP headers.

**Implementation**:
```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```
Configure in ASP.NET Core middleware or web server (IIS/Kestrel).

## Technical Architecture

### Component Diagram
```
┌─────────────────────────────────────────┐
│   WasmConverter.razor (Blazor Page)     │
│   - File selection UI                   │
│   - Conversion controls                 │
│   - Progress display                    │
│   - Download management                 │
└──────────────┬──────────────────────────┘
               │ JS Interop
               ▼
┌─────────────────────────────────────────┐
│   ffmpeg-interop.js (JavaScript)        │
│   - Browser compatibility checks        │
│   - FFmpeg.wasm initialization          │
│   - File handling (File API)            │
│   - Progress callbacks                  │
└──────────────┬──────────────────────────┘
               │ PostMessage
               ▼
┌─────────────────────────────────────────┐
│   Web Worker (ffmpeg-worker.js)         │
│   - FFmpeg.wasm execution               │
│   - Video processing                    │
│   - Progress reporting                  │
└─────────────────────────────────────────┘
```

### Data Flow
1. User selects files via `<input type="file">` (stays in browser memory)
2. Blazor component invokes JavaScript via `IJSRuntime`
3. JavaScript loads FFmpeg.wasm and creates Web Worker
4. Worker processes file and sends progress updates via PostMessage
5. JavaScript forwards progress to Blazor via callbacks
6. Blazor updates UI in real-time
7. Completed file is returned as Blob and offered for download

### File Structure
```
VobToMp4/
├── Components/
│   ├── Pages/
│   │   └── WasmConverter.razor        (New)
│   └── Layout/
│       └── NavMenu.razor              (Modified)
├── Models/
│   ├── WasmConversionJob.cs           (New)
│   └── ConversionSettings.cs          (New)
└── wwwroot/
    └── js/
        ├── ffmpeg-interop.js          (New)
        └── ffmpeg-worker.js           (New)
```

**Note**: FFmpeg.wasm is loaded from CDN, not bundled with the application.

## Risks / Trade-offs

### Risk 1: Browser Compatibility
**Risk**: Users with older browsers cannot use WASM converter.
**Mitigation**: 
- Detect browser capabilities on page load
- Show clear compatibility message with supported browser list
- Fallback to server-side converter automatically or via link

### Risk 2: Memory Limitations
**Risk**: Very large files (>2GB) may exhaust browser memory.
**Mitigation**:
- Display recommended file size limits in UI
- Catch and handle out-of-memory errors gracefully
- Suggest server-side converter for extremely large files

### Risk 3: Initial Load Time
**Risk**: FFmpeg.wasm library is ~30MB, slowing initial page load.
**Mitigation**:
- Lazy-load FFmpeg.wasm only when user navigates to WASM converter page
- Show loading progress during library download
- Leverage browser caching for subsequent visits
- Consider CDN hosting for faster delivery

### Risk 4: COOP/COEP Header Configuration
**Risk**: Incorrect headers prevent SharedArrayBuffer, degrading performance or breaking functionality.
**Mitigation**:
- Document header requirements clearly
- Test deployment configuration in staging environment
- Provide fallback mode without SharedArrayBuffer (slower but functional)
- Add startup checks to verify header configuration

### Risk 5: Processing Performance Variability
**Risk**: Conversion speed varies widely based on user's device.
**Mitigation**:
- Set clear expectations in UI ("Processing may take several minutes")
- Display estimated time remaining based on progress
- Allow users to cancel long-running conversions
- Recommend server-side converter for users with slower devices

### Trade-off: Code Duplication
**Trade-off**: Maintaining two conversion systems (server + client) increases code complexity.
**Decision**: Accept duplication for user experience benefits. The systems serve different use cases and can evolve independently.

## Migration Plan

### Phase 1: Development and Testing (Week 1-2)
- Implement FFmpeg.wasm CDN integration
- Create WasmConverter.razor page with minimal UI
- Test browser compatibility and performance
- Verify CDN loading and fallback handling

### Phase 2: Feature Completion (Week 3-4)
- Implement conversion queue management
- Add progress tracking and statistics
- Implement error handling and validation
- Complete documentation

### Phase 3: Deployment Preparation (Week 5)
- Configure COOP/COEP headers for staging environment
- Performance testing on various browsers and devices
- Update user documentation and help pages
- Prepare rollout communication

### Phase 4: Production Deployment (Week 6)
- Deploy to production with feature flag (optional)
- Monitor browser errors and performance metrics
- Gather user feedback
- Iterate on UX improvements

### Rollback Plan
If critical issues arise:
1. Remove "Browser Converter" link from navigation menu
2. Display maintenance message on `/wasm-converter` route
3. Direct all users to server-side converter
4. Fix issues in development branch
5. Re-deploy after validation

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Only load FFmpeg.wasm when user navigates to WASM converter page
2. **Web Worker**: Keep main thread responsive during processing
3. **Memory Management**: Explicitly free memory after conversion completes
4. **Progress Throttling**: Update UI every 100ms instead of every frame
5. **Asset Caching**: Configure long cache duration for FFmpeg.wasm assets

### Expected Performance
- **Library Load**: 3-10 seconds (30MB download, one-time per session)
- **Conversion Speed**: Varies by device, typically 0.5x-2x realtime for video
- **Memory Usage**: 2-3x input file size during processing
- **Browser Support**: Chrome 92+, Firefox 90+, Edge 92+, Safari 15.2+

## Decisions on Open Questions

### Question 1: Should we support parallel conversion?
**Decision**: No
**Rationale**: Sequential processing only for WASM page. This prevents browser memory exhaustion and keeps implementation simple. Users can still process multiple files, but one at a time.

### Question 2: Should we package FFmpeg.wasm with the app or use CDN?
**Decision**: Package locally
**Rationale**: Bundle FFmpeg.wasm files with the application to ensure reliability, enable offline operation after first load, and avoid CDN dependencies or failures.
**Implementation**: 
- Store files in `wwwroot/lib/ffmpeg/` directory
- Include `ffmpeg-core.js`, `ffmpeg-core.wasm`, and `814.ffmpeg.js`
- Reference via `<script>` tag in `App.razor`
- Load from local origin: `${baseURL}/lib/ffmpeg/...`
- No external network dependencies for conversion functionality

### Question 3: Should we persist conversion settings?
**Decision**: No
**Rationale**: Keep it simple. Users can select settings each time they convert. No need for localStorage complexity in MVP.

### Question 4: How to handle unsupported formats?
**Decision**: Display error message on UI
**Rationale**: When FFmpeg.wasm encounters unsupported format or codec, catch the error and show user-friendly message explaining the issue. No automatic format detection needed.
**Implementation**: Simple error handling with clear messaging about what went wrong.

### Question 5: Should we provide preset profiles (e.g., "High Quality", "Small Size")?
**Decision**: No
**Rationale**: Not needed for MVP. Focus on basic VOB to MP4 conversion with default settings. Users can use server-side converter if they need advanced options.

