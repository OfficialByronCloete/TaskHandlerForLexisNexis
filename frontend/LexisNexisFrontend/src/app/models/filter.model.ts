export interface FilterModel {
  SearchTerm?: string;
  statuses?: number[]; // 0 = New, 1 = In Progress, 2 = Done
  priorities?: number[]; // 0 = Low, 1 = Medium, 2 = High
  orderBy?: number[] ; // 0 = titleAsc, 1 = titleDesc, 2 = dueDateAsc, 3 = dueDateDesc
}
