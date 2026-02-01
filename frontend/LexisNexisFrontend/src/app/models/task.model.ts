export interface Task {
  id: number;
  title: string;
  description?: string;
  status: number; // 0 = New, 1 = In Progress, 2 = Done
  priority: number; // 0 = Low, 1 = Medium, 2 = High
  dueDate?: Date;
  createdAt: Date;
}
