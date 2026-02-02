using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TaskHandler.Common.Enums;
using TaskHandler.Integrations.DataAccess.Contexts;
using TaskHandler.Integrations.DataAccess.Entities;

namespace TaskHandler.Integrations.DataAccess.Extensions;

public static class DatabaseSeedingExtensions
{
    public static async Task SeedTaskHandlerDataAsync(this IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<TaskHandlerContext>();

        // Ensures DB exists for InMemory / creates schema for relational if needed
        await context.Database.EnsureCreatedAsync();

        // Idempotent seed
        if (await context.Tasks.AsNoTracking().AnyAsync())
            return;

        var now = DateTime.UtcNow;

        // Add some tasks for assignment
        var tasks = new[]
        {
            new TaskEntity
            {
                Title = "Set up project",
                Description = "Create solution + baseline structure",
                Status = Status.New,
                Priority = Priority.High,
                DueDate = now.AddDays(2),
                CreatedAt = now.AddDays(-5)
            },
            new TaskEntity
            {
                Title = "Implement pagination",
                Description = "Add stable ordering + total count",
                Status = Status.InProgress,
                Priority = Priority.Medium,
                DueDate = now.AddDays(5),
                CreatedAt = now.AddDays(-3)
            },
            new TaskEntity
            {
                Title = "Add filtering",
                Description = "Filter by statuses, priority, search term",
                Status = Status.Done,
                Priority = Priority.Low,
                DueDate = now.AddDays(1),
                CreatedAt = now.AddDays(-10)
            }
        };

        context.Tasks.AddRange(tasks);

        await context.SaveChangesAsync();
    }
}