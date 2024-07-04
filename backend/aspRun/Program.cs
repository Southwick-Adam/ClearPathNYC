using aspRun.Data;
using aspRun.ApiCalls;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy",
    builder =>
    {
        builder.WithOrigins("https://clearpath.info.gf", "http://localhost:3000", "http://react")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddHttpClient();

builder.Services.AddSingleton<WeatherAPI>();
builder.Services.AddHostedService<WeatherStartup>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<Neo4jOptions>(builder.Configuration.GetSection("Neo4j"));
builder.Services.AddSingleton<Neo4jService>();

var app = builder.Build();

//Test api endpoints with swagger (for dev)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("ReactPolicy");

app.MapControllers();
app.Run();