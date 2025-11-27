# ============================================================================
# DOCKERFILE - Backend API .NET 8.0
# ============================================================================
# Multi-stage build para optimizar tamaño de imagen
# ============================================================================

# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar archivo de proyecto y restaurar dependencias
COPY ["OrigamiBack.csproj", "./"]
RUN dotnet restore "OrigamiBack.csproj"

# Copiar todo el código y compilar
COPY . .
RUN dotnet build "OrigamiBack.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "OrigamiBack.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Crear directorio para logs
RUN mkdir -p /app/logs

# Copiar archivos publicados
COPY --from=publish /app/publish .

# Exponer puerto (Render usa 10000 por defecto)
EXPOSE 10000

# Punto de entrada
ENTRYPOINT ["dotnet", "OrigamiBack.dll"]
