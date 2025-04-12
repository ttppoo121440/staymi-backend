export type AppErrorType = Error & {
  status?: string;
  statusCode?: number;
  isOperational?: boolean;
};
