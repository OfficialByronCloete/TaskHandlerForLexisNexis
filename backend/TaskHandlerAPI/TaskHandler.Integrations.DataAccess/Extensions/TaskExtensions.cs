using TaskHandler.Core.Models;
using TaskHandler.Integrations.DataAccess.Entities;

namespace TaskHandler.Integrations.DataAccess.Extensions
{
    public static class TaskExtensions
    {
        public static void ApplyTaskUpdates(this TaskEntity originalTask, TaskModel updatedTask)
        {
            if (originalTask.Title != updatedTask.Title)
                originalTask.Title = updatedTask.Title;

            if (originalTask.Description != updatedTask.Description)
                originalTask.Description = updatedTask.Description;

            if (originalTask.Status != updatedTask.Status)
                originalTask.Status = updatedTask.Status;

            if (originalTask.Priority != updatedTask.Priority)
                originalTask.Priority = updatedTask.Priority;

            if (originalTask.DueDate != updatedTask.DueDate)
                originalTask.DueDate = updatedTask.DueDate;
        }
    }
}
