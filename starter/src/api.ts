// OWNED BY YOU. Request the game data, separate HTTP and JSON failures, and call parseConfig.
//
// Route: GET /api/ranges/reference, same origin. Each failure kind has its own message:
// a non-success HTTP response ("HTTP <status>"), malformed JSON ("malformed"), and an unexpected
// definition (parseConfig throws ConfigError, message contains "Unexpected"). Transport problems
// are not game status, so they are surfaced only as thrown errors for the controller to display.

import { parseConfig } from "./supplied/config.js";
import type { RangeConfig } from "./supplied/config.js";

export async function loadConfig(): Promise<RangeConfig> {
  const response = await fetch("/api/ranges/reference");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("malformed");
  }

  return parseConfig("range", data);
}
