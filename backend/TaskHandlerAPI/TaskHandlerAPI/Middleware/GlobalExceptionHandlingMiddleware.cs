using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Text.Json;
using TaskHandler.Common.Exceptions;

namespace TaskHandler.WebAPI.Middleware
{
    public sealed class GlobalExceptionHandlingMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlingMiddleware> logger, IHostEnvironment environment)
    {
        private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext httpContext, Exception exception)
        {
            if (httpContext.Response.HasStarted)
            {
                logger.LogWarning(exception, "Unhandled exception occurred after the response has started.");
                throw exception;
            }

            var traceId = Activity.Current?.Id ?? httpContext.TraceIdentifier;

            var (statusCode, title) = exception switch
            {
                NotFoundException => (StatusCodes.Status404NotFound, "Task not found."),
                InvalidOperationException => (StatusCodes.Status404NotFound, "Task not found."),
                ArgumentException => (StatusCodes.Status400BadRequest, "Invalid request."),
                _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred.")
            };

            logger.LogError(exception, "Unhandled exception. TraceId: {TraceId}", traceId);

            var problemDetails = new ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc7807",
                Title = title,
                Status = statusCode,
                Detail = environment.IsDevelopment() ? exception.Message : null,
                Instance = httpContext.Request.Path
            };

            problemDetails.Extensions["traceId"] = traceId;

            httpContext.Response.Clear();
            httpContext.Response.StatusCode = statusCode;
            httpContext.Response.ContentType = "application/problem+json";

            await httpContext.Response.WriteAsync(JsonSerializer.Serialize(problemDetails, JsonOptions));
        }
    }
}
