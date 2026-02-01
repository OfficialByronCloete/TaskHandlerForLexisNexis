using TaskHandler.Common.Models;
using TaskHandler.Core.Models;

namespace TaskHandler.Services.Contracts
{
    public interface ITaskService
    {
        Task<PagedResult<TaskModel>> GetPaginatedListOfTasksAsync(PaginationModel pagination);
        Task CreateTaskAsync(TaskModel task);
        Task UpdateTaskAsync(TaskModel updatedTask);
        Task DeleteTaskAsync(int taskId);
        Task<PagedResult<TaskModel>> SearchTasksAsync(FilterModel filter, PaginationModel pagination);
    }
}
