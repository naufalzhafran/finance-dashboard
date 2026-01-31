/**
 * Environment variable validation and access.
 * Provides type-safe access to environment variables with runtime validation.
 */

import path from "path";

/**
 * Get the database path from environment or use default.
 */
export function getDatabasePath(): string {
  const envPath = process.env.DATABASE_PATH;
  if (envPath) {
    return path.isAbsolute(envPath)
      ? envPath
      : path.join(process.cwd(), envPath);
  }
  return path.join(process.cwd(), "..", "ingestion", "finance_data.db");
}

/**
 * Check if we're in development mode.
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Check if we're in production mode.
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
