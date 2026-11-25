// OWNED BY YOU. The application adapter: load -> start -> dispatch -> restart.
//
// Supplied boundary you call:
//   connect(GENRE, { dispatch, start, restart, reload })   once, at startup (src/supplied/controls.ts)
//   playable(enabled)                                      enable/disable the action buttons
//   paint(state)                                           show the state you choose (src/supplied/render.ts)
//   text(region, message)                                  "api" | "status" | "result" | "telemetry"
//   identify(runId)                                        show the run ID and point the event link at it
//   newRunId(), recordEvent(event)                         event helper (src/supplied/telemetry.ts)

import { GENRE } from "./genre.js";
import { loadConfig } from "./api.js";
import { initialState, evaluate, isFinished } from "./rules.js";
import { accuracy, nextStreak } from "./stats.js";
import type { GameState } from "./models.js";
import type { RangeConfig } from "./supplied/config.js";
import type { RangePanelAction } from "./supplied/controls.js";
import { connect, playable } from "./supplied/controls.js";
import { identify, paint, text } from "./supplied/render.js";
import { newRunId, recordEvent } from "./supplied/telemetry.js";

// Only a confirmed, validated configuration becomes playable game data.
let config: RangeConfig | null = null;
// The current run, present only once a game has started.
let runId: string | null = null;
let state: GameState | null = null;
let sequence = 0;
// Consecutive accepted hits in the current run; a miss or a new game resets it.
let streak = 0;

/** Paint the rule state plus the derived shot statistics (the stats never enter GameState). */
function show(current: GameState): void {
  paint({ ...current, accuracy: `${accuracy(current)}%`, streak });
}

/** Request game data, keeping transport status in the "api" region and off game status. */
async function loadVerified(): Promise<void> {
  text("api", "Loading game data…");
  try {
    config = await loadConfig();
    text("api", "Game data verified");
    if (!state) text("status", "Press Start game to begin.");
  } catch (error) {
    // A failed (re)load must not destroy the last confirmed playable session, so the last
    // verified config is kept (it stays null if nothing has ever been verified).
    text("api", error instanceof Error ? error.message : String(error));
  }
}

/** Begin a fresh game with a new run ID. Does nothing without verified game data. */
function beginGame(message = "Game started."): void {
  if (!config) {
    text("status", "Load verified game data before starting.");
    return;
  }
  state = initialState(config);
  runId = newRunId();
  sequence = 0;
  streak = 0;
  identify(runId);
  show(state);
  text("result", "New range ready.");
  text("status", message);
  playable(!isFinished(state));
}

function dispatch(action: RangePanelAction): void {
  if (!config || !state || !runId) {
    text("status", "Start a game before taking a shot.");
    return;
  }

  const before = state;
  const result = evaluate(config, before, action);
  state = result.state;
  streak = nextStreak(streak, action, result);
  show(state);

  if (result.accepted) {
    text("result", `Accepted "${action.type}".`);
  } else {
    text("result", result.reason ?? "Rejected.");
  }
  playable(!isFinished(state));

  sequence += 1;
  const event = {
    runId,
    sequence,
    action: action.type,
    accepted: result.accepted,
    before,
    after: result.state,
  };
  void recordEvent(event)
    .then(() => text("telemetry", "Recorded locally"))
    .catch(() => text("telemetry", "Local recording unavailable"));
}

connect(GENRE, {
  dispatch,
  start: () => beginGame(),
  restart: () => beginGame("Game restarted."),
  reload: () => {
    void loadVerified();
  },
});

playable(false);
text("status", "Loading game data…");
await loadVerified();

