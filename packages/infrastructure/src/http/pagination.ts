export type PageableParams = {
  page: number;
  rowsPerPage: number;
  sortBy: string;
  sortDirection: "asc" | "desc";
};

export type PageableResponse<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
