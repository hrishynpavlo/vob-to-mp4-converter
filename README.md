# Introduction
VOB to mp4 converter (no registration and SMS)

# Features roadmap
- [x] Validation (size, format by file extension, format by ffprobe)
- [x] Multiple files upload (process one by one, manually start each one)
- [ ] Interactive WebAssembly mode: files converted in the browser (no upload to server), no authorization = wasm
- [ ] Authorization (by Google using any user management provider)
- [ ] Create API endpoint to stream converted file instead of reading all bytes in-memory
- [ ] Use an internal bounded channel for file processing (number of workers = number of CPU cores), if the channel reaches capacity, then provide any estimation on UI
- [ ] File upload (< 200 mb) for quick conversion for users with authorization and free plan, has monthly limitations (by number of files and traffic)
- [ ] Subscription plan (prioritized channel for processing, big limits) 
- [ ] Metrics tracking (file size, conversion time, errors)
- [ ] Integrate DataDog for metrics/logs
- [ ] Integrate Cloudflare for rate-limitation, CDN, and bot protection 
- [ ] Setup CI/CD deployments (multi-arch builds, deploy to GCP/local k3s)

# Commands
To build and run the Docker container locally, use the following commands:
```shell

docker build -t vob-to-mp4-converter .
docker run -d -p 8080:8080 -e ASPNETCORE_URLS=http://+:8080 --name vob-converter vob-to-mp4-converter:latest
```
