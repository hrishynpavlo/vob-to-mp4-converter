# Change: Add FFmpeg WASM Page for Client-Side Free File Conversion

## Why
Currently, the application performs server-side video conversion which:
- Consumes server resources (CPU, memory, disk I/O)
- Requires file uploads/downloads over the network
- Limits concurrent user capacity
- May raise privacy concerns for sensitive video content

Providing a client-side conversion option using FFmpeg.wasm allows users to convert files entirely in their browser, eliminating server load and privacy concerns while offering instant processing without network overhead.

## What Changes
- **Add** new client-side conversion page using FFmpeg.wasm
- **Add** browser-based video conversion capability (VOB to MP4, and potentially other formats)
- **Add** client-side progress tracking and statistics display
- **Add** support for larger files (no SignalR 1.1GB limitation)
- **Add** navigation menu item for WASM-based converter
- **Implement** WebAssembly-based FFmpeg processing in browser
- **Implement** file handling using browser File API (no server upload)
- **Implement** conversion queue with configurable concurrency (default: 1 file at a time to prevent browser freezing)

## Impact
### Affected Specs
- `client-side-conversion` (NEW) - Browser-based video conversion using FFmpeg.wasm

### Affected Code
- `/Components/Pages/` - New `WasmConverter.razor` page
- `/Components/Layout/NavMenu.razor` - Add menu link to WASM converter
- `/wwwroot/js/` - New JavaScript interop for FFmpeg.wasm integration
- `/VobToMp4.csproj` - No new NuGet packages (client-side only)
- `/Program.cs` - Add COOP/COEP headers middleware for SharedArrayBuffer support

**Note**: FFmpeg.wasm is loaded from CDN (unpkg or jsdelivr), not bundled with the application.

### User Benefits
- **Privacy**: Files never leave the user's device
- **Performance**: No network upload/download time
- **Capacity**: No file size limitations (beyond browser memory)
- **Cost**: Zero server processing costs
- **Availability**: Works offline after initial page load

### Technical Benefits
- Reduced server load and infrastructure costs
- Better scalability (processing moves to client)
- No temporary file storage management on server
- Parallel processing capability (user's multi-core CPU)

### Trade-offs
- Increases application bundle size by ~30MB (FFmpeg.wasm files)
- Requires modern browser with WebAssembly and SharedArrayBuffer support
- Processing speed depends on user's device CPU
- Memory constraints based on user's available RAM (max 5GB per file)
- No external CDN dependencies - fully self-contained deployment
- Files cached by browser after first load for better subsequent performance

