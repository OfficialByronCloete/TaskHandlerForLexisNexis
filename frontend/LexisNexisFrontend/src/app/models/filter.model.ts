export interface FilterModel {
  SearchTerm?: string;
  statuses?: number[]; // 0 = New, 1 = In Progress, 2 = Done
  status?: number; // 0 = New, 1 = In Progress, 2 = Done
  priority?: number; // 0 = Low, 1 = Medium, 2 = High
  order?: number; // 0 = Ascending, 1 = Descending
}
