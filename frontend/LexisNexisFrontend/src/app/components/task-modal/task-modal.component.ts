import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (open) {
      <div class="modal-backdrop" (click)="onClose()">
        <div #modalElement class="modal modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header" (mousedown)="startDrag($event)">
            <h2>{{ editingTask ? 'Edit Task' : 'Create Task' }}</h2>
            <button class="icon-button" (click)="onClose()" (mousedown)="$event.stopPropagation()">×</button>
          </div>

          <div class="modal-body">
                <label class="field">
              <span>Title <span class="required">*</span></span>
              <input    
                type="text"
                name="title"
                [(ngModel)]="title"
                (blur)="onTitleBlur()"
                [class.input-error]="submitted && !title.trim()"
                placeholder="Enter task title" />
            </label>

            <label class="field">
              <span>Description</span>
              <textarea
                rows="3"
                name="description"
                [(ngModel)]="description"
                placeholder="Optional description"></textarea>
            </label>

            <div class="field-row">
              <label class="field">
                <span>Status</span>
                <select name="status" [(ngModel)]="status" (change)="onStatusChange()" class="status-select">
                  <option [ngValue]="0" data-badge="new">New</option>
                  <option [ngValue]="1" data-badge="in-progress">In Progress</option>
                  <option [ngValue]="2" data-badge="done">Done</option>
                </select>
              </label>

              <label class="field">
                <span>Priority</span>
                <select name="priority" [(ngModel)]="priority" (change)="onPriorityChange()" class="priority-select">
                  <option [ngValue]="0" data-priority="low">Low</option>
                  <option [ngValue]="1" data-priority="medium">Medium</option>
                  <option [ngValue]="2" data-priority="high">High</option>
                </select>
              </label>
            </div>

            <label class="field">
              <span>Due Date <span class="required">*</span></span>
              <input type="date" name="dueDate" [(ngModel)]="dueDate" [class.input-error]="submitted && !dueDate.trim()" />
            </label>

            @if (error) {
              <div class="form-error">{{ error }}</div>
            }
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="onClose()">Cancel</button>
            <button
              [class.btn-create]="!editingTask"
              [class.btn-update]="editingTask"
              class="btn"
              (click)="submit()">
              {{ loading ? (editingTask ? 'Updating...' : 'Creating...') : (editingTask ? 'Update Task' : 'Create Task') }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .modal {
      top: 80px;
      right: 20px;
      width: 420px;
      max-height: 75vh;
    }

    .modal-body {
      display: grid;
      gap: 10px;
    }

    .status-select,
    .priority-select {
      appearance: none;
      background-position: right 8px center;
      background-repeat: no-repeat;
      background-size: 20px;
      padding-right: 32px;
    }

    .status-select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23047857' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    }

    .priority-select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%232563eb' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    }

    /* Status select colors */
    .status-select.status-new {
      background-color: #ecfdf5;
      border-color: #a7f3d0;
    }

    .status-select.status-in-progress {
      background-color: #fff7ed;
      border-color: #fed7aa;
    }

    .status-select.status-done {
      background-color: #eff6ff;
      border-color: #bfdbfe;
    }

    /* Priority select colors */
    .priority-select.priority-low {
      background-color: #fef2f2;
      border-color: #fecaca;
    }

    .priority-select.priority-medium {
      background-color: #fffbeb;
      border-color: #fde68a;
    }

    .priority-select.priority-high {
      background-color: #eff6ff;
      border-color: #bfdbfe;
    }

    .field label {
      display: grid;
      gap: 6px;
    }

    .field-error-state {
      padding: 10px;
      border: 2px solid #fecaca;
      border-radius: 10px;
      gap: 8px;
    }

    .field-error-state label {
      gap: 8px;
    }

    .field-row {
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .form-error {
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
      padding: 10px 12px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
    }
  `,
})
export class TaskCreateModalComponent implements OnChanges {
  @ViewChild('modalElement', { static: false }) modalElement?: ElementRef<HTMLDivElement>;
  
  @Input() open = false;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() editingTask: Task | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() submitTask = new EventEmitter<Omit<Task, 'id'>>();
  @Output() updateTask = new EventEmitter<Task>();

  title = '';
  description = '';
  status = 0;
  priority = 0;
  dueDate = '';
  titleTouched = false;
  titleBlurred = false;
  submitted = false;

  // Drag functionality: track where modal has been dragged to
  private dragOffsetX = 0;  // How far dragged horizontally
  private dragOffsetY = 0;  // How far dragged vertically
  private dragStartMouseX = 0;  // Mouse X position when drag started
  private dragStartMouseY = 0;  // Mouse Y position when drag started

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue) {
      if (this.editingTask) {
        // Load task data into form for editing
        this.title = this.editingTask.title;
        this.description = this.editingTask.description || '';
        this.status = this.editingTask.status;
        this.priority = this.editingTask.priority;
        this.dueDate = this.editingTask.dueDate ? new Date(this.editingTask.dueDate).toISOString().split('T')[0] : '';
      } else {
        // Reset form for creating new task
        this.resetForm();
      }
      // Reset drag position when modal opens
      this.dragOffsetX = 0;
      this.dragOffsetY = 0;
      // Update select colors after modal opens
      setTimeout(() => this.updateSelectColors(), 0);
    }
  }

  private updateSelectColors(): void {
    const statusSelect = document.querySelector('.status-select') as HTMLSelectElement;
    const prioritySelect = document.querySelector('.priority-select') as HTMLSelectElement;

    if (statusSelect) {
      statusSelect.className = 'status-select';
      const statusMap: { [key: number]: string } = { 0: 'status-new', 1: 'status-in-progress', 2: 'status-done' };
      statusSelect.classList.add(statusMap[this.status] || 'status-new');
    }

    if (prioritySelect) {
      prioritySelect.className = 'priority-select';
      const priorityMap: { [key: number]: string } = { 0: 'priority-low', 1: 'priority-medium', 2: 'priority-high' };
      prioritySelect.classList.add(priorityMap[this.priority] || 'priority-low');
    }
  }

  onStatusChange(): void {
    this.updateSelectColors();
  }

  onPriorityChange(): void {
    this.updateSelectColors();
  }

  onClose(): void {
    this.close.emit();
  }

  // Start dragging when user clicks on header
  startDrag(e: MouseEvent): void {
    e.preventDefault();
    
    // Remember where the mouse started
    this.dragStartMouseX = e.clientX - this.dragOffsetX;
    this.dragStartMouseY = e.clientY - this.dragOffsetY;

    // Listen for mouse movement and release
    document.addEventListener('mousemove', this.onDrag);
    document.addEventListener('mouseup', this.stopDrag);
  }

  // Update modal position as mouse moves
  private onDrag = (e: MouseEvent): void => {
    if (!this.modalElement) return;
    
    e.preventDefault();
    
    // Calculate new position based on mouse movement
    this.dragOffsetX = e.clientX - this.dragStartMouseX;
    this.dragOffsetY = e.clientY - this.dragStartMouseY;

    // Move the modal
    this.modalElement.nativeElement.style.transform = 
      `translate(${this.dragOffsetX}px, ${this.dragOffsetY}px)`;
  };

  // Stop dragging when mouse is released
  private stopDrag = (): void => {
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.stopDrag);
  };

  submit(): void {
    this.submitted = true;

    if (!this.title.trim() || !this.dueDate.trim()) {
      return;
    }

    const dueDateValue = this.dueDate.trim();
    const taskData = {
      title: this.title.trim(),
      description: this.description.trim() || undefined,
      status: this.status,
      priority: this.priority,
      dueDate: new Date(dueDateValue),
      createdAt: new Date(),
    };

    if (this.editingTask) {
      // Emit update event with full task object including ID
      this.updateTask.emit({
        id: this.editingTask.id,
        ...taskData
      } as Task);
    } else {
      // Emit create event
      this.submitTask.emit(taskData);
    }
  }

  private resetForm(): void {
    this.title = '';
    this.description = '';
    this.status = 0;
    this.priority = 0;
    this.dueDate = '';
    this.titleBlurred = false;
    this.submitted = false;
  }

  onTitleBlur(): void {
    this.titleBlurred = true;
  }
}
