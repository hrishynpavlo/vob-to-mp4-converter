# Introduction
VOB to mp4 converter (no registration and SMS)

# Features roadmap
- [x] Validation (size, format by file extension, format by ffprobe)
- [x] Multiple files upload (process one by one, manually start each one)
- [ ] Authorization (by google using any user management provider)
- [ ] Interactive WebAssembly mode: files converted in the browser (no upload to server)
- [ ] Metrics tracking (file size, conversion time, errors)
- [ ] Subscription plans (free, monthly, or pay per single conversion for big files)
- [ ] Setup ci/cd deployments (docker file, multi arch builds, deploy to GCP/local k3s)

# Commands
To build and run the Docker container locally, use the following commands:
```shell

docker build -t vob-to-mp4-converter .
docker run -d -p 8080:8080 -e ASPNETCORE_URLS=http://+:8080 --name vob-converter vob-to-mp4-converter:latest
```