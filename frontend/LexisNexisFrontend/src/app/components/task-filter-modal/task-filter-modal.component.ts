import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterModel } from '../../models/filter.model';

@Component({
  selector: 'app-task-filter-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="open()" (click)="onOverlayClick()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Search Tasks</h2>
          <button class="close-btn" (click)="closeModal()">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="searchInput">Search by title or description:</label>
            <input
              id="searchInput"
              type="text"
              [(ngModel)]="filter.SearchTerm"
              (keyup.enter)="handleSearch()"
              placeholder="Enter search terms..."
              class="search-input"
            />
          </div>

          <div class="form-group">
            <span class="section-title">Status</span>
            <div class="checkbox-group">
              <label class="checkbox-option">
                <input type="checkbox" [(ngModel)]="statusNew" />
                <span>New</span>
              </label>
              <label class="checkbox-option">
                <input type="checkbox" [(ngModel)]="statusInProgress" />
                <span>In Progress</span>
              </label>
              <label class="checkbox-option">
                <input type="checkbox" [(ngModel)]="statusDone" />
                <span>Done</span>
              </label>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" (click)="closeModal()">Cancel</button>
          <button class="btn-search" (click)="handleSearch()">Search</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      width: 90%;
      max-width: 500px;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
      background: linear-gradient(90deg, #ffffff 0%, #fecdd3 100%);
      border-radius: 8px 8px 0 0;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #6b7280;
      transition: color 0.2s;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: #1f2937;
    }

    .modal-body {
      padding: 24px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    .checkbox-group {
      display: grid;
      gap: 8px;
      margin-top: 4px;
    }

    .checkbox-option {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #374151;
    }

    .checkbox-option input {
      width: 16px;
      height: 16px;
      accent-color: #0ea5e9;
    }

    label {
      font-size: 14px;
      font-weight: 500;
      color: #374151;
    }

    .search-input {
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #0ea5e9;
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
    }

    .modal-footer {
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

    .btn-search {
      padding: 8px 16px;
      background: #0ea5e9;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: white;
      transition: background-color 0.2s;
    }

    .btn-search:hover {
      background: #0284c7;
    }

    .btn-search:active {
      transform: scale(0.98);
    }
  `]
})
export class TaskFilterModalComponent {
  open = input<boolean>(false);
  close = output<void>();
  search = output<FilterModel>();

  filter: FilterModel = {
    SearchTerm: '',
    statuses: [],
  };
  statusNew = false;
  statusInProgress = false;
  statusDone = false;

  closeModal(): void {
    this.close.emit();
  }

  handleSearch(): void {
    const statuses = this.getSelectedStatuses();
    this.filter.statuses = statuses;
    this.filter.status = statuses.length === 1 ? statuses[0] : undefined;
    this.search.emit({ ...this.filter });
  }

  private getSelectedStatuses(): number[] {
    const statuses: number[] = [];
    if (this.statusNew) {
      statuses.push(0);
    }
    if (this.statusInProgress) {
      statuses.push(1);
    }
    if (this.statusDone) {
      statuses.push(2);
    }
    return statuses;
  }

  onOverlayClick(): void {
    this.closeModal();
  }
}
