import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;
  const baseUrl = 'https://localhost:7065/api/Task';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify that no unmatched requests are outstanding
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return 404 not found when deleting a non-existent task', () => {
    const taskId = 999;
    const mockErrorResponse = {
      status: 404,
      statusText: 'Not Found'
    };
    const problemDetails = {
      type: 'https://tools.ietf.org/html/rfc7807',
      title: 'Resource not found.',
      status: 404,
      detail: 'Task not found',
      instance: `/api/Task/DeleteTask/${taskId}`,
      traceId: 'mock-trace-id'
    };

    // Call the deleteTask method
    service.deleteTask(taskId).subscribe({
      next: () => {
        throw new Error('should have failed with 404 error');
      },
      error: (error) => {
        // Verify the error response
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
        expect(error.error.title).toBe('Resource not found.');
        expect(error.error.status).toBe(404);
      }
    });

    // Expect a DELETE request to the correct URL
    const req = httpMock.expectOne(`${baseUrl}/DeleteTask/${taskId}`);
    expect(req.request.method).toBe('DELETE');

    // Respond with a 404 error using ProblemDetails format
    req.flush(problemDetails, mockErrorResponse);
  });
});
