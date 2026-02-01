using TaskHandler.Common.Models;
using TaskHandler.Core.Models;
using TaskHandler.Services.Contracts;

namespace TaskHandler.Services.Services
{
    public class TaskService(ITaskRepository _taskRepository) : ITaskService
    {
        public async Task<PagedResult<TaskModel>> GetPaginatedListOfTasksAsync(PaginationModel pagination)
        {
            var (items, totalCount) = await _taskRepository.GetPaginatedListOfTasksAsync(pagination);

            return new PagedResult<TaskModel>
            {
                Items = items,
                TotalCount = totalCount
            };
        }

        public async Task CreateTaskAsync(TaskModel task)
            => await _taskRepository.CreateTaskAsync(task);

        public async Task UpdateTaskAsync(TaskModel updatedTask)
            => await _taskRepository.UpdateTaskAsync(updatedTask);

        public async Task DeleteTaskAsync(int taskId)
            => await _taskRepository.DeleteTaskAsync(taskId);

        public async Task<PagedResult<TaskModel>> SearchTasksAsync(string query, PaginationModel pagination)
        {
            var (items, totalCount) = await _taskRepository.SearchTasksAsync(query, pagination);

            return new PagedResult<TaskModel>
            {
                Items = items,
                TotalCount = totalCount
            };
        }
    }
}
