import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { PaginationModel } from '../../models/pagination.model';
import { FilterModel } from '../../models/filter.model';
import { TaskCreateModalComponent } from '../task-modal/task-modal.component';
import { TaskFilterModalComponent } from '../task-filter-modal/task-filter-modal.component';
import { TaskDeleteConfirmModalComponent } from '../task-delete-confirm-modal/task-delete-confirm-modal.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskCreateModalComponent, TaskFilterModalComponent, TaskDeleteConfirmModalComponent],
  template: `
    <div class="logo-section">
      <img src="https://upload.wikimedia.org/wikipedia/commons/b/bf/LexisNexis_logo.svg" alt="LexisNexis Logo" class="logo-img" />
    </div>

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
              <li [class.expanded]="isTaskExpanded(task.id)" class="task-item" (click)="editTask(task)">
                @if (task.description) {
                  <button class="expand-btn" (click)="toggleExpand(task.id); $event.stopPropagation()" [attr.title]="isTaskExpanded(task.id) ? 'Collapse' : 'Expand'">
                    {{ isTaskExpanded(task.id) ? '▼' : '▶' }}
                  </button>
                } @else {
                  <div class="expand-spacer"></div>
                }
                <div class="task-content">
                  <h3>{{ task.title }}</h3>
                  @if (isTaskExpanded(task.id) && task.description) {
                    <div class="task-description" [innerHTML]="task.description"></div>
                  }
                </div>
                <div class="task-status" (click)="$event.stopPropagation()">
                  @if (isTaskExpanded(task.id)) {
                    <div class="status-row">
                      @if (task.status == 0) {
                        <span class="badge new">New Task</span>
                      } @else if (task.status == 1) {
                        <span class="badge in-progress">In Progress</span>
                      } @else if (task.status == 2) {
                        <span class="badge done">Done</span>
                      }
                      @if (task.priority === 2) {
                        <span class="priority-indicator priority-high">High Priority</span>
                      } @else if (task.priority === 1) {
                        <span class="priority-indicator priority-medium">Medium Priority</span>
                      } @else if (task.priority === 0) {
                        <span class="priority-indicator priority-low">Low Priority</span>
                      }
                    </div>
                  } @else {
                    <div class="status-row">
                      @if (task.status == 0) {
                        <span class="badge new">New</span>
                      } @else if (task.status == 1) {
                        <span class="badge in-progress">In Progress</span>
                      } @else if (task.status == 2) {
                        <span class="badge done">Done</span>
                      }
                      @if (task.priority === 2) {
                        <span class="priority-icon priority-high">▲</span>
                      } @else if (task.priority === 1) {
                        <span class="priority-icon priority-medium">▬</span>
                      } @else if (task.priority === 0) {
                        <span class="priority-icon priority-low">▼</span>
                      }
                    </div>
                  }
                  @if (task.status != 2 && task.dueDate) {
                    <span class="due-date">Due {{ task.dueDate | date:'mediumDate' }}</span>
                  }
                  @if (isTaskExpanded(task.id)) {
                    <span class="created-date">Created {{ task.createdAt | date:'mediumDate' }}</span>
                  }
                </div>
                <button class="delete-btn" (click)="deleteTask(task.id); $event.stopPropagation()" title="Delete task">
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
      [resetTrigger]="filterResetTrigger()"
      (close)="closeFilter()"
      (search)="handleSearch($event)">
    </app-task-filter-modal>

    <app-task-create-modal
      [open]="createOpen()"
      [loading]="createLoading()"
      [error]="createError()"
      [editingTask]="editingTask()"
      (close)="closeCreate()"
      (submitTask)="handleCreate($event)"
      (updateTask)="handleUpdate($event)">
    </app-task-create-modal>

    <app-task-delete-confirm-modal
      [open]="confirmDeleteOpen()"
      [taskTitle]="taskToDeleteTitle()"
      [errorMessage]="deleteError()"
      (cancel)="cancelDelete()"
      (confirm)="confirmDelete()">
    </app-task-delete-confirm-modal>
  `,
  styles: `
    .task-container {
      max-width: 920px;
      margin: 40px auto 100px auto;
      padding: 28px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      border: 1px solid #eef2f7;
    }

    .logo-section {
      max-width: 920px;
      margin: 30px auto 20px;
      padding: 0 28px;
      text-align: center;
    }

    :host {
      display: block;
      padding-bottom: 60px;
    }

    .logo-img {
      height: 60px;
      width: auto;
      object-fit: contain;
      transition: filter 0.2s ease;
    }

    .logo-img:hover {
      filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
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
      grid-template-columns: auto 1fr auto auto;
      gap: 16px;
      align-items: flex-start;
      padding: 16px 18px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: #ffffff;
      background-size: 200% 100%;
      background-position: 100% 0;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .task-item.expanded {
      background-image: linear-gradient(135deg, #ffffff 0%, rgba(200, 16, 46, 0.08) 100%);
      background-position: 0% 0;
    }

    .expand-btn {
      flex-shrink: 0;
      width: 28px;
      padding: 0;
      border: none;
      background: transparent;
      color: #64748b;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background-color 0.2s ease, color 0.2s ease;
      margin-top: 4px;
    }

    .expand-btn:hover {
      background-color: #f1f5f9;
      color: #334155;
    }

    .expand-spacer {
      width: 28px;
      height: 28px;
    }

    .task-item:hover {
      animation: fillGradient 0.6s ease forwards;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      cursor: pointer;
    }

    @keyframes fillGradient {
      from {
        background-image: linear-gradient(135deg, #ffffff 0%, rgba(200, 16, 46, 0.08) 100%);
        background-position: 100% 0;
      }
      to {
        background-image: linear-gradient(135deg, #ffffff 0%, rgba(200, 16, 46, 0.08) 100%);
        background-position: 0% 0;
      }
    }

    .task-status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
    }

    .task-content {
      flex: 1;
    }

    .task-description {
      margin-top: 12px;
      padding: 12px;
      background-color: #f8fafc;
      border-left: 3px solid #0284c7;
      border-radius: 4px;
      font-size: 13px;
      line-height: 1.5;
      color: #475569;
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    .status-row {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .priority-indicator {
      font-size: 12px;
      font-weight: 600;
      line-height: 1.4;
      padding: 6px 10px;
      border-radius: 6px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      white-space: nowrap;
    }

    .priority-icon {
      font-size: 16px;
      font-weight: 700;
      line-height: 1;
      padding: 7px 7px;
      border-radius: 999px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .priority-icon.priority-high {
      color: #dc2626;
      border-color: #fecaca;
      background: #fef2f2;
    }

    .priority-icon.priority-medium {
      color: #a16207;
      border-color: #fde68a;
      background: #fffbeb;
    }

    .priority-icon.priority-low {
      color: #2563eb;
      border-color: #bfdbfe;
      background: #eff6ff;
    }

    .priority-high {
      color: #dc2626;
      border-color: #fecaca;
      background: #fef2f2;
    }

    .priority-medium {
      color: #a16207;
      border-color: #fde68a;
      background: #fffbeb;
    }

    .priority-low {
      color: #2563eb;
      border-color: #bfdbfe;
      background: #eff6ff;
    }

    .badge {
      font-size: 12px;
      font-weight: 600;
      padding: 6px 10px;
      border-radius: 6px;
      display: inline-block;
      white-space: nowrap;
    }

    .badge.new {
      color: #2563eb;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
    }

    .badge.in-progress {
      color: #a16207;
      background: #fffbeb;
      border: 1px solid #fde68a;
    }

    .badge.done {
      color: #16a34a;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
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

    .due-date {
      display: block;
      margin-top: 15px;
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
    }

    .created-date {
      display: block;
      margin-top: 6px;
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
  editingTask = signal<any | null>(null);
  filterOpen = signal(false);
  confirmDeleteOpen = signal(false);
  taskToDeleteId = signal<number | null>(null);
  taskToDeleteTitle = signal<string>('');
  deleteError = signal<string>('');
  filterResetTrigger = signal(0);
  expandedTaskIds = signal<Set<number>>(new Set());

  ngOnInit(): void {
    this.loadTasks();
  }

  toggleExpand(taskId: number): void {
    const expanded = new Set(this.expandedTaskIds());
    if (expanded.has(taskId)) {
      expanded.delete(taskId);
    } else {
      expanded.add(taskId);
    }
    this.expandedTaskIds.set(expanded);
  }

  isTaskExpanded(taskId: number): boolean {
    return this.expandedTaskIds().has(taskId);
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
    this.editingTask.set(null);
    this.createError.set(null);
    this.createOpen.set(true);
  }

  editTask(task: any): void {
    this.editingTask.set(task);
    this.createError.set(null);
    this.createOpen.set(true);
  }

  closeCreate(): void {
    this.createOpen.set(false);
    this.editingTask.set(null);
  }

  openFilter(): void {
    this.filterOpen.set(true);
  }

  closeFilter(): void {
    this.filterOpen.set(false);
  }

  refreshTasks(): void {
    this.activeFilter = null;
    this.filterResetTrigger.update(v => v + 1);
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
        (filter.priorities && filter.priorities.length > 0) ||
        (filter.orderBy && filter.orderBy.length > 0)
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

  handleUpdate(payload: any): void {
    this.createLoading.set(true);
    this.createError.set(null);

    this.taskService.updateTask(payload).subscribe({
      next: () => {
        this.createLoading.set(false);
        this.closeCreate();
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error updating task:', err);
        this.createError.set('Failed to update task. Please try again.');
        this.createLoading.set(false);
      }
    });
  }

  deleteTask(id: number): void {
    const task = this.tasks().find(t => t.id === id);
    const taskTitle = task?.title || 'this task';
    
    this.taskToDeleteId.set(id);
    this.taskToDeleteTitle.set(taskTitle);
    this.deleteError.set('');
    this.confirmDeleteOpen.set(true);
  }

  cancelDelete(): void {
    this.confirmDeleteOpen.set(false);
    this.taskToDeleteId.set(null);
    this.taskToDeleteTitle.set('');
    this.deleteError.set('');
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
        const message = err.error?.title
          ? `${err.error.title} Could not delete the task.`
          : 'Failed to delete task. Please try again.';
        this.deleteError.set(message);
      }
    });
  }
}
