using Moq;
using TaskHandler.Common.Models;
using TaskHandler.Core.Models;
using TaskHandler.Services.Contracts;
using TaskHandler.Services.Services;

namespace TaskHandler.Services.Test.Services;

[TestClass]
public sealed class TaskServiceTests
{
    private Mock<ITaskRepository> _taskRepositoryMock = null!;
    private TaskService _sut = null!;

    [TestInitialize]
    public void Initialize()
    {
        _taskRepositoryMock = new Mock<ITaskRepository>(MockBehavior.Strict);
        _sut = new TaskService(_taskRepositoryMock.Object);
    }

    [TestMethod]
    public async Task SearchTasksAsync_WhenRepositoryReturnsItems_MapsToPagedResult()
    {
        var filter = new FilterModel { SearchTerm = "hello" };
        var pagination = new PaginationModel { Page = 1, PageSize = 10 };

        var items = new List<TaskModel>
        {
            new() { Id = 1, Title = "T1" },
            new() { Id = 2, Title = "T2" }
        };

        const int totalCount = 42;

        _taskRepositoryMock
            .Setup(r => r.SearchTasksAsync(filter, pagination))
            .ReturnsAsync((items, totalCount));

        var result = await _sut.SearchTasksAsync(filter, pagination);

        Assert.AreSame(items, result.Items);
        Assert.AreEqual(totalCount, result.TotalCount);
        _taskRepositoryMock.VerifyAll();
    }

    [TestMethod]
    public async Task SearchTasksAsync_WhenRepositoryThrows_PropagatesException()
    {
        var filter = new FilterModel { SearchTerm = "hello" };
        var pagination = new PaginationModel { Page = 1, PageSize = 10 };

        _taskRepositoryMock
            .Setup(r => r.SearchTasksAsync(filter, pagination))
            .ThrowsAsync(new InvalidOperationException("boom"));

        await Assert.ThrowsAsync<InvalidOperationException>(() => _sut.SearchTasksAsync(filter, pagination));
        _taskRepositoryMock.VerifyAll();
    }
}
