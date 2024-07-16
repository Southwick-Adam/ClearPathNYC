using System;
using aspBuild.ApiCalls;
using aspBuild.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient();

builder.Services.AddSingleton<UpdateDatabase>();
builder.Services.AddHostedService<UpdateService>();

builder.Services.Configure<Neo4jOptions>(builder.Configuration.GetSection("Neo4j"));
builder.Services.AddSingleton<Neo4jService>();

builder.Services.AddSingleton<ModelAPI>();
builder.Services.AddSingleton<RunningGraphAPI>();

var app = builder.Build();
app.Run();