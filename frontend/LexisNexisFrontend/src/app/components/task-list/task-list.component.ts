import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { PaginationModel } from '../../models/pagination.model';
import { FilterModel } from '../../models/filter.model';
import { TaskCreateModalComponent } from '../task-modal/task-modal.component';
import { TaskFilterModalComponent } from '../task-filter-modal/task-filter-modal.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskCreateModalComponent, TaskFilterModalComponent],
  template: `
    <div class="task-container">
      <div class="header-row">
        <h1>Task Handler</h1>
        <div class="header-actions">
          <button class="refresh-btn-icon" (click)="refreshTasks()" title="Refresh">⟳</button>
          <button class="filter-btn-icon" (click)="openFilter()" title="Filters">🔍</button>
          <button class="add-task-btn-icon" (click)="openCreate()" title="Create Task">+</button>
        </div>
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
                </div>
                <div class="task-status">
                  @if (task.status == 0) {
                    <span class="badge new">New</span>
                  } @else if (task.status == 1) {
                    <span class="badge in-progress">In Progress</span>
                  } @else if (task.status == 2) {
                    <span class="badge done">Done</span>
                  }
                  @if (task.status != 2 && task.dueDate) {
                    <span class="due-date">Due {{ task.dueDate | date:'mediumDate' }}</span>
                  }
                </div>
                <button class="delete-btn" (click)="deleteTask(task.id)" title="Delete task">
                  🗑️
                </button>
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

    <app-task-filter-modal
      [open]="filterOpen()"
      (close)="closeFilter()"
      (search)="handleSearch($event)">
    </app-task-filter-modal>

    <app-task-create-modal
      [open]="createOpen()"
      [loading]="createLoading()"
      [error]="createError()"
      (close)="closeCreate()"
      (submitTask)="handleCreate($event)">
    </app-task-create-modal>

    @if (confirmDeleteOpen()) {
      <div class="modal-overlay" (click)="cancelDelete()">
        <div class="confirm-modal" (click)="$event.stopPropagation()">
          <div class="confirm-header">
            <h2>Delete Task</h2>
          </div>
          <div class="confirm-body">
            <p>Are you sure you want to permanently delete <strong>"{{ taskToDeleteTitle() }}"</strong>?</p>
            <p class="confirm-warning">This action cannot be undone.</p>
          </div>
          <div class="confirm-footer">
            <button class="btn-cancel" (click)="cancelDelete()">Cancel</button>
            <button class="btn-delete" (click)="confirmDelete()">Delete</button>
          </div>
        </div>
      </div>
    }
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

    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
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
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 16px;
      align-items: flex-start;
      padding: 16px 18px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: #ffffff;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .task-status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
    }

    .delete-btn {
      background: transparent;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: background-color 0.2s, transform 0.1s;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.6;
      height: fit-content;
    }

    .delete-btn:hover {
      background: #fee2e2;
      opacity: 1;
      transform: scale(1.1);
    }

    .delete-btn:active {
      transform: scale(0.95);
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

    .due-date {
      display: block;
      margin-top: 15px;
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
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
      background: #10b981;
      color: white;
      font-size: 28px;
      font-weight: 800;
      line-height: 1;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .add-task-btn-icon:hover {
      background: #059669;
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
    }

    .add-task-btn-icon:active {
      transform: scale(0.98);
    }

    .filter-btn-icon {
      width: 44px;
      height: 44px;
      border-radius: 25%;
      border: none;
      background: #65cae7;
      color: white;
      font-size: 25px;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .filter-btn-icon:hover {
      background: #0284c7;
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(14, 165, 233, 0.4);
    }

    .filter-btn-icon:active {
      transform: scale(0.98);
    }

    .refresh-btn-icon {
      width: 44px;
      height: 44px;
      border-radius: 25%;
      border: none;
      color: black;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .refresh-btn-icon:active {
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

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .confirm-modal {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      width: 90%;
      max-width: 450px;
      animation: slideIn 0.2s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .confirm-header {
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
      background: linear-gradient(90deg, #ffffff 0%, #fecdd3 100%);
      border-radius: 12px 12px 0 0;
    }

    .confirm-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }

    .confirm-body {
      padding: 24px 20px;
    }

    .confirm-body p {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #374151;
      line-height: 1.5;
    }

    .confirm-body p:last-child {
      margin-bottom: 0;
    }

    .confirm-warning {
      color: #dc2626;
      font-weight: 600;
      font-size: 13px;
    }

    .confirm-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 20px;
      border-top: 1px solid #e5e7eb;
    }

    .btn-cancel {
      padding: 8px 16px;
      background: #e5e7eb;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      transition: background-color 0.2s;
    }

    .btn-cancel:hover {
      background: #d1d5db;
    }

    .btn-delete {
      padding: 8px 16px;
      background: #dc2626;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: white;
      transition: background-color 0.2s;
    }

    .btn-delete:hover {
      background: #b91c1c;
    }

    .btn-delete:active {
      transform: scale(0.98);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private activeFilter: FilterModel | null = null;

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
  filterOpen = signal(false);
  confirmDeleteOpen = signal(false);
  taskToDeleteId = signal<number | null>(null);
  taskToDeleteTitle = signal<string>('');

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

    // If we have an active filter, use search endpoint instead
    if (this.activeFilter && this.hasAnyFilter(this.activeFilter)) {
      this.taskService.searchTasks(this.activeFilter, pagination).subscribe({
        next: (result) => {
          this.tasks.set(result.items);
          this.totalItems.set(result.totalCount);
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
    } else {
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

  openFilter(): void {
    this.filterOpen.set(true);
  }

  closeFilter(): void {
    this.filterOpen.set(false);
  }

  refreshTasks(): void {
    this.activeFilter = null;
    this.loadTasks();
  }

  handleSearch(filter: FilterModel): void {
    this.closeFilter();
    this.currentPage.set(1);
    
    // Store the active filter for pagination
    if (this.hasAnyFilter(filter)) {
      this.activeFilter = filter;
    } else {
      this.activeFilter = null;
    }
    
    this.loadTasks();
  }

  private hasAnyFilter(filter: FilterModel): boolean {
    return Boolean(
      (filter.SearchTerm ?? '').trim() ||
        (filter.statuses && filter.statuses.length > 0) ||
        typeof filter.status === 'number' ||
        typeof filter.priority === 'number' ||
        typeof filter.order === 'number'
    );
  }

  handleCreate(payload: any): void {
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

  deleteTask(id: number): void {
    const task = this.tasks().find(t => t.id === id);
    const taskTitle = task?.title || 'this task';
    
    this.taskToDeleteId.set(id);
    this.taskToDeleteTitle.set(taskTitle);
    this.confirmDeleteOpen.set(true);
  }

  cancelDelete(): void {
    this.confirmDeleteOpen.set(false);
    this.taskToDeleteId.set(null);
    this.taskToDeleteTitle.set('');
  }

  confirmDelete(): void {
    const id = this.taskToDeleteId();
    if (id === null) return;

    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.cancelDelete();
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error deleting task:', err);
        this.error.set('Failed to delete task. Please try again.');
        this.cancelDelete();
      }
    });
  }
}
