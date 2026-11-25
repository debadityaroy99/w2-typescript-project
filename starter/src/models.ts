// OWNED BY YOU. Precise state and action types, and the invariants they must keep.
//
// Target Range route. State is the shape the R01-R05 fixtures and paint() use.

/** A range is "active" while rounds remain, then "complete" forever. */
export type RangeStatus = "active" | "complete";

/** The game state your rules return and the page paints. */
export interface GameState {
  readonly ammunition: number;
  readonly score: number;
  readonly shots: number;
  readonly status: RangeStatus;
}

export type RangeActionType = "hit" | "miss";

export interface GameAction {
  readonly type: string;
}

export interface RuleResult {
  readonly accepted: boolean;
  readonly reason: string | null;
  readonly state: GameState;
}
