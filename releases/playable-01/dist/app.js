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
import { connect, playable } from "./supplied/controls.js";
import { identify, paint, text } from "./supplied/render.js";
import { newRunId, recordEvent } from "./supplied/telemetry.js";
// Only a confirmed, validated configuration becomes playable game data.
let config = null;
// The current run, present only once a game has started.
let runId = null;
let state = null;
let sequence = 0;
/** Request game data, keeping transport status in the "api" region and off game status. */
async function loadVerified() {
    text("api", "Loading game data…");
    try {
        config = await loadConfig();
        text("api", "Game data verified");
    }
    catch (error) {
        // A failed (re)load must not destroy the last confirmed playable session.
        config = null;
        text("api", error instanceof Error ? error.message : String(error));
    }
}
/** Begin a fresh game with a new run ID. Does nothing without verified game data. */
function beginGame() {
    if (!config) {
        text("status", "Load verified game data before starting.");
        return;
    }
    state = initialState(config);
    runId = newRunId();
    sequence = 0;
    identify(runId);
    paint(state);
    text("result", "New range ready.");
    text("status", "Game started.");
    playable(!isFinished(state));
}
function dispatch(action) {
    if (!config || !state || !runId) {
        text("status", "Start a game before taking a shot.");
        return;
    }
    const before = state;
    const result = evaluate(config, before, action);
    state = result.state;
    paint(state);
    if (result.accepted) {
        text("result", `Accepted "${action.type}".`);
    }
    else {
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
    start: beginGame,
    restart: beginGame,
    reload: () => {
        void loadVerified();
    },
});
playable(false);
text("status", "Loading game data…");
await loadVerified();
//# sourceMappingURL=app.js.map