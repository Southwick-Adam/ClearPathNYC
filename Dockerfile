# BUILD STAGE
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Restore dotnet packages
COPY NewYorkApp.csproj .
RUN dotnet restore NewYorkApp.csproj

# Copy everything else, install node and build
COPY . .
WORKDIR /app/ClientApp

# Set up env
ARG MAPBOX_ACCESS_TOKEN
ENV REACT_APP_MAPBOX_ACCESS_TOKEN=$MAPBOX_ACCESS_TOKEN

# Install npm
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs
RUN npm install
RUN npx update-browserslist-db@latest

#Publish
WORKDIR /app
RUN dotnet publish -c Release -o /app/out

# RUNTIME STAGE
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/out .

EXPOSE 8080

ENTRYPOINT ["dotnet", "NewYorkApp.dll"]
