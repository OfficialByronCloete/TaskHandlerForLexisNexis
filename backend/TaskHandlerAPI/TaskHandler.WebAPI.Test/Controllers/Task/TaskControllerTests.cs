using AutoFixture;
using Microsoft.AspNetCore.Mvc;
using Moq;
using TaskHandler.Core.Models;
using TaskHandler.Services.Contracts;
using TaskHandler.WebAPI.Controllers.Task;

namespace TaskHandler.WebAPI.Test.Controllers.Task
{
    [TestClass]
    public sealed class TaskControllerTests
    {
        private Mock<ITaskService> _taskServiceMock = null!;
        private TaskController _sut = null!;
        private readonly Fixture _fixture = new();

        [TestInitialize]
        public void Initialize()
        {
            _taskServiceMock = new Mock<ITaskService>(MockBehavior.Strict);
            _sut = new TaskController(_taskServiceMock.Object);
        }

        [TestMethod]
        public async System.Threading.Tasks.Task CreateTaskAsync_WhenServiceSucceeds_ReturnsOk()
        {
            // Arrange
            var task = new TaskModel
            {
                Title = "Set up project",
                Description = "Create solution + baseline structure",
                Priority = Common.Enums.Priority.High,
                Status = Common.Enums.Status.New,
                DueDate = DateTime.UtcNow.AddDays(2)
            };

            _taskServiceMock
                .Setup(s => s.CreateTaskAsync(task))
                .Returns(System.Threading.Tasks.Task.CompletedTask);

            // Act
            var result = await _sut.CreateTaskAsync(task);

            // Assert
            Assert.IsInstanceOfType<OkResult>(result);
            _taskServiceMock.VerifyAll();
        }

        [TestMethod]
        public async System.Threading.Tasks.Task DeleteTaskAsync_WhenServiceThrowsInvalidOperationException_Throws()
        {
            // Arrange
            var id = _fixture.Create<int>();

            _taskServiceMock
                .Setup(s => s.DeleteTaskAsync(id))
                .ThrowsAsync(new InvalidOperationException("not found"));

            // Act
            InvalidOperationException ex;
            try
            {
                await _sut.DeleteTaskAsync(id);
                Assert.Fail("Expected InvalidOperationException to be thrown.");
                return;
            }
            catch (InvalidOperationException caught)
            {
                ex = caught;
            }

            // Assert
            Assert.AreEqual("not found", ex.Message);
            _taskServiceMock.VerifyAll();
        }

        [TestMethod]
        public async System.Threading.Tasks.Task DeleteTaskAsync_WhenServiceSucceeds_ReturnsOk()
        {
            // Arrange
            var id = _fixture.Create<int>();

            _taskServiceMock
                .Setup(s => s.DeleteTaskAsync(id))
                .Returns(System.Threading.Tasks.Task.CompletedTask);

            // Act
            var result = await _sut.DeleteTaskAsync(id);

            // Assert
            Assert.IsInstanceOfType<OkResult>(result);
            _taskServiceMock.VerifyAll();
        }
    }
}
