using Microsoft.EntityFrameworkCore;
using TaskHandler.Common.Enums;
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
        public async Task<(List<TaskModel> Tasks, int TotalCount)> GetPaginatedListOfTasksAsync(PaginationModel pagination)
        {
            var query = _context.Tasks.Where(t => !t.IsDeleted);

            var totalCount = await query.CountAsync();

            var tasks = await query
                .OrderBy(t => t.DueDate)
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

            return (tasks, totalCount);
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

        public async Task<(List<TaskModel> Tasks, int TotalCount)> SearchTasksAsync(FilterModel filter, PaginationModel pagination)
        {
            ArgumentNullException.ThrowIfNull(filter);

            var query = _context.Tasks.AsQueryable().Where(t => !t.IsDeleted);

            // Optional: Status filter
            if (filter.Status is not null)
                query = query.Where(t => t.Status == filter.Status);

            // Optional: Priority filter
            if (filter.Priority is not null)
                query = query.Where(t => t.Priority == filter.Priority);

            // Optional: Search term filter
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var pattern = $"%{filter.SearchTerm.Trim()}%";
                query = query.Where(t => EF.Functions.ILike(
                    (t.Title ?? string.Empty) + " " + (t.Description ?? string.Empty),
                    pattern));
            }

            // Total count BEFORE pagination
            var totalCount = await query.CountAsync();

            // We might want to do different kind of ordering
            // dueDate (asc, desc)
            // Title (asc, desc)

            // Deterministic ordering BEFORE pagination
            query = filter.Order == SearchOrder.Descending
                ? query.OrderByDescending(t => t.DueDate).ThenBy(t => t.Title)
                : query.OrderBy(t => t.DueDate).ThenBy(t => t.Title);

            var tasks = await query
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

            return (tasks, totalCount);
        }
    }
}
