using Microsoft.OpenApi;
using TaskHandler.Integrations.DataAccess.Extensions;
using TaskHandler.WebAPI.Extensions;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;

// Add services to the container.
services.AddControllers();
// Ensure API explorer and Swagger generator are registered so UseSwagger/UseSwaggerUI are available.
services.AddEndpointsApiExplorer();
services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "TaskHandlerAPI",
        Version = "v1"
    });
});
services.ConfigureCustomDependencyInjection(builder);

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
services.AddOpenApi();

var app = builder.Build();

app.Services.ApplyTaskHandlerMigrations();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Enable swagger UI in all environments
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "TaskHandlerAPI v1");
});

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
