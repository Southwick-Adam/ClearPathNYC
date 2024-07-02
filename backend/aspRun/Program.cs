using aspRun.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

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
app.MapControllers();
app.Run();