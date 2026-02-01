import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';
import { PaginationModel } from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:7065/api/Task'; // Base URL for the API

  // what determines the structure of a request and response?
  // I want to pass the pagination model to the backend when fetching tasks
  getTasks(pagination: PaginationModel): Observable<Task[]> {
    return this.http.post<Task[]>(`${this.baseUrl}/GetTasks`, pagination);
  }

  // If needed in future
  //   getTask(id: string): Observable<Task> {
  //     return this.http.get<Task>(`${this.baseUrl}/api/GetTasks/${id}`);
  //   }

  createTask(task: Omit<Task, 'id'>): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/CreateTask`, task);
  }

  updateTask(task: Task): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/UpdateTask`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/DeleteTask/${id}`);
  }

  searchTasks(query: string, pagination: PaginationModel): Observable<Task[]> {
    const params = new HttpParams().set('query', query);
    return this.http.post<Task[]>(
      `${this.baseUrl}/Search`,
      {
        page: pagination.page,
        pageSize: pagination.pageSize,
      },
      { params },
    );
  }
}
