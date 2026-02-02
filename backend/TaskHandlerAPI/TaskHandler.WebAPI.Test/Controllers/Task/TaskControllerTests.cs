using AutoFixture;
using Microsoft.AspNetCore.Mvc;
using Moq;
using TaskHandler.Common.Models;
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

        [TestMethod]
        public async System.Threading.Tasks.Task GetPaginatedListOfTasksAsync_WhenPaginationIsValid_ReturnsOkWithPagedResult()
        {
            // Arrange
            var pagination = new PaginationModel { Page = 1, PageSize = 10 };

            var expected = new PagedResult<TaskModel>
            {
                Items = new[]
                {
                    new TaskModel { Title = "T1", Description = "D1" },
                    new TaskModel { Title = "T2", Description = "D2" }
                },
                TotalCount = 2
            };

            _taskServiceMock
                .Setup(s => s.GetPaginatedListOfTasksAsync(pagination))
                .ReturnsAsync(expected);

            // Act
            var result = await _sut.GetPaginatedListOfTasksAsync(pagination);

            // Assert
            var ok = result as OkObjectResult;
            Assert.IsNotNull(ok);
            Assert.AreSame(expected, ok.Value);
            _taskServiceMock.VerifyAll();
        }

        [TestMethod]
        public async System.Threading.Tasks.Task GetPaginatedListOfTasksAsync_WhenPaginationIsNull_ReturnsBadRequest()
        {
            // Arrange

            // Act
            var result = await _sut.GetPaginatedListOfTasksAsync(null!);

            // Assert
            var badRequest = result as BadRequestObjectResult;
            Assert.IsNotNull(badRequest);
            Assert.AreEqual("Pagination payload is required.", badRequest.Value);
            _taskServiceMock.VerifyNoOtherCalls();
        }

        [TestMethod]
        public async System.Threading.Tasks.Task GetPaginatedListOfTasksAsync_WhenPageOrPageSizeIsInvalid_ReturnsBadRequest()
        {
            // Arrange
            var pagination = new PaginationModel { Page = 0, PageSize = 10 };

            // Act
            var result = await _sut.GetPaginatedListOfTasksAsync(pagination);

            // Assert
            var badRequest = result as BadRequestObjectResult;
            Assert.IsNotNull(badRequest);
            Assert.AreEqual("PageNumber and PageSize must be greater than zero.", badRequest.Value);
            _taskServiceMock.VerifyNoOtherCalls();
        }

        [TestMethod]
        public async System.Threading.Tasks.Task GetPaginatedListOfTasksAsync_WhenPageSizeIsTooLarge_ReturnsBadRequest()
        {
            // Arrange
            var pagination = new PaginationModel { Page = 1, PageSize = 101 };

            // Act
            var result = await _sut.GetPaginatedListOfTasksAsync(pagination);

            // Assert
            var badRequest = result as BadRequestObjectResult;
            Assert.IsNotNull(badRequest);
            Assert.AreEqual("PageSize cannot be greater than 100.", badRequest.Value);
            _taskServiceMock.VerifyNoOtherCalls();
        }
    }
}
