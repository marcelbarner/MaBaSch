# syntax=docker/dockerfile:1

# --- Stage 1: Frontend build ---
FROM node:22-alpine AS frontend-build
WORKDIR /src/frontend
COPY frontend/mabasch/package*.json ./
RUN npm ci
COPY frontend/mabasch/ ./
RUN npm run build

# --- Stage 2: Backend build ---
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src/backend
COPY backend/MaBaSch/*.csproj ./
RUN dotnet restore
COPY backend/MaBaSch/ ./
RUN dotnet publish -c Release -o /app/publish --no-restore

# --- Stage 3: Runtime ---
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=backend-build /app/publish ./
COPY --from=frontend-build /src/frontend/dist/mabasch/browser ./wwwroot

ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    ConnectionStrings__Default="Data Source=/app/data/mabasch.db"

RUN mkdir -p /app/data
VOLUME ["/app/data"]

EXPOSE 8080

ENTRYPOINT ["dotnet", "MaBaSch.dll"]
