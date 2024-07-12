using System.Diagnostics;
using aspBuild.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<UpdateDatabase>();
builder.Services.AddHostedService<UpdateService>();

builder.Services.Configure<Neo4jOptions>(builder.Configuration.GetSection("Neo4j"));
builder.Services.AddSingleton<Neo4jService>();

var app = builder.Build();
app.Run();