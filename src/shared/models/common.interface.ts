export interface ResponseData<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface ResponseData2<T> {
  dates: ResponseDates;
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

interface ResponseDates {
  maximum: string;
  minimum: string;
}
