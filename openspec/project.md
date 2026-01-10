# Project Context

## Purpose
VOB to MP4 Converter - a web application for converting VOB (DVD Video Object) video files to MP4 format using FFMpeg. Provides a simple web interface for uploading and converting video files.

### Main Goals:
- Simplify the conversion of VOB files to the more modern MP4 format
- Provide a user-friendly web interface for batch file processing (up to 5 files simultaneously)
- Display conversion progress and statistics

## Tech Stack

### Backend
- **.NET 9.0** - core framework
- **ASP.NET Core** - web hosting
- **Blazor Server** - interactive UI with server-side rendering
- **C# 12** with Nullable reference types and Implicit usings

### Libraries and Packages
- **FFMpegCore 5.4.0** - wrapper for working with FFMpeg
- **Serilog 4.3.0** - structured logging
  - Serilog.AspNetCore 10.0.0
  - Serilog.Sinks.Console 6.1.1
- **Central Package Management** - centralized version management via Directory.Packages.props

### Frontend
- **Blazor Interactive Server** - components with server-side rendering
- **Bootstrap 5** - UI framework
- **Bootstrap Icons** - icons
- **JavaScript Interop** - for browser interaction

### External Tools
- **FFMpeg** - included in the project (ffmpeg.exe in the ffmpeg/ folder)

## Project Conventions

### Code Style
- **C# Naming Conventions:**
  - PascalCase for classes, methods, properties, public fields
  - camelCase for local variables and parameters
  - Private fields with `_` prefix (when needed)
- **File Organization:**
  - One class per file
  - File name matches class name
- **Nullable Reference Types:** enabled throughout the project
- **Implicit Usings:** enabled to reduce boilerplate code

### Architecture Patterns

#### Project Structure:
```
Components/
  - Layout/     # Main layout components
  - Pages/      # Razor Pages
Domain/         # Domain models and types
Helpers/        # Utility classes
Models/         # DTOs and data models
ffmpeg/         # FFMpeg executable
```

#### Key Patterns:
- **Result Pattern** - functional approach to error handling
  - `Result<TSuccess, TFailure>` - result type with explicit success/error handling
  - `MappingError` and `Reason` - typed errors
  - Implicit operators for convenient Result creation
- **Dependency Injection** - all services are registered via DI container
- **Singleton Services** - FileValidator and Configuration as singletons
- **Blazor Server Components** - interactive components with `@rendermode InteractiveServer`

#### Validation:
- File validation through `FileValidator`
- Checks: file size (max 1GB + 10%), extension (.vob), file count (max 5)

### Testing Strategy
[TODO: Add tests]
- Planning to add unit tests for FileValidator
- Integration tests for conversion
- Tests for Result Pattern

### Git Workflow
[Standard workflow with feature branches]
- Main branch: `main` or `master`
- Feature branches for new features
- Conventional commits are encouraged

## Domain Context

### Video Formats:
- **VOB (Video Object)** - DVD format container, can contain MPEG-2 video and audio
- **MP4** - modern container format, widely supported by all devices

### Conversion Process:
1. User uploads VOB files through the web interface (max 5 files)
2. Files are validated (size, extension)
3. FFMpeg performs conversion with progress tracking
4. Converted files are downloaded to the browser
5. Statistics are displayed: conversion time, video duration, file sizes

### Limitations:
- Maximum 5 files at a time
- Maximum file size: 1.1 GB
- Only .vob files are supported

## Important Constraints

### Technical Constraints:
- **File Size:** maximum 1.1 GB per file (SignalR limit for Blazor Server)
- **File Count:** maximum 5 files per upload
- **Supported Formats:** VOB → MP4 only
- **Platform:** Windows (FFMpeg.exe included for Windows)

### Business Constraints:
- Application runs locally, files are not stored on the server permanently
- Concurrent file processing is not yet optimized (no queue/processing pool)

### Planned Improvements:
- [ ] Add processing queue with limits (e.g., 8 concurrent conversions)
- [ ] Implement streaming instead of loading entire file into memory
- [ ] Use Channels for managing parallel processing
- [ ] Add ffprobe support for validating file content

## External Dependencies

### FFMpeg
- **Version:** embedded in the project (ffmpeg.exe)
- **Location:** `VobToMp4/ffmpeg/ffmpeg.exe`
- **Purpose:** video conversion VOB → MP4
- **License:** FFMpeg (GPL/LGPL)

### FFMpegCore Library
- **Version:** 5.4.0
- **Purpose:** C# wrapper for working with FFMpeg
- **Documentation:** https://github.com/rosenbjerg/FFMpegCore

### Blazor Server
- **SignalR:** used for real-time communication between server and client
- **Limitations:** maximum message/file size is limited by SignalR configuration

### Logging
- **Serilog:** structured logging to console
- **Format:** `[HH:mm:ss LEVEL] Message`
- **Levels:** Information for application, Warning for Microsoft.AspNetCore
