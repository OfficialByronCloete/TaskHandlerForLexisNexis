using Microsoft.EntityFrameworkCore;
using TaskHandler.Common.Enums;
using TaskHandler.Common.Exceptions;
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
                ?? throw new NotFoundException($"Task with ID {updatedTask.Id} not found.");

            originalTask.ApplyTaskUpdates(updatedTask);
            if (!_context.ChangeTracker.HasChanges())
                return;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteTaskAsync(int taskId)
        {
            var taskEntity = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == taskId && !t.IsDeleted)
                ?? throw new NotFoundException($"Task with ID {taskId} not found.");

            taskEntity.IsDeleted = true;

            await _context.SaveChangesAsync();
        }

        public async Task<(List<TaskModel> Tasks, int TotalCount)> SearchTasksAsync(FilterModel filter, PaginationModel pagination)
        {
            ArgumentNullException.ThrowIfNull(filter);

            var query = _context.Tasks.AsQueryable().Where(t => !t.IsDeleted);

            // Optional: Status filter
            if (filter.Statuses?.Any() == true)
                query = query.Where(t => filter.Statuses.Contains(t.Status));

            // Optional: Priority filter
            if (filter.Priorities is not null)
                query = query.Where(t => filter.Priorities.Contains(t.Priority));

            // Optional: Search term filter
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var term = filter.SearchTerm.Trim();

                // Provider-aware search (PostgreSQL supports ILIKE; InMemory/others do not)
                var provider = _context.Database.ProviderName ?? string.Empty;
                var isPostgres = provider.Contains("Npgsql", StringComparison.OrdinalIgnoreCase);

                if (isPostgres)
                {
                    var pattern = $"%{term}%";
                    query = query.Where(t => EF.Functions.ILike(
                        (t.Title ?? string.Empty) + " " + (t.Description ?? string.Empty),
                        pattern));
                }
                else
                {
                    // Cross-provider fallback:
                    // - Works for InMemory
                    // - Translates for most relational providers
                    var normalized = term.ToUpper();

                    query = query.Where(t =>
                        (((t.Title ?? string.Empty) + " " + (t.Description ?? string.Empty))
                            .Contains(normalized, StringComparison.CurrentCultureIgnoreCase)));
                }
            }

            // Total count BEFORE pagination and orderingto ensure correct total count for the filtered results
            var totalCount = await query.CountAsync();

            // Deterministic ordering BEFORE pagination
            IOrderedQueryable<TaskEntity>? orderedQuery = null;

            if (filter.OrderBy?.Any() == true)
            {
                foreach (var order in filter.OrderBy)
                {
                    orderedQuery = (orderedQuery, order) switch
                    {
                        // Title
                        (null, OrderBy.TitleAsc) => query.OrderBy(t => t.Title),
                        (null, OrderBy.TitleDesc) => query.OrderByDescending(t => t.Title),
                        (not null, OrderBy.TitleAsc) => orderedQuery.ThenBy(t => t.Title),
                        (not null, OrderBy.TitleDesc) => orderedQuery.ThenByDescending(t => t.Title),

                        // DueDate
                        (null, OrderBy.DueDateAsc) => query.OrderBy(t => t.DueDate),
                        (null, OrderBy.DueDateDesc) => query.OrderByDescending(t => t.DueDate),
                        (not null, OrderBy.DueDateAsc) => orderedQuery.ThenBy(t => t.DueDate),
                        (not null, OrderBy.DueDateDesc) => orderedQuery.ThenByDescending(t => t.DueDate),

                        _ => orderedQuery
                    };
                }
            }

            // If no specific ordering was applied, order in alphabetical order by Title,
            // with the tie-breaker of Id to ensure deterministic results across pages
            query = (orderedQuery ?? query.OrderBy(t => t.Title))
                .ThenBy(t => t.Id);

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
