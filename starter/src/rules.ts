// OWNED BY YOU. Pure rules: no DOM, clock, randomness or I/O, and never mutate an input.
//
//   initialState(config)                 -> a fresh state for the validated configuration
//   evaluate(config, state, action)      -> { accepted, reason, state }
//
// Target Range contract (fixtures R01-R05): a hit scores and spends one round, a miss spends one
// round without scoring, zero ammunition completes the game, unknown and post-completion actions
// are rejected with the state preserved exactly.

import type { RangeConfig } from "./supplied/config.js";
import type { GameAction, GameState, RuleResult } from "./models.js";

export function initialState(config: RangeConfig): GameState {
  return { ammunition: config.ammunition, score: 0, shots: 0, status: "active" };
}

function reject(reason: string, state: GameState): RuleResult {
  return { accepted: false, reason, state };
}

export function evaluate(_config: RangeConfig, state: GameState, action: GameAction): RuleResult {
  if (state.status === "complete") return reject("GAME_COMPLETE", state);
  if (action.type !== "hit" && action.type !== "miss") return reject("INVALID_EVENT", state);

  const ammunition = state.ammunition - 1;
  const score = action.type === "hit" ? state.score + 1 : state.score;
  const shots = state.shots + 1;
  const status: GameState["status"] = ammunition === 0 ? "complete" : "active";
  return { accepted: true, reason: null, state: { ammunition, score, shots, status } };
}

export function isFinished(state: GameState): boolean {
  return state.status === "complete";
}
