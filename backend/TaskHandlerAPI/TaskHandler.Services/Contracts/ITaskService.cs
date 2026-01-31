using TaskHandler.Common.Models;
using TaskHandler.Core.Models;

namespace TaskHandler.Services.Contracts
{
    public interface ITaskService
    {
        public Task<List<TaskModel>> GetPaginatedListOfTasksAsync(PaginationModel pagination);
        public Task CreateTaskAsync(TaskModel task);
        public Task UpdateTaskAsync(TaskModel updatedTask);
        public Task DeleteTaskAsync(int taskId);
        public Task<List<TaskModel>> SearchTasksAsync(string query, PaginationModel pagination);
    }
}
