                                                                               
  
                              
                                                                                                       
                                                                                             
                                                                                                              
                                                                                                     
                                                                                                          
                                                                                                    
import { GENRE } from "./genre.js";
import { loadConfig } from "./api.js";
import { initialState, evaluate, isFinished } from "./rules.js";
import { connect, playable } from "./supplied/controls.js";
import { identify, paint, text } from "./supplied/render.js";
import { newRunId, recordEvent } from "./supplied/telemetry.js";
                                                                        
let config = null;
                                                         
let runId = null;
let state = null;
let sequence = 0;
                                                                                           
async function loadVerified() {
    text("api", "Loading game data…");
    try {
        config = await loadConfig();
        text("api", "Game data verified");
    }
    catch (error) {
                                                                                  
        config = null;
        text("api", error instanceof Error ? error.message : String(error));
    }
}
                                                                                     
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
                               