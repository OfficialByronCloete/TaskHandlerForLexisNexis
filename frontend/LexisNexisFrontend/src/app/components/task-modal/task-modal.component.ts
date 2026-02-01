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
        <div #modalElement class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header" (mousedown)="startDrag($event)">
            <h2>Create Task</h2>
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
                <select name="status" [(ngModel)]="status">
                  <option [ngValue]="0">New</option>
                  <option [ngValue]="1">In Progress</option>
                  <option [ngValue]="2">Done</option>
                </select>
              </label>

              <label class="field">
                <span>Priority</span>
                <select name="priority" [(ngModel)]="priority">
                  <option [ngValue]="0">Low</option>
                  <option [ngValue]="1">Medium</option>
                  <option [ngValue]="2">High</option>
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
              class="btn btn-create"
              (click)="submit()">
              {{ loading ? 'Creating...' : 'Create Task' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .modal-backdrop {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      z-index: 1000;
    }

    .modal {
      position: absolute;
      width: 100%;
      max-width: 520px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #eef2f7;
      cursor: move;
      user-select: none;
      background: linear-gradient(90deg, #ffffff 0%, #fecdd3 100%);
    }

    .modal-header h2 {
      margin: 0;
      font-size: 18px;
      color: #0f172a;
    }

    .icon-button {
      background: transparent;
      border: none;
      font-size: 22px;
      cursor: pointer;
      color: #64748b;
    }

    .modal-body {
      padding: 18px 20px;
      display: grid;
      gap: 14px;
    }

    .field {
      display: grid;
      gap: 6px;
      font-size: 13px;
      color: #475569;
      font-weight: 600;
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

    .field input,
    .field textarea,
    .field select {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 14px;
      font-family: inherit;
      outline: none;
    }

    .field input:focus,
    .field textarea:focus,
    .field select:focus {
      border-color: #0ea5e9;
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
    }

    .input-error {
      border-color: #fecaca !important;
      border-width: 2px !important;
    }

    .required {
      color: #c8102e;
      font-weight: 700;
    }

    .field-row {
      display: grid;
      gap: 12px;
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

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 20px 20px;
      border-top: 1px solid #eef2f7;
    }

    .btn {
      padding: 8px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
    }

    .btn-create {
      background: #10b981;
      color: #ffffff;
      box-shadow: 0 6px 14px rgba(16, 185, 129, 0.25);
    }

    .btn-create:hover:not(:disabled) {
      background: #059669;
    }

    .btn-secondary {
      background: #e2e8f0;
      color: #0f172a;
      box-shadow: none;
    }
  `,
})
export class TaskCreateModalComponent implements OnChanges {
  @ViewChild('modalElement', { static: false }) modalElement?: ElementRef<HTMLDivElement>;
  
  @Input() open = false;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() submitTask = new EventEmitter<Omit<Task, 'id'>>();

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
      this.resetForm();
      // Reset drag position when modal opens
      this.dragOffsetX = 0;
      this.dragOffsetY = 0;
    }
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
    this.submitTask.emit({
      title: this.title.trim(),
      description: this.description.trim() || undefined,
      status: this.status,
      priority: this.priority,
      dueDate: new Date(dueDateValue),
      createdAt: new Date(),
    });
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
