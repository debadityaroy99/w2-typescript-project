// OWNED BY YOU. Extra shot statistics, kept OUTSIDE GameState on purpose: the supplied fixtures
// R01-R05B compare the whole rule state, so adding fields there would break the contract.
// Pure functions only: no DOM, clock, randomness or I/O, and inputs are never mutated.

import type { GameAction, GameState, RuleResult } from "./models.js";

/** Percentage of accepted shots that were hits, rounded to a whole number. 0 before any shot. */
export function accuracy(state: GameState): number {
  if (state.shots === 0) return 0;
  return Math.round((state.score / state.shots) * 100);
}

/**
 * The consecutive-hit streak after an action:
 *   accepted hit  -> streak + 1
 *   accepted miss -> 0 (a miss resets the streak)
 *   rejected      -> unchanged (nothing was fired)
 */
export function nextStreak(streak: number, action: GameAction, result: RuleResult): number {
  if (!result.accepted) return streak;
  return action.type === "hit" ? streak + 1 : 0;
}
