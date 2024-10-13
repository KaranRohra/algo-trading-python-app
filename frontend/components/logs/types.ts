export interface LogEntry {
  timestamp: string;
  logType: "SUCCESS" | "ERROR" | "WARN" | "INFO";
  message: string;
  details: object;
}
