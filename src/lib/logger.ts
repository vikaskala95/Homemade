/**
 * Logger utility - structured JSON logging for production, readable for development.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: { message: string; stack?: string };
}

const LOG_LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = (process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug")) as LogLevel;

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function createEntry(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>, error?: Error): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context && { context }),
    ...(data && { data }),
    ...(error && { error: { message: error.message, stack: error.stack } }),
  };
}

function output(entry: LogEntry) {
  if (process.env.NODE_ENV === "production") {
    // JSON structured logging for production (compatible with ELK, CloudWatch, etc.)
    const fn = entry.level === "error" ? console.error : entry.level === "warn" ? console.warn : console.log;
    fn(JSON.stringify(entry));
  } else {
    // Readable logging for development
    const prefix = `[${entry.level.toUpperCase()}]`;
    const ctx = entry.context ? ` [${entry.context}]` : "";
    const msg = `${prefix}${ctx} ${entry.message}`;
    if (entry.level === "error") {
      console.error(msg, entry.data || "", entry.error?.stack || "");
    } else if (entry.level === "warn") {
      console.warn(msg, entry.data || "");
    } else {
      console.log(msg, entry.data || "");
    }
  }
}

export const logger = {
  debug(message: string, context?: string, data?: Record<string, unknown>) {
    if (shouldLog("debug")) output(createEntry("debug", message, context, data));
  },
  info(message: string, context?: string, data?: Record<string, unknown>) {
    if (shouldLog("info")) output(createEntry("info", message, context, data));
  },
  warn(message: string, context?: string, data?: Record<string, unknown>) {
    if (shouldLog("warn")) output(createEntry("warn", message, context, data));
  },
  error(message: string, error?: Error, context?: string, data?: Record<string, unknown>) {
    if (shouldLog("error")) output(createEntry("error", message, context, data, error || undefined));
  },
};
