// OWNED BY YOU. Unit tests for the extra shot statistics in src/stats.ts (accuracy and hit streak).
// Expected values are worked out by hand. Run with: npm run check:rules (builds first).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { accuracy, nextStreak } from "../dist/stats.js";
import { initialState, evaluate } from "../dist/rules.js";
import { parseConfig } from "../dist/supplied/config.js";

const config = parseConfig("range", JSON.parse(readFileSync(new URL("../fixtures/range-reference.json", import.meta.url), "utf8")));

test("accuracy is 0% before any shot (no division by zero)", () => {
  assert.equal(accuracy(initialState(config)), 0);
});

test("accuracy is hits / shots as a whole-number percentage", () => {
  assert.equal(accuracy({ ammunition: 1, score: 1, shots: 1, status: "active" }), 100);
  assert.equal(accuracy({ ammunition: 0, score: 1, shots: 2, status: "complete" }), 50);
  assert.equal(accuracy({ ammunition: 0, score: 0, shots: 2, status: "complete" }), 0);
  assert.equal(accuracy({ ammunition: 0, score: 1, shots: 3, status: "complete" }), 33); // 33.3 rounds down
  assert.equal(accuracy({ ammunition: 0, score: 2, shots: 3, status: "complete" }), 67); // 66.7 rounds up
});

test("accuracy does not mutate the state", () => {
  const state = Object.freeze({ ammunition: 0, score: 1, shots: 2, status: "complete" });
  accuracy(state);
  assert.deepStrictEqual(state, { ammunition: 0, score: 1, shots: 2, status: "complete" });
});

test("streak: an accepted hit adds one, an accepted miss resets to zero", () => {
  const accepted = { accepted: true, reason: null, state: initialState(config) };
  assert.equal(nextStreak(0, { type: "hit" }, accepted), 1);
  assert.equal(nextStreak(3, { type: "hit" }, accepted), 4);
  assert.equal(nextStreak(3, { type: "miss" }, accepted), 0);
});

test("streak: a rejected action leaves the streak unchanged", () => {
  const completed = { ammunition: 0, score: 2, shots: 2, status: "complete" };
  const rejected = evaluate(config, completed, { type: "hit" });
  assert.equal(rejected.accepted, false);
  assert.equal(nextStreak(2, { type: "hit" }, rejected), 2);
  assert.equal(nextStreak(2, { type: "reload" }, evaluate(config, initialState(config), { type: "reload" })), 2);
});

test("streak and accuracy across a whole run: hit, hit (complete), then a rejected hit", () => {
  let state = initialState(config);
  let streak = 0;
  for (const type of ["hit", "hit", "hit"]) {
    const result = evaluate(config, state, { type });
    streak = nextStreak(streak, { type }, result);
    state = result.state;
  }
  assert.equal(streak, 2); // the third hit was rejected (GAME_COMPLETE), so no change
  assert.equal(accuracy(state), 100);
});
