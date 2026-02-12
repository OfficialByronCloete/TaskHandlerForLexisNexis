import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';
import { PagedResultModel } from '../models/paged-result.model';
import { PaginationModel } from '../models/pagination.model';
import { FilterModel } from '../models/filter.model';
import { environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.taskHandlerApiBaseUrl; // Base URL for the Task API

  getTasks(pagination: PaginationModel): Observable<PagedResultModel<Task>> {
    return this.http.post<PagedResultModel<Task>>(`${this.baseUrl}/GetTasks`, pagination);
  }

  createTask(task: Omit<Task, 'id'>): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/CreateTask`, task);
  }

  updateTask(task: Task): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/UpdateTask`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/DeleteTask/${id}`);
  }

  searchTasks(filter: FilterModel, pagination: PaginationModel): Observable<PagedResultModel<Task>> {
    return this.http.post<PagedResultModel<Task>>(`${this.baseUrl}/Search`, {
      filter,
      pagination,
    });
  }
}
