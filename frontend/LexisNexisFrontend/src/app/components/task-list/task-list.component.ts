import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { PaginationModel } from '../../models/pagination.model';
import { TaskCreateModalComponent } from '../task-modal/task-modal.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskCreateModalComponent],
  template: `
    <div class="task-container">
      <div class="header-row">
        <h1>Task Handler</h1>
        <button class="add-task-btn-icon" (click)="openCreate()" title="Create Task">+</button>
      </div>
      
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
            (click)="goToFirstPage()"
            [disabled]="currentPage() === 1 || loading()"
            class="btn btn-page"
            title="First page">
            ««
          </button>
          <button
            (click)="previousPage()"
            [disabled]="currentPage() === 1 || loading()"
            class="btn btn-page"
            title="Previous page">
            «
          </button>
          
          @for (page of getVisiblePages(); track page) {
            <button
              (click)="goToPage(page)"
              [disabled]="loading()"
              [class.active]="page === currentPage()"
              class="btn btn-page-number">
              {{ page }}
            </button>
          }
          
          <button
            (click)="nextPage()"
            [disabled]="currentPage() >= totalPages() || loading()"
            class="btn btn-page"
            title="Next page">
            »
          </button>
          <button
            (click)="goToLastPage()"
            [disabled]="currentPage() >= totalPages() || loading()"
            class="btn btn-page"
            title="Last page">
            »»
          </button>
          
          <span class="page-info">
            Page {{ currentPage() }} of {{ totalPages() }}
          </span>
        </div>
      }
    </div>

    <app-task-create-modal
      [open]="createOpen()"
      [loading]="createLoading()"
      [error]="createError()"
      (close)="closeCreate()"
      (submitTask)="handleCreate($event)">
    </app-task-create-modal>
  `,
  styles: `
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
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.2px;
    }

    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 18px;
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
      gap: 8px;
      margin-top: 22px;
      padding-top: 12px;
      border-top: 1px solid #eef2f7;
      flex-wrap: wrap;
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

    .btn-page {
      padding: 8px 12px;
      min-width: 40px;
      background-color: #f8fafc;
      color: #0f172a;
      border: 1px solid #e2e8f0;
      box-shadow: none;
    }

    .btn-page:hover:not(:disabled) {
      background-color: #e2e8f0;
      border-color: #cbd5e1;
      transform: translateY(-1px);
    }

    .btn-page-number {
      padding: 8px 12px;
      min-width: 40px;
      background-color: #f8fafc;
      color: #0f172a;
      border: 1px solid #e2e8f0;
      box-shadow: none;
    }

    .btn-page-number:hover:not(:disabled) {
      background-color: #e2e8f0;
      border-color: #cbd5e1;
      transform: translateY(-1px);
    }

    .btn-page-number.active {
      background-color: #c8102e;
      color: white;
      border-color: #c8102e;
      box-shadow: 0 4px 10px rgba(200, 16, 46, 0.25);
    }

    .btn-page-number.active:hover {
      background-color: #a60d25;
      transform: none;
    }

    .add-task-btn-icon {
      width: 44px;
      height: 44px;
      border-radius: 25%;
      border: none;
      background: #c8102e;
      color: white;
      font-size: 28px;
      font-weight: 800;
      line-height: 1;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s;
      box-shadow: 0 4px 12px rgba(200, 16, 46, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .add-task-btn-icon:hover {
      background: #a60d25;
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(200, 16, 46, 0.4);
    }

    .add-task-btn-icon:active {
      transform: scale(0.98);
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
      font-size: 13px;
      color: #64748b;
      font-weight: 600;
      margin-left: 8px;
      white-space: nowrap;
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
  totalItems = signal(0);
  totalPages = signal(1);
  createOpen = signal(false);
  createLoading = signal(false);
  createError = signal<string | null>(null);

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
      next: (result) => {
        this.tasks.set(result.items);
        this.totalItems.set(result.totalCount);
        // Calculate exact total pages from totalCount
        const calculatedPages = Math.ceil(result.totalCount / this.pageSize());
        this.totalPages.set(calculatedPages > 0 ? calculatedPages : 1);
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
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
      this.loadTasks();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
      this.loadTasks();
    }
  }

  goToFirstPage(): void {
    if (this.currentPage() !== 1) {
      this.currentPage.set(1);
      this.loadTasks();
    }
  }

  goToLastPage(): void {
    if (this.currentPage() !== this.totalPages()) {
      this.currentPage.set(this.totalPages());
      this.loadTasks();
    }
  }

  goToPage(page: number): void {
    if (page !== this.currentPage() && page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadTasks();
    }
  }

  getVisiblePages(): number[] {
    const current = this.currentPage();
    const total = this.totalPages();
    const maxVisible = 5;
    
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  openCreate(): void {
    this.createError.set(null);
    this.createOpen.set(true);
  }

  closeCreate(): void {
    this.createOpen.set(false);
  }

  handleCreate(payload: Omit<Task, 'id'>): void {
    this.createLoading.set(true);
    this.createError.set(null);

    this.taskService.createTask(payload).subscribe({
      next: () => {
        this.createLoading.set(false);
        this.closeCreate();
        this.currentPage.set(1);
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error creating task:', err);
        this.createError.set('Failed to create task. Please try again.');
        this.createLoading.set(false);
      }
    });
  }
}
