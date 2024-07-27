using aspRun.Data;
using aspRun.ApiCalls;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
    builder =>
    {
        builder.WithOrigins("https://clearpath.info.gf")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddHttpClient();

builder.Services.AddSingleton<WeatherAPI>();
builder.Services.AddHostedService<WeatherService>();

builder.Services.AddEndpointsApiExplorer();

builder.Services.Configure<Neo4jOptions>(builder.Configuration.GetSection("Neo4j"));
builder.Services.AddSingleton<Neo4jService>();

builder.Services.AddSingleton<ChangeDb>();

var app = builder.Build();

app.UseRouting();
app.UseCors("CorsPolicy");
app.UseAuthorization();

app.MapControllers();
app.Run();