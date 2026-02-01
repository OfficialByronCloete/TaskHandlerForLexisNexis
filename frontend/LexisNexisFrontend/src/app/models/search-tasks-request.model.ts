import { PaginationModel } from "./pagination.model";
import { FilterModel } from "./filter.model";

export interface SearchTasksRequest {
  filter: FilterModel;
  pagination: PaginationModel;
}
