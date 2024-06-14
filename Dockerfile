# BUILD STAGE
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy only the necessary files
COPY NewYorkApp.csproj .
RUN dotnet restore NewYorkApp.csproj

# Copy the rest of the source code and publish
COPY . .
RUN dotnet publish NewYorkApp.csproj -c release -o out

# RUNTIME STAGE
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/out .

EXPOSE 80
EXPOSE 8080
EXPOSE 3307

ENTRYPOINT ["dotnet", "NewYorkApp.dll"]
