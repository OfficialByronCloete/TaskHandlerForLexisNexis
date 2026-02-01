using TaskHandler.Common.Models;
using TaskHandler.Core.Models;

namespace TaskHandler.Services.Contracts
{
    public interface ITaskRepository
    {
        Task<(List<TaskModel> Items, int TotalCount)> GetPaginatedListOfTasksAsync(PaginationModel pagination);
        Task CreateTaskAsync(TaskModel task);
        Task UpdateTaskAsync(TaskModel updatedTask);
        Task DeleteTaskAsync(int taskId);
        Task<List<TaskModel>> SearchTasksAsync(string query, PaginationModel pagination);
    }
}
