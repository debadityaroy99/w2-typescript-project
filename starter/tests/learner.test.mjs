// OWNED BY YOU. Your changed-input regression with an INDEPENDENT expected value.
//
// Choose an input the contract fixtures do not already cover (a changed invalid or completion input
// from your brief), work out the expected result by hand from the rules BEFORE running it, and assert
// the whole result: accepted, reason and every state field. Also check the input was not mutated.
// Keep the test that failed before your repair; do not weaken it to get a green result.
//
// Run with: npm run check:rules   (it builds first, then imports the compiled rules from dist/)

import { test } from "node:test";
import assert from "node:assert/strict";
import { initialState, evaluate } from "../dist/rules.js";
import { parseConfig } from "../dist/supplied/config.js";
import { readFileSync } from "node:fs";

const config = parseConfig("range", JSON.parse(readFileSync(new URL("../fixtures/range-reference.json", import.meta.url), "utf8")));

// Changed-input, multi-step regression not covered by a single supplied fixture:
// a full run (hit -> miss -> hit-after-completion) checked against values worked out by hand.
test("learner regression: hit then miss completes, and a later hit is rejected unchanged", () => {
  // Hand-computed from the Target Range rules, starting from the fresh initial state.
  const fresh = initialState(config);
  assert.deepStrictEqual(fresh, { ammunition: 2, score: 0, shots: 0, status: "active" });

  // Step 1: a hit spends one round and scores one; the game stays active (ammo 1).
  const afterHit = evaluate(config, fresh, { type: "hit" });
  assert.deepStrictEqual(afterHit, {
    accepted: true,
    reason: null,
    state: { ammunition: 1, score: 1, shots: 1, status: "active" },
  });

  // Step 2: a miss spends the last round without scoring; the game completes (ammo 0).
  const frozenBefore = Object.freeze({ ...afterHit.state });
  const afterMiss = evaluate(config, frozenBefore, { type: "miss" });
  assert.deepStrictEqual(afterMiss, {
    accepted: true,
    reason: null,
    state: { ammunition: 0, score: 1, shots: 2, status: "complete" },
  });
  // The input state must not be mutated.
  assert.deepStrictEqual(frozenBefore, { ammunition: 1, score: 1, shots: 1, status: "active" });

  // Step 3: any action after completion is rejected and preserves the completed state exactly.
  const completed = Object.freeze({ ...afterMiss.state });
  const afterComplete = evaluate(config, completed, { type: "hit" });
  assert.deepStrictEqual(afterComplete, {
    accepted: false,
    reason: "GAME_COMPLETE",
    state: { ammunition: 0, score: 1, shots: 2, status: "complete" },
  });
  assert.deepStrictEqual(completed, { ammunition: 0, score: 1, shots: 2, status: "complete" });
});
