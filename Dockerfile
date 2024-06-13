#BUILD STAGE
FROM mcr.microsoft.com/dotnet/sdk:8.0-noble-amd64 AS build
WORKDIR /app
COPY . .
RUN dotnet restore "./NewYorkApp.csproj"
RUN dotnet publish "./NewYorkApp.csproj" -c release -o out

#SERVE STAGE
FROM mcr.microsoft.com/dotnet/aspnet:8.0-noble-amd64 AS runtime
WORKDIR /app
COPY --from=build /app/out .

#for App
EXPOSE 80
EXPOSE 8080
#for DB
EXPOSE 3307

ENTRYPOINT [ "dotnet", "NewYorkApp.dll" ]