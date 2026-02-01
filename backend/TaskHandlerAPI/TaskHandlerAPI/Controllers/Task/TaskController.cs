using Microsoft.AspNetCore.Mvc;
using TaskHandler.Common.Models;
using TaskHandler.Core.Models;
using TaskHandler.Services.Contracts;

namespace TaskHandler.WebAPI.Controllers.Task
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaskController(ITaskService _taskService) : Controller
    {
        [HttpPost("GetTasks", Name = "GetTasks")]
        public async Task<IActionResult> GetPaginatedListOfTasksAsync([FromBody] PaginationModel pagination)
        {
            var validationResult = ValidatePagination(pagination);
            if (validationResult is not null)
                return validationResult;

            // This needs to return a paginated list of tasks
            var tasks = await _taskService.GetPaginatedListOfTasksAsync(pagination);
            return Ok(tasks);
        }

        [HttpPost("CreateTask", Name = "CreateTask")]
        public async Task<IActionResult> CreateTaskAsync([FromBody] TaskModel newTask)
        {
            await _taskService.CreateTaskAsync(newTask);
            return Ok();
        }

        [HttpPost("UpdateTask", Name = "UpdateTask")]
        public async Task<IActionResult> UpdateTaskAsync([FromBody] TaskModel updatedTask)
        {
            try
            {
                await _taskService.UpdateTaskAsync(updatedTask);
                return Ok();
            }
            catch (InvalidOperationException)
            {
                return NotFound($"Task with ID {updatedTask.Id} not found.");
            }
        }

        [HttpDelete("DeleteTask/{id}", Name = "DeleteTask")]
        public async Task<IActionResult> DeleteTaskAsync(int id)
        {
            try
            {
                await _taskService.DeleteTaskAsync(id);
                return Ok();
            }
            catch (InvalidOperationException)
            {
                return NotFound($"Task with ID {id} not found.");
            }
        }

        [HttpPost("Search", Name = "SearchTasks")]
        public async Task<IActionResult> SearchTasksAsync([FromBody] SearchTasksRequest request)
        {
            if (request is null)
                return BadRequest("Request payload is required.");

            var validationResult = ValidatePagination(request.Pagination);
            if (validationResult is not null)
                return validationResult;

            var result = await _taskService.SearchTasksAsync(request.Filter, request.Pagination);
            return Ok(result);
        }

        // Returns null when the pagination is valid; returns a BadRequest IActionResult when invalid.
        private BadRequestObjectResult? ValidatePagination(PaginationModel? pagination)
        {
            if (pagination is null)
                return BadRequest("Pagination payload is required.");

            if (pagination.Page <= 0 || pagination.PageSize <= 0)
                return BadRequest("PageNumber and PageSize must be greater than zero.");

            if (pagination.PageSize > 100)
                return BadRequest("PageSize cannot be greater than 100.");

            return null;
        }
    }
}
