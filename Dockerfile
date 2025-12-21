FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build-env
WORKDIR /build
COPY ./src/ .
RUN dotnet restore
RUN dotnet build
RUN dotnet publish VobToMp4/VobToMp4.csproj -c Release -o published-app

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
# Install FFmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*
COPY --from=build-env /build/published-app .
ENTRYPOINT ["dotnet", "VobToMp4.dll"]