import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { PaginationModel } from '../../models/pagination.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="task-container">
      <h1>Task Handler</h1>
      
      @if (loading()) {
        <div class="loading">Loading tasks...</div>
      } @else if (error()) {
        <div class="error">{{ error() }}</div>
      } @else {
        @if (tasks().length === 0) {
          <div class="empty">No tasks found</div>
        } @else {
          <ul class="task-list">
            @for (task of tasks(); track task.id) {
              <li class="task-item">
                <div class="task-content">
                  <h3>{{ task.title }}</h3>
                  @if (task.description) {
                    <p>{{ task.description }}</p>
                  }
                </div>
                <div class="task-status">
                  @if (task.status == 0) {
                    <span class="badge new">New</span>
                  } @else if (task.status == 1) {
                    <span class="badge in-progress">In Progress</span>
                  } @else if (task.status == 2) {
                    <span class="badge done">Done</span>
                  }
                </div>
              </li>
            }
          </ul>
        }

        <div class="pagination">
          <button
            (click)="previousPage()"
            [disabled]="currentPage() === 1 || loading()"
            class="btn">
            Previous
          </button>
          <span class="page-info">
            Page {{ currentPage() }}
          </span>
          <button
            (click)="nextPage()"
            [disabled]="tasks().length < pageSize() || loading()"
            class="btn">
            Next
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(90deg, #c8102e 0%, #ffffff 85%);
      padding: 32px 16px;
    }

    .task-container {
      max-width: 920px;
      margin: 40px auto;
      padding: 28px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      border: 1px solid #eef2f7;
    }

    h1 {
      margin-bottom: 18px;
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.2px;
    }

    .loading,
    .error,
    .empty {
      padding: 16px 18px;
      text-align: center;
      border-radius: 12px;
      font-weight: 500;
    }

    .loading {
      background: linear-gradient(90deg, #e0f2fe, #f0f9ff);
      color: #0369a1;
      border: 1px solid #bae6fd;
    }

    .error {
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }

    .empty {
      background: #f8fafc;
      color: #64748b;
      border: 1px dashed #e2e8f0;
    }

    .task-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 12px;
    }

    .task-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 18px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: #ffffff;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .task-item:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
      border-color: #cbd5f5;
    }

    .task-content h3 {
      margin: 0 0 6px 0;
      color: #0f172a;
      font-size: 16px;
      font-weight: 600;
    }

    .task-content p {
      margin: 0;
      color: #64748b;
      font-size: 14px;
      line-height: 1.4;
    }

    .badge {
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.2px;
    }

    .badge.new {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }

    .badge.in-progress {
      background: #fff7ed;
      color: #c2410c;
      border: 1px solid #fed7aa;
    }

    .badge.done {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      margin-top: 22px;
      padding-top: 12px;
      border-top: 1px solid #eef2f7;
    }

    .btn {
      padding: 8px 16px;
      border: 1px solid #e2e8f0;
      background-color: #0ea5e9;
      color: white;
      border-radius: 10px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: transform 0.1s ease, box-shadow 0.1s ease, background-color 0.2s;
      box-shadow: 0 6px 14px rgba(14, 165, 233, 0.25);
    }

    .btn:hover:not(:disabled) {
      background-color: #0284c7;
      transform: translateY(-1px);
    }

    .btn:disabled {
      background-color: #e2e8f0;
      color: #94a3b8;
      border-color: #e2e8f0;
      cursor: not-allowed;
      box-shadow: none;
    }

    .page-info {
      font-size: 14px;
      color: #64748b;
      font-weight: 600;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent implements OnInit {
  private readonly taskService = inject(TaskService);

  tasks = signal<Task[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  currentPage = signal(1);
  pageSize = signal(10);

  ngOnInit(): void {
    this.loadTasks();
  }

  private loadTasks(): void {
    this.loading.set(true);
    this.error.set(null);

    const pagination: PaginationModel = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
    };
    this.taskService.getTasks(pagination).subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.error.set('Failed to load tasks. Please try again later.');
        this.loading.set(false);
      }
    });
  }

  nextPage(): void {
    this.currentPage.update((page) => page + 1);
    this.loadTasks();
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
      this.loadTasks();
    }
  }
}
