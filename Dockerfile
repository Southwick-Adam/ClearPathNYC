# BUILD STAGE
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Install Node.js and npm
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Copy only the necessary files
COPY NewYorkApp.csproj .
RUN dotnet restore NewYorkApp.csproj

# Copy the rest of the source code and publish
COPY . .
RUN dotnet publish -c Release -o /app/out

# RUNTIME STAGE
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/out .

EXPOSE 80
EXPOSE 8080
EXPOSE 3307

ENTRYPOINT ["dotnet", "NewYorkApp.dll"]
