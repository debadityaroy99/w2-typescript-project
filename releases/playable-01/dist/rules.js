                                                                                         
  
                                                                                          
                                                                        
  
                                                                                                 
                                                                                                 
                                                 
export function initialState(config) {
    return { ammunition: config.ammunition, score: 0, shots: 0, status: "active" };
}
function reject(reason, state) {
    return { accepted: false, reason, state };
}
export function evaluate(_config, state, action) {
    if (state.status === "complete")
        return reject("GAME_COMPLETE", state);
    if (action.type !== "hit" && action.type !== "miss")
        return reject("INVALID_EVENT", state);
    const ammunition = state.ammunition - 1;
    const score = action.type === "hit" ? state.score + 1 : state.score;
    const shots = state.shots + 1;
    const status = ammunition === 0 ? "complete" : "active";
    return { accepted: true, reason: null, state: { ammunition, score, shots, status } };
}
                                                                                                    
export function isFinished(state) {
    return state.status === "complete";
}
                                 