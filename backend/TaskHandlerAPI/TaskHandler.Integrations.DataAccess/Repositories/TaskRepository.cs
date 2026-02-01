using Microsoft.EntityFrameworkCore;
using TaskHandler.Common.Models;
using TaskHandler.Core.Models;
using TaskHandler.Integrations.DataAccess.Contexts;
using TaskHandler.Integrations.DataAccess.Entities;
using TaskHandler.Integrations.DataAccess.Extensions;
using TaskHandler.Services.Contracts;

namespace TaskHandler.Integrations.DataAccess.Repositories
{
    public class TaskRepository(TaskHandlerContext _context) : ITaskRepository
    {
        public async Task<(List<TaskModel> Items, int TotalCount)> GetPaginatedListOfTasksAsync(PaginationModel pagination)
        {
            var baseQuery = _context.Tasks.Where(t => !t.IsDeleted);

            var totalCount = await baseQuery.CountAsync();

            var items = await baseQuery
                .ApplyPagination(pagination)
                .Select(t => new TaskModel
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    Status = t.Status,
                    Priority = t.Priority,
                    DueDate = t.DueDate,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task CreateTaskAsync(TaskModel task)
        {
            var taskEntity = new TaskEntity
            {
                Title = task.Title,
                Description = task.Description,
                Status = task.Status,
                Priority = task.Priority,
                DueDate = task.DueDate,
                CreatedAt = task.CreatedAt
            };

            _context.Tasks.Add(taskEntity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateTaskAsync(TaskModel updatedTask)
        {
            var originalTask = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == updatedTask.Id && !t.IsDeleted)
                ?? throw new InvalidOperationException(); // Handle not found case

            originalTask.ApplyTaskUpdates(updatedTask);
            if (!_context.ChangeTracker.HasChanges())
                return;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteTaskAsync(int taskId)
        {
            var taskEntity = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == taskId && !t.IsDeleted)
                ?? throw new InvalidOperationException(); // Handle not found case

            taskEntity.IsDeleted = true;

            await _context.SaveChangesAsync();
        }

        public async Task<List<TaskModel>> SearchTasksAsync(string query, PaginationModel pagination)
        {
            if (string.IsNullOrWhiteSpace(query))
                return [];

            var pattern = $"%{query.Trim()}%";

            return await _context.Tasks
                .Where(t => !t.IsDeleted &&
                            EF.Functions.ILike(
                                (t.Title ?? string.Empty) + " " + (t.Description ?? string.Empty),
                                pattern))
                .ApplyPagination(pagination)
                .Select(t => new TaskModel
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    Status = t.Status,
                    Priority = t.Priority,
                    DueDate = t.DueDate,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync();
        }
    }
}
