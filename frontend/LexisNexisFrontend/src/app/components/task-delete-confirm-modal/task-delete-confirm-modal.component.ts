import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-delete-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open()) {
      <div class="modal-overlay" (click)="onOverlayClick()">
        <div class="confirm-modal" (click)="$event.stopPropagation()">
          <div class="confirm-header">
            <h2>Delete Task</h2>
          </div>
          <div class="confirm-body">
            <p>Are you sure you want to permanently delete <strong>"{{ taskTitle() }}"</strong>?</p>
            <p class="confirm-warning">This action cannot be undone.</p>
          </div>
          <div class="confirm-footer">
            <button class="btn-cancel" (click)="onCancel()">Cancel</button>
            <button class="btn-delete" (click)="onConfirm()">Delete</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
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
  `]
})
export class TaskDeleteConfirmModalComponent {
  open = input<boolean>(false);
  taskTitle = input<string>('');
  cancel = output<void>();
  confirm = output<void>();

  onCancel(): void {
    this.cancel.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onOverlayClick(): void {
    this.cancel.emit();
  }
}
