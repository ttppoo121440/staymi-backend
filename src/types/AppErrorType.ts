export interface AppError extends Error {
  status?: string;
  statusCode?: number;
  isOperational?: boolean;
}
