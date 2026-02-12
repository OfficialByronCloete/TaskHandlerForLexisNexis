import { Component, input, output, signal, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterModel } from '../../models/filter.model';

@Component({
  selector: 'app-task-filter-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="open()" (click)="onOverlayClick()">
      <div #modalElement class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header" (mousedown)="startDrag($event)">
          <h2>Search Tasks</h2>
          <button class="close-btn" (click)="closeModal()" (mousedown)="$event.stopPropagation()">✕</button>
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

          <div class="outer-group">
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

            <div class="form-group">
              <span class="section-title">Priority</span>
              <div class="checkbox-group">
                <label class="checkbox-option">
                  <input type="checkbox" [(ngModel)]="priorityLow" />
                  <span>Low</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" [(ngModel)]="priorityMedium" />
                  <span>Medium</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" [(ngModel)]="priorityHigh" />
                  <span>High</span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-group">
            <span class="section-title">Sort By</span>
            <div class="sort-controls">
              <div class="sort-group">
                <span class="sort-group-label">Title</span>
                <div class="toggle-buttons">
                  <button
                    type="button"
                    class="toggle-btn"
                    [class.active]="titleSort() === 'asc'"
                    (click)="toggleTitleSort('asc'); $event.stopPropagation()"
                  >
                    A-Z
                  </button>
                  <button
                    type="button"
                    class="toggle-btn"
                    [class.active]="titleSort() === 'desc'"
                    (click)="toggleTitleSort('desc'); $event.stopPropagation()"
                  >
                    Z-A
                  </button>
                </div>
              </div>
              <div class="sort-group">
                <span class="sort-group-label">Due Date</span>
                <div class="toggle-buttons">
                  <button
                    type="button"
                    class="toggle-btn"
                    [class.active]="dueDateSort() === 'asc'"
                    (click)="toggleDueDateSort('asc'); $event.stopPropagation()"
                  >
                    Earliest
                  </button>
                  <button
                    type="button"
                    class="toggle-btn"
                    [class.active]="dueDateSort() === 'desc'"
                    (click)="toggleDueDateSort('desc'); $event.stopPropagation()"
                  >
                    Latest
                  </button>
                </div>
              </div>
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
      background: transparent;
    }

    .modal-content {
      top: 70px;
      right: 20px;
      width: 380px;
      max-height: 80vh;
      border-radius: 8px;
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

    .outer-group {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      gap: 16px;
    }

    .outer-group .form-group {
      flex: 1;
    }

    .sort-controls {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 8px;
    }

    .sort-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .sort-group-label {
      font-size: 13px;
      font-weight: 500;
      color: #6b7280;
      min-width: 70px;
    }

    .toggle-buttons {
      display: flex;
      gap: 4px;
      background: #f3f4f6;
      padding: 4px;
      border-radius: 6px;
    }

    .toggle-btn {
      flex: 1;
      padding: 8px 12px;
      border: none;
      background: transparent;
      color: #6b7280;
      font-size: 13px;
      font-weight: 500;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .toggle-btn:hover {
      color: #374151;
    }

    .toggle-btn.active {
      background: white;
      color: #0ea5e9;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  `]
})
export class TaskFilterModalComponent {
  @ViewChild('modalElement', { static: false }) modalElement?: ElementRef<HTMLDivElement>;

  open = input<boolean>(false);
  resetTrigger = input<number>(0);
  close = output<void>();
  search = output<FilterModel>();

  filter: FilterModel = {
    SearchTerm: '',
    statuses: [],
    priorities: [],
  };
  priorityLow = false;
  priorityMedium = false;
  priorityHigh = false;
  statusNew = false;
  statusInProgress = false;
  statusDone = false;
  titleSort = signal<'asc' | 'desc' | undefined>(undefined);
  dueDateSort = signal<'asc' | 'desc' | undefined>(undefined);

  // Drag functionality: track where modal has been dragged to
  private dragOffsetX = 0;  // How far dragged horizontally
  private dragOffsetY = 0;  // How far dragged vertically
  private dragStartMouseX = 0;  // Mouse X position when drag started
  private dragStartMouseY = 0;  // Mouse Y position when drag started

  constructor() {
    // Watch for reset trigger changes
    effect(() => {
      const trigger = this.resetTrigger();
      if (trigger > 0) {
        this.resetFilters();
      }
    });
  }

  private resetFilters(): void {
    this.filter.SearchTerm = '';
    this.filter.statuses = [];
    this.filter.priorities = [];
    this.priorityLow = false;
    this.priorityMedium = false;
    this.priorityHigh = false;
    this.statusNew = false;
    this.statusInProgress = false;
    this.statusDone = false;
    this.titleSort.set(undefined);
    this.dueDateSort.set(undefined);
  }

  closeModal(): void {
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

  toggleTitleSort(direction: 'asc' | 'desc'): void {
    // If clicking same button, deselect it. Otherwise, switch to new direction.
    this.titleSort.update(current => current === direction ? undefined : direction);
  }

  toggleDueDateSort(direction: 'asc' | 'desc'): void {
    // If clicking same button, deselect it. Otherwise, switch to new direction.
    this.dueDateSort.update(current => current === direction ? undefined : direction);
  }

  handleSearch(): void {
    const statuses = this.getSelectedStatuses();
    const priorities = this.getSelectedPriorities();
    this.filter.statuses = statuses;
    this.filter.priorities = priorities;
    
    // Map sort selections to orderBy array:
    // 0 = titleAsc, 1 = titleDesc, 2 = dueDateAsc, 3 = dueDateDesc
    // Build array with selected sorts
    const orderByArray: number[] = [];
    const titleSortValue = this.titleSort();
    const dueDateSortValue = this.dueDateSort();
    
    if (titleSortValue) {
      orderByArray.push(titleSortValue === 'asc' ? 0 : 1);
    }
    if (dueDateSortValue) {
      orderByArray.push(dueDateSortValue === 'asc' ? 2 : 3);
    }
    
    this.filter.orderBy = orderByArray.length > 0 ? orderByArray : undefined;
    
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

  private getSelectedPriorities(): number[] 
  {
    const priorities: number[] = []; 
    if (this.priorityLow) { priorities.push(0); } 
    if (this.priorityMedium) { priorities.push(1); } 
    if (this.priorityHigh) { priorities.push(2); }
    return priorities;
  }

  onOverlayClick(): void {
    this.closeModal();
  }
}
